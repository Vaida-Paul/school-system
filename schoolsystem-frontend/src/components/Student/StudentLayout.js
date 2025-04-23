import React from "react";
import VerticalNavbar from "../VerticalNavbar";
import HorizontalNavbar from "../HorizontalNavbar";
import { Outlet } from "react-router-dom";

const StudentLayout = ({ onLogout }) => {
  return (
    <div className="student-layout">
      <VerticalNavbar />
      <HorizontalNavbar />
      <div className="content">
        <Outlet />
      </div>
    </div>
  );
};

export default StudentLayout;
