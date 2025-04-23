import React, { useState, useEffect } from "react";
import "../Style/LoginSystem.css";

const SchoolLoginSystem = () => {
  const [view, setView] = useState("welcome");
  const [userType, setUserType] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
    fullName: "",
  });
  const [animation, setAnimation] = useState("");

  useEffect(() => {
    setAnimation("animate-in");
    const timer = setTimeout(() => {
      setAnimation("");
    }, 500);
    return () => clearTimeout(timer);
  }, [view, userType]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(
      `${
        view === "login" ? "Login" : "Registration"
      } successful for ${userType}`
    );
    setView("welcome");
    setUserType(null);
    setFormData({
      username: "",
      password: "",
      confirmPassword: "",
      email: "",
      fullName: "",
    });
  };

  const changeView = (newView) => {
    setAnimation("animate-out");
    setTimeout(() => {
      setView(newView);
      if (newView === "welcome") {
        setUserType(null);
      }
    }, 300);
  };

  const changeUserType = (type) => {
    setAnimation("animate-out");
    setTimeout(() => {
      setUserType(type);
    }, 300);
  };

  const getContainerClass = () => {
    const baseClass = "login-container";
    if (userType === "student") return `${baseClass} student-theme`;
    if (userType === "teacher") return `${baseClass} teacher-theme`;
    return baseClass;
  };

  return (
    <div className="login-system">
      <div className={getContainerClass()}>
     
        <div className="decorative-circle top-right"></div>
        <div className="decorative-circle bottom-left"></div>

        {view === "welcome" && (
          <div className={`welcome-view ${animation}`}>
            <h1 className="app-title">EduPortal</h1>
            <p className="app-subtitle">Welcome to your educational journey</p>

            <div className="button-group">
              <button
                className="primary-button"
                onClick={() => changeView("login")}
              >
                Login
              </button>

              <button
                className="secondary-button"
                onClick={() => changeView("register")}
              >
                Register
              </button>
            </div>
          </div>
        )}

        {view === "login" && (
          <div className={`login-view ${animation}`}>
            <h2 className="view-title">Login</h2>
            <p className="view-subtitle">Access your account</p>

            {!userType ? (
              <div className="user-type-selection">
                <p className="selection-prompt">I am a:</p>
                <div className="user-type-options">
                  <button
                    className="user-type-button"
                    onClick={() => changeUserType("student")}
                  >
                    <div className="user-type-content">
                      <span className="user-type-icon">👨‍🎓</span>
                      <span>Student</span>
                    </div>
                  </button>

                  <button
                    className="user-type-button"
                    onClick={() => changeUserType("teacher")}
                  >
                    <div className="user-type-content">
                      <span className="user-type-icon">👨‍🏫</span>
                      <span>Teacher</span>
                    </div>
                  </button>
                </div>

                <button
                  className="back-button"
                  onClick={() => changeView("welcome")}
                >
                  ← Back to welcome
                </button>
              </div>
            ) : (
              <form
                className={`login-form ${animation}`}
                onSubmit={handleSubmit}
              >
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder={`${
                      userType === "student" ? "student_id" : "teacher_id"
                    }`}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter your password"
                    required
                  />
                </div>

                <div className="form-help">
                  <a href="#" className="form-link">
                    Forgot Password?
                  </a>
                </div>

                <div className="form-actions">
                  <button type="submit" className="submit-button">
                    Login as {userType === "student" ? "Student" : "Teacher"}
                  </button>
                </div>

                <div className="form-navigation">
                  <button
                    type="button"
                    className="nav-button"
                    onClick={() => changeUserType(null)}
                  >
                    ← Change user type
                  </button>
                  <button
                    type="button"
                    className="nav-button"
                    onClick={() => changeView("welcome")}
                  >
                    Back to home
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {view === "register" && (
          <div className={`register-view ${animation}`}>
            <h2 className="view-title">Create Account</h2>
            <p className="view-subtitle">Join our learning community</p>

            {!userType ? (
              <div className="user-type-selection">
                <p className="selection-prompt">I want to register as:</p>
                <div className="user-type-options">
                  <button
                    className="user-type-button"
                    onClick={() => changeUserType("student")}
                  >
                    <div className="user-type-content">
                      <span className="user-type-icon">👨‍🎓</span>
                      <span>Student</span>
                    </div>
                  </button>

                  <button
                    className="user-type-button"
                    onClick={() => changeUserType("teacher")}
                  >
                    <div className="user-type-content">
                      <span className="user-type-icon">👨‍🏫</span>
                      <span>Teacher</span>
                    </div>
                  </button>
                </div>

                <button
                  className="back-button"
                  onClick={() => changeView("welcome")}
                >
                  ← Back to welcome
                </button>
              </div>
            ) : (
              <form
                className={`register-form ${animation}`}
                onSubmit={handleSubmit}
              >
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Choose a username"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Create a password"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Confirm your password"
                    required
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="submit-button">
                    Register as {userType === "student" ? "Student" : "Teacher"}
                  </button>
                </div>

                <div className="form-navigation">
                  <button
                    type="button"
                    className="nav-button"
                    onClick={() => changeUserType(null)}
                  >
                    ← Change user type
                  </button>
                  <button
                    type="button"
                    className="nav-button"
                    onClick={() => changeView("welcome")}
                  >
                    Back to home
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

    
        {(view === "login" || view === "register") && userType && (
          <>
            <div className="decorative-square bottom-right"></div>
            <div className="decorative-square top-left"></div>
          </>
        )}
      </div>
    </div>
  );
};

export default SchoolLoginSystem;
