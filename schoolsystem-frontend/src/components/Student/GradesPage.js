import React, { useState, useEffect } from "react";
import "../../Style/GradesPage.css";
import HorizontalNavbar from "../HorizontalNavbar";
import VerticalNavbar from "../VerticalNavbar";
import { Star, ChevronDown, ChevronUp, Filter, Search } from "lucide-react";

const GradesPage = () => {
  const [grades, setGrades] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          "https://localhost:7229/api/Grades/student",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch grades");
        }

        const data = await response.json();

        const formattedGrades = data.map((grade) => ({
          id: grade.id,
          mark: grade.mark,
          comment: grade.comment,
          createdDate: grade.createdDate,
          courseId: grade.courseId,
          courseName: grade.courseName,
          studentName: grade.studentName,
          teacherName: grade.teacherName,

          formattedDate: new Date(grade.createdDate).toLocaleDateString(),
        }));

        setGrades(formattedGrades);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching grades:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGrades();
  }, []);

  const toggleExpand = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const filteredGrades = grades
    .filter((grade) => {
      if (filter === "all") return true;
      if (filter === "excellent") return grade.mark >= 9;
      if (filter === "good job") return grade.mark >= 7 && grade.mark < 9;
      if (filter === "you_can_do_better") return grade.mark >= 5 && grade < 7;
      if (filter === "needs_improvement") return grade.mark < 5;
      return true;
    })
    .filter(
      (grade) =>
        grade.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        grade.teacherName.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const getGradeColor = (mark) => {
    if (mark >= 9) return "#4CAF50";
    if (mark >= 7) return "#2196F3";
    if (mark >= 5) return "#FFC107";
    return "#F44336";
  };

  const calculateAverage = () => {
    if (grades.length === 0) return 0;
    const sum = grades.reduce((acc, grade) => acc + grade.mark, 0);
    return (sum / grades.length).toFixed(2);
  };

  if (isLoading) {
    return (
      <div className="grades-container">
        <main className="grades-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your grades...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grades-container">
        <main className="grades-content">
          <div className="error-message">Error loading grades: {error}</div>
        </main>
      </div>
    );
  }

  return (
    <div className="grades-container">
      <main className="grades-content">
        <div className="grades-header">
          <h1>Your Grades</h1>
          {grades.length > 0 && (
            <div className="average-grade">
              <span>Average Grade: </span>
              <span className="average-value">{calculateAverage()}</span>
            </div>
          )}
        </div>

        <div className="grades-controls">
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
            <Filter size={18} className="filter-icon" />
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All Grades</option>
              <option value="excellent">Excellent (9-10)</option>
              <option value="good_job">Good (7-8)</option>
              <option value="you_can_do_better">You can do better (5-6)</option>
              <option value="needs_improvement">Needs Improvement (1-4)</option>
            </select>
          </div>
        </div>

        <div className="grades-table-container">
          <table className="grades-table">
            <thead>
              <tr>
                <th>Course</th>
                <th>Teacher</th>
                <th>Grade</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredGrades.length === 0 ? (
                <tr className="no-results-row">
                  <td colSpan="5">
                    {grades.length === 0
                      ? "You don't have any grades yet."
                      : "No grades match your search criteria."}
                  </td>
                </tr>
              ) : (
                filteredGrades.map((grade) => (
                  <React.Fragment key={grade.id}>
                    <tr
                      className="grade-row"
                      onClick={() => toggleExpand(grade.id)}
                    >
                      <td className="course-cell">
                        <span className="course-name">{grade.courseName}</span>
                        <span className="course-id">ID: {grade.courseId}</span>
                      </td>
                      <td className="teacher-cell">{grade.teacherName}</td>
                      <td className="grade-cell">
                        <span
                          className="grade-badge"
                          style={{
                            backgroundColor: getGradeColor(grade.mark),
                          }}
                        >
                          {grade.mark}
                        </span>
                      </td>
                      <td className="date-cell">{grade.formattedDate}</td>
                      <td className="expand-cell">
                        {expandedRow === grade.id ? (
                          <ChevronUp size={18} />
                        ) : (
                          <ChevronDown size={18} />
                        )}
                      </td>
                    </tr>
                    {expandedRow === grade.id && (
                      <tr className="details-row">
                        <td colSpan="5">
                          <div className="grade-details">
                            <div className="comment-section">
                              <h4>Teacher's Comment:</h4>
                              <p>"{grade.comment || "No comment provided"}"</p>
                            </div>
                            <div className="additional-info">
                              <div>
                                <span className="info-label">Full Date:</span>
                                <span>
                                  {new Date(grade.createdDate).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default GradesPage;
