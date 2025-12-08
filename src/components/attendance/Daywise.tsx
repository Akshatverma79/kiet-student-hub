import axios from "axios";
import { useEffect, useState } from "react";
import type {
    AttendanceApiResponse,
    DaywiseReportProps,
    LectureListProps,
} from "../../types/response";

function formatDate(dateString: string) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-2);
    return `${day}-${month}-${year}`;
}

function DaywiseReport({ token, payload }: DaywiseReportProps) {
    const [daywiseData, setDaywiseData] = useState<LectureListProps[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        const fetchDaywiseAttendance = async () => {
            try {
                // REVERTED: Direct Link
                const response = await axios.post<AttendanceApiResponse>(
                    "/attendance-api/api/attendance/schedule/student/course/attendance/percentage",
                    payload,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `GlobalEducation ${token}`,
                        },
                    },
                );

                if (response.data.data && response.data.data.length > 0) {
                    const lectures = response.data.data[0].lectureList;
                    lectures.sort(
                        (a, b) =>
                            new Date(b.planLecDate).getTime() -
                            new Date(a.planLecDate).getTime(),
                    );
                    setDaywiseData(lectures);
                } else {
                    setDaywiseData([]);
                }
            } catch (err: unknown) {
                console.error(err);
                setError("Failed to load data or no classes yet.");
            } finally {
                setLoading(false);
            }
        };

        fetchDaywiseAttendance();
    }, [token, payload]);

    if (loading) return <div className="p-4 text-center font-bold text-slate-500">Loading records...</div>;
    if (error) return <div className="p-4 text-center text-red-600 font-bold">{error}</div>;
    if (daywiseData.length === 0) return <div className="p-4 text-center text-slate-500">No records found.</div>;

    return (
        <div className="overflow-hidden rounded-xl border border-slate-200">
            <div className="overflow-x-auto max-h-[400px]">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-700 font-bold sticky top-0">
                        <tr>
                            <th className="p-3 border-b">Date</th>
                            <th className="p-3 border-b">Day</th>
                            <th className="p-3 border-b">Slot</th>
                            <th className="p-3 border-b">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {daywiseData.map((lecture) => (
                            <tr key={`${lecture.planLecDate}-${lecture.timeSlot}`} className="hover:bg-slate-50">
                                <td className="p-3 font-medium">{formatDate(lecture.planLecDate)}</td>
                                <td className="p-3 text-slate-500">{lecture.dayName.substring(0, 3)}</td>
                                <td className="p-3 text-slate-500 text-xs">{lecture.timeSlot}</td>
                                <td className="p-3 font-bold">
                                    {lecture.attendance === "PRESENT" && <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Present</span>}
                                    {lecture.attendance === "ADJUSTED" && <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded">Adjusted</span>}
                                    {lecture.attendance === "ABSENT" && <span className="text-red-600 bg-red-50 px-2 py-1 rounded">Absent</span>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default DaywiseReport;
