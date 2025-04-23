import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Calendar, Plus } from "lucide-react";
import "../../Style/TeacherDashboard.css";
import CourseActions from "./CourseActions";
import HorizontalNavbar from "../HorizontalNavbar";
import VerticalNavbar from "../VerticalNavbar";

const TeacherDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [teacher, setTeacher] = useState({
    name: "Loading...",
    coursesCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [courseFormData, setCourseFormData] = useState({
    title: "",
    description: "",
    timetable: "",
    color: "#4285F4",
    location: "",
    examDate: "",
  });

  const coursesContainerRef = useRef();
  const navigate = useNavigate();
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("https://localhost:7229/api/Courses", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch courses");
        }

        const data = await response.json();
        setCourses(data);

        if (data.length > 0) {
          setTeacher({
            name: data[0].teacherName,
            coursesCount: data.length,
          });
        } else {
          setTeacher((prev) => ({
            ...prev,
            coursesCount: 0,
          }));
        }
      } catch (err) {
        setError(err.message);
        console.error("Error fetching courses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    if (coursesContainerRef.current && courses.length > 0) {
      const containerWidth = coursesContainerRef.current.clientWidth;
      const scrollWidth = coursesContainerRef.current.scrollWidth;
      setMaxScroll(scrollWidth - containerWidth);
    }
  }, [courses]);

  const handleScroll = (direction) => {
    const container = coursesContainerRef.current;
    if (!container) return;

    const scrollAmount = 300;
    let newPosition;

    if (direction === "left") {
      newPosition = Math.max(0, scrollPosition - scrollAmount);
    } else {
      newPosition = Math.min(maxScroll, scrollPosition + scrollAmount);
    }

    container.scrollTo({
      left: newPosition,
      behavior: "smooth",
    });

    setScrollPosition(newPosition);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourseFormData({
      ...courseFormData,
      [name]: value,
    });
  };

  const handleColorSelect = (color) => {
    setCourseFormData({
      ...courseFormData,
      color: color,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("https://localhost:7229/api/Courses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: courseFormData.title,
          description: courseFormData.description,
          timetable: courseFormData.timetable,
          color: courseFormData.color,
          location: courseFormData.location,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create course");
      }

      const newCourse = await response.json();
      setCourses((prev) => [...prev, newCourse]);
      setTeacher((prev) => ({
        ...prev,
        coursesCount: prev.coursesCount + 1,
      }));
      setShowModal(false);
      setCourseFormData({
        title: "",
        description: "",
        timetable: "",
        color: "#4285F4",
        location: "",
        examDate: "",
      });
    } catch (err) {
      console.error("Error creating course:", err);
      alert(`Error: ${err.message}`);
    }
  };

  const navigateToTimetable = () => {
    window.location.href = "/timetable";
  };

  const navigateToCourse = (courseId) => {
    navigate(`/courses/${courseId}`);
  };

  const colorOptions = [
    { name: "Blue", value: "#4285F4" },
    { name: "Red", value: "#EA4335" },
    { name: "Yellow", value: "#FBBC05" },
    { name: "Green", value: "#34A853" },
    { name: "Purple", value: "#673AB7" },
    { name: "Pink", value: "#F28B82" },
    { name: "Cyan", value: "#00BCD4" },
    { name: "DarkPink", value: "#b73a57" },
    { name: "GreenYellow", value: "#9eb73a" },
    { name: "Turquoise", value: "#3ab79a" },
  ];

  if (loading) {
    return (
      <div className="dashboard-container">
        <HorizontalNavbar />
        <main className="dashboard-content-teacher">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <HorizontalNavbar />
        <main className="dashboard-content-teacher">
          <div className="error-message">Error: {error}</div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <HorizontalNavbar />
      <main className="dashboard-content-teacher">
        <div className="welcome-section">
          <div className="welcome-message">
            <h1>Welcome, {teacher.name}</h1>
            <p>
              Manage your courses, schedule, and student progress all in one
              place.
            </p>
          </div>

          <div className="stats-card">
            <div className="stats-info">
              <h2>Teaching Stats</h2>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-value">{teacher.coursesCount}</span>
                  <span className="stat-label">Active Courses</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">
                    {new Date().toLocaleDateString("en-GB", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <Link to="/timetable" className="action-button timetable-button">
            <Calendar size={20} />
            <span>View Timetable</span>
          </Link>

          <button
            className="action-button create-course-button"
            onClick={() => setShowModal(true)}
          >
            <Plus size={20} />
            <span>Create New Course</span>
          </button>
        </div>

        <div className="courses-section">
          <div className="section-header">
            <h2>Your Courses</h2>
            {courses.length > 0 && (
              <div className="navigation-buttons">
                <button
                  className="nav-button"
                  onClick={() => handleScroll("left")}
                  disabled={scrollPosition <= 0}
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  className="nav-button"
                  onClick={() => handleScroll("right")}
                  disabled={scrollPosition >= maxScroll}
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            )}
          </div>

          <div className="courses-container" ref={coursesContainerRef}>
            {courses.length > 0 ? (
              courses.map((course) => (
                <div
                  className="course-card"
                  key={course.id}
                  style={{ backgroundColor: course.color }}
                  onClick={() => navigateToCourse(course.id)}
                >
                  <h3>{course.title}</h3>
                  <p className="course-description">
                    {course.description.length > 20
                      ? course.description.slice(0, 25) + "..."
                      : course.description}
                  </p>
                  <p className="course-created">
                    {new Date(course.createdDate).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <div className="no-courses-message">
                <p>You don't have any courses yet. Create your first course!</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Create New Course</h2>
              <button
                className="close-button"
                onClick={() => setShowModal(false)}
              >
                &times;
              </button>
            </div>

            <form className="course-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="title">Course Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={courseFormData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Algebra, Geometry, Calculus"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={courseFormData.description}
                  onChange={handleInputChange}
                  required
                  placeholder="Brief description of the course content and objectives"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label htmlFor="timetable">Timetable *</label>
                <input
                  type="text"
                  id="timetable"
                  name="timetable"
                  value={courseFormData.timetable}
                  placeholder="week day/begin(10:00am)/end(12:00pm)"
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="color">Course Color *</label>
                <div className="color-picker">
                  {colorOptions.map((color) => (
                    <div
                      key={color.value}
                      className={`color-option ${
                        courseFormData.color === color.value ? "selected" : ""
                      }`}
                      style={{ backgroundColor: color.value }}
                      onClick={() => handleColorSelect(color.value)}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-button">
                  Create Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
