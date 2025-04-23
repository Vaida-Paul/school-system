import React from "react";
import HorizontalNavbar from "../HorizontalNavbar";
import { Outlet } from "react-router-dom";

const TeacherLayout = ({ onLogout }) => {
  return (
    <div className="teacher-layout">
      <HorizontalNavbar />
      <div className="content">
        <Outlet />
      </div>
    </div>
  );
};

export default TeacherLayout;
