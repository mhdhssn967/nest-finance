import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom"; // Removed unnecessary BrowserRouter import
import { auth } from "./firebaseConfig"; // Import Firebase auth
import Login from "./pages/Login";
import HomePage from "./pages/HomePage";
import Insights from "./pages/Insights";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // State to track user authentication
  const navigate = useNavigate(); // Hook to navigate to different routes

  useEffect(() => {
    const savedAuthState = localStorage.getItem("isAuthenticated");
  
    const currentPath = window.location.pathname;
  
    if (savedAuthState === "true") {
      setIsAuthenticated(true);
      if (currentPath === "/" || currentPath === "/login") {
        navigate("/home");
      }
    } else {
      setIsAuthenticated(false);
      if (currentPath !== "/") {
        navigate("/");
      }
    }
  
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsAuthenticated(true);
        localStorage.setItem("isAuthenticated", "true");
        if (currentPath === "/" || currentPath === "/login") {
          navigate("/home");
        }
      } else {
        setIsAuthenticated(false);
        localStorage.setItem("isAuthenticated", "false");
        if (currentPath !== "/") {
          navigate("/");
        }
      }
    });
  
    return () => unsubscribe();
  }, [navigate]);
  

  if (isAuthenticated === null) {
    return <div>Loading...</div>; // Show loading state while checking auth status
  }

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/home/insights" element={<Insights />} />
    </Routes>
  );
};

export default App;
