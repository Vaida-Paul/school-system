import React, { useState } from "react";
import Login from "./Login";
import Register from "./Register";

const AuthSystem = () => {
  const [isLogin, setIsLogin] = useState(true);

  const switchToRegister = () => setIsLogin(false);
  const switchToLogin = () => setIsLogin(true);

  const handleLoginSuccess = (role) => {
    window.location.href =
      role === "Teacher" ? "/teacher-dashboard" : "/student-dashboard";
  };

  return isLogin ? (
    <Login
      switchToRegister={switchToRegister}
      onLoginSuccess={handleLoginSuccess}
    />
  ) : (
    <Register switchToLogin={switchToLogin} onRegisterSuccess={switchToLogin} />
  );
};

export default AuthSystem;
