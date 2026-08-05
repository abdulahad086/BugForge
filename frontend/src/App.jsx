import React, { useState } from "react";

// Initial Demo State
const INITIAL_USERS = [
  { id: "usr-1", name: "System Admin", email: "admin@bugforge.io", role: "ADMIN" },
  { id: "usr-2", name: "Alex Rivera", email: "alex@bugforge.io", role: "MANAGER" },
  { id: "usr-3", name: "Sarah Chen", email: "sarah@bugforge.io", role: "DEVELOPER" },
  { id: "usr-4", name: "David Kim", email: "david@bugforge.io", role: "DEVELOPER" },
];

const INITIAL_PROJECTS = [
  { id: "prj-1", key: "ENG", name: "Backend Core Engine", description: "FastAPI REST API & Database engine", createdBy: "admin@bugforge.io" },
  { id: "prj-2", key: "AUTH", name: "Authentication Service", description: "JWT & Redis session management", createdBy: "alex@bugforge.io" },
  { id: "prj-3", key: "UI", name: "Frontend Web Portal", description: "React Single Page Application", createdBy: "sarah@bugforge.io" },
];

const INITIAL_ISSUES = [
  {
    id: "ENG-101",
    type: "BUG",
    title: "Database connection pool exhaustion under high load",
    description: "Asyncpg connection pool exceeds max allowed slots during concurrency benchmarks.",
    status: "OPEN",
    priority: "CRITICAL",
    severity: "BLOCKER",
    projectKey: "ENG",
    assigneeId: "usr-3",
    reporterId: "usr-1",
    createdAt: "2026-08-05",
  },
  {
    id: "AUTH-102",
    type: "FEATURE",
    title: "Implement OAuth2 SSO integration with Okta",
    description: "Support SAML 2.0 and OIDC single sign-on authentication.",
    status: "IN_PROGRESS",
    priority: "HIGH",
    severity: "HIGH",
    projectKey: "AUTH",
    assigneeId: "usr-3",
    reporterId: "usr-2",
    createdAt: "2026-08-04",
  },
  {
    id: "UI-103",
    type: "TASK",
    title: "Optimize NGINX Gzip compression rules",
    description: "Add cache control headers for static production assets.",
    status: "RESOLVED",
    priority: "MEDIUM",
    severity: "MEDIUM",
    projectKey: "UI",
    assigneeId: "usr-4",
    reporterId: "usr-3",
    createdAt: "2026-08-03",
  },
];

const STATUSES = ["OPEN", "IN_PROGRESS", "IN_REVIEW", "RESOLVED", "CLOSED"];

export default function App() {
  // Auth & State Management
  const [users, setUsers] = useState(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState(INITIAL_USERS[0]); // Default Admin
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [issues, setIssues] = useState(INITIAL_ISSUES);

  // Active View & Filters
  const [activeTab, setActiveTab] = useState("BOARD"); // 'BOARD', 'PROJECTS', 'USERS'
  const [selectedProjectKey, setSelectedProjectKey] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("ALL");

  // Selected Issue for Detail Modal
  const [selectedIssue, setSelectedIssue] = useState(null);

  // Modals
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isNewIssueModalOpen, setIsNewIssueModalOpen] = useState(false);
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);

  // Form States
  const [newProject, setNewProject] = useState({ name: "", key: "", description: "" });
  const [newIssue, setNewIssue] = useState({
    title: "",
    description: "",
    type: "BUG",
    priority: "MEDIUM",
    severity: "MEDIUM",
    projectKey: "ENG",
    assigneeId: "usr-3",
  });
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "DEVELOPER" });

  // Filtered Issues
  const filteredIssues = issues.filter((issue) => {
    const matchesProject = selectedProjectKey === "ALL" || issue.projectKey === selectedProjectKey;
    const matchesPriority = selectedPriority === "ALL" || issue.priority === selectedPriority;
    const matchesSearch =
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProject && matchesPriority && matchesSearch;
  });

  // Actions: Projects
  const handleCreateProject = (e) => {
    e.preventDefault();
    if (!newProject.name || !newProject.key) return;
    const project = {
      id: `prj-${projects.length + 1}`,
      key: newProject.key.toUpperCase().trim(),
      name: newProject.name.trim(),
      description: newProject.description,
      createdBy: currentUser.email,
    };
    setProjects([...projects, project]);
    setNewProject({ name: "", key: "", description: "" });
    setIsNewProjectModalOpen(false);
  };

  const handleDeleteProject = (projectKey) => {
    if (!window.confirm(`Delete project ${projectKey} and all associated issues?`)) return;
    setProjects(projects.filter((p) => p.key !== projectKey));
    setIssues(issues.filter((i) => i.projectKey !== projectKey));
    if (selectedProjectKey === projectKey) setSelectedProjectKey("ALL");
  };

  // Actions: Issues
  const handleCreateIssue = (e) => {
    e.preventDefault();
    if (!newIssue.title) return;
    const issue = {
      ...newIssue,
      id: `${newIssue.projectKey}-${100 + issues.length + 1}`,
      status: "OPEN",
      reporterId: currentUser.id,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setIssues([issue, ...issues]);
    setNewIssue({
      title: "",
      description: "",
      type: "BUG",
      priority: "MEDIUM",
      severity: "MEDIUM",
      projectKey: projects[0]?.key || "ENG",
      assigneeId: currentUser.id,
    });
    setIsNewIssueModalOpen(false);
  };

  const handleUpdateIssueStatus = (issueId, newStatus) => {
    setIssues(issues.map((i) => (i.id === issueId ? { ...i, status: newStatus } : i)));
    if (selectedIssue && selectedIssue.id === issueId) {
      setSelectedIssue({ ...selectedIssue, status: newStatus });
    }
  };

  const handleUpdateIssueAssignee = (issueId, newAssigneeId) => {
    setIssues(issues.map((i) => (i.id === issueId ? { ...i, assigneeId: newAssigneeId } : i)));
    if (selectedIssue && selectedIssue.id === issueId) {
      setSelectedIssue({ ...selectedIssue, assigneeId: newAssigneeId });
    }
  };

  const handleDeleteIssue = (issueId) => {
    if (!window.confirm(`Are you sure you want to delete issue ${issueId}?`)) return;
    setIssues(issues.filter((i) => i.id !== issueId));
    setSelectedIssue(null);
  };

  // Actions: Users
  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;
    const user = {
      id: `usr-${users.length + 1}`,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    };
    setUsers([...users, user]);
    setNewUser({ name: "", email: "", role: "DEVELOPER" });
    setIsNewUserModalOpen(false);
  };

  const getUserName = (userId) => {
    const u = users.find((x) => x.id === userId);
    return u ? u.name : "Unassigned";
  };

  // If user logged out
  if (!isLoggedIn) {
    return (
      <div className="w-full h-screen bg-[#0b0f19] text-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#111827] border border-slate-800 rounded-xl p-6 space-y-5 shadow-2xl">
          <div className="text-center space-y-1">
            <h1 className="text-xl font-bold text-white">BugForge Portal</h1>
            <p className="text-xs text-slate-400">Select user account to sign in</p>
          </div>

          <div className="space-y-2">
            {users.map((u) => (
              <button
                key={u.id}
                onClick={() => {
                  setCurrentUser(u);
                  setIsLoggedIn(true);
                }}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-[#1f2937]/50 hover:bg-slate-800 text-left transition"
              >
                <div>
                  <p className="text-xs font-bold text-white">{u.name}</p>
                  <p className="text-[11px] text-slate-400">{u.email}</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {u.role}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-[#0b0f19] text-slate-100 font-sans flex flex-col overflow-hidden">
      {/* ========================================================================= */}
      {/* NAVIGATION HEADER */}
      {/* ========================================================================= */}
      <header className="h-14 bg-[#111827] border-b border-slate-800 px-5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
              BF
            </div>
            <span className="font-bold text-sm text-white tracking-tight">BugForge Engine</span>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 text-xs font-semibold">
            <button
              onClick={() => setActiveTab("BOARD")}
              className={`px-3 py-1.5 rounded transition ${
                activeTab === "BOARD"
                  ? "bg-slate-800 text-white font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Issue Board
            </button>
            <button
              onClick={() => setActiveTab("PROJECTS")}
              className={`px-3 py-1.5 rounded transition ${
                activeTab === "PROJECTS"
                  ? "bg-slate-800 text-white font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Projects ({projects.length})
            </button>

            {currentUser.role === "ADMIN" && (
              <button
                onClick={() => setActiveTab("USERS")}
                className={`px-3 py-1.5 rounded transition ${
                  activeTab === "USERS"
                    ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Admin User Management
              </button>
            )}
          </nav>
        </div>

        {/* User Status & Controls */}
        <div className="flex items-center gap-3">
          {/* Active User Switcher */}
          <div className="flex items-center gap-2 bg-[#1f2937] border border-slate-700 px-3 py-1 rounded text-xs">
            <span className="text-slate-400">Logged in as:</span>
            <select
              value={currentUser.id}
              onChange={(e) => {
                const u = users.find((x) => x.id === e.target.value);
                if (u) setCurrentUser(u);
              }}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id} className="bg-slate-900 text-white">
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setIsNewIssueModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3.5 py-1.5 rounded transition"
          >
            + Create Issue
          </button>

          <button
            onClick={() => setIsLoggedIn(false)}
            className="text-xs text-slate-400 hover:text-red-400 border border-slate-800 px-2.5 py-1 rounded"
          >
            Logout
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MAIN CONTENT AREA */}
      {/* ========================================================================= */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Filters */}
        <aside className="w-56 bg-[#0d121f] border-r border-slate-800 p-4 space-y-5 shrink-0 hidden md:block text-xs">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Filter by Project
            </label>
            <select
              value={selectedProjectKey}
              onChange={(e) => setSelectedProjectKey(e.target.value)}
              className="w-full bg-[#111827] border border-slate-700 rounded p-2 text-white focus:outline-none"
            >
              <option value="ALL">All Projects ({projects.length})</option>
              {projects.map((p) => (
                <option key={p.key} value={p.key}>
                  [{p.key}] {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Filter by Priority
            </label>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full bg-[#111827] border border-slate-700 rounded p-2 text-white focus:outline-none"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <span className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
              Active User Role
            </span>
            <span className="inline-block font-mono font-bold px-2 py-1 rounded bg-slate-800 text-indigo-300 border border-slate-700">
              {currentUser.role}
            </span>
          </div>
        </aside>

        {/* Main View Display */}
        <main className="flex-1 bg-[#0b0f19] overflow-y-auto p-5 flex flex-col">
          {/* ========================================================================= */}
          {/* VIEW 1: KANBAN BOARD */}
          {/* ========================================================================= */}
          {activeTab === "BOARD" && (
            <div className="flex-1 flex flex-col">
              {/* Header Bar */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Search issues..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-[#111827] border border-slate-700 rounded px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none w-64"
                  />
                  <span className="text-xs text-slate-400">
                    Showing {filteredIssues.length} issues
                  </span>
                </div>

                {currentUser.role === "ADMIN" && (
                  <button
                    onClick={() => setIsNewProjectModalOpen(true)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold px-3 py-1.5 rounded"
                  >
                    + Add New Project
                  </button>
                )}
              </div>

              {/* Status Columns */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 flex-1">
                {STATUSES.map((statusKey) => {
                  const columnIssues = filteredIssues.filter((i) => i.status === statusKey);
                  return (
                    <div
                      key={statusKey}
                      className="bg-[#111827] border border-slate-800 rounded-lg p-3 flex flex-col min-h-[500px]"
                    >
                      <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
                        <span className="font-bold text-xs text-slate-300 uppercase tracking-wider">
                          {statusKey.replace("_", " ")}
                        </span>
                        <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                          {columnIssues.length}
                        </span>
                      </div>

                      <div className="flex-1 space-y-2.5">
                        {columnIssues.map((issue) => (
                          <div
                            key={issue.id}
                            onClick={() => setSelectedIssue(issue)}
                            className="bg-[#1f2937]/70 border border-slate-800 hover:border-indigo-500/60 rounded-lg p-3 cursor-pointer transition space-y-2"
                          >
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-mono font-bold text-indigo-400">
                                {issue.id}
                              </span>
                              <span
                                className={`font-bold px-1.5 py-0.5 rounded ${
                                  issue.priority === "CRITICAL"
                                    ? "bg-red-500/20 text-red-300 border border-red-500/30"
                                    : issue.priority === "HIGH"
                                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                    : "bg-slate-800 text-slate-300"
                                }`}
                              >
                                {issue.priority}
                              </span>
                            </div>

                            <p className="text-xs font-semibold text-white leading-snug line-clamp-2">
                              {issue.title}
                            </p>

                            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                              <span>Assignee: {getUserName(issue.assigneeId)}</span>
                              <span className="font-mono text-slate-500">[{issue.type}]</span>
                            </div>
                          </div>
                        ))}

                        {columnIssues.length === 0 && (
                          <div className="h-24 border border-dashed border-slate-800 rounded flex items-center justify-center text-[11px] text-slate-600 font-medium">
                            No issues
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
          {/* VIEW 2: PROJECTS MANAGEMENT */}
          {/* ========================================================================= */}
          {activeTab === "PROJECTS" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white">Project Repositories</h2>
                  <p className="text-xs text-slate-400">Manage software house project spaces</p>
                </div>
                <button
                  onClick={() => setIsNewProjectModalOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded"
                >
                  + Add Project
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((p) => {
                  const projIssueCount = issues.filter((i) => i.projectKey === p.key).length;
                  return (
                    <div
                      key={p.key}
                      className="bg-[#111827] border border-slate-800 rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          KEY: {p.key}
                        </span>
                        {currentUser.role === "ADMIN" && (
                          <button
                            onClick={() => handleDeleteProject(p.key)}
                            className="text-[11px] text-red-400 hover:underline"
                          >
                            Delete Project
                          </button>
                        )}
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-white">{p.name}</h3>
                        <p className="text-xs text-slate-400 mt-1">{p.description || "No description provided."}</p>
                      </div>

                      <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                        <span>Issues Total: {projIssueCount}</span>
                        <button
                          onClick={() => {
                            setSelectedProjectKey(p.key);
                            setActiveTab("BOARD");
                          }}
                          className="text-indigo-400 font-bold hover:underline"
                        >
                          View Board -&gt;
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 3: ADMIN USER MANAGEMENT */}
          {/* ========================================================================= */}
          {activeTab === "USERS" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white">Admin User Management</h2>
                  <p className="text-xs text-slate-400">Manage software house team members and permissions</p>
                </div>
                <button
                  onClick={() => setIsNewUserModalOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded"
                >
                  + Add User Account
                </button>
              </div>

              <div className="bg-[#111827] border border-slate-800 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-[#1f2937] text-slate-400 uppercase font-bold text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="p-3">User ID</th>
                      <th className="p-3">Full Name</th>
                      <th className="p-3">Email Address</th>
                      <th className="p-3">Access Role</th>
                      <th className="p-3">Assigned Issues</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {users.map((u) => {
                      const count = issues.filter((i) => i.assigneeId === u.id).length;
                      return (
                        <tr key={u.id} className="hover:bg-slate-800/50">
                          <td className="p-3 font-mono text-slate-400">{u.id}</td>
                          <td className="p-3 font-bold text-white">{u.name}</td>
                          <td className="p-3 text-slate-400">{u.email}</td>
                          <td className="p-3">
                            <span className="font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700 text-[10px]">
                              {u.role}
                            </span>
                          </td>
                          <td className="p-3 font-bold">{count} issues</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* ISSUE DETAIL MODAL */}
      {/* ========================================================================= */}
      {selectedIssue && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-xl w-full max-w-xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm text-indigo-400">
                  {selectedIssue.id}
                </span>
                <span className="text-xs text-slate-400">[{selectedIssue.projectKey}]</span>
              </div>
              <button
                onClick={() => setSelectedIssue(null)}
                className="text-slate-400 hover:text-white font-bold"
              >
                [Close]
              </button>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white leading-snug">
                {selectedIssue.title}
              </h3>
              <div className="p-3 rounded bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1">
                <span className="block text-[10px] font-bold text-slate-500 uppercase">
                  Description
                </span>
                <p>{selectedIssue.description}</p>
              </div>

              {/* Controls Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Status</label>
                  <select
                    value={selectedIssue.status}
                    onChange={(e) => handleUpdateIssueStatus(selectedIssue.id, e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded p-2 focus:outline-none"
                  >
                    {STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Assignee</label>
                  <select
                    value={selectedIssue.assigneeId}
                    onChange={(e) => handleUpdateIssueAssignee(selectedIssue.id, e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded p-2 focus:outline-none"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
              <button
                onClick={() => handleDeleteIssue(selectedIssue.id)}
                className="text-red-400 font-bold hover:underline"
              >
                Delete Issue
              </button>
              <button
                onClick={() => setSelectedIssue(null)}
                className="bg-indigo-600 text-white px-4 py-1.5 rounded font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CREATE PROJECT MODAL */}
      {/* ========================================================================= */}
      {isNewProjectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white">Create New Project Repository</h3>
              <button
                onClick={() => setIsNewProjectModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                [Close]
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mobile iOS Application"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Project Key (Short ID)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. IOS"
                  maxLength={10}
                  value={newProject.key}
                  onChange={(e) => setNewProject({ ...newProject, key: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono focus:outline-none uppercase"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows="2"
                  placeholder="Project purpose and scope..."
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewProjectModalOpen(false)}
                  className="px-3 py-1.5 text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 text-white font-bold px-4 py-1.5 rounded"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CREATE ISSUE MODAL */}
      {/* ========================================================================= */}
      {isNewIssueModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-xl w-full max-w-lg p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white">Create New Issue Ticket</h3>
              <button
                onClick={() => setIsNewIssueModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                [Close]
              </button>
            </div>

            <form onSubmit={handleCreateIssue} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Target Project</label>
                  <select
                    value={newIssue.projectKey}
                    onChange={(e) => setNewIssue({ ...newIssue, projectKey: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:outline-none"
                  >
                    {projects.map((p) => (
                      <option key={p.key} value={p.key}>
                        [{p.key}] {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Issue Type</label>
                  <select
                    value={newIssue.type}
                    onChange={(e) => setNewIssue({ ...newIssue, type: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:outline-none"
                  >
                    <option value="BUG">BUG</option>
                    <option value="FEATURE">FEATURE</option>
                    <option value="TASK">TASK</option>
                    <option value="IMPROVEMENT">IMPROVEMENT</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Summary Title</label>
                <input
                  type="text"
                  required
                  placeholder="Summary of issue..."
                  value={newIssue.title}
                  onChange={(e) => setNewIssue({ ...newIssue, title: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows="3"
                  placeholder="Steps to reproduce, technical impact..."
                  value={newIssue.description}
                  onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Priority</label>
                  <select
                    value={newIssue.priority}
                    onChange={(e) => setNewIssue({ ...newIssue, priority: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:outline-none"
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
                    value={newIssue.assigneeId}
                    onChange={(e) => setNewIssue({ ...newIssue, assigneeId: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:outline-none"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewIssueModalOpen(false)}
                  className="px-3 py-1.5 text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 text-white font-bold px-4 py-1.5 rounded"
                >
                  Create Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CREATE USER MODAL (ADMIN ONLY) */}
      {/* ========================================================================= */}
      {isNewUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white">Add New Software House User</h3>
              <button
                onClick={() => setIsNewUserModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                [Close]
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="john@company.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Access Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:outline-none"
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="DEVELOPER">DEVELOPER</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewUserModalOpen(false)}
                  className="px-3 py-1.5 text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 text-white font-bold px-4 py-1.5 rounded"
                >
                  Add User Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}