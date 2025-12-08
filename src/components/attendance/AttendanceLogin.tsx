import axios from "axios";
import Cookies from "js-cookie";
import { ArrowRight, GraduationCap, Lock, User } from "lucide-react";
import { useState } from "react";
import { AUTH_COOKIE_NAME, COOKIE_EXPIRY, PASSWORD_COOKIE, REMEMBER_ME_COOKIE, USERNAME_COOKIE } from "../../types/CookieVars";
import type { AttendanceResponse, LoginResponse } from "../../types/response";

export default function AttendanceLogin({ onLogin }: { onLogin: (data: AttendanceResponse) => void }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // 1. Get Token (Direct Link)
            const loginResponse = await axios.post<LoginResponse>("/attendance-api/api/auth/login", {
                userName: username,
                password: password,
            });

            const token = loginResponse.data.data.token;
            if (!token) throw new Error("No token received");

            // 2. Fetch Data (Direct Link)
            const dataResponse = await axios.get<AttendanceResponse>(
                "/attendance-api/api/attendance/course/component/student",
                { headers: { Authorization: `GlobalEducation ${token}` } }
            );

            // 3. Save & Continue
            Cookies.set(AUTH_COOKIE_NAME, token, { expires: COOKIE_EXPIRY });
            Cookies.set(USERNAME_COOKIE, username, { expires: COOKIE_EXPIRY });
            onLogin(dataResponse.data);

        } catch (err) {
            console.error(err);
            setError("Invalid credentials or server error.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 px-4 font-sans text-slate-900">
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-slate-100 animate-fade-in">
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-emerald-600 p-3 rounded-2xl shadow-lg shadow-emerald-200 mb-4 transform transition-transform hover:scale-105">
                        <GraduationCap className="text-white h-8 w-8" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Attendance Portal</h2>
                    <p className="text-sm text-slate-500 font-medium mt-1">Sign in with CyberVidya ID</p>
                </div>
                
                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider ml-1">University Roll Number</label>
                        <div className="relative group">
                            <div className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-emerald-600 transition-colors"><User size={20} /></div>
                            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-semibold" placeholder="Roll No..." required />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider ml-1">Password</label>
                        <div className="relative group">
                            <div className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-emerald-600 transition-colors"><Lock size={20} /></div>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-semibold" placeholder="••••••••" required />
                        </div>
                    </div>
                    {error && <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-100 flex items-center"><span className="mr-2 text-base">⚠️</span>{error}</div>}
                    <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl transform transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4">{loading ? "Verifying..." : <>Login <ArrowRight size={18} strokeWidth={2.5}/></>}</button>
                </form>
            </div>
        </div>
    );
}
