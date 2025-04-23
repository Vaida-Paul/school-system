import React, { useState } from "react";
import "../Style/AuthStyles.css";
import schoolLogo from "../images/logoDark.png";
import studentImage from "../images/register_student.png";
import teacherImage from "../images/register_teacher.png";

const Register = ({ switchToLogin, onRegisterSuccess }) => {
  const [selectedRole, setSelectedRole] = useState("student");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    teacherCode: "",
  });
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      selectedRole === "teacher" &&
      formData.teacherCode !==
        "JRir!!44y5kay45@la3IIg124!jaUYA#luu5u475a@ga4aHRar#"
    ) {
      setError("Invalid teacher code");
      return;
    }

    try {
      const response = await fetch("https://localhost:7229/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          role: selectedRole === "teacher" ? "Teacher" : "Student",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
      }

      alert("Registration successful! Please log in.");
      onRegisterSuccess();
    } catch (err) {
      setError(err.message);
      console.error("Registration error:", err);
    }
  };
  return (
    <div className="auth-container">
      <div className="auth-card register-card">
        <div className="register-split">
          <div className="role-side">
            <div className="role-image-container">
              <img
                src={selectedRole === "student" ? studentImage : teacherImage}
                alt={selectedRole === "student" ? "Student" : "Teacher"}
                className="role-toggle-image"
              />
            </div>

            <div className="role-toggle">
              <button
                className={`role-button ${
                  selectedRole === "student" ? "active" : ""
                }`}
                onClick={() => setSelectedRole("student")}
              >
                Student
              </button>
              <button
                className={`role-button ${
                  selectedRole === "teacher" ? "active" : ""
                }`}
                onClick={() => setSelectedRole("teacher")}
              >
                Teacher
              </button>
            </div>
          </div>

          <div className="form-side">
            <div className="logo-container">
              <img
                src={schoolLogo}
                alt="School Logo"
                className="school-logo school-logo-responsive"
              />
            </div>

            <h2>Create Account</h2>

            <form
              className="auth-form"
              onSubmit={handleSubmit}
              style={{ gap: "16px" }}
            >
              <div className="form-row">
                <div className="input-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="John"
                    required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="regEmail">Email</label>
                <input
                  type="email"
                  id="regEmail"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="regPassword">Password</label>
                <input
                  type="password"
                  id="regPassword"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="password"
                  required
                />
              </div>

              {selectedRole === "teacher" && (
                <div className="input-group teacher-code-input">
                  <label htmlFor="teacherCode">Teacher Code</label>
                  <input
                    type="password"
                    id="teacherCode"
                    name="teacherCode"
                    value={formData.teacherCode}
                    onChange={handleInputChange}
                    placeholder="Enter teacher verification code"
                    required
                  />
                </div>
              )}

              <button type="submit" className="auth-button">
                Register
              </button>
            </form>

            <div
              className="auth-footer"
              style={{ marginTop: "auto", paddingTop: "20px" }}
            >
              <p>
                Already have an account?{" "}
                <button onClick={switchToLogin} className="text-button">
                  Sign In
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
