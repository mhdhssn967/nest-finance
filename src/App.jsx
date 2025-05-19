import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom"; // Removed unnecessary BrowserRouter import
import Login from "./pages/Login";
import HomePage from "./pages/HomePage";
import Insights from "./pages/Insights";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // State to track user authentication
  const navigate = useNavigate(); // Hook to navigate to different routes



  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<HomePage />} />
      <Route path="/home/insights" element={<Insights />} />
    </Routes>
  );
};

export default App;
