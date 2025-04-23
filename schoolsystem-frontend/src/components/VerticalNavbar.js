import { React, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "../Style/VerticalNavbar.css";
import { Home, Book, Calendar, Users, Settings } from "lucide-react";
import attendenceLight from "../images/AttendenceLight.png";
import attendenceDark from "../images/AttendenceDark.png";
import timetableLight from "../images/timetableLight.png";
import timetableDark from "../images/timetableDark.png";
import dashboardLight from "../images/StudentDashboardLight.png";
import dashboardDark from "../images/StudentDashboardDark.png";
import examsDark from "../images/StudentExamsDark.png";
import examsLight from "../images/StudentExamsLight.png";
import gradesDark from "../images/StudentGradesDark.png";
import gradesLight from "../images/StudentGradesLight.png";

const VerticalNavbar = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.body.classList.contains("dark-theme"));
    };

    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);
  return (
    <nav className="vertical-navbar">
      <ul className="nav-links">
        <li className={`nav-item ${location.pathname === "/" ? "active" : ""}`}>
          <Link to="/dashboard">
            <img
              src={isDarkMode ? dashboardLight : dashboardDark}
              className="icon"
              alt="Dashboard"
            />
            <span className="tooltip">Dashboard</span>
          </Link>
        </li>
        <li
          className={`nav-item ${
            location.pathname === "/timetable" ? "active" : ""
          }`}
        >
          <Link to="/timetable">
            <img
              src={isDarkMode ? timetableLight : timetableDark}
              className="icon"
              alt="Timetable"
            />
            <span className="tooltip">TimeTable</span>
          </Link>
        </li>
        <li
          className={`nav-item ${
            location.pathname === "/attendance" ? "active" : ""
          }`}
        >
          <Link to="/attendance">
            <img
              src={isDarkMode ? attendenceLight : attendenceDark}
              className="icon"
              alt="Attendance"
            />
            <span className="tooltip">Attendance</span>
          </Link>
        </li>
        <li
          className={`nav-item ${
            location.pathname === "/grades" ? "active" : ""
          }`}
        >
          <Link to="/grades">
            <img
              src={isDarkMode ? gradesLight : gradesDark}
              className="icon"
              alt="Grades"
            />
            <span className="tooltip">Grades</span>
          </Link>
        </li>
        <li
          className={`nav-item ${
            location.pathname === "/exams" ? "active" : ""
          }`}
        >
          <Link to="/exams">
            <img
              src={isDarkMode ? examsLight : examsDark}
              className="icon"
              alt="Exams"
            />
            <span className="tooltip">Exams</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default VerticalNavbar;
