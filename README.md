# "MUGGAM" Video Editor

MUGGAM is a full-stack video generation app where users upload images and text, then generate an MP4 using an FFmpeg-powered backend.

## Flow

User uploads images -> Backend uses FFmpeg -> Apply motion + transitions + text + optional music -> Stream MP4 back to frontend (no server file saved).

## Features

- Google login UI.
- Text + multi-image upload.
- Real backend video generation with FFmpeg.
- Cinematic motion effect + smooth fade transitions.
- Optional background music track.
- Quality mode selection (`high` 1080p / `standard` 720p).
- Render controls (seconds per image, transition duration).
- MP4 preview and download.
- No persistent video storage on server.
- Improved error details from backend for easier debugging.

## Tech Stack

- Frontend: React
- Backend: Node.js + Express + Multer
- Video processing: FFmpeg (`ffmpeg-static`)

## Prerequisites

- Node.js 18+ recommended
- npm 9+ recommended
- Windows/Linux/macOS

## Run

1. Install dependencies:
```sh
npm install
```

2. Start backend:
```sh
npm run server
```

3. In another terminal, start frontend:
```sh
npm start
```

Frontend runs on `http://localhost:3000` and backend on `http://localhost:5000`.
Run backend and frontend in two separate terminals.

## API

`POST /api/generate-video` (multipart/form-data)

- `text`: string
- `images`: one or more image files (required)
- `music`: one audio file (optional)
- `secondsPerImage`: number (`1.5` to `8`)
- `transitionDuration`: number (`0.2` to `2`, and auto-clamped based on image duration)
- `quality`: `high` or `standard`

Defaults:

- `secondsPerImage = 3`
- `transitionDuration = 0.7`
- `quality = high`

Limits:

- max images: `20`
- max files in request: `25`
- max file size: `20MB` per file

Response:

- `200 OK` with `video/mp4` binary stream.
- `400` with JSON error:
```json
{
  "error": "Upload at least one image."
}
```
- `500` with JSON error:
```json
{
  "error": "Video generation failed.",
  "details": "FFmpeg error details..."
}
```

Minimal request example:
```sh
curl -X POST http://localhost:5000/api/generate-video \
  -F "text=My Story" \
  -F "quality=high" \
  -F "secondsPerImage=3" \
  -F "transitionDuration=0.7" \
  -F "images=@image1.jpg" \
  -F "images=@image2.jpg"
```

## Health Check

`GET /api/health`

Response:
```json
{ "ok": true }
```

## Notes

- Videos are generated in a temporary directory and deleted after response.
- If generation fails, check backend terminal logs for `FFmpeg error: ...`.
- Current version has no project save/history and no job queue.
