import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Avatar from "react-avatar";
import {
  Calendar,
  Users,
  BookOpen,
  Award,
  ChevronLeft,
  CheckCircle,
  XCircle,
  Edit2,
  Trash2,
  Plus,
  PlusCircle,
  FileText,
  Check,
  User,
  Clock,
  MapPin,
  GraduationCap,
  ClipboardList,
  BarChart2,
  Bookmark,
  List,
  Grid,
  LayoutDashboard,
} from "lucide-react";
import "../../Style/CourseActions.css";
import HorizontalNavbar from "../HorizontalNavbar";

const CourseActions = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [examModalOpen, setExamModalOpen] = useState(false);
  const [allStudents, setAllStudents] = useState([]);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [expandedStudentId, setExpandedStudentId] = useState(null);
  const [currentStudentId, setCurrentStudentId] = useState(null);

  const fetchWithAuth = async (url, options = {}) => {
    const token = localStorage.getItem("token");
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    };

    try {
      const response = await fetch(`https://localhost:7229/api${url}`, {
        ...options,
        headers,
      });
      console.log(response);

      if (!response.ok) {
        let errorMsg = `Request failed with status ${response.status}`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.message || errorMsg;
        } catch (e) {
          console.warn("Couldn't parse error response", e);
        }
        throw new Error(errorMsg);
      }

      if (response.status === 204) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error(`API call failed for ${url}:`, error);
      throw error;
    }
  };

  const [examForm, setExamForm] = useState({
    location: "",
    examDate: "",
  });

  const [attendanceForm, setAttendanceForm] = useState({
    isPresent: true,
    extraPoints: 0,
    comment: "",
    attendanceDate: new Date().toISOString().slice(0, 16),
    courseId: parseInt(courseId),
    studentId: "",
  });

  const [gradeForm, setGradeForm] = useState({
    mark: 0,
    comment: "",
    courseId: parseInt(courseId),
    studentId: "",
  });

  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [showStudentAttendance, setShowStudentAttendance] = useState(false);
  const [studentAttendance, setStudentAttendance] = useState([]);
  const [currentStudentName, setCurrentStudentName] = useState("");
  const [viewMode, setViewMode] = useState("grid");

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const data = await fetchWithAuth(`/Courses/${courseId}`);
        console.log(data);
        if (!data) {
          throw new Error("Course not found");
        }
        setCourse({
          id: data.id,
          title: data.title,
          description: data.description,
          timetable: data.timetable,
          color: data.color,
          location: data.location,
          examDate: data.examDate,
          createdDate: data.createdDate,
          teacherName: data.teacherName,
        });
      } catch (err) {
        console.error("Error fetching course:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);
  const deleteCurrentCourse = async () => {
    if (
      !window.confirm(
        `Are you sure you want to permanently delete "${course.title}"?`
      )
    ) {
      return;
    }

    try {
      const result = await fetchWithAuth(`/Courses/${courseId}`, {
        method: "DELETE",
      });

      if (result === null || (result && result.Message)) {
        navigate("/teacher-dashboard", {
          state: {
            success: true,
            message:
              result?.Message ||
              `Course "${course.title}" deleted successfully`,
          },
        });
      } else {
        throw new Error("Unexpected response from server");
      }
    } catch (err) {
      console.error("Error deleting course:", err);
      alert(
        err.message.includes("404")
          ? "Course not found (may have already been deleted)"
          : err.message
      );
    }
  };

  useEffect(() => {
    const fetchAllStudents = async () => {
      try {
        const data = await fetchWithAuth("/Enrollment/Students");
        setAllStudents(data);
      } catch (err) {
        console.error("Error fetching students:", err);
      }
    };
    fetchAllStudents();
  }, []);

  useEffect(() => {
    const fetchEnrolledStudents = async () => {
      try {
        const data = await fetchWithAuth(`/Enrollment/TeacherStudents`);

        const filtered = data.filter((student) =>
          student.courses.some((course) => course.id === parseInt(courseId))
        );
        setEnrolledStudents(filtered);
      } catch (err) {
        console.error("Error fetching enrolled students:", err);
      }
    };
    fetchEnrolledStudents();
  }, [courseId]);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const data = await fetchWithAuth(`/Grades/teacher/course/${courseId}`);
        setGrades(data);
      } catch (err) {
        console.error("Error fetching grades:", err);
      }
    };
    fetchGrades();
  }, [courseId]);

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleExamSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetchWithAuth(`/Courses/${courseId}/programed-exam`, {
        method: "PUT",
        body: JSON.stringify({
          ExamDate: examForm.examDate,
          Location: examForm.location,
        }),
      });

      const data = await fetchWithAuth(`/Courses/${courseId}`);
      setCourse(data);
      setExamModalOpen(false);
    } catch (err) {
      console.error("Error updating exam:", err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleEnrollStudent = async (studentEmail) => {
    try {
      await fetchWithAuth("/Enrollment/EnrollStudent", {
        method: "POST",
        body: JSON.stringify({
          StudentEmail: studentEmail,
          CourseId: parseInt(courseId),
        }),
      });

      const data = await fetchWithAuth("/Enrollment/TeacherStudents");
      const filtered = data.filter((student) =>
        student.courses.some((course) => course.id === parseInt(courseId))
      );
      setEnrolledStudents(filtered);
    } catch (err) {
      console.error("Error enrolling student:", err);
      alert(`Error: ${err.message}`);
    }
  };

  const toggleStudentActions = (studentId) => {
    setExpandedStudentId(expandedStudentId === studentId ? null : studentId);
  };

  const openAttendanceModal = (studentId) => {
    setAttendanceForm({
      ...attendanceForm,
      studentId,
    });
    setShowAttendanceModal(true);
  };

  const openGradeModal = (studentId) => {
    setGradeForm({
      ...gradeForm,
      studentId,
    });
    setShowGradeModal(true);
  };

  const handleAttendanceSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetchWithAuth("/Attendance", {
        method: "POST",
        body: JSON.stringify({
          isPresent: attendanceForm.isPresent,
          extraPoints: Number(attendanceForm.extraPoints),
          comment: attendanceForm.comment,
          attendanceDate: new Date(attendanceForm.attendanceDate).toISOString(),
          courseId: parseInt(courseId),
          studentId: attendanceForm.studentId,
        }),
      });

      const updatedAttendance = await fetchWithAuth(
        `/Attendance/teacher/course/${courseId}/student/${attendanceForm.studentId}`
      );
      setStudentAttendance(updatedAttendance);

      setShowAttendanceModal(false);
    } catch (err) {
      console.error("Error adding attendance:", err);
      alert(`Error: ${err.message}. Please check the data and try again.`);
    }
  };
  const deleteAttendance = async (attendanceId) => {
    try {
      await fetchWithAuth(`/Attendance/${attendanceId}`, {
        method: "DELETE",
      });

      const updatedAttendance = await fetchWithAuth(
        `/Attendance/teacher/course/${courseId}/student/${currentStudentId}`
      );
      setStudentAttendance(updatedAttendance || []);
    } catch (err) {
      console.error("Error deleting attendance:", err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetchWithAuth("/Grades", {
        method: "POST",
        body: JSON.stringify({
          Mark: parseFloat(gradeForm.mark),
          Comment: gradeForm.comment,
          CourseId: parseInt(courseId),
          StudentId: gradeForm.studentId,
        }),
      });

      const data = await fetchWithAuth(`/Grades/teacher/course/${courseId}`);
      setGrades(data);
      setShowGradeModal(false);
    } catch (err) {
      console.error("Error adding grade:", err);
      alert(`Error: ${err.message}`);
    }
  };
  const deleteGrade = async (gradeId) => {
    try {
      await fetchWithAuth(`/Grades/${gradeId}`, {
        method: "DELETE",
      });

      const updatedGrades = await fetchWithAuth(
        `/Grades/teacher/course/${courseId}`
      );
      setGrades(updatedGrades);
    } catch (err) {
      console.error("Error deleting grade:", err);
      alert(`Error: ${err.message}`);
    }
  };

  const viewStudentAttendance = async (studentId) => {
    setCurrentStudentId(studentId);
    try {
      const student = enrolledStudents.find((s) => s.id === studentId);
      if (student) {
        setCurrentStudentName(student.fullName);

        const attendance = await fetchWithAuth(
          `/Attendance/teacher/course/${courseId}/student/${studentId}`
        );

        setStudentAttendance(attendance || []);
        setShowStudentAttendance(true);
      }
    } catch (err) {
      console.error("Error fetching attendance:", err);
      setStudentAttendance([]);
      setShowStudentAttendance(true);
    }
  };

  const calculateAverageGrade = () => {
    if (grades.length === 0) return 0;
    const sum = grades.reduce((acc, grade) => acc + grade.mark, 0);
    return (sum / grades.length).toFixed(1);
  };

  const getAttendanceStats = () => {
    if (studentAttendance.length === 0) return { present: 0, absent: 0 };

    const present = studentAttendance.filter((a) => a.isPresent).length;
    const absent = studentAttendance.length - present;

    return { present, absent };
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading course details...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="error-container">
        <h2>Course not found</h2>
        <button onClick={handleBackClick} className="back-button">
          <ChevronLeft size={20} />
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="course-detail-container">
      <HorizontalNavbar />

      <main className="course-detail-content">
        <div
          className="course-header"
          style={{ backgroundColor: course.color }}
        >
          <button onClick={handleBackClick} className="back-button">
            <ChevronLeft size={20} />
            Back
          </button>
          <div className="course-title-container">
            <h1>{course.title}</h1>
            <p className="course-description">{course.description}</p>
            <div className="course-meta">
              <span className="delete-btn-course" onClick={deleteCurrentCourse}>
                <Trash2 /> Delete Course
              </span>
              <span>
                <User size={16} /> {course.teacherName}
              </span>
              <span>
                <Clock size={16} /> Created:{" "}
                {new Date(course.createdDate).toLocaleDateString()}
              </span>
              {course.timetable && (
                <span>
                  <Calendar size={16} /> Schedule:{" "}
                  {new Date(course.timetable).toLocaleString()}
                </span>
              )}
              {course.location && (
                <span>
                  <MapPin size={16} /> {course.location}
                </span>
              )}
              {course.examDate && (
                <span className="exam-date">
                  <ClipboardList size={16} /> Exam:{" "}
                  {new Date(course.examDate).toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="tabs-container">
          <div className="tabs">
            <button
              className={`tab ${activeTab === "dashboard" ? "active" : ""}`}
              onClick={() => setActiveTab("dashboard")}
            >
              <LayoutDashboard size={18} />
              Dashboard
            </button>
            <button
              className={`tab ${activeTab === "students" ? "active" : ""}`}
              onClick={() => setActiveTab("students")}
            >
              <Users size={18} />
              Students
            </button>
            <button
              className={`tab ${activeTab === "grades" ? "active" : ""}`}
              onClick={() => setActiveTab("grades")}
            >
              <Award size={18} />
              Grades
            </button>
            <button
              className={`tab ${activeTab === "enrollment" ? "active" : ""}`}
              onClick={() => setActiveTab("enrollment")}
            >
              <PlusCircle size={18} />
              Enrollment
            </button>
            <button
              className={`tab ${activeTab === "exam" ? "active" : ""}`}
              onClick={() => setActiveTab("exam")}
            >
              <ClipboardList size={18} />
              Exam
            </button>
          </div>

          {activeTab !== "dashboard" && (
            <div className="view-toggle">
              <button
                className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
                onClick={() => setViewMode("grid")}
              >
                <Grid size={18} />
              </button>
              <button
                className={`view-btn ${viewMode === "list" ? "active" : ""}`}
                onClick={() => setViewMode("list")}
              >
                <List size={18} />
              </button>
            </div>
          )}
        </div>

        <div className="tab-content">
          {activeTab === "dashboard" && (
            <div className="dashboard-tab">
              <div className="dashboard-cards">
                <div className="dashboard-card stats-card">
                  <div className="card-icon">
                    <Users size={24} />
                  </div>
                  <div className="card-content">
                    <h3>Enrolled Students</h3>
                    <div className="stat-value">{enrolledStudents.length}</div>
                    <button
                      className="card-action"
                      onClick={() => setActiveTab("students")}
                    >
                      View All
                    </button>
                  </div>
                </div>

                <div className="dashboard-card stats-card">
                  <div className="card-icon">
                    <Award size={24} />
                  </div>
                  <div className="card-content">
                    <h3>Average Grade</h3>
                    <div className="stat-value">{calculateAverageGrade()}</div>
                    <button
                      className="card-action"
                      onClick={() => setActiveTab("grades")}
                    >
                      View Grades
                    </button>
                  </div>
                </div>

                <div className="dashboard-card stats-card">
                  <div className="card-icon">
                    <Calendar size={24} />
                  </div>
                  <div className="card-content">
                    <h3>Upcoming Exam</h3>
                    <div className="stat-value">
                      {course.examDate
                        ? new Date(course.examDate).toLocaleDateString()
                        : "Not Scheduled"}
                    </div>
                    <button
                      className="card-action"
                      onClick={() => setExamModalOpen(true)}
                    >
                      {course.examDate ? "Update" : "Schedule"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="dashboard-sections">
                <div className="dashboard-section recent-grades">
                  <h3>Recent Grades</h3>
                  {grades.length === 0 ? (
                    <div className="empty-state">
                      <p>No grades recorded yet</p>
                    </div>
                  ) : (
                    <div className="grades-list">
                      {grades.slice(0, 3).map((grade) => (
                        <div key={grade.id} className="grade-item">
                          <div className="grade-student">
                            {/* <Avatar
                              name={enrolledStudents.find(
                                (s) => s.fullName === grade.studentName
                              )}
                              size="100"
                              round={true}
                            /> */}
                            {/* <img
                              src={
                                enrolledStudents.find(
                                  (s) => s.fullName === grade.studentName
                                )?.avatar || (
                                  <Avatar
                                    name={enrolledStudents.fullName}
                                    size="100"
                                    round={true}
                                  />
                                )
                              }
                              alt={grade.studentName}
                              className="student-avatar"
                            /> */}
                            <span>{grade.studentName}</span>
                          </div>
                          <div
                            className={`grade-mark grade-${Math.floor(
                              grade.mark
                            )}`}
                          >
                            {grade.mark}
                          </div>
                          <div className="grade-comment">{grade.comment}</div>
                        </div>
                      ))}
                      {grades.length > 3 && (
                        <button
                          className="view-all-btn"
                          onClick={() => setActiveTab("grades")}
                        >
                          View All Grades
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="dashboard-section quick-actions">
                  <h3>Quick Actions</h3>
                  <div className="action-buttons-grid">
                    <button
                      className="action-btn primary"
                      onClick={() => setActiveTab("enrollment")}
                    >
                      <PlusCircle size={18} />
                      Enroll Students
                    </button>
                    <button
                      className="action-btn secondary"
                      onClick={() => setExamModalOpen(true)}
                    >
                      <ClipboardList size={18} />
                      Schedule Exam
                    </button>
                    <button
                      className="action-btn tertiary"
                      onClick={() => setActiveTab("students")}
                    >
                      <Bookmark size={18} />
                      Record Attendance
                    </button>
                    <button
                      className="action-btn quaternary"
                      onClick={() => setActiveTab("grades")}
                    >
                      <BarChart2 size={18} />
                      Add Grades
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "students" && (
            <div className="students-tab">
              <div className="section-header">
                <h2>Enrolled Students</h2>
                <div className="header-actions">
                  <button
                    className="action-button primary"
                    onClick={() => setActiveTab("enrollment")}
                  >
                    <Plus size={16} />
                    Enroll New Students
                  </button>
                </div>
              </div>

              {enrolledStudents.length === 0 ? (
                <div className="empty-state">
                  <User size={48} />
                  <p>No students enrolled yet</p>
                  <button
                    className="action-button primary"
                    onClick={() => setActiveTab("enrollment")}
                  >
                    Enroll Students
                  </button>
                </div>
              ) : viewMode === "grid" ? (
                <div className="students-grid">
                  {enrolledStudents.map((student) => (
                    <div key={student.id} className="student-card">
                      <div className="student-avatar-container">
                        <Avatar
                          name={student.fullName}
                          size="100"
                          round={true}
                        />
                        <div className="student-status"></div>
                      </div>
                      <div className="student-info">
                        <h3>{student.fullName}</h3>
                        <p>{student.email}</p>
                      </div>
                      <div className="student-actions">
                        <button
                          className="action-btn small primary"
                          onClick={() => openGradeModal(student.id)}
                        >
                          <Award size={16} />
                          Grade
                        </button>
                        <button
                          className="action-btn small secondary"
                          onClick={() => openAttendanceModal(student.id)}
                        >
                          <CheckCircle size={16} />
                          Attendance
                        </button>
                        <button
                          className="action-btn small tertiary"
                          onClick={() => viewStudentAttendance(student.id)}
                        >
                          <FileText size={16} />
                          Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="students-table-container">
                  <table className="students-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Email</th>
                        <th>Grades</th>
                        <th>Attendance</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enrolledStudents.map((student) => {
                        const studentGrades = grades.filter(
                          (g) => g.studentName === student.fullName
                        );
                        const averageGrade =
                          studentGrades.length > 0
                            ? studentGrades.reduce(
                                (acc, g) => acc + g.mark,
                                0
                              ) / studentGrades.length
                            : null;

                        return (
                          <React.Fragment key={student.id}>
                            <tr>
                              <td>
                                <div className="student-cell">
                                  <Avatar
                                    name={student.fullName}
                                    size="100"
                                    round={true}
                                  />
                                  <span>{student.fullName}</span>
                                </div>
                              </td>
                              <td>{student.email}</td>
                              <td>
                                {averageGrade ? (
                                  <span
                                    className={`grade-badge grade-${Math.floor(
                                      averageGrade
                                    )}`}
                                  >
                                    {averageGrade.toFixed(1)}
                                  </span>
                                ) : (
                                  <span className="no-grade">No grades</span>
                                )}
                              </td>
                              <td>
                                <span className="attendance-badge present">
                                  <CheckCircle size={14} />
                                  85%
                                </span>
                              </td>
                              <td>
                                <div className="table-actions">
                                  <button
                                    className="action-btn small primary"
                                    onClick={() => openGradeModal(student.id)}
                                    title="Add Grade"
                                  >
                                    <Award size={16} />
                                  </button>
                                  <button
                                    className="action-btn small secondary"
                                    onClick={() =>
                                      openAttendanceModal(student.id)
                                    }
                                    title="Record Attendance"
                                  >
                                    <CheckCircle size={16} />
                                  </button>
                                  <button
                                    className="action-btn small tertiary"
                                    onClick={() =>
                                      viewStudentAttendance(student.id)
                                    }
                                    title="View Details"
                                  >
                                    <FileText size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === "grades" && (
            <div className="grades-tab">
              <div className="section-header">
                <h2>Course Grades</h2>
                <div className="stats-summary">
                  <div className="stat-item">
                    <span className="stat-label">Average Grade</span>
                    <span className="stat-value">
                      {calculateAverageGrade()}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Highest Grade</span>
                    <span className="stat-value">
                      {grades.length > 0
                        ? Math.max(...grades.map((g) => g.mark))
                        : "-"}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Lowest Grade</span>
                    <span className="stat-value">
                      {grades.length > 0
                        ? Math.min(...grades.map((g) => g.mark))
                        : "-"}
                    </span>
                  </div>
                </div>
              </div>

              {grades.length === 0 ? (
                <div className="empty-state">
                  <Award size={48} />
                  <p>No grades recorded yet</p>
                  <p>Add grades from the Students tab</p>
                </div>
              ) : viewMode === "grid" ? (
                <div className="grades-grid">
                  {grades.map((grade) => {
                    const student = enrolledStudents.find(
                      (s) => s.fullName === grade.studentName
                    );
                    return (
                      <div key={grade.id} className="grade-card">
                        <div className="grade-header">
                          <Avatar
                            name={grade.studentName}
                            size="100"
                            round={true}
                          />
                          <div className="student-info">
                            <h3>{grade.studentName}</h3>
                            <p>
                              {new Date(grade.createdDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div
                            className={`grade-value grade-${Math.floor(
                              grade.mark
                            )}`}
                          >
                            {grade.mark}
                          </div>
                        </div>
                        <div className="grade-comment">
                          <p>{grade.comment}</p>
                        </div>
                        <div className="grade-actions">
                          <button className="action-btn small">
                            <Edit2 size={16} />
                          </button>
                          <button
                            className="action-btn small"
                            onClick={() => deleteGrade(grade.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="grades-table-container">
                  <table className="grades-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Mark</th>
                        <th>Comment</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grades.map((grade) => {
                        const student = enrolledStudents.find(
                          (s) => s.fullName === grade.studentName
                        );
                        return (
                          <tr key={grade.id}>
                            <td>
                              <div className="student-cell">
                                <Avatar
                                  name={grade.studentName}
                                  size="100"
                                  round={true}
                                />
                                <span>{grade.studentName}</span>
                              </div>
                            </td>
                            <td>
                              <span
                                className={`grade-badge grade-${Math.floor(
                                  grade.mark
                                )}`}
                              >
                                {grade.mark}
                              </span>
                            </td>
                            <td className="comment-cell">{grade.comment}</td>
                            <td>
                              {new Date(grade.createdDate).toLocaleDateString()}
                            </td>
                            <td>
                              <div className="table-actions">
                                <button className="action-btn small">
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  className="action-btn small"
                                  onClick={() => deleteGrade(grade.id)}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === "enrollment" && (
            <div className="enrollment-tab">
              <div className="section-header">
                <h2>Enroll Students</h2>
                <div className="enrollment-stats">
                  <span>{enrolledStudents.length} enrolled</span>
                  <span>
                    {allStudents.length - enrolledStudents.length} available
                  </span>
                </div>
              </div>

              {allStudents.length === 0 ? (
                <div className="empty-state">
                  <User size={48} />
                  <p>No students available for enrollment</p>
                </div>
              ) : viewMode === "grid" ? (
                <div className="enrollment-grid">
                  {allStudents.map((student) => {
                    const isEnrolled = enrolledStudents.some(
                      (enrolled) => enrolled.id === student.id
                    );

                    return (
                      <div
                        key={student.id}
                        className={`student-card ${
                          isEnrolled ? "enrolled" : ""
                        }`}
                      >
                        <div className="student-avatar-container">
                          <Avatar
                            name={student.fullName}
                            size="100"
                            round={true}
                          />
                          {isEnrolled && (
                            <div className="enrolled-badge">
                              <Check size={16} />
                            </div>
                          )}
                        </div>
                        <div className="student-info">
                          <h3>{student.fullName}</h3>
                          <p>{student.email}</p>
                        </div>
                        <div className="enrollment-action">
                          {isEnrolled ? (
                            <span className="enrolled-text">Enrolled</span>
                          ) : (
                            <button
                              className="enroll-btn"
                              onClick={() => handleEnrollStudent(student.email)}
                            >
                              <Plus size={16} />
                              Enroll
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="enrollment-table-container">
                  <table className="enrollment-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allStudents.map((student) => {
                        const isEnrolled = enrolledStudents.some(
                          (enrolled) => enrolled.id === student.id
                        );

                        return (
                          <tr
                            key={student.id}
                            className={isEnrolled ? "enrolled" : ""}
                          >
                            <td>
                              <div className="student-cell">
                                <Avatar
                                  name={student.fullName}
                                  size="100"
                                  round={true}
                                />

                                <span>{student.fullName}</span>
                              </div>
                            </td>
                            <td>{student.email}</td>
                            <td>
                              {isEnrolled ? (
                                <span className="status-badge enrolled">
                                  <CheckCircle size={14} />
                                  Enrolled
                                </span>
                              ) : (
                                <span className="status-badge not-enrolled">
                                  Available
                                </span>
                              )}
                            </td>
                            <td>
                              {isEnrolled ? (
                                <button
                                  className="action-btn small disabled"
                                  disabled
                                >
                                  Enrolled
                                </button>
                              ) : (
                                <button
                                  className="action-btn small primary"
                                  onClick={() =>
                                    handleEnrollStudent(student.email)
                                  }
                                >
                                  <Plus size={16} />
                                  Enroll
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === "exam" && (
            <div className="exam-tab">
              <div className="section-header">
                <h2>Exam Information</h2>
                <button
                  className="action-button primary"
                  onClick={() => setExamModalOpen(true)}
                >
                  {course.examDate ? "Update Exam" : "Schedule Exam"}
                </button>
              </div>

              {course.examDate ? (
                <div className="exam-info-card">
                  <div className="exam-info-header">
                    <h3>Final Exam</h3>
                    <span className="exam-status upcoming">Upcoming</span>
                  </div>
                  <div className="exam-details">
                    <div className="detail-item">
                      <Calendar size={20} />
                      <div>
                        <p className="detail-label">Date & Time</p>
                        <p className="detail-value">
                          {new Date(course.examDate).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="detail-item">
                      <MapPin size={20} />
                      <div>
                        <p className="detail-label">Location</p>
                        <p className="detail-value">{course.location}</p>
                      </div>
                    </div>
                  </div>
                  <div className="exam-actions">
                    <button className="action-btn secondary">
                      <Edit2 size={16} />
                      Edit Details
                    </button>
                    <button className="action-btn tertiary">
                      <Trash2 size={16} />
                      Cancel Exam
                    </button>
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <ClipboardList size={48} />
                  <p>No exam scheduled yet</p>
                  <button
                    className="action-button primary"
                    onClick={() => setExamModalOpen(true)}
                  >
                    Schedule Exam
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {examModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{course.examDate ? "Update Exam" : "Schedule Exam"}</h2>
              <button
                className="close-button"
                onClick={() => setExamModalOpen(false)}
              >
                &times;
              </button>
            </div>

            <form className="exam-form" onSubmit={handleExamSubmit}>
              <div className="form-group">
                <label htmlFor="location">
                  <MapPin size={18} />
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  value={examForm.location}
                  onChange={(e) =>
                    setExamForm({ ...examForm, location: e.target.value })
                  }
                  placeholder="e.g., Room 101, Building A"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="examDate">
                  <Calendar size={18} />
                  Exam Date & Time
                </label>
                <input
                  type="datetime-local"
                  id="examDate"
                  value={examForm.examDate}
                  onChange={(e) =>
                    setExamForm({ ...examForm, examDate: e.target.value })
                  }
                  min={new Date().toISOString().slice(0, 16)}
                  required
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setExamModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
              <div className="form-actions">
                <button type="submit" className="submit-button">
                  {course.examDate ? "Update Exam" : "Schedule Exam"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAttendanceModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Record Attendance</h2>
              <button
                className="close-button"
                onClick={() => setShowAttendanceModal(false)}
              >
                &times;
              </button>
            </div>

            <form className="attendance-form" onSubmit={handleAttendanceSubmit}>
              <div className="form-group status-group">
                <label>Status</label>
                <div className="status-options">
                  <label className="status-option present-option">
                    <input
                      type="radio"
                      name="isPresent"
                      checked={attendanceForm.isPresent}
                      onChange={() =>
                        setAttendanceForm({
                          ...attendanceForm,
                          isPresent: true,
                        })
                      }
                    />
                    <CheckCircle size={18} className="present-icon" />
                    Present
                  </label>
                  <label className="status-option absent-option">
                    <input
                      type="radio"
                      name="isPresent"
                      checked={!attendanceForm.isPresent}
                      onChange={() =>
                        setAttendanceForm({
                          ...attendanceForm,
                          isPresent: false,
                        })
                      }
                    />
                    <XCircle size={18} className="absent-icon" />
                    Absent
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="attendanceDate">
                  <Clock size={18} />
                  Date
                </label>
                <input
                  type="datetime-local"
                  id="attendanceDate"
                  value={attendanceForm.attendanceDate}
                  onChange={(e) =>
                    setAttendanceForm({
                      ...attendanceForm,
                      attendanceDate: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="extraPoints">
                  <Award size={18} />
                  Extra Points (0-10)
                </label>
                <input
                  type="number"
                  id="extraPoints"
                  min="0"
                  max="10"
                  step="0.5"
                  value={attendanceForm.extraPoints}
                  onChange={(e) =>
                    setAttendanceForm({
                      ...attendanceForm,
                      extraPoints: parseInt(e.target.value),
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label htmlFor="comment">
                  <FileText size={18} />
                  Comment (Optional)
                </label>
                <textarea
                  id="comment"
                  value={attendanceForm.comment}
                  onChange={(e) =>
                    setAttendanceForm({
                      ...attendanceForm,
                      comment: e.target.value,
                    })
                  }
                  placeholder="Add notes about student's participation"
                  rows="3"
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowAttendanceModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-button">
                  Save Attendance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showGradeModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add Grade</h2>
              <button
                className="close-button"
                onClick={() => setShowGradeModal(false)}
              >
                &times;
              </button>
            </div>

            <form className="grade-form" onSubmit={handleGradeSubmit}>
              <div className="form-group">
                <label htmlFor="mark">
                  <Award size={18} />
                  Mark (0-10)
                </label>
                <div className="grade-input-container">
                  <input
                    type="number"
                    id="mark"
                    min="0"
                    max="10"
                    step="0.01"
                    value={gradeForm.mark}
                    onChange={(e) =>
                      setGradeForm({
                        ...gradeForm,
                        mark: parseFloat(e.target.value),
                      })
                    }
                    required
                  />
                  <span className="grade-value-display">{gradeForm.mark}</span>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="gradeComment">
                  <FileText size={18} />
                  Comment
                </label>
                <textarea
                  id="gradeComment"
                  value={gradeForm.comment}
                  onChange={(e) =>
                    setGradeForm({ ...gradeForm, comment: e.target.value })
                  }
                  placeholder="Provide feedback on student's performance"
                  rows="3"
                  required
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowGradeModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-button">
                  Save Grade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showStudentAttendance && (
        <div className="modal-overlay">
          <div className="modal-content wide-modal">
            <div className="modal-header">
              <h2>
                <User size={20} />
                {currentStudentName}'s Attendance Records
              </h2>
              <button
                className="close-button"
                onClick={() => setShowStudentAttendance(false)}
              >
                &times;
              </button>
            </div>

            <div className="attendance-records">
              {studentAttendance.length === 0 ? (
                <div className="empty-state">
                  <ClipboardList size={48} />
                  <p>No attendance records found for this student.</p>
                </div>
              ) : (
                <>
                  <div className="attendance-stats">
                    <div className="stat-card">
                      <h3>Total Records</h3>
                      <p>{studentAttendance.length}</p>
                    </div>
                    <div className="stat-card present-stat">
                      <h3>Present</h3>
                      <p>{getAttendanceStats().present}</p>
                    </div>
                    <div className="stat-card absent-stat">
                      <h3>Absent</h3>
                      <p>{getAttendanceStats().absent}</p>
                    </div>
                    <div className="stat-card">
                      <h3>Attendance Rate</h3>
                      <p>
                        {Math.round(
                          (getAttendanceStats().present /
                            studentAttendance.length) *
                            100
                        )}
                        %
                      </p>
                    </div>
                  </div>

                  <div className="attendance-table-container">
                    <table className="attendance-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Status</th>
                          <th>Extra Points</th>
                          <th>Comment</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentAttendance.map((record) => (
                          <tr key={record.id}>
                            <td>
                              {new Date(record.attendanceDate).toLocaleString()}
                            </td>
                            <td>
                              {record.isPresent ? (
                                <span className="status-badge present">
                                  <CheckCircle size={14} />
                                  Present
                                </span>
                              ) : (
                                <span className="status-badge absent">
                                  <XCircle size={14} />
                                  Absent
                                </span>
                              )}
                            </td>
                            <td>{record.extraPoints}</td>
                            <td>{record.comment || "-"}</td>
                            <td>
                              <div className="table-actions">
                                <button className="action-btn small">
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  className="action-btn small"
                                  onClick={() => deleteAttendance(record.id)}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseActions;
