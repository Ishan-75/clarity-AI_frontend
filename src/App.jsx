import React, { useEffect, useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import AuthContext from "./context/AuthContext";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import LecturerPage from "./pages/LecturerPage";
import StudentPage from "./pages/StudentPage";
import AboutPage from "./pages/AboutPage";

import "./styles/app.css";
import "./styles/main.css";
import "./styles/responsive.css";
import DashboardLayout from "./components/DashboardLayout";

const ProtectedRoute = ({ children, role }) => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default function App() {
 

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Default route */}
          <Route path="/" element={<Navigate to="/login" />} />

          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute role="student">
                <DashboardLayout>
                  <StudentPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/lecturer"
            element={
              <ProtectedRoute role="professor">
                <DashboardLayout>
                  <LecturerPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/about"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <AboutPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
