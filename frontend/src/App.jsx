import React, { useState } from "react";

// Initial Demo Enterprise Data
const INITIAL_BUGS = [
  {
    id: "BF-101",
    type: "BUG",
    title: "Database connection pool exhaustion under high concurrency load",
    description: "Asyncpg pool runs out of available connection slots during peak workload. Need to increase pool size and verify pool_recycle configuration.",
    status: "OPEN",
    priority: "CRITICAL",
    severity: "BLOCKER",
    project: "Core Engine",
    assignee: "Alex Rivera",
    reporter: "Sarah Chen",
    tags: ["database", "asyncpg", "performance"],
    commentsCount: 4,
    subtasks: { done: 1, total: 3 },
    createdAt: "2026-08-05 14:30",
  },
  {
    id: "BF-102",
    type: "FEATURE",
    title: "Implement OAuth2 SSO integration with Okta & Google Workspace",
    description: "Enterprise customers require single sign-on support via SAML 2.0 and OAuth2 OIDC identity providers.",
    status: "IN_PROGRESS",
    priority: "HIGH",
    severity: "HIGH",
    project: "Auth Security",
    assignee: "Sarah Chen",
    reporter: "Alex Rivera",
    tags: ["auth", "security", "sso"],
    commentsCount: 8,
    subtasks: { done: 4, total: 5 },
    createdAt: "2026-08-04 09:15",
  },
  {
    id: "BF-103",
    type: "BUG",
    title: "JWT refresh token failing to revoke in Redis revocation list",
    description: "Logout API endpoint does not set TTL expiration key on blacklisted JTI string in Redis instance.",
    status: "IN_PROGRESS",
    priority: "HIGH",
    severity: "HIGH",
    project: "Auth Security",
    assignee: "Sarah Chen",
    reporter: "David Kim",
    tags: ["redis", "jwt", "security"],
    commentsCount: 2,
    subtasks: { done: 2, total: 2 },
    createdAt: "2026-08-04 11:20",
  },
  {
    id: "BF-104",
    type: "TASK",
    title: "Configure ArgoCD GitOps sync policy for AWS EKS deployment",
    description: "Set up automated sync policy with prune and self-heal options enabled in Kubernetes cluster.",
    status: "IN_REVIEW",
    priority: "MEDIUM",
    severity: "MEDIUM",
    project: "DevOps Pipeline",
    assignee: "David Kim",
    reporter: "Elena Rostova",
    tags: ["k8s", "argocd", "devops"],
    commentsCount: 6,
    subtasks: { done: 3, total: 3 },
    createdAt: "2026-08-03 16:45",
  },
  {
    id: "BF-105",
    type: "IMPROVEMENT",
    title: "Optimize NGINX Gzip compression and static asset caching rules",
    description: "Add 1-year cache headers for immutable Vite production bundles to improve Lighthouse score.",
    status: "RESOLVED",
    priority: "LOW",
    severity: "LOW",
    project: "Frontend Portal",
    assignee: "Elena Rostova",
    reporter: "Alex Rivera",
    tags: ["nginx", "frontend", "performance"],
    commentsCount: 1,
    subtasks: { done: 1, total: 1 },
    createdAt: "2026-08-02 10:10",
  },
];

const COLUMNS = [
  { key: "OPEN", title: "Open", countBg: "bg-amber-500/20 text-amber-300 border-amber-500/30", dot: "bg-amber-400" },
  { key: "IN_PROGRESS", title: "In Progress", countBg: "bg-blue-500/20 text-blue-300 border-blue-500/30", dot: "bg-blue-400" },
  { key: "IN_REVIEW", title: "In Review", countBg: "bg-purple-500/20 text-purple-300 border-purple-500/30", dot: "bg-purple-400" },
  { key: "RESOLVED", title: "Resolved", countBg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30", dot: "bg-emerald-400" },
];

export default function App() {
  const [bugs, setBugs] = useState(INITIAL_BUGS);
  const [currentView, setCurrentView] = useState("BOARD"); // 'BOARD', 'LIST', 'SUMMARY'
  const [search, setSearch] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("ALL");
  const [selectedAssignee, setSelectedAssignee] = useState("ALL");
  const [activeIssue, setActiveIssue] = useState(null); // Detail Drawer
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [commentText, setCommentText] = useState("");

  const [newIssue, setNewIssue] = useState({
    title: "",
    description: "",
    type: "BUG",
    priority: "MEDIUM",
    severity: "MEDIUM",
    project: "Core Engine",
    assignee: "Alex Rivera",
    tags: "frontend, api",
  });

  // Filter Issues
  const filteredBugs = bugs.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.id.toLowerCase().includes(search.toLowerCase()) ||
      b.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchesPriority = selectedPriority === "ALL" || b.priority === selectedPriority;
    const matchesAssignee = selectedAssignee === "ALL" || b.assignee === selectedAssignee;
    return matchesSearch && matchesPriority && matchesAssignee;
  });

  const handleCreateIssue = (e) => {
    e.preventDefault();
    if (!newIssue.title) return;
    const created = {
      ...newIssue,
      id: `BF-${100 + bugs.length + 1}`,
      status: "OPEN",
      reporter: "Sarah Chen",
      tags: newIssue.tags.split(",").map((t) => t.trim()).filter(Boolean),
      commentsCount: 0,
      subtasks: { done: 0, total: 1 },
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
    };
    setBugs([created, ...bugs]);
    setIsCreateModalOpen(false);
    setNewIssue({
      title: "",
      description: "",
      type: "BUG",
      priority: "MEDIUM",
      severity: "MEDIUM",
      project: "Core Engine",
      assignee: "Alex Rivera",
      tags: "frontend, api",
    });
  };

  const updateIssueStatus = (id, newStatus) => {
    setBugs(bugs.map((b) => (b.id === id ? { ...b, status: newStatus } : b)));
    if (activeIssue && activeIssue.id === id) {
      setActiveIssue({ ...activeIssue, status: newStatus });
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case "BUG":
        return <span className="w-5 h-5 rounded bg-red-500/20 text-red-400 flex items-center justify-center text-[10px] font-bold border border-red-500/30">🔴</span>;
      case "FEATURE":
        return <span className="w-5 h-5 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold border border-emerald-500/30">✨</span>;
      case "TASK":
        return <span className="w-5 h-5 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-bold border border-blue-500/30">📋</span>;
      default:
        return <span className="w-5 h-5 rounded bg-purple-500/20 text-purple-400 flex items-center justify-center text-[10px] font-bold border border-purple-500/30">⚡</span>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "CRITICAL":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/40">CRITICAL</span>;
      case "HIGH":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">HIGH</span>;
      case "MEDIUM":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">MEDIUM</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">LOW</span>;
    }
  };

  return (
    <div className="w-full h-screen bg-[#090C15] text-slate-100 font-sans flex flex-col overflow-hidden">
      {/* ========================================================================= */}
      {/* TOP JIRA-LEVEL NAVIGATION BAR */}
      {/* ========================================================================= */}
      <header className="h-14 bg-[#0F1422] border-b border-slate-800/80 px-5 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-6">
          {/* Logo & Workspace Switcher */}
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 via-violet-600 to-pink-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-indigo-500/30">
              BF
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-tight text-white">BugForge</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  ENTERPRISE
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">Acme Software Corp</span>
            </div>
          </div>

          <div className="h-5 w-[1px] bg-slate-800 hidden md:block" />

          {/* Main Top Nav Links */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-semibold">
            <button
              onClick={() => setCurrentView("BOARD")}
              className={`px-3 py-1.5 rounded-lg transition ${
                currentView === "BOARD"
                  ? "bg-slate-800 text-white font-bold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              📋 Board View
            </button>
            <button
              onClick={() => setCurrentView("LIST")}
              className={`px-3 py-1.5 rounded-lg transition ${
                currentView === "LIST"
                  ? "bg-slate-800 text-white font-bold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              📄 List View
            </button>
            <button
              onClick={() => setCurrentView("SUMMARY")}
              className={`px-3 py-1.5 rounded-lg transition ${
                currentView === "SUMMARY"
                  ? "bg-slate-800 text-white font-bold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              📊 Analytics Dashboard
            </button>
          </nav>
        </div>

        {/* Global Controls & Actions */}
        <div className="flex items-center gap-3">
          {/* Global Search Bar */}
          <div className="relative w-64 hidden sm:block">
            <input
              type="text"
              placeholder="Search issues, keys, tags... ⌘K"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#151B2B] border border-slate-800 rounded-lg px-3.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
            />
          </div>

          {/* Primary Create Button */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-lg shadow-indigo-600/30 transition hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1.5"
          >
            <span>+</span> Create Issue
          </button>

          {/* User Profile */}
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-200 relative">
            AR
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute bottom-0 right-0 border-2 border-[#0F1422]" />
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MAIN CONTAINER (SIDEBAR + CONTENT) */}
      {/* ========================================================================= */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-60 bg-[#0C0F1A] border-r border-slate-800/80 p-4 flex flex-col justify-between shrink-0 hidden md:flex">
          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                Views & Workflows
              </p>
              <div className="space-y-1 text-xs">
                <button
                  onClick={() => setCurrentView("BOARD")}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition ${
                    currentView === "BOARD"
                      ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/20 font-bold"
                      : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <span>📋</span> Active Sprint Board
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                    {bugs.length}
                  </span>
                </button>

                <button
                  onClick={() => setCurrentView("LIST")}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition ${
                    currentView === "LIST"
                      ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/20 font-bold"
                      : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <span>📄</span> Issues List & Grid
                  </span>
                </button>

                <button
                  onClick={() => setCurrentView("SUMMARY")}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition ${
                    currentView === "SUMMARY"
                      ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/20 font-bold"
                      : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <span>📊</span> Sprint Analytics
                  </span>
                </button>
              </div>
            </div>

            {/* Priority Filters */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                Quick Filters
              </p>
              <div className="space-y-1 text-xs">
                {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((p) => (
                  <button
                    key={p}
                    onClick={() => setSelectedPriority(p)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
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

            {/* Assignee Filter */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                Assignee
              </p>
              <div className="space-y-1 text-xs">
                {["ALL", "Alex Rivera", "Sarah Chen", "David Kim", "Elena Rostova"].map((a) => (
                  <button
                    key={a}
                    onClick={() => setSelectedAssignee(a)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      selectedAssignee === a
                        ? "bg-slate-800 text-white border border-slate-700"
                        : "text-slate-400 hover:bg-slate-900"
                    }`}
                  >
                    {a === "ALL" ? "All Assignees" : a}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#121624] border border-slate-800 text-[11px] space-y-1">
            <div className="flex items-center justify-between text-slate-300 font-bold">
              <span>Sprint #14</span>
              <span className="text-emerald-400 font-mono">98% SLA</span>
            </div>
            <p className="text-slate-500 text-[10px]">Ends in 4 days (Aug 9)</p>
          </div>
        </aside>

        {/* Main Display Area */}
        <main className="flex-1 bg-[#090C15] overflow-y-auto p-6 flex flex-col">
          {/* ========================================================================= */}
          {/* VIEW 1: KANBAN BOARD */}
          {/* ========================================================================= */}
          {currentView === "BOARD" && (
            <div className="flex-1 flex flex-col">
              {/* Header Filters Bar */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-black text-white tracking-tight">Active Sprint Kanban Board</h2>
                  <p className="text-xs text-slate-400">Manage issue states, status transitions, and team assignments</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                  <span>Showing {filteredBugs.length} of {bugs.length} issues</span>
                </div>
              </div>

              {/* Kanban Grid Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
                {COLUMNS.map((col) => {
                  const colBugs = filteredBugs.filter((b) => b.status === col.key);
                  return (
                    <div
                      key={col.key}
                      className="bg-[#0E1321] border border-slate-800/90 rounded-xl p-3.5 flex flex-col min-h-[550px]"
                    >
                      {/* Column Header */}
                      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">
                            {col.title}
                          </h3>
                        </div>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${col.countBg}`}>
                          {colBugs.length}
                        </span>
                      </div>

                      {/* Cards List */}
                      <div className="flex-1 space-y-3">
                        {colBugs.map((bug) => (
                          <div
                            key={bug.id}
                            onClick={() => setActiveIssue(bug)}
                            className="bg-[#141A2A] border border-slate-800 hover:border-indigo-500/50 rounded-xl p-3.5 shadow-md hover:shadow-indigo-500/10 cursor-pointer transition group"
                          >
                            <div className="flex items-center justify-between text-[11px] mb-2">
                              <div className="flex items-center gap-1.5">
                                {getTypeBadge(bug.type)}
                                <span className="font-mono font-bold text-indigo-400 hover:underline">
                                  {bug.id}
                                </span>
                              </div>
                              {getPriorityBadge(bug.priority)}
                            </div>

                            <h4 className="font-semibold text-xs text-slate-100 group-hover:text-indigo-300 transition line-clamp-2 leading-relaxed">
                              {bug.title}
                            </h4>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-1 mt-2.5">
                              {bug.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>

                            {/* Card Footer */}
                            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                              <span className="flex items-center gap-1 font-medium text-slate-300">
                                👤 {bug.assignee}
                              </span>
                              <div className="flex items-center gap-2 text-slate-500">
                                <span>💬 {bug.commentsCount}</span>
                                <span>✅ {bug.subtasks.done}/{bug.subtasks.total}</span>
                              </div>
                            </div>
                          </div>
                        ))}

                        {colBugs.length === 0 && (
                          <div className="h-28 border border-dashed border-slate-800 rounded-xl flex items-center justify-center text-xs text-slate-600 font-medium">
                            No issues in {col.title}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 2: LIST GRID VIEW */}
          {/* ========================================================================= */}
          {currentView === "LIST" && (
            <div className="flex-1 bg-[#0E1321] border border-slate-800 rounded-xl overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white">All Issues Grid</h2>
                  <p className="text-xs text-slate-400">High-density data view for issues and tickets</p>
                </div>
                <span className="text-xs text-slate-400 font-semibold">{filteredBugs.length} records</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-[#141A2A] text-slate-400 uppercase font-bold text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="p-3">Key</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Summary</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Priority</th>
                      <th className="p-3">Severity</th>
                      <th className="p-3">Assignee</th>
                      <th className="p-3">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredBugs.map((bug) => (
                      <tr
                        key={bug.id}
                        onClick={() => setActiveIssue(bug)}
                        className="hover:bg-slate-800/40 cursor-pointer transition"
                      >
                        <td className="p-3 font-mono font-bold text-indigo-400">{bug.id}</td>
                        <td className="p-3">{getTypeBadge(bug.type)}</td>
                        <td className="p-3 font-semibold text-slate-100 max-w-md truncate">{bug.title}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                            {bug.status}
                          </span>
                        </td>
                        <td className="p-3">{getPriorityBadge(bug.priority)}</td>
                        <td className="p-3">
                          <span className="text-[10px] font-mono text-slate-400">{bug.severity}</span>
                        </td>
                        <td className="p-3 font-medium text-slate-200">{bug.assignee}</td>
                        <td className="p-3 text-slate-500 font-mono text-[10px]">{bug.createdAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 3: SUMMARY ANALYTICS */}
          {/* ========================================================================= */}
          {currentView === "SUMMARY" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#0E1321] border border-slate-800 rounded-xl p-4">
                  <p className="text-xs text-slate-400 font-semibold">Total Issues</p>
                  <p className="text-3xl font-black text-white mt-2">{bugs.length}</p>
                </div>
                <div className="bg-[#0E1321] border border-slate-800 rounded-xl p-4">
                  <p className="text-xs text-slate-400 font-semibold">Blockers & Critical</p>
                  <p className="text-3xl font-black text-red-400 mt-2">
                    {bugs.filter((b) => b.priority === "CRITICAL").length}
                  </p>
                </div>
                <div className="bg-[#0E1321] border border-slate-800 rounded-xl p-4">
                  <p className="text-xs text-slate-400 font-semibold">Active In Progress</p>
                  <p className="text-3xl font-black text-blue-400 mt-2">
                    {bugs.filter((b) => b.status === "IN_PROGRESS").length}
                  </p>
                </div>
                <div className="bg-[#0E1321] border border-slate-800 rounded-xl p-4">
                  <p className="text-xs text-slate-400 font-semibold">SLA Compliance Rate</p>
                  <p className="text-3xl font-black text-emerald-400 mt-2">98.4%</p>
                </div>
              </div>

              <div className="bg-[#0E1321] border border-slate-800 rounded-xl p-6">
                <h3 className="text-sm font-bold text-white mb-4">Sprint Breakdown by Priority</h3>
                <div className="space-y-3">
                  {["CRITICAL", "HIGH", "MEDIUM", "LOW"].map((p) => {
                    const count = bugs.filter((b) => b.priority === p).length;
                    const pct = Math.round((count / bugs.length) * 100) || 0;
                    return (
                      <div key={p} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-slate-300">
                          <span>{p} Priority</span>
                          <span>{count} ({pct}%)</span>
                        </div>
                        <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              p === "CRITICAL" ? "bg-red-500" : p === "HIGH" ? "bg-amber-500" : "bg-indigo-500"
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* RICH ISSUE DETAIL SLIDE-OVER DRAWER */}
      {/* ========================================================================= */}
      {activeIssue && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-2xl bg-[#0F1422] border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#13192B]">
              <div className="flex items-center gap-2">
                {getTypeBadge(activeIssue.type)}
                <span className="font-mono font-bold text-sm text-indigo-400">{activeIssue.id}</span>
                <span className="text-slate-600">/</span>
                <span className="text-xs font-semibold text-slate-400">{activeIssue.project}</span>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={activeIssue.status}
                  onChange={(e) => updateIssueStatus(activeIssue.id, e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg text-indigo-300 focus:outline-none"
                >
                  <option value="OPEN">Status: OPEN</option>
                  <option value="IN_PROGRESS">Status: IN_PROGRESS</option>
                  <option value="IN_REVIEW">Status: IN_REVIEW</option>
                  <option value="RESOLVED">Status: RESOLVED</option>
                  <option value="CLOSED">Status: CLOSED</option>
                </select>

                <button
                  onClick={() => setActiveIssue(null)}
                  className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-bold text-xs"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Title & Description */}
              <div>
                <h2 className="text-lg font-black text-white leading-snug">{activeIssue.title}</h2>
                <p className="text-xs text-slate-400 mt-2 font-mono">Created at {activeIssue.createdAt}</p>
              </div>

              <div className="bg-[#141A2A] border border-slate-800 rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Description</h4>
                <p className="text-xs leading-relaxed text-slate-300 whitespace-pre-wrap">
                  {activeIssue.description}
                </p>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-4 bg-[#141A2A] border border-slate-800 rounded-xl p-4 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Assignee</span>
                  <span className="font-semibold text-slate-200 mt-0.5 block">👤 {activeIssue.assignee}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Reporter</span>
                  <span className="font-semibold text-slate-200 mt-0.5 block">👤 {activeIssue.reporter}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Priority</span>
                  <span className="mt-0.5 block">{getPriorityBadge(activeIssue.priority)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Severity</span>
                  <span className="font-mono font-bold text-slate-300 mt-0.5 block">{activeIssue.severity}</span>
                </div>
              </div>

              {/* Activity / Comments Section */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Discussion & Comments ({activeIssue.commentsCount})
                </h4>

                <div className="space-y-3">
                  <div className="bg-[#141A2A] border border-slate-800/80 rounded-xl p-3 text-xs space-y-1">
                    <div className="flex justify-between text-slate-400 text-[10px]">
                      <span className="font-bold text-indigo-400">Sarah Chen</span>
                      <span>10 mins ago</span>
                    </div>
                    <p className="text-slate-300">
                      Investigating pool configuration parameters in <code className="bg-slate-900 px-1 rounded">session.py</code>. Updating `max_overflow` to 20.
                    </p>
                  </div>
                </div>

                {/* Add Comment Input */}
                <div className="space-y-2">
                  <textarea
                    rows="2"
                    placeholder="Add a comment to this issue..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="w-full bg-[#141A2A] border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={() => setCommentText("")}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                    >
                      Post Comment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CREATE ISSUE MODAL */}
      {/* ========================================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F1422] border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Create New Enterprise Issue</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateIssue} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Issue Type</label>
                  <select
                    value={newIssue.type}
                    onChange={(e) => setNewIssue({ ...newIssue, type: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none"
                  >
                    <option value="BUG">🔴 Bug</option>
                    <option value="FEATURE">✨ Feature Request</option>
                    <option value="TASK">📋 Task</option>
                    <option value="IMPROVEMENT">⚡ Improvement</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Project</label>
                  <select
                    value={newIssue.project}
                    onChange={(e) => setNewIssue({ ...newIssue, project: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none"
                  >
                    <option value="Core Engine">Core Engine</option>
                    <option value="Auth Security">Auth Security</option>
                    <option value="DevOps Pipeline">DevOps Pipeline</option>
                    <option value="Frontend Portal">Frontend Portal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Summary Title</label>
                <input
                  type="text"
                  required
                  placeholder="Short, descriptive summary of the issue..."
                  value={newIssue.title}
                  onChange={(e) => setNewIssue({ ...newIssue, title: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows="3"
                  placeholder="Detailed description, steps to reproduce, impact..."
                  value={newIssue.description}
                  onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Priority</label>
                  <select
                    value={newIssue.priority}
                    onChange={(e) => setNewIssue({ ...newIssue, priority: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-white focus:outline-none"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Assignee</label>
                  <select
                    value={newIssue.assignee}
                    onChange={(e) => setNewIssue({ ...newIssue, assignee: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-white focus:outline-none"
                  >
                    <option value="Alex Rivera">Alex Rivera</option>
                    <option value="Sarah Chen">Sarah Chen</option>
                    <option value="David Kim">David Kim</option>
                    <option value="Elena Rostova">Elena Rostova</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-semibold text-slate-400 hover:bg-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30"
                >
                  Create Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}