import React, { useState, useEffect } from "react";
import "../../Style/ExamsPage.css";
import HorizontalNavbar from "../HorizontalNavbar";
import VerticalNavbar from "../VerticalNavbar";
import {
  Calendar,
  MapPin,
  Clock,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Search,
} from "lucide-react";

const ExamsPage = () => {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudentCourses = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          "https://localhost:7229/api/StudentCourses",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch courses");
        }

        const data = await response.json();

        const filteredData = data.filter(
          (course) =>
            filter === "all" ||
            (filter === "scheduled" && course.examDate) ||
            (filter === "unscheduled" && !course.examDate)
        );

        setCourses(filteredData);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching courses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentCourses();
  }, [filter]);

  const toggleExpand = (id) => {
    setExpandedCourse(expandedCourse === id ? null : id);
  };

  const filteredCourses = courses
    .filter((course) => {
      if (filter === "all") return true;
      if (filter === "scheduled") return course.examDate !== null;
      if (filter === "unscheduled") return course.examDate === null;
      return true;
    })
    .filter(
      (course) =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.teacherName.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const formatExamDate = (dateString) => {
    if (!dateString) return "Not scheduled yet";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDaysUntilExam = (examDate) => {
    if (!examDate) return null;
    const today = new Date();
    const examDay = new Date(examDate);
    const diffTime = examDay - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "Exam passed";
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    return `${diffDays} days remaining`;
  };

  if (loading) {
    return (
      <div className="exams-container">
        <main className="exams-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading exam schedule...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="exams-container">
        <main className="exams-content">
          <div className="error-message">
            Error loading exam schedule: {error}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="exams-container">
      <main className="exams-content">
        <div className="exams-header">
          <h1>Exam Schedule</h1>
          <p>View all your upcoming exams and their details</p>
        </div>

        <div className="exams-controls">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search courses or teachers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-dropdown">
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All Courses</option>
              <option value="scheduled">Scheduled Exams</option>
              <option value="unscheduled">Unscheduled Exams</option>
            </select>
          </div>
        </div>

        <div className="exams-table-container">
          {filteredCourses.length === 0 ? (
            <div className="no-exams">
              <p>No courses match your search criteria.</p>
            </div>
          ) : (
            <table className="exams-table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Teacher</th>
                  <th>Exam Date</th>
                  <th>Location</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((course) => (
                  <React.Fragment key={course.id}>
                    <tr
                      className={`exam-row ${
                        !course.examDate ? "unscheduled" : ""
                      }`}
                      onClick={() => toggleExpand(course.id)}
                    >
                      <td className="course-cell">
                        <div
                          className="course-color"
                          style={{ backgroundColor: course.color || "#6c757d" }}
                        ></div>
                        <div className="course-info">
                          <span className="course-title-exams">
                            {course.title}
                          </span>
                          <span className="course-id">ID: {course.id}</span>
                        </div>
                      </td>
                      <td className="teacher-cell">{course.teacherName}</td>
                      <td className="date-cell">
                        <div className="date-info">
                          <Calendar size={16} className="info-icon" />
                          <span>{formatExamDate(course.examDate)}</span>
                          {course.examDate && (
                            <span className="days-remaining">
                              {getDaysUntilExam(course.examDate)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="location-cell">
                        <div className="location-info">
                          <MapPin size={16} className="info-icon" />
                          <span>{course.location || "Not specified"}</span>
                        </div>
                      </td>
                      <td className="expand-cell">
                        {expandedCourse === course.id ? (
                          <ChevronUp size={18} />
                        ) : (
                          <ChevronDown size={18} />
                        )}
                      </td>
                    </tr>
                    {expandedCourse === course.id && (
                      <tr className="details-row">
                        <td colSpan="5">
                          <div className="exam-details">
                            <div className="detail-section">
                              <h4>Course Description</h4>
                              <p>{course.description}</p>
                            </div>
                            <div className="detail-section">
                              <h4>Additional Information</h4>
                              <div className="additional-info-grid">
                                <div className="info-item">
                                  <Clock size={16} />
                                  <span>
                                    <strong>Duration:</strong>{" "}
                                    {course.examDate
                                      ? "2 hours"
                                      : "Not specified"}
                                  </span>
                                </div>
                                <div className="info-item">
                                  <BookOpen size={16} />
                                  <span>
                                    <strong>Materials:</strong>{" "}
                                    {course.examDate
                                      ? "Closed book"
                                      : "Not specified"}
                                  </span>
                                </div>
                              </div>
                            </div>
                            {course.examDate && (
                              <div className="countdown-section">
                                <div className="countdown-box">
                                  <span className="countdown-label">
                                    Exam Countdown
                                  </span>
                                  <span className="countdown-value">
                                    {getDaysUntilExam(course.examDate)}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
};

export default ExamsPage;
