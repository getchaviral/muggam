const express = require("express");
const cors = require("cors");
const multer = require("multer");
const ffmpegPath = require("ffmpeg-static");
const { spawn } = require("child_process");
const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const os = require("os");

const app = express();
const PORT = process.env.PORT || 5000;
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024, files: 25 },
});

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

function sanitizeText(input) {
  if (!input) return "";
  return String(input)
    .replace(/[\\:']/g, "")
    .replace(/[%\[\],;]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
}

function getFontOption() {
  if (process.platform !== "win32") return "";
  const arialPath = "C:/Windows/Fonts/arial.ttf";
  if (!fs.existsSync(arialPath)) return "";
  const escaped = arialPath.replace(/:/g, "\\:").replace(/\//g, "\\/");
  return `fontfile='${escaped}':`;
}

function parseNumber(input, fallback, min, max) {
  const parsed = Number(input);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function getQualityProfile(quality) {
  if (quality === "high") {
    return { width: 1920, height: 1080, crf: "17", preset: "slow" };
  }
  return { width: 1280, height: 720, crf: "21", preset: "medium" };
}

function runFfmpeg(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(ffmpegPath, args);
    let stderr = "";

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(stderr || `ffmpeg exited with code ${code}`));
      }
    });
  });
}

async function saveUploadedImages(files, dir) {
  const imagePaths = [];
  for (let i = 0; i < files.length; i += 1) {
    const ext = path.extname(files[i].originalname) || ".jpg";
    const target = path.join(dir, `image-${i}${ext}`);
    await fsp.writeFile(target, files[i].buffer);
    imagePaths.push(target);
  }
  return imagePaths;
}

function buildFilter({ text, imageCount, secondsPerImage, transitionDuration, width, height, hasMusic }) {
  const textForFilter = sanitizeText(text) || "MUGGAM";
  const fontOption = getFontOption();
  const chains = [];
  const clipDuration = secondsPerImage + transitionDuration;
  const zoomFrames = Math.max(1, Math.round(clipDuration * 30));
  const fontSize = Math.max(26, Math.round(height * 0.055));

  for (let i = 0; i < imageCount; i += 1) {
    chains.push(
      `[${i}:v]scale=${width}:${height}:force_original_aspect_ratio=decrease:flags=lanczos,` +
        `pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:color=black,` +
        `zoompan=z='min(zoom+0.0008,1.08)':d=${zoomFrames}:s=${width}x${height}:fps=30,` +
        `trim=duration=${clipDuration.toFixed(2)},setpts=PTS-STARTPTS,` +
        `drawtext=${fontOption}text='${textForFilter}':fontcolor=white:fontsize=${fontSize}:` +
        `x=(w-text_w)/2:y=h-${Math.round(height * 0.12)}:` +
        "box=1:boxcolor=black@0.5:boxborderw=20" +
        `[v${i}]`
    );
  }

  let currentVideoLabel = "v0";
  if (imageCount > 1) {
    for (let i = 1; i < imageCount; i += 1) {
      const offset = (secondsPerImage * i).toFixed(2);
      const out = i === imageCount - 1 ? "vxf" : `vx${i}`;
      chains.push(
        `[${currentVideoLabel}][v${i}]xfade=transition=fade:duration=${transitionDuration.toFixed(2)}:offset=${offset}[${out}]`
      );
      currentVideoLabel = out;
    }
  }

  chains.push(`[${currentVideoLabel}]format=yuv420p[vout]`);

  const totalDuration = imageCount * secondsPerImage - (imageCount - 1) * transitionDuration;
  if (hasMusic) {
    const musicInputIndex = imageCount;
    const fadeStart = Math.max(0, totalDuration - 1).toFixed(2);
    chains.push(
      `[${musicInputIndex}:a]atrim=duration=${totalDuration.toFixed(2)},` +
        `afade=t=out:st=${fadeStart}:d=1[aout]`
    );
  }

  return { filter: chains.join(";"), totalDuration };
}

app.post(
  "/api/generate-video",
  upload.fields([
    { name: "images", maxCount: 20 },
    { name: "music", maxCount: 1 },
  ]),
  async (req, res) => {
    const files = (req.files && req.files.images) || [];
    const musicFile = req.files && req.files.music ? req.files.music[0] : null;
    const text = (req.body && req.body.text) || "";
    const secondsPerImage = parseNumber(req.body?.secondsPerImage, 3, 1.5, 8);
    const rawTransitionDuration = parseNumber(req.body?.transitionDuration, 0.7, 0.2, 2);
    const transitionDuration = Math.min(rawTransitionDuration, Math.max(0.2, secondsPerImage - 0.1));
    const quality = req.body?.quality === "high" ? "high" : "standard";
    const { width, height, crf, preset } = getQualityProfile(quality);

    if (!files.length) {
      return res.status(400).json({ error: "Upload at least one image." });
    }

    const tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), "muggam-"));
    const outputPath = path.join(tmpDir, "output.mp4");

    try {
      const imagePaths = await saveUploadedImages(files, tmpDir);
      const imageInputArgs = imagePaths.flatMap((imagePath) => ["-loop", "1", "-i", imagePath]);
      let musicPath = null;
      if (musicFile) {
        const musicExt = path.extname(musicFile.originalname) || ".mp3";
        musicPath = path.join(tmpDir, `music${musicExt}`);
        await fsp.writeFile(musicPath, musicFile.buffer);
      }
      const hasMusic = Boolean(musicPath);
      const { filter } = buildFilter({
        text,
        imageCount: imagePaths.length,
        secondsPerImage,
        transitionDuration,
        width,
        height,
        hasMusic,
      });

      const ffmpegArgs = [
        "-y",
        ...imageInputArgs,
        ...(hasMusic ? ["-stream_loop", "-1", "-i", musicPath] : []),
        "-filter_complex",
        filter,
        "-map",
        "[vout]",
        ...(hasMusic ? ["-map", "[aout]", "-c:a", "aac", "-b:a", "192k"] : ["-an"]),
        "-r",
        "30",
        "-c:v",
        "libx264",
        "-preset",
        preset,
        "-crf",
        crf,
        "-profile:v",
        "high",
        "-pix_fmt",
        "yuv420p",
        "-movflags",
        "+faststart",
        outputPath,
      ];

      await runFfmpeg(ffmpegArgs);

      const videoBuffer = await fsp.readFile(outputPath);
      res.setHeader("Content-Type", "video/mp4");
      res.setHeader("Content-Disposition", 'inline; filename="generated.mp4"');
      res.send(videoBuffer);
    } catch (error) {
      console.error("FFmpeg error:", error.message);
      res.status(500).json({ error: "Video generation failed.", details: error.message });
    } finally {
      await fsp.rm(tmpDir, { recursive: true, force: true });
    }
  }
);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`MUGGAM backend running on http://localhost:${PORT}`);
});
