import React, { useState, useEffect } from "react";

const INITIAL_BUGS = [
  {
    id: "BUG-101",
    title: "Database connection pool exhaustion under peak load",
    description: "Asyncpg pool runs out of available connections during high concurrency benchmarks.",
    status: "OPEN",
    priority: "CRITICAL",
    severity: "BLOCKER",
    project: "Backend Engine",
    assignee: "Alex Rivera",
    createdAt: "2026-08-05",
  },
  {
    id: "BUG-102",
    title: "JWT refresh token failing to revoke in Redis",
    description: "Logout API endpoint does not set proper TTL key on blacklisted JTI string.",
    status: "IN_PROGRESS",
    priority: "HIGH",
    severity: "HIGH",
    project: "Auth Security",
    assignee: "Sarah Chen",
    createdAt: "2026-08-04",
  },
  {
    id: "BUG-103",
    title: "SPA Client routing 404 on page refresh",
    description: "NGINX try_files directive is missing fallback rule for React Router sub-paths.",
    status: "IN_REVIEW",
    priority: "MEDIUM",
    severity: "MEDIUM",
    project: "Frontend Portal",
    assignee: "David Kim",
    createdAt: "2026-08-03",
  },
  {
    id: "BUG-104",
    title: "Alembic migration revision history out of sync",
    description: "Multiple head revisions created on parallel feature branches.",
    status: "RESOLVED",
    priority: "LOW",
    severity: "LOW",
    project: "DevOps Pipeline",
    assignee: "Elena Rostova",
    createdAt: "2026-08-02",
  },
];

const COLUMNS = [
  { key: "OPEN", title: "Open Issues", color: "from-amber-500/20 to-amber-500/5 border-amber-500/30 text-amber-400" },
  { key: "IN_PROGRESS", title: "In Progress", color: "from-blue-500/20 to-blue-500/5 border-blue-500/30 text-blue-400" },
  { key: "IN_REVIEW", title: "In Review", color: "from-purple-500/20 to-purple-500/5 border-purple-500/30 text-purple-400" },
  { key: "RESOLVED", title: "Resolved", color: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/30 text-emerald-400" },
];

export default function App() {
  const [bugs, setBugs] = useState(INITIAL_BUGS);
  const [search, setSearch] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBug, setNewBug] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    severity: "MEDIUM",
    project: "Backend Engine",
    assignee: "Unassigned",
  });

  const filteredBugs = bugs.filter((bug) => {
    const matchesSearch =
      bug.title.toLowerCase().includes(search.toLowerCase()) ||
      bug.id.toLowerCase().includes(search.toLowerCase());
    const matchesPriority =
      selectedPriority === "ALL" || bug.priority === selectedPriority;
    return matchesSearch && matchesPriority;
  });

  const handleCreateBug = (e) => {
    e.preventDefault();
    if (!newBug.title) return;
    const created = {
      ...newBug,
      id: `BUG-${100 + bugs.length + 1}`,
      status: "OPEN",
      createdAt: new Date().toISOString().split("T")[0],
    };
    setBugs([created, ...bugs]);
    setIsModalOpen(false);
    setNewBug({
      title: "",
      description: "",
      priority: "MEDIUM",
      severity: "MEDIUM",
      project: "Backend Engine",
      assignee: "Unassigned",
    });
  };

  const moveBugStatus = (bugId, newStatus) => {
    setBugs(
      bugs.map((b) => (b.id === bugId ? { ...b, status: newStatus } : b))
    );
  };

  return (
    <div className="min-h-screen bg-[#0A0D14] text-slate-100 font-sans flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-[#0F1420]/80 backdrop-blur-md sticky top-0 z-40 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-indigo-500/20">
            ⚡
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              BugForge
            </h1>
            <p className="text-xs text-slate-400 font-medium">Enterprise SaaS Issue Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative w-72">
            <input
              type="text"
              placeholder="Search issues, keys..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
            />
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            + Create Bug Ticket
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r border-slate-800/80 bg-[#0C1019] p-5 flex flex-col justify-between hidden md:flex">
          <div className="space-y-6">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
                Workspace
              </p>
              <nav className="space-y-1">
                <a className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-indigo-600/10 text-indigo-400 font-semibold text-sm border border-indigo-500/20">
                  <span>📊</span> Issue Kanban Board
                </a>
                <a className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition text-sm">
                  <span>📁</span> Projects & Teams
                </a>
                <a className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition text-sm">
                  <span>🛡️</span> Security Audit Trail
                </a>
                <a className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition text-sm">
                  <span>⚙️</span> System Settings
                </a>
              </nav>
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
                Priority Filter
              </p>
              <div className="space-y-1">
                {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((p) => (
                  <button
                    key={p}
                    onClick={() => setSelectedPriority(p)}
                    className={`w-full text-left px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
                      selectedPriority === p
                        ? "bg-slate-800 text-white border border-slate-700"
                        : "text-slate-400 hover:bg-slate-900"
                    }`}
                  >
                    {p === "ALL" ? "All Priorities" : `${p} Priority`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 text-xs">
            <p className="font-bold text-slate-300">FastAPI + Postgres 16</p>
            <p className="text-slate-500 mt-1">Docker Compose Stack Online</p>
          </div>
        </aside>

        {/* Board Display */}
        <main className="flex-1 overflow-x-auto p-6 bg-[#080B11]">
          {/* Metrics Header */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-[#0F1420] border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-medium">Total Reported Issues</p>
                <p className="text-2xl font-bold text-white mt-1">{bugs.length}</p>
              </div>
              <span className="text-2xl p-2 rounded-xl bg-slate-800">🐞</span>
            </div>
            <div className="bg-[#0F1420] border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-medium">Critical Blockers</p>
                <p className="text-2xl font-bold text-red-400 mt-1">
                  {bugs.filter((b) => b.priority === "CRITICAL").length}
                </p>
              </div>
              <span className="text-2xl p-2 rounded-xl bg-red-500/10 border border-red-500/20">🔥</span>
            </div>
            <div className="bg-[#0F1420] border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-medium">In Active Progress</p>
                <p className="text-2xl font-bold text-blue-400 mt-1">
                  {bugs.filter((b) => b.status === "IN_PROGRESS").length}
                </p>
              </div>
              <span className="text-2xl p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">⚡</span>
            </div>
            <div className="bg-[#0F1420] border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-medium">Resolved & Closed</p>
                <p className="text-2xl font-bold text-emerald-400 mt-1">
                  {bugs.filter((b) => b.status === "RESOLVED").length}
                </p>
              </div>
              <span className="text-2xl p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">✅</span>
            </div>
          </div>

          {/* Kanban Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {COLUMNS.map((col) => {
              const colBugs = filteredBugs.filter((b) => b.status === col.key);
              return (
                <div
                  key={col.key}
                  className="bg-[#0F1420]/70 border border-slate-800/80 rounded-2xl p-4 flex flex-col min-h-[500px]"
                >
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${col.color}`} />
                      <h3 className="font-bold text-sm text-slate-200">{col.title}</h3>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                      {colBugs.length}
                    </span>
                  </div>

                  <div className="flex-1 space-y-3">
                    {colBugs.map((bug) => (
                      <div
                        key={bug.id}
                        className="bg-[#141A28] border border-slate-800/90 hover:border-slate-700 rounded-xl p-4 shadow-lg hover:shadow-indigo-500/5 transition-all group"
                      >
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                          <span className="font-mono font-bold text-indigo-400">{bug.id}</span>
                          <span
                            className={`px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                              bug.priority === "CRITICAL"
                                ? "bg-red-500/15 text-red-400 border border-red-500/30"
                                : bug.priority === "HIGH"
                                ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                                : "bg-slate-800 text-slate-300"
                            }`}
                          >
                            {bug.priority}
                          </span>
                        </div>

                        <h4 className="font-semibold text-sm text-slate-100 group-hover:text-indigo-300 transition line-clamp-2">
                          {bug.title}
                        </h4>

                        <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 font-normal">
                          {bug.description}
                        </p>

                        <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                          <span>👤 {bug.assignee}</span>
                          <select
                            value={bug.status}
                            onChange={(e) => moveBugStatus(bug.id, e.target.value)}
                            className="bg-slate-900 border border-slate-800 text-slate-300 rounded px-1.5 py-0.5 text-[10px] focus:outline-none"
                          >
                            <option value="OPEN">Move: Open</option>
                            <option value="IN_PROGRESS">Move: Progress</option>
                            <option value="IN_REVIEW">Move: Review</option>
                            <option value="RESOLVED">Move: Resolved</option>
                          </select>
                        </div>
                      </div>
                    ))}

                    {colBugs.length === 0 && (
                      <div className="h-32 flex items-center justify-center border-2 border-dashed border-slate-800/60 rounded-xl text-xs text-slate-600 font-medium">
                        No issues in this stage
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>

      {/* Create Ticket Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F1420] border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Create New Bug Ticket</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBug} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Issue Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Memory leak in background worker"
                  value={newBug.title}
                  onChange={(e) => setNewBug({ ...newBug, title: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows="3"
                  placeholder="Describe step to reproduce and impact..."
                  value={newBug.description}
                  onChange={(e) => setNewBug({ ...newBug, description: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={newBug.priority}
                    onChange={(e) => setNewBug({ ...newBug, priority: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Assignee
                  </label>
                  <input
                    type="text"
                    placeholder="Assignee name"
                    value={newBug.assignee}
                    onChange={(e) => setNewBug({ ...newBug, assignee: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:bg-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30"
                >
                  Create Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}