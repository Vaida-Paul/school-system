import React, { useState } from "react";
import "../../Style/CreateCourse.css";

const CreateCourse = () => {
  const [course, setCourse] = useState({
    title: "",
    description: "",
    timetable: "",
    color: "#3498db",
    location: "",
    examDate: "",
  });

  const colorOptions = [
    { name: "Blue", value: "#3498db" },
    { name: "Red", value: "#e74c3c" },
    { name: "Green", value: "#2ecc71" },
    { name: "Purple", value: "#9b59b6" },
    { name: "Orange", value: "#e67e22" },
    { name: "Yellow", value: "#f1c40f" },
    { name: "Teal", value: "#1abc9c" },
    { name: "Pink", value: "#ff6b6b" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCourse({
      ...course,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting course:", course);
    window.location.href = "/teacher";
  };

  return (
    <div className="create-course-container">
      <div className="create-course-header">
        <h1>Create New Course</h1>
        <p>Add a new course to your teaching schedule</p>
      </div>

      <form className="course-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Course Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={course.title}
            onChange={handleChange}
            required
            placeholder="e.g. Algebra, Geometry, Calculus"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={course.description}
            onChange={handleChange}
            required
            placeholder="Brief description of the course content and objectives"
            rows="4"
          />
        </div>

        <div className="form-group">
          <label htmlFor="timetable">Timetable *</label>
          <input
            type="datetime-local"
            id="timetable"
            name="timetable"
            value={course.timetable}
            onChange={handleChange}
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
                  course.color === color.value ? "selected" : ""
                }`}
                style={{ backgroundColor: color.value }}
                onClick={() => setCourse({ ...course, color: color.value })}
                title={color.name}
              />
            ))}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="location">Location (Optional)</label>
          <input
            type="text"
            id="location"
            name="location"
            value={course.location}
            onChange={handleChange}
            placeholder="e.g. Room 101, Building A"
          />
        </div>

        <div className="form-group">
          <label htmlFor="examDate">Exam Date (Optional)</label>
          <input
            type="datetime-local"
            id="examDate"
            name="examDate"
            value={course.examDate}
            onChange={handleChange}
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="cancel-button"
            onClick={() => window.history.back()}
          >
            Cancel
          </button>
          <button type="submit" className="submit-button">
            Create Course
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCourse;
