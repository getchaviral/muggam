// src/Login.js
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";

function Login({ onLoginSuccess, onLoginError }) {
  const handleLoginSuccess = (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);
    console.log(decoded);
    alert("Login Successful! Welcome " + decoded.name);
    onLoginSuccess(decoded); // Pass user data to App.js
  };

  const handleLoginError = () => {
    console.log('Login Failed');
    alert("Login Failed");
    onLoginError(); // Notify App.js that login failed
  };

  return (
    <div className="login-container">
      <h2>Welcome to MUGGAM📹 </h2>
      <p>Please login with your Google Account</p>
      <GoogleLogin onSuccess={handleLoginSuccess} onError={handleLoginError} />
    </div>
  );
}

export default Login;
