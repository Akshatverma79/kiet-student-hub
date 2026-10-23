import { Analytics } from "@vercel/analytics/react";
import axios from "axios";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import LandingPage from "./components/LandingPage";
import MoodleAssignments from "./components/MoodleAssignments";
import MoodleLogin from "./components/MoodleLogin";
import Attendance from "./components/attendance/Attendance";
import AttendanceLogin from "./components/attendance/AttendanceLogin";

import { AUTH_COOKIE_NAME } from "./types/CookieVars";
import type { AttendanceResponse } from "./types/response";

const MOODLE_COOKIE = "moodle_token";

function MoodleApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!Cookies.get(MOODLE_COOKIE));
  return isAuthenticated ? (
    <MoodleAssignments onLogout={() => { Cookies.remove(MOODLE_COOKIE); setIsAuthenticated(false); }} />
  ) : (
    <MoodleLogin onLogin={() => setIsAuthenticated(true)} />
  );
}

function AttendanceApp() {
  const [attendanceData, setAttendanceData] = useState<AttendanceResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get(AUTH_COOKIE_NAME);
    if (token && !attendanceData) {
      // REVERTED: Direct Link
      axios.get<AttendanceResponse>(
        "/attendance-api/api/attendance/course/component/student",
        { headers: { Authorization: `GlobalEducation ${token}` } }
      ).then(res => {
        setAttendanceData(res.data);
      }).catch(() => {
        Cookies.remove(AUTH_COOKIE_NAME);
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-emerald-600 font-bold animate-pulse">Initializing Portal...</div>;

  return attendanceData ? (
    <Attendance attendanceData={attendanceData} setAttendanceData={setAttendanceData} />
  ) : (
    <AttendanceLogin onLogin={(data) => setAttendanceData(data)} />
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/moodle/*" element={<MoodleApp />} />
        <Route path="/attendance/*" element={<AttendanceApp />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Analytics />
    </BrowserRouter>
  );
}
