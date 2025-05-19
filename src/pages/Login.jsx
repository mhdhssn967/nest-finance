import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig"; // Import Firebase Auth
import { useNavigate } from "react-router-dom";
import "./Login.css"; // Import the CSS file
import logo from "../assets/OQ.png";

const Login = () => {
  const [email, setEmail] = useState(""); // State for email
  const [password, setPassword] = useState(""); // State for password
  const [error, setError] = useState(""); // State for error message
  const navigate = useNavigate(); // Hook to navigate pages

  const handleLogin = async (e) => {    
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password); // Firebase login
      navigate("/home"); // Redirect to home page after successful login
    } catch (error) {
      setError("Invalid email or password!");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <img src={logo} alt="Oqulance Logo" style={{ width: "60px" }} />
        <h1 style={{ fontWeight: "300" }}>Oqulix Finance</h1>
        <p style={{ fontWeight: "100" }}>Track and optimize company expenses with ease.</p>
        <h2 style={{ fontWeight: "200" }}>Login to your account</h2>

        {error && <p className="error-message">{error}</p>} {/* Error message */}

        <form className="login-form" onSubmit={handleLogin}>
          <input 
            type="email" 
            placeholder="Email" 
            className="input-field" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="input-field" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required
          />
          <button type="submit" className="login-button">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
