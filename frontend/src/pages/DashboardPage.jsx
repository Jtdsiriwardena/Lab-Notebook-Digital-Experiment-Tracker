import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import {
  Plus,
  Search,
  Calendar,
  Clock,
  FileText,
  Target,
  TrendingUp,
  Grid3X3,
  List,
  AlertTriangle,
  Beaker,
} from "lucide-react";

export default function DashboardPage() {
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");

  useEffect(() => {
    const fetchExperiments = async () => {
      try {
        const res = await api.get("/experiments/");
        setExperiments(res.data);
      } catch (err) {
        setError("Failed to load experiments.");
      } finally {
        setLoading(false);
      }
    };

    fetchExperiments();
  }, []);

  const filteredExperiments = experiments.filter(
    (exp) =>
      exp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.objective.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  /* Loading State*/

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-slate-800" />
          <div className="absolute inset-0 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
          <div
            className="absolute inset-3 rounded-full border border-teal-500/30 border-t-teal-400/60 animate-spin"
            style={{ animationDirection: "reverse", animationDuration: "0.8s" }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-800 text-slate-200 px-6 py-10 overflow-hidden">
      {/* Grid Texture */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(20,184,166,1) 1px, transparent 1px), linear-gradient(90deg, rgba(20,184,166,1) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      {/* Glow Blobs */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-teal-500/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-cyan-500/6 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto fade-in">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <span className="inline-block font-mono text-[10px] text-teal-400 tracking-[0.2em] uppercase border border-teal-500/30 px-3 py-1 rounded-full bg-teal-500/5 mb-3">
              Laboratory Overview
            </span>
            <h1 className="font-mono font-bold text-3xl text-slate-100">
              Experiments Dashboard
            </h1>
            <p className="font-mono text-xs text-slate-300 uppercase tracking-[0.12em] mt-2">
              {experiments.length} total experiments
            </p>
          </div>

          <Link
            to="/experiments/create"
            className="flex items-center gap-2 bg-teal-500 hover:bg-teal-400
              text-slate-950 font-mono font-bold text-sm px-6 py-3 rounded-xl
              transition-all duration-200 shadow-lg shadow-teal-500/20
              hover:shadow-teal-400/30 hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="w-4 h-4" />
            New Experiment
          </Link>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {[
            {
              label: "Total Experiments",
              value: experiments.length,
              icon: FileText,
            },
            {
              label: "This Month",
              value: experiments.filter((exp) => {
                const d = new Date(exp.created_at || exp.updated_at);
                const now = new Date();
                return (
                  d.getMonth() === now.getMonth() &&
                  d.getFullYear() === now.getFullYear()
                );
              }).length,
              icon: TrendingUp,
            },
            {
              label: "Recent Activity",
              value: experiments.filter((exp) => {
                const d = new Date(exp.updated_at);
                const diff =
                  Math.abs(new Date() - d) / (1000 * 60 * 60 * 24);
                return diff <= 7;
              }).length,
              icon: Clock,
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <p className="font-mono text-xs text-slate-300 uppercase tracking-[0.12em]">
                    {stat.label}
                  </p>
                  <p className="font-mono text-2xl font-bold text-slate-100">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 mb-10">
          <div className="flex flex-wrap gap-4 justify-between items-center">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input
                type="text"
                placeholder="Search experiments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-10 pr-4 py-3
                  font-mono text-sm text-slate-200 placeholder-slate-300
                  focus:outline-none focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/20"
              />
            </div>

            <div className="flex gap-2">
              {[["grid", Grid3X3], ["list", List]].map(([mode, Icon]) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`p-2 rounded-xl border transition-all ${
                    viewMode === mode
                      ? "bg-teal-500/10 text-teal-400 border-teal-500/20"
                      : "text-slate-400 border-slate-700 hover:border-slate-600"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3 mb-8">
            <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5" />
            <p className="font-mono text-xs text-red-400">{error}</p>
          </div>
        )}

        {/* Experiments */}
        {filteredExperiments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14
            bg-slate-900/40 border border-slate-800 border-dashed rounded-2xl text-center px-6">
            <div className="w-14 h-14 bg-slate-800 border border-slate-700 rounded-2xl
              flex items-center justify-center mb-4">
              <Beaker className="w-6 h-6 text-slate-600" />
            </div>
            <h3 className="font-mono font-bold text-slate-400 mb-1">
              No experiments found
            </h3>
            <p className="font-mono text-xs text-slate-600 max-w-xs">
              Create your first experiment to begin documenting laboratory work.
            </p>
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            {filteredExperiments.map((exp) => (
              <Link
                key={exp.id}
                to={`/experiments/${exp.id}`}
                className="group bg-slate-900/60 border border-slate-800
                  hover:border-slate-700 rounded-xl p-6 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <Target className="w-4 h-4 text-teal-400" />
                  <span className="font-mono text-[10px] text-slate-300 uppercase tracking-widest">
                    #{exp.id}
                  </span>
                </div>

                <h3 className="font-mono font-bold text-lg text-slate-100 mb-2">
                  {exp.name}
                </h3>

                <p className="font-sans text-sm text-slate-300 mb-4 leading-relaxed line-clamp-2">
                  {exp.objective}
                </p>

                <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400 uppercase tracking-[0.15em]">
                  <Calendar className="w-3 h-3" />
                  Updated {formatDate(exp.updated_at)}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
