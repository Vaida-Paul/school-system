import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AuthSystem from "./components/AuthSystem";
import ExamsPage from "./components/Student/ExamsPage";
import GradesPage from "./components/Student/GradesPage";
import StudentDashboard from "./components/Student/StudentDashboard";
import Timetable from "./components/Timetable";
import StudentAttendance from "./components/Student/StudentAttendance";
import TeacherDashboard from "./components/Teacher/TeacherDasboard";
import CourseActions from "./components/Teacher/CourseActions";

import StudentLayout from "./components/Student/StudentLayout";
import TeacherLayout from "./components/Teacher/TeacherLayout";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token && role) {
      setIsAuthenticated(true);
      setUserRole(role);
    }
    setLoading(false);
  }, []);

  const handleLogin = (token, role) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    setIsAuthenticated(true);
    setUserRole(role);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setIsAuthenticated(false);
    setUserRole(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        {!isAuthenticated ? (
          <Route path="*" element={<AuthSystem onLogin={handleLogin} />} />
        ) : userRole === "Teacher" ? (
          <Route path="/" element={<TeacherLayout />}>
            <Route path="/" element={<TeacherLayout />}>
              <Route
                index
                element={<TeacherDashboard onLogout={handleLogout} />}
              />
              <Route
                path="timetable"
                element={<Timetable userRole={userRole} />}
              />
              <Route path="/courses/:courseId" element={<CourseActions />} />
            </Route>
          </Route>
        ) : (
          <Route path="/" element={<StudentLayout />}>
            <Route
              index
              element={<StudentDashboard onLogout={handleLogout} />}
            />
            <Route
              path="timetable"
              element={<Timetable userRole={userRole} />}
            />
            <Route path="attendance" element={<StudentAttendance />} />
            <Route path="grades" element={<GradesPage />} />
            <Route path="exams" element={<ExamsPage />} />
          </Route>
        )}

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
