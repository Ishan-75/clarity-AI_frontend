import React from "react";
import "../styles/responsive.css";

export default function Roles({ setRole }) {
  return (
    <div className="roles">
      <div className="role-dashboard ">
        <h1 className="role-select-descript">Who you are?</h1>
        <button
          onClick={() => setRole("lecturer")}
          className="lecturer-role-select role-select"
        >
          Professor
        </button>
        <button
          onClick={() => setRole("student")}
          className="student-role-select role-select"
        >
          Student
        </button>
      </div>
    </div>
  );
}
