# MUGGAM Video Editor

MUGGAM is a modern web application that allows users to create amazing videos from their text and images. It features Google authentication, a clean UI, and a simple workflow for generating video previews.

## Features

- **Google Login**: Secure authentication using Google OAuth.
- **Dark/Light Mode**: Toggle between dark and light themes.
- **Text Story Input**: Write your story or message for the video.
- **Image Upload**: Upload multiple images via file picker or drag-and-drop.
- **Video Generation (Demo)**: Simulated video preview generation.
- **Download & Share**: Download or share your generated video (UI only).

## Getting Started

### Prerequisites

- Node.js (v14 or higher recommended)
- npm

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/muggam.git
   cd muggam
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Start the development server:
   ```sh
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
public/
  index.html
  ...
src/
  App.js
  App.css
  Login.js
  VideoEditor.js
  VideoEditor.css
  ...
```

- [`src/App.js`](src/App.js): Main app logic, theme toggle, and routing.
- [`src/Login.js`](src/Login.js): Google login component.
- [`src/VideoEditor.js`](src/VideoEditor.js): Main video editor UI and logic.
- [`src/App.css`](src/App.css), [`src/VideoEditor.css`](src/VideoEditor.css): Styling.

## Notes

- Video generation is simulated for demo purposes.
- Replace the Google OAuth client ID in [`src/App.js`](src/App.js) with your own for production use.

## License

MIT
