import ProgressBar from "@ramonak/react-progress-bar";
import axios from "axios";
import Cookies from "js-cookie";
import { memo, useEffect, useState } from "react";
import { AUTH_COOKIE_NAME } from "../../types/CookieVars";
import type { AttendanceDataSummaryResponse } from "../../types/response";

const attendanceColour = {
    above80: "22c55e",
    below80: "eab308",
    below75: "dc2626",
};

const OverallAtt = memo(function OverallAtt() {
    const [attendanceDataSummary, setSetAndanceDataSummary] =
        useState<AttendanceDataSummaryResponse | null>(null);
    
    useEffect(() => {
        const fetchData = async () => {
            const token = Cookies.get(AUTH_COOKIE_NAME);
            if (!token) return;
            
            try {
                // REVERTED: Direct Link
                const response = await axios.get(
                    "https://kiet.cybervidya.net/api/student/dashboard/attendance",
                    {
                        headers: {
                            Authorization: `GlobalEducation ${token}`,
                        },
                    },
                );
                setSetAndanceDataSummary(response.data);
            } catch (e) {
                console.error("Failed to fetch overall stats");
            }
        };
        if (!attendanceDataSummary) {
            fetchData();
        }
    }, [attendanceDataSummary]);

    function handleAttendanceSliderColour(): string {
        if (attendanceDataSummary) {
            const percentage = attendanceDataSummary.data.presentPerc;
            if (percentage >= 80) return attendanceColour.above80;
            else if (percentage >= 75) return attendanceColour.below80;
            else return attendanceColour.below75;
        }
        return attendanceColour.above80;
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8 animate-fade-in">
            <h1 className="text-xl font-black text-slate-800 mb-4">Overall Attendance</h1>
            {attendanceDataSummary && (
                <ProgressBar
                    completed={attendanceDataSummary.data.presentPerc}
                    bgColor={`#${handleAttendanceSliderColour()}`}
                    height="30px"
                    labelAlignment="center"
                    labelColor="#ffffff"
                    labelSize="14px"
                    animateOnRender
                    customLabel={`${attendanceDataSummary.data.presentPerc}%`}
                    baseBgColor="#e2e8f0"
                />
            )}
        </div>
    );
});

export default OverallAtt;
