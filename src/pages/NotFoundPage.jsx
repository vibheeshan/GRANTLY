import React from "react";
import { Link } from "react-router-dom";
import { GraduationCap, ArrowLeft, LayoutDashboard, Search, Sparkles } from "lucide-react";
import { Button } from "../components/ui/Button.jsx";

export function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-6">
      <div className="w-20 h-20 rounded-3xl bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center mx-auto shadow-lg">
        <GraduationCap className="w-10 h-10" />
      </div>

      <div className="space-y-2 max-w-md">
        <span className="text-xs font-extrabold uppercase tracking-widest text-violet-600 dark:text-violet-400 block font-heading">
          404 Error — Page Not Found
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight">
          Lost in the scholarship maze?
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          The requested URL does not match any route in the GRANTLY application. Check the address or jump back to one of the main modules.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link to="/">
          <Button variant="primary" size="md" icon={LayoutDashboard}>
            Go to Dashboard
          </Button>
        </Link>
        <Link to="/explorer">
          <Button variant="outline" size="md" icon={Search}>
            Browse Scholarships
          </Button>
        </Link>
        <Link to="/matcher">
          <Button variant="secondary" size="md" icon={Sparkles}>
            Check Eligibility
          </Button>
        </Link>
      </div>
    </div>
  );
}
