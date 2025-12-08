import axios from "axios";
import Cookies from "js-cookie";
import { AlertTriangle, CalendarDays, CheckCircle, ChevronDown, ChevronUp, LogOut, User, Wand2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AUTH_COOKIE_NAME, USERNAME_COOKIE } from "../../types/CookieVars";
import type { AttendanceResponse, ScheduleEntry, ScheduleResponse } from "../../types/response";
import { fetchStudentId, getWeekRange } from "../../types/utils";
import DaywiseReport from "./Daywise";
import OverallAtt from "./OverallAtt";
import { Link } from "react-router-dom";

interface AttendanceProps {
    attendanceData: AttendanceResponse;
    setAttendanceData: React.Dispatch<React.SetStateAction<AttendanceResponse | null>>;
}

interface SelectedComponentType {
    course: AttendanceResponse["data"]["attendanceCourseComponentInfoList"][0];
    component: AttendanceResponse["data"]["attendanceCourseComponentInfoList"][0]["attendanceCourseComponentNameInfoList"][0];
}

const TARGET_PERCENTAGE = 75;

export default function Attendance({ attendanceData, setAttendanceData }: AttendanceProps) {
    const [studentId, setStudentId] = useState<number | null>(null);
    const [selectedComponent, setSelectedComponent] = useState<SelectedComponentType | null>(null);
    const [isDaywiseModalOpen, setIsDaywiseModalOpen] = useState(false);
    
    const [showProjection, setShowProjection] = useState(false);
    const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
    const [missedClasses, setMissedClasses] = useState<Set<string>>(new Set());
    const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

    function handleLogout() {
        Cookies.remove(AUTH_COOKIE_NAME);
        Cookies.remove(USERNAME_COOKIE);
        setAttendanceData(null);
    }

    useEffect(() => {
        const token = Cookies.get(AUTH_COOKIE_NAME) || "";
        fetchStudentId(token).then((id) => { if (id) setStudentId(id); });
        window.scrollTo({ top: 0, behavior: "instant" });
    }, []);

    useEffect(() => {
        const fetchSchedule = async () => {
            const token = Cookies.get(AUTH_COOKIE_NAME);
            if (token) {
                try {
                    const { startDate } = getWeekRange();
                    // REVERTED: Direct Link
                    const scheduleResponse = await axios.get<ScheduleResponse>(
                        `https://kiet.cybervidya.net/api/student/schedule/class?weekEndDate=2025-12-09&weekStartDate=${startDate}`,
                        { headers: { Authorization: `GlobalEducation ${token}` } },
                    );
                    setSchedule(scheduleResponse.data.data);
                } catch (err) {
                    console.error("Failed to fetch schedule", err);
                }
            }
        };
        if (showProjection && schedule.length === 0) fetchSchedule();
    }, [showProjection, schedule]);

    const handleMissClassToggle = (classStartString: string) => {
        setMissedClasses((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(classStartString)) newSet.delete(classStartString);
            else newSet.add(classStartString);
            return newSet;
        });
    };

    const groupedSchedule = useMemo(() => {
        const grouped = new Map<string, ScheduleEntry[]>();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        schedule
            .filter((c) => c.type === "CLASS")
            .forEach((c) => {
                const [day, month, year] = c.lectureDate.split("/").map(Number);
                const classDate = new Date(year, month - 1, day);
                if (classDate >= today) {
                    const dayName = classDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
                    if (!grouped.has(dayName)) grouped.set(dayName, []);
                    grouped.get(dayName)?.push(c);
                }
            });
        return grouped;
    }, [schedule]);

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
            <div className="max-w-6xl mx-auto">
                {/* Header Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6 animate-fade-in">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-4">
                            <Link to="/" className="bg-slate-100 hover:bg-slate-200 p-3 rounded-xl transition-colors">
                                <User className="h-8 w-8 text-slate-600" />
                            </Link>
                            <div>
                                <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight">{attendanceData.data.fullName}</h1>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    {attendanceData.data.branchShortName} • {attendanceData.data.semesterName}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowProjection(!showProjection)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${showProjection ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
                            >
                                <Wand2 size={16} /> Projection
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                            >
                                <LogOut size={16} /> Logout
                            </button>
                        </div>
                    </div>
                </div>

                {/* Projection Panel */}
                {showProjection && (
                    <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 p-6 mb-6 animate-fade-in ring-2 ring-indigo-50">
                        <div className="flex items-center gap-2 mb-4">
                            <CalendarDays className="text-indigo-600" />
                            <h3 className="text-lg font-bold text-slate-800">Attendance Projection</h3>
                        </div>
                        <p className="text-sm text-slate-500 mb-4">Select future classes you plan to miss to see the impact.</p>
                        
                        <div className="space-y-3">
                            {groupedSchedule.size === 0 && <p className="text-slate-400 font-medium">No upcoming classes found.</p>}
                            {Array.from(groupedSchedule.entries()).map(([day, classes]) => (
                                <div key={day} className="border border-slate-200 rounded-xl overflow-hidden">
                                    <button 
                                        onClick={() => {
                                            setExpandedDays(prev => {
                                                const n = new Set(prev);
                                                if (n.has(day)) n.delete(day); else n.add(day);
                                                return n;
                                            });
                                        }}
                                        className="w-full flex justify-between items-center p-3 bg-slate-50 hover:bg-slate-100 transition-colors"
                                    >
                                        <span className="font-bold text-sm text-slate-700">{day}</span>
                                        {expandedDays.has(day) ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                                    </button>
                                    
                                    {expandedDays.has(day) && (
                                        <div className="p-3 bg-white space-y-2">
                                            {classes.map(c => (
                                                <div key={c.start} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={missedClasses.has(c.start)}
                                                        onChange={() => handleMissClassToggle(c.start)}
                                                        className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                    />
                                                    <div className="text-sm">
                                                        <span className="block font-bold text-slate-800">{c.courseName}</span>
                                                        <span className="text-slate-500 text-xs">{c.start.split(" ")[1]} - {c.end.split(" ")[1]}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {!showProjection && <OverallAtt />}

                {/* Course Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {attendanceData.data.attendanceCourseComponentInfoList.map((course) => (
                        <div key={course.courseCode} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow animate-fade-in">
                            <div className="mb-4">
                                <h3 className="font-bold text-slate-800 leading-tight mb-1">{course.courseName}</h3>
                                <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-500">{course.courseCode}</span>
                            </div>
                            
                            <div className="space-y-4">
                                {course.attendanceCourseComponentNameInfoList.map((comp) => {
                                    const perc = comp.presentPercentage || 0;
                                    const isSafe = perc >= TARGET_PERCENTAGE;
                                    
                                    return (
                                        <div key={comp.componentName} className="border-t border-slate-100 pt-3">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{comp.componentName}</span>
                                                <span className={`text-sm font-black ${isSafe ? 'text-emerald-600' : 'text-red-600'}`}>
                                                    {comp.presentPercentageWith}
                                                </span>
                                            </div>
                                            
                                            <div className="flex justify-between items-center text-xs text-slate-500 mb-3">
                                                <span>Attended: {comp.numberOfPresent}/{comp.numberOfPeriods}</span>
                                                {!isSafe && <span className="text-red-500 font-bold flex items-center gap-1"><AlertTriangle size={10} /> Low Attendance</span>}
                                            </div>
                                            
                                            <button
                                                onClick={() => { setSelectedComponent({ course, component: comp }); setIsDaywiseModalOpen(true); }}
                                                className="w-full py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                                            >
                                                View Report
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {isDaywiseModalOpen && selectedComponent && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-6 animate-fade-in relative">
                            <button 
                                onClick={() => setIsDaywiseModalOpen(false)}
                                className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full hover:bg-red-50 hover:text-red-600 transition-colors"
                            >
                                <X size={20} />
                            </button>
                            
                            <h2 className="text-lg font-bold text-slate-800 mb-1">{selectedComponent.course.courseName}</h2>
                            <p className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-6">
                                {selectedComponent.component.componentName} Report
                            </p>
                            
                            <DaywiseReport
                                token={Cookies.get(AUTH_COOKIE_NAME) || ""}
                                payload={{
                                    courseCompId: selectedComponent.component.courseComponentId,
                                    courseId: selectedComponent.course.courseId,
                                    sessionId: null,
                                    studentId: studentId || 0,
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
