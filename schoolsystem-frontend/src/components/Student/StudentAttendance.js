import React, { useState, useEffect } from "react";
import {
  Calendar,
  CheckCircle,
  XCircle,
  Star,
  ArrowUp,
  ArrowDown,
  Filter,
} from "lucide-react";
import HorizontalNavbar from "../HorizontalNavbar";
import VerticalNavbar from "../VerticalNavbar";
import "../../Style/StudentAttendance.css";

const StudentAttendance = () => {
  const [attendanceList, setAttendanceList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [filterOptions, setFilterOptions] = useState({
    course: "all",
    status: "all",
    sortDate: "desc",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [summary, setSummary] = useState({
    totalClasses: 0,
    presentCount: 0,
    absentCount: 0,
    attendanceRate: 0,
    totalPoints: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const courseColors = {
    7: "#FBBC05",
    9: "#EA4335",
    10: "#EA4335",
    11: "#F28B82",
  };

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          "https://localhost:7229/api/Attendance/student",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch attendance data");
        }

        const data = await response.json();

        const processedData = data.map((record) => ({
          id: record.id,
          isPresent: record.isPresent,
          extraPoints: record.extraPoints,
          comment: record.comment,
          attendanceDate: new Date(record.attendanceDate),
          formattedDate: new Date(record.attendanceDate).toLocaleDateString(
            "en-US",
            {
              year: "numeric",
              month: "short",
              day: "numeric",
            }
          ),
          courseId: record.courseId,
          courseName: record.courseName,
          studentName: record.studentName,
          teacherName: record.teacherName,
        }));

        processedData.sort((a, b) => b.attendanceDate - a.attendanceDate);

        setAttendanceList(processedData);
        setFilteredList(processedData);
        calculateSummary(processedData);
      } catch (err) {
        setError(err.message);
        console.error("Attendance fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filterOptions, attendanceList]);

  const calculateSummary = (data) => {
    const totalClasses = data.length;
    const presentCount = data.filter((item) => item.isPresent).length;
    const absentCount = totalClasses - presentCount;
    const attendanceRate =
      totalClasses > 0 ? (presentCount / totalClasses) * 100 : 0;
    const totalPoints = data.reduce((sum, item) => sum + item.extraPoints, 0);

    setSummary({
      totalClasses,
      presentCount,
      absentCount,
      attendanceRate: attendanceRate.toFixed(1),
      totalPoints: totalPoints.toFixed(1),
    });
  };

  const applyFilters = () => {
    let filtered = [...attendanceList];

    if (filterOptions.course !== "all") {
      filtered = filtered.filter(
        (item) => item.courseId === parseInt(filterOptions.course)
      );
    }

    if (filterOptions.status !== "all") {
      const isPresent = filterOptions.status === "present";
      filtered = filtered.filter((item) => item.isPresent === isPresent);
    }

    filtered.sort((a, b) => {
      return filterOptions.sortDate === "desc"
        ? b.attendanceDate - a.attendanceDate
        : a.attendanceDate - b.attendanceDate;
    });

    setFilteredList(filtered);
  };

  const handleFilterChange = (name, value) => {
    setFilterOptions((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const courses = [...new Set(attendanceList.map((item) => item.courseId))].map(
    (id) => {
      const course = attendanceList.find((item) => item.courseId === id);
      return {
        id,
        name: course ? course.courseName : `Course ${id}`,
      };
    }
  );

  if (loading) {
    return (
      <div className="dashboard-container">
        <main className="dashboard-content-attendance">
          <div className="loading-message">Loading attendance records...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <main className="dashboard-content-attendance">
          <div className="error-message">Error: {error}</div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <main className="dashboard-content-attendance">
        <div className="attendance-header">
          <div className="attendance-title">
            <h1>Attendance Records</h1>
            <p>Track your class attendance and participation</p>
          </div>

          <div className="attendance-summary">
            <div className="summary-card total-classes">
              <div className="summary-icon">
                <Calendar size={24} />
              </div>
              <div className="summary-content">
                <span className="summary-value">{summary.totalClasses}</span>
                <span className="summary-label">Total Classes</span>
              </div>
            </div>

            <div className="summary-card present">
              <div className="summary-icon">
                <CheckCircle size={24} />
              </div>
              <div className="summary-content">
                <span className="summary-value">{summary.presentCount}</span>
                <span className="summary-label">Present</span>
              </div>
            </div>

            <div className="summary-card absent">
              <div className="summary-icon">
                <XCircle size={24} />
              </div>
              <div className="summary-content">
                <span className="summary-value">{summary.absentCount}</span>
                <span className="summary-label">Absent</span>
              </div>
            </div>

            <div className="summary-card rate">
              <div className="summary-content">
                <span className="summary-value">{summary.attendanceRate}%</span>
                <span className="summary-label">Attendance Rate</span>
              </div>
              <div className="attendance-progress">
                <div
                  className="progress-bar"
                  style={{ width: `${summary.attendanceRate}%` }}
                ></div>
              </div>
            </div>

            <div className="summary-card points">
              <div className="summary-icon">
                <Star size={24} />
              </div>
              <div className="summary-content">
                <span className="summary-value">{summary.totalPoints}</span>
                <span className="summary-label">Extra Points</span>
              </div>
            </div>
          </div>
        </div>

        <div className="attendance-filter-section">
          <button className="filter-toggle" onClick={toggleFilters}>
            <Filter size={18} />
            <span>Filters</span>
            {showFilters ? <ArrowUp size={18} /> : <ArrowDown size={18} />}
          </button>

          {showFilters && (
            <div className="filters-container">
              <div className="filter-group">
                <label htmlFor="course-filter">Course:</label>
                <select
                  id="course-filter"
                  value={filterOptions.course}
                  onChange={(e) => handleFilterChange("course", e.target.value)}
                >
                  <option value="all">All Courses</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="status-filter">Attendance:</label>
                <select
                  id="status-filter"
                  value={filterOptions.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="date-sort">Sort by date:</label>
                <select
                  id="date-sort"
                  value={filterOptions.sortDate}
                  onChange={(e) =>
                    handleFilterChange("sortDate", e.target.value)
                  }
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="attendance-records">
          {filteredList.length > 0 ? (
            filteredList.map((record, index) => (
              <div
                className={`attendance-card ${
                  record.isPresent ? "present" : "absent"
                }`}
                key={record.id}
                style={{
                  animationDelay: `${index * 0.05}s`,
                  borderLeft: `4px solid ${
                    courseColors[record.courseId] || "#4285F4"
                  }`,
                }}
              >
                <div className="attendance-date">
                  <Calendar size={16} />
                  <span>{record.formattedDate}</span>
                </div>

                <div className="attendance-details">
                  <h3 className="course-name">{record.courseName}</h3>
                  <p className="teacher-name">Teacher: {record.teacherName}</p>
                </div>

                <div className="attendance-status">
                  {record.isPresent ? (
                    <div className="status present-status">
                      <CheckCircle size={20} />
                      <span>Present</span>
                    </div>
                  ) : (
                    <div className="status absent-status">
                      <XCircle size={20} />
                      <span>Absent</span>
                    </div>
                  )}
                </div>

                {record.isPresent && record.extraPoints > 0 && (
                  <div className="extra-points">
                    <Star size={16} />
                    <span>{record.extraPoints} pts</span>
                  </div>
                )}

                {record.comment && (
                  <div className="comment">
                    <p>"{record.comment}"</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="no-records">
              <p>No attendance records match your filters.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentAttendance;
