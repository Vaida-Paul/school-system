import React, { useState, useEffect, useRef } from "react";
import "../../Style/StudentDashboard.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import HorizontalNavbar from "../HorizontalNavbar";
import VerticalNavbar from "../VerticalNavbar";

const StudentDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [grades, setGrades] = useState([]);
  const [student, setStudent] = useState({
    name: "Loading...",
    grade: 0,
    performance: "Loading...",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const coursesContainerRef = useRef();
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        const [coursesRes, gradesRes] = await Promise.all([
          fetch("https://localhost:7229/api/StudentCourses", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch("https://localhost:7229/api/Grades/student", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        if (!coursesRes.ok) throw new Error("Failed to fetch courses");
        if (!gradesRes.ok) throw new Error("Failed to fetch grades");

        const coursesData = await coursesRes.json();
        const gradesData = await gradesRes.json();

        setCourses(coursesData);
        setGrades(gradesData);

        const avgGrade =
          gradesData.length > 0
            ? gradesData.reduce((sum, grade) => sum + grade.mark, 0) /
              gradesData.length
            : 0;

        const studentName =
          gradesData.length > 0 ? gradesData[0].studentName : "Student";

        setStudent({
          name: studentName,
          grade: avgGrade.toFixed(2),
          performance: determinePerformance(avgGrade),
        });
      } catch (err) {
        setError(err.message);
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (coursesContainerRef.current && courses.length > 0) {
      const containerWidth = coursesContainerRef.current.clientWidth;
      const scrollWidth = coursesContainerRef.current.scrollWidth;
      setMaxScroll(scrollWidth - containerWidth);
    }
  }, [courses]);

  const determinePerformance = (avgGrade) => {
    if (avgGrade >= 9) return "Excellent";
    if (avgGrade >= 8) return "Very Good";
    if (avgGrade >= 7) return "Good";
    if (avgGrade >= 5) return "Satisfactory";
    return "Needs Improvement";
  };

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

  if (loading) {
    return <div className="loading-message">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <div className="dashboard-container">
      <main className="dashboard-content">
        <div className="welcome-section">
          <div className="welcome-message">
            <h1>Welcome back, {student.name}</h1>
            <p>
              It's great to see you again. Ready to continue your learning
              journey?
            </p>
          </div>

          <div className="grade-card">
            <div className="grade-info">
              <h2>Current Performance</h2>
              <div className="grade">{student.grade}</div>
              <p>{student.performance}</p>
            </div>
            {student.grade >= 8 && (
              <div className="congratulation-message">
                <div className="confetti"></div>
                <h3>Congratulations!</h3>
                <p>You're doing amazing work. Keep it up!</p>
              </div>
            )}
          </div>
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
              courses.map((course) => {
                const courseGrades = grades.filter(
                  (grade) => grade.courseId === course.id
                );
                const highestGrade =
                  courseGrades.length > 0
                    ? Math.max(...courseGrades.map((g) => g.mark))
                    : null;

                return (
                  <div
                    className="course-card"
                    key={course.id}
                    style={{ backgroundColor: getRandomColor(course.id) }}
                  >
                    <h3>{course.title}</h3>
                    <p>Taught by {course.teacherName}</p>
                    {highestGrade && (
                      <p className="course-grade">
                        Highest Grade: {highestGrade}
                      </p>
                    )}
                    {courseGrades.length > 0 ? (
                      <p className="course-grade-count">
                        {courseGrades.length} grade(s)
                      </p>
                    ) : (
                      <p className="course-grade-count">No grades yet</p>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="no-courses-message">
                You are not enrolled in any courses yet.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

const getRandomColor = (id) => {
  const colors = [
    "#FBBC05",
    "#EA4335",
    "#F28B82",
    "#34A853",
    "#4285F4",
    "#673AB7",
    "#FF9800",
  ];
  return colors[id % colors.length];
};

export default StudentDashboard;
