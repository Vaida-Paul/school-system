import React, { useState, useEffect } from "react";
import "../Style/Timetable.css";
import HorizontalNavbar from "./HorizontalNavbar.js";
import VerticalNavbar from "./VerticalNavbar.js";

const Timetable = ({ userRole }) => {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const hourSlots = [];
  for (let hour = 8; hour <= 22; hour++) {
    const formattedHour = hour <= 12 ? hour : hour - 12;
    const amPm = hour < 12 ? "AM" : "PM";
    hourSlots.push(`${formattedHour}:00 ${amPm}`);
  }

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        console.log("Fetching timetable as:", userRole);
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token found");

        const endpoint =
          userRole === "Teacher"
            ? "https://localhost:7229/api/Courses"
            : "https://localhost:7229/api/StudentCourses";

        console.log("Using endpoint:", endpoint);

        const response = await fetch(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("API Error Response:", errorText);
          throw new Error(
            `Server returned ${response.status}: ${errorText || "No details"}`
          );
        }

        const data = await response.json();
        console.log("API Response:", data);

        const transformedCourses = data.map((course) => {
          const [day, startTimeStr, endTimeStr] = course.timetable.split("/");

          const startTime = convertTimeToHour(startTimeStr);
          const endTime = convertTimeToHour(endTimeStr);
          const duration = endTime - startTime;

          return {
            id: course.id,
            title: course.title,
            day,
            startTime,
            duration,
            teacher:
              course.teacher ||
              (userRole === "Teacher" ? "---" : course.teacherName),
            location: course.location,
            color: course.color || getRandomColor(course.id),
          };
        });

        setCourses(transformedCourses);
      } catch (err) {
        setError(`Failed to load ${userRole} timetable: ${err.message}`);
        console.error("Fetch error details:", {
          userRole,
          error: err,
          timestamp: new Date().toISOString(),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTimetable();
  }, [userRole]);

  const convertTimeToHour = (timeStr) => {
    const [time, period] = timeStr.split(/(am|pm)/i);
    const [hours] = time.split(":").map(Number);
    return period?.toLowerCase() === "pm"
      ? hours === 12
        ? 12
        : hours + 12
      : hours === 12
      ? 0
      : hours;
  };

  const getRandomColor = (id) => {
    const colors = [
      "#4285F4",
      "#EA4335",
      "#FBBC05",
      "#34A853",
      "#5F6368",
      "#8AB4F8",
      "#F28B82",
    ];
    return colors[id % colors.length];
  };

  const getCourseForTimeSlot = (day, hour) => {
    return courses.find(
      (course) =>
        course.day === day &&
        hour >= course.startTime &&
        hour < course.startTime + course.duration
    );
  };

  const courseStartsAt = (day, hour) => {
    return courses.some(
      (course) => course.day === day && hour === course.startTime
    );
  };

  const getCourseDuration = (day, hour) => {
    const course = courses.find(
      (course) => course.day === day && hour === course.startTime
    );
    return course ? course.duration : 0;
  };

  if (loading) {
    return (
      <div className="timetable-container">
        <main className="timetable-content">
          <div className="loading-message">Loading timetable...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="timetable-container">
        <main className="timetable-content">
          <div className="error-message">Error: {error}</div>
        </main>
      </div>
    );
  }

  return (
    <div className="timetable-container">
      <main
        className={`timetable-content ${
          userRole === "Teacher" ? " " : "navbar-student"
        }`}
      >
        <div className="timetable">
          <div className="timetable-grid">
            <div className="time-header"></div>
            {days.map((day) => (
              <div className="day-header" key={day}>
                {day}
              </div>
            ))}

            {hourSlots.map((timeSlot, hourIndex) => {
              const hour = hourIndex + 8;

              return (
                <React.Fragment key={timeSlot}>
                  <div className="time-slot">{timeSlot}</div>

                  {days.map((day) => {
                    const course = getCourseForTimeSlot(day, hour);
                    const startsCourse = courseStartsAt(day, hour);
                    const duration = getCourseDuration(day, hour);

                    if (course && startsCourse) {
                      return (
                        <div
                          className="course-cell"
                          key={`${day}-${hour}`}
                          style={{
                            backgroundColor: course.color,
                            gridRow: `span ${duration}`,
                          }}
                        >
                          <div className="course-title">{course.title}</div>
                          <div className="course-teacher">{course.teacher}</div>
                          <div className="course-time">
                            {timeSlot} -{" "}
                            {hour + duration <= 12
                              ? hour + duration
                              : hour + duration - 12}
                            :00 {hour + duration < 12 ? "AM" : "PM"}
                          </div>
                        </div>
                      );
                    } else if (course && !startsCourse) {
                      return null;
                    } else {
                      return (
                        <div
                          className="empty-cell"
                          key={`${day}-${hour}`}
                        ></div>
                      );
                    }
                  })}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Timetable;
