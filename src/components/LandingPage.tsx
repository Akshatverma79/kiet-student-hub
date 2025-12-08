import { BookOpen, GraduationCap, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">KIET STUDENT HUB</h1>
          <p className="text-slate-500 font-medium">Select a service to continue</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Attendance Card */}
          <Link to="/attendance" className="group relative bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-slate-100 hover:-translate-y-1 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-emerald-600"></div>
            <div className="mb-6 bg-emerald-100 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <GraduationCap className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Attendance</h2>
            <p className="text-slate-500 mb-6 text-sm">Check your CyberVidya attendance records, detailed day-wise reports, and subject status.</p>
            <div className="flex items-center text-emerald-600 font-bold text-sm group-hover:gap-2 transition-all">
              Launch App <ArrowRight size={16} />
            </div>
          </Link>

          {/* Moodle Card */}
          <Link to="/moodle" className="group relative bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-slate-100 hover:-translate-y-1 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-orange-600"></div>
            <div className="mb-6 bg-orange-100 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen className="w-8 h-8 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Moodle LMS</h2>
            <p className="text-slate-500 mb-6 text-sm">Track your assignments, view pending submissions, and access course materials.</p>
            <div className="flex items-center text-orange-600 font-bold text-sm group-hover:gap-2 transition-all">
              Launch App <ArrowRight size={16} />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
