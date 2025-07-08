// src/App.js
import { GoogleOAuthProvider } from '@react-oauth/google';
import Login from './Login';
import VideoEditor from './VideoEditor';
import { useState } from 'react';
import './App.css'; // Don't forget to import CSS here

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };

  const handleLoginSuccess = (userData) => {
    setIsLoggedIn(true);
    setUser(userData);
  };

  const handleLoginError = () => {
    setIsLoggedIn(false);
    setUser(null);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
  };

  return (
    <GoogleOAuthProvider clientId="472547953441-3i05crn8srtd4a8udndt5p9thnmv4o5k.apps.googleusercontent.com">
      <div className={darkMode ? "app dark" : "app light"}>
        <div className="wrapper">
          <button onClick={toggleDarkMode} className="toggle-btn">
            {darkMode ? "Light" : "Dark"} Mode
          </button>

          {!isLoggedIn ? (
            <Login onLoginSuccess={handleLoginSuccess} onLoginError={handleLoginError} />
          ) : (
            <VideoEditor user={user} onLogout={handleLogout} />
          )}
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;
