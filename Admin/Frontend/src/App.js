import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Calls from "./pages/Calls";
import Layout from "./components/Layout";
import Employees from "./pages/Employees";


function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* LOGIN PAGE */}
        <Route path="/login" element={<Login />} />

        {/* PROTECTED ROUTES */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/calls"
          element={
            <PrivateRoute>
              <Layout>
                <Calls />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/employees"
          element={
          <Layout>
          <Employees />
          </Layout>
        }
      />

        {/* DEFAULT REDIRECT */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
