import React, { useState } from "react";
import "../Style/AuthStyles.css";
import schoolLogo from "../images/logoDark.png";

const Login = ({ switchToRegister, onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("https://localhost:7229/api/Auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const { token, role } = await response.json();

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      onLoginSuccess(role);
    } catch (err) {
      setError(err.message);
      console.error("Login error:", err);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card login-card">
        <div className="logo-container">
          <img src={schoolLogo} alt="School Logo" className="school-logo" />
        </div>

        <div className="form-container">
          <h2>Welcome Back</h2>
          <p className="subtitle">Please enter your credentials to continue</p>

          {error && <div className="error-message">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your@email.com"
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="password"
                required
              />
            </div>

            <div className="auth-options">
              <div className="remember-me">
                <input type="checkbox" id="remember" />
                <label htmlFor="remember">Remember me</label>
              </div>
              <a href="#" className="forgot-password">
                Forgot password?
              </a>
            </div>

            <button type="submit" className="auth-button">
              Sign In
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Don't have an account?{" "}
              <button onClick={switchToRegister} className="text-button">
                Register
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
