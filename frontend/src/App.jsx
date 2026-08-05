import React, { useState } from "react";

// Pre-seeded Multi-Tenant B2B Software Houses & Companies
const INITIAL_ORGANIZATIONS = [
  { id: "org-1", slug: "acme-tech", name: "Acme Tech Solutions", plan: "ENTERPRISE" },
  { id: "org-2", slug: "cybersoft", name: "CyberSoft Systems", plan: "PRO_SAAS" },
];

// Pre-seeded Users tied to Organizations
const INITIAL_USERS = [
  // Super Admin (Platform Owner)
  { id: "usr-super", orgId: "org-1", name: "Platform Owner (You)", email: "owner@bugforge.io", role: "SUPER_ADMIN" },
  
  // Acme Tech (Company 1)
  { id: "usr-[#1]", orgId: "org-1", name: "John Miller (Tech Lead)", email: "john@acmetech.com", role: "TECH_LEAD" },
  { id: "usr-[#2]", orgId: "org-1", name: "Alex Rivera (Backend Dev)", email: "alex@acmetech.com", role: "DEVELOPER" },
  { id: "usr-[#3]", orgId: "org-1", name: "Sarah Chen (Frontend Dev)", email: "sarah@acmetech.com", role: "DEVELOPER" },

  // CyberSoft (Company 2)
  { id: "usr-[#4]", orgId: "org-2", name: "Robert Vance (Company Head)", email: "robert@cybersoft.io", role: "TECH_LEAD" },
  { id: "usr-[#5]", orgId: "org-2", name: "David Kim (Fullstack Dev)", email: "david@cybersoft.io", role: "DEVELOPER" },
];

// Pre-seeded Projects tied to Organizations with Project-Specific Assigned Team
const INITIAL_PROJECTS = [
  {
    id: "prj-1",
    orgId: "org-1",
    key: "CORE",
    name: "Core Payment Engine",
    description: "Stripe & PayPal billing API integration",
    leadId: "usr-[#1]",
    assignedUserIds: ["usr-[#2]", "usr-[#3]"], // Project-specific team members
  },
  {
    id: "prj-2",
    orgId: "org-1",
    key: "AUTH",
    name: "OAuth2 Identity Service",
    description: "Okta & Google OIDC SSO service",
    leadId: "usr-[#1]",
    assignedUserIds: ["usr-[#2]"],
  },
  {
    id: "prj-3",
    orgId: "org-2",
    key: "CYBER",
    name: "CyberSecurity Scanner",
    description: "Vulnerability analysis engine",
    leadId: "usr-[#4]",
    assignedUserIds: ["usr-[#5]"],
  },
];

// Pre-seeded Issues
const INITIAL_ISSUES = [
  {
    id: "CORE-101",
    orgId: "org-1",
    projectKey: "CORE",
    type: "BUG",
    title: "Database connection timeout during peak checkout payload",
    description: "Asyncpg connection pool runs out of slots under peak traffic load.",
    status: "OPEN",
    priority: "CRITICAL",
    severity: "BLOCKER",
    assigneeId: "usr-[#2]",
    reporterId: "usr-[#1]",
    createdAt: "2026-08-05",
  },
  {
    id: "AUTH-102",
    orgId: "org-1",
    projectKey: "AUTH",
    type: "FEATURE",
    title: "Implement SAML 2.0 Single Sign-On for enterprise clients",
    description: "Enable OKTA and Azure AD SSO login integrations.",
    status: "IN_PROGRESS",
    priority: "HIGH",
    severity: "HIGH",
    assigneeId: "usr-[#2]",
    reporterId: "usr-[#1]",
    createdAt: "2026-08-04",
  },
  {
    id: "CYBER-201",
    orgId: "org-2",
    projectKey: "CYBER",
    type: "BUG",
    title: "Scanner engine thread lock on large repository scans",
    description: "Worker threads deadlock during deep AST analysis.",
    status: "OPEN",
    priority: "CRITICAL",
    severity: "BLOCKER",
    assigneeId: "usr-[#5]",
    reporterId: "usr-[#4]",
    createdAt: "2026-08-05",
  },
];

const STATUSES = ["OPEN", "IN_PROGRESS", "IN_REVIEW", "RESOLVED", "CLOSED"];

export default function App() {
  // State
  const [organizations, setOrganizations] = useState(INITIAL_ORGANIZATIONS);
  const [currentOrgId, setCurrentOrgId] = useState("org-1"); // Selected Software House

  const [users, setUsers] = useState(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState(INITIAL_USERS[1]); // Default to Acme Tech Lead John Miller

  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [issues, setIssues] = useState(INITIAL_ISSUES);

  // Active View & Filters
  const [activeTab, setActiveTab] = useState("PROJECTS"); // 'PROJECTS', 'BOARD', 'TEAM', 'CLIENTS'
  const [selectedProjectKey, setSelectedProjectKey] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isNewIssueModalOpen, setIsNewIssueModalOpen] = useState(false);
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  const [isNewCompanyModalOpen, setIsNewCompanyModalOpen] = useState(false);

  // Form States
  const [newProject, setNewProject] = useState({
    name: "",
    key: "",
    description: "",
    assignedUserIds: [],
  });

  const [newIssue, setNewIssue] = useState({
    title: "",
    description: "",
    type: "BUG",
    priority: "MEDIUM",
    severity: "MEDIUM",
    projectKey: "CORE",
    assigneeId: "",
  });

  const [newUser, setNewUser] = useState({ name: "", email: "", role: "DEVELOPER" });
  const [newCompany, setNewCompany] = useState({ name: "", slug: "", leadName: "", leadEmail: "" });

  // Permissions Helper
  const isSuperAdmin = currentUser.role === "SUPER_ADMIN";
  const isTechLead = currentUser.role === "TECH_LEAD" || isSuperAdmin;

  // Filter Data by Active Organization (Tenant Isolation)
  const currentOrg = organizations.find((o) => o.id === currentOrgId) || organizations[0];
  const orgProjects = projects.filter((p) => p.orgId === currentOrgId);
  const orgUsers = users.filter((u) => u.orgId === currentOrgId || u.role === "SUPER_ADMIN");
  const orgIssues = issues.filter((i) => i.orgId === currentOrgId);

  const filteredIssues = orgIssues.filter((issue) => {
    const matchesProject = selectedProjectKey === "ALL" || issue.projectKey === selectedProjectKey;
    const matchesSearch =
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProject && matchesSearch;
  });

  // Action 1: Tech Lead Creates Project with Specific Project Assignees
  const handleCreateProject = (e) => {
    e.preventDefault();
    if (!isTechLead) {
      alert("Access Denied: Only Company Tech Lead can create projects.");
      return;
    }
    if (!newProject.name || !newProject.key) return;
    const keyUpper = newProject.key.toUpperCase().trim();
    if (orgProjects.some((p) => p.key === keyUpper)) {
      alert(`Project key ${keyUpper} already exists in this software house.`);
      return;
    }

    const project = {
      id: `prj-${projects.length + 1}`,
      orgId: currentOrgId,
      key: keyUpper,
      name: newProject.name.trim(),
      description: newProject.description,
      leadId: currentUser.id,
      assignedUserIds: newProject.assignedUserIds, // Project specific assignees
    };

    setProjects([...projects, project]);
    setNewProject({ name: "", key: "", description: "", assignedUserIds: [] });
    setIsNewProjectModalOpen(false);
  };

  // Action 2: Tech Lead Deletes Project
  const handleDeleteProject = (projectKey) => {
    if (!isTechLead) {
      alert("Access Denied: Only Company Tech Lead can delete projects.");
      return;
    }
    if (!window.confirm(`Tech Lead Notice: Delete project ${projectKey} and all project issues?`)) return;
    setProjects(projects.filter((p) => !(p.orgId === currentOrgId && p.key === projectKey)));
    setIssues(issues.filter((i) => !(i.orgId === currentOrgId && i.projectKey === projectKey)));
  };

  // Action 3: Tech Lead Creates Issue & Selects Allowed Project Assignee
  const handleCreateIssue = (e) => {
    e.preventDefault();
    if (!isTechLead) {
      alert("Access Denied: Only Company Tech Lead can create & assign issues.");
      return;
    }
    if (!newIssue.title) return;

    const targetProject = orgProjects.find((p) => p.key === newIssue.projectKey);
    const assignedId = newIssue.assigneeId || (targetProject?.assignedUserIds[0] || currentUser.id);

    const issue = {
      ...newIssue,
      id: `${newIssue.projectKey}-${100 + orgIssues.length + 1}`,
      orgId: currentOrgId,
      status: "OPEN",
      assigneeId: assignedId,
      reporterId: currentUser.id,
      createdAt: new Date().toISOString().split("T")[0],
    };

    setIssues([issue, ...issues]);
    setIsNewIssueModalOpen(false);
  };

  // Action 4: Tech Lead Onboards New Client Company (Super Admin)
  const handleOnboardCompany = (e) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      alert("Access Denied: Only Platform Owner can onboard new software house companies.");
      return;
    }
    const newOrgId = `org-${organizations.length + 1}`;
    const org = {
      id: newOrgId,
      slug: newCompany.slug.toLowerCase().trim(),
      name: newCompany.name.trim(),
      plan: "ENTERPRISE",
    };
    const leadUser = {
      id: `usr-[#${users.length + 1}]`,
      orgId: newOrgId,
      name: newCompany.leadName.trim(),
      email: newCompany.leadEmail.trim(),
      role: "TECH_LEAD",
    };

    setOrganizations([...organizations, org]);
    setUsers([...users, leadUser]);
    setCurrentOrgId(newOrgId);
    setCurrentUser(leadUser);
    setNewCompany({ name: "", slug: "", leadName: "", leadEmail: "" });
    setIsNewCompanyModalOpen(false);
  };

  // Action 5: Add Team Member to Software House (Tech Lead)
  const handleAddTeamMember = (e) => {
    e.preventDefault();
    if (!isTechLead) return;
    const user = {
      id: `usr-[#${users.length + 1}]`,
      orgId: currentOrgId,
      name: newUser.name.trim(),
      email: newUser.email.trim(),
      role: newUser.role,
    };
    setUsers([...users, user]);
    setNewUser({ name: "", email: "", role: "DEVELOPER" });
    setIsNewUserModalOpen(false);
  };

  // Update Status
  const handleUpdateStatus = (issueId, newStatus) => {
    setIssues(issues.map((i) => (i.id === issueId ? { ...i, status: newStatus } : i)));
  };

  const getUserName = (userId) => {
    const u = users.find((x) => x.id === userId);
    return u ? u.name : "Unassigned";
  };

  return (
    <div className="w-full h-screen bg-[#0b0f19] text-slate-100 font-sans flex flex-col overflow-hidden">
      {/* ========================================================================= */}
      {/* TOP HEADER: SOFTWARE HOUSE SELECTOR & ROLE SWITCHER */}
      {/* ========================================================================= */}
      <header className="h-14 bg-[#111827] border-b border-slate-800 px-5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
              BF
            </div>
            <span className="font-bold text-sm text-white tracking-tight">BugForge B2B SaaS</span>
          </div>

          {/* Software House Client Selector */}
          <div className="flex items-center gap-2 bg-[#1f2937] border border-slate-700 px-3 py-1 rounded text-xs">
            <span className="text-slate-400">Software House:</span>
            <select
              value={currentOrgId}
              onChange={(e) => {
                const orgId = e.target.value;
                setCurrentOrgId(orgId);
                const firstOrgUser = users.find((u) => u.orgId === orgId && u.role === "TECH_LEAD") || users.find((u) => u.orgId === orgId) || currentUser;
                setCurrentUser(firstOrgUser);
                setSelectedProjectKey("ALL");
              }}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
            >
              {organizations.map((o) => (
                <option key={o.id} value={o.id} className="bg-slate-900 text-white">
                  {o.name} [{o.plan}]
                </option>
              ))}
            </select>
          </div>

          {/* Nav Tabs */}
          <nav className="flex items-center gap-1 text-xs font-semibold">
            <button
              onClick={() => setActiveTab("PROJECTS")}
              className={`px-3 py-1.5 rounded ${activeTab === "PROJECTS" ? "bg-slate-800 text-white font-bold" : "text-slate-400 hover:text-slate-200"}`}
            >
              Projects ({orgProjects.length})
            </button>
            <button
              onClick={() => setActiveTab("BOARD")}
              className={`px-3 py-1.5 rounded ${activeTab === "BOARD" ? "bg-slate-800 text-white font-bold" : "text-slate-400 hover:text-slate-200"}`}
            >
              Issue Board
            </button>
            <button
              onClick={() => setActiveTab("TEAM")}
              className={`px-3 py-1.5 rounded ${activeTab === "TEAM" ? "bg-slate-800 text-white font-bold" : "text-slate-400 hover:text-slate-200"}`}
            >
              Company Team ({orgUsers.length})
            </button>

            {isSuperAdmin && (
              <button
                onClick={() => setActiveTab("CLIENTS")}
                className="px-3 py-1.5 rounded bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-bold"
              >
                Onboard New Client Company
              </button>
            )}
          </nav>
        </div>

        {/* User Role Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#1f2937] border border-slate-700 px-3 py-1 rounded text-xs">
            <span className="text-slate-400">Active User:</span>
            <select
              value={currentUser.id}
              onChange={(e) => {
                const u = users.find((x) => x.id === e.target.value);
                if (u) setCurrentUser(u);
              }}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
            >
              {orgUsers.map((u) => (
                <option key={u.id} value={u.id} className="bg-slate-900 text-white">
                  {u.name} [{u.role}]
                </option>
              ))}
            </select>
          </div>

          {isTechLead ? (
            <button
              onClick={() => setIsNewProjectModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded"
            >
              + Add Project (Tech Lead)
            </button>
          ) : (
            <span className="text-[11px] text-slate-500 px-2 py-1 bg-slate-900 rounded border border-slate-800">
              Developer Read-Only
            </span>
          )}
        </div>
      </header>

      {/* Role Permission Notice Banner */}
      <div
        className={`px-5 py-1.5 text-xs font-semibold border-b flex items-center justify-between ${
          isSuperAdmin
            ? "bg-purple-950/40 border-purple-800/60 text-purple-300"
            : isTechLead
            ? "bg-indigo-950/40 border-indigo-800/60 text-indigo-300"
            : "bg-slate-900 border-slate-800 text-slate-400"
        }`}
      >
        <span>
          {isSuperAdmin
            ? "PLATFORM OWNER ACTIVE: You can onboard new client software houses and manage all system data."
            : isTechLead
            ? `TECH LEAD ACTIVE (${currentOrg.name}): Full control over projects, assigned project teams, and issue creation.`
            : `DEVELOPER ACTIVE (${currentOrg.name}): View projects and update status of issues assigned to you.`}
        </span>
        <span className="font-mono text-[10px] uppercase font-bold">
          Company: {currentOrg.name} | Role: {currentUser.role}
        </span>
      </div>

      {/* ========================================================================= */}
      {/* MAIN CONTAINER */}
      {/* ========================================================================= */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Display Area */}
        <main className="flex-1 bg-[#0b0f19] overflow-y-auto p-6">
          {/* ========================================================================= */}
          {/* TAB 1: PROJECTS MANAGEMENT (TECH LEAD CONTROL) */}
          {/* ========================================================================= */}
          {activeTab === "PROJECTS" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white">
                    {currentOrg.name} - Project Repositories
                  </h2>
                  <p className="text-xs text-slate-400">
                    {isTechLead
                      ? "Tech Lead Controls: Create projects and assign specific team members to each project."
                      : "Developer View: Active software house projects."}
                  </p>
                </div>

                {isTechLead && (
                  <button
                    onClick={() => setIsNewProjectModalOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded"
                  >
                    + Create New Project (Tech Lead)
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {orgProjects.map((p) => {
                  const pIssues = issues.filter((i) => i.orgId === currentOrgId && i.projectKey === p.key);
                  const pAssignedUsers = users.filter((u) => p.assignedUserIds.includes(u.id));

                  return (
                    <div
                      key={p.key}
                      className="bg-[#111827] border border-slate-800 rounded-xl p-4 space-y-4 shadow-lg flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            KEY: {p.key}
                          </span>
                          {isTechLead && (
                            <button
                              onClick={() => handleDeleteProject(p.key)}
                              className="text-[11px] text-red-400 hover:underline font-bold"
                            >
                              Delete Project
                            </button>
                          )}
                        </div>

                        <h3 className="text-sm font-bold text-white">{p.name}</h3>
                        <p className="text-xs text-slate-400">{p.description || "No description provided."}</p>
                      </div>

                      {/* Project Specific Assignees Team Section */}
                      <div className="pt-3 border-t border-slate-800 space-y-2 text-xs">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          Project Assigned Team ({pAssignedUsers.length}):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {pAssignedUsers.map((u) => (
                            <span
                              key={u.id}
                              className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-semibold"
                            >
                              {u.name}
                            </span>
                          ))}
                          {pAssignedUsers.length === 0 && (
                            <span className="text-slate-600 text-[11px]">No specific assignees set</span>
                          )}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-bold">{pIssues.length} Total Issues</span>
                        <div className="flex items-center gap-2">
                          {isTechLead && (
                            <button
                              onClick={() => {
                                setNewIssue({ ...newIssue, projectKey: p.key });
                                setIsNewIssueModalOpen(true);
                              }}
                              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold px-2.5 py-1 rounded border border-slate-700"
                            >
                              + Add Issue
                            </button>
                          )}
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
                    </div>
                  );
                })}

                {orgProjects.length === 0 && (
                  <div className="col-span-3 p-8 border border-dashed border-slate-800 rounded-xl text-center text-xs text-slate-500">
                    No projects found for {currentOrg.name}. Click "+ Create New Project" to add one.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: KANBAN ISSUE BOARD */}
          {/* ========================================================================= */}
          {activeTab === "BOARD" && (
            <div className="flex-1 flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <select
                    value={selectedProjectKey}
                    onChange={(e) => setSelectedProjectKey(e.target.value)}
                    className="bg-[#111827] border border-slate-700 rounded px-3 py-1.5 text-xs text-white focus:outline-none"
                  >
                    <option value="ALL">All Projects ({orgProjects.length})</option>
                    {orgProjects.map((p) => (
                      <option key={p.key} value={p.key}>
                        [{p.key}] {p.name}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="Search issues..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-[#111827] border border-slate-700 rounded px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none w-64"
                  />
                </div>

                {isTechLead && (
                  <button
                    onClick={() => setIsNewIssueModalOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded"
                  >
                    + Create & Assign Issue (Tech Lead)
                  </button>
                )}
              </div>

              {/* Status Columns */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 flex-1">
                {STATUSES.map((statusKey) => {
                  const colIssues = filteredIssues.filter((i) => i.status === statusKey);
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
                          {colIssues.length}
                        </span>
                      </div>

                      <div className="flex-1 space-y-2.5">
                        {colIssues.map((issue) => (
                          <div
                            key={issue.id}
                            className="bg-[#1f2937]/70 border border-slate-800 rounded-lg p-3 space-y-2"
                          >
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-mono font-bold text-indigo-400">{issue.id}</span>
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

                            <p className="text-xs font-semibold text-white leading-snug">{issue.title}</p>

                            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                              <span>Assignee: {getUserName(issue.assigneeId)}</span>
                              <select
                                value={issue.status}
                                onChange={(e) => handleUpdateStatus(issue.id, e.target.value)}
                                className="bg-slate-900 border border-slate-700 text-white rounded px-1 py-0.5 text-[10px] focus:outline-none"
                              >
                                {STATUSES.map((s) => (
                                  <option key={s} value={s}>
                                    {s}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        ))}

                        {colIssues.length === 0 && (
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
          {/* TAB 3: COMPANY TEAM MEMBERS */}
          {/* ========================================================================= */}
          {activeTab === "TEAM" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white">{currentOrg.name} - Team Roster</h2>
                  <p className="text-xs text-slate-400">Manage developers and project assignees</p>
                </div>
                {isTechLead && (
                  <button
                    onClick={() => setIsNewUserModalOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded"
                  >
                    + Add Team Member (Tech Lead)
                  </button>
                )}
              </div>

              <div className="bg-[#111827] border border-slate-800 rounded-lg overflow-hidden text-xs">
                <table className="w-full text-left text-slate-300">
                  <thead className="bg-[#1f2937] text-slate-400 uppercase font-bold text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="p-3">User ID</th>
                      <th className="p-3">Full Name</th>
                      <th className="p-3">Email Address</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Assigned Projects</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {orgUsers.map((u) => {
                      const userProjs = orgProjects.filter((p) => p.assignedUserIds.includes(u.id));
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
                          <td className="p-3">
                            {userProjs.map((p) => p.key).join(", ") || "None"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: SUPER ADMIN CLIENT ONBOARDING */}
          {/* ========================================================================= */}
          {activeTab === "CLIENTS" && isSuperAdmin && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white">Platform Owner - Onboard Software Houses</h2>
                  <p className="text-xs text-slate-400">Register new client companies and setup their Tech Leads</p>
                </div>
                <button
                  onClick={() => setIsNewCompanyModalOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded"
                >
                  + Onboard Client Software House
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {organizations.map((org) => {
                  const orgLead = users.find((u) => u.orgId === org.id && u.role === "TECH_LEAD");
                  const pCount = projects.filter((p) => p.orgId === org.id).length;
                  return (
                    <div key={org.id} className="bg-[#111827] border border-slate-800 rounded-xl p-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-mono font-bold text-xs text-indigo-400">SLUG: {org.slug}</span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-400 font-mono text-[10px]">
                          {org.plan}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white">{org.name}</h3>
                      <p className="text-xs text-slate-400">Tech Lead: {orgLead ? `${orgLead.name} (${orgLead.email})` : "Unassigned"}</p>
                      <div className="pt-2 border-t border-slate-800 text-xs text-slate-400 flex justify-between">
                        <span>Projects: {pCount}</span>
                        <button
                          onClick={() => {
                            setCurrentOrgId(org.id);
                            if (orgLead) setCurrentUser(orgLead);
                            setActiveTab("PROJECTS");
                          }}
                          className="text-indigo-400 font-bold hover:underline"
                        >
                          Switch to Workspace -&gt;
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* CREATE PROJECT MODAL (TECH LEAD ONLY) */}
      {/* ========================================================================= */}
      {isNewProjectModalOpen && isTechLead && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white">Create New Project (Tech Lead)</h3>
              <button onClick={() => setIsNewProjectModalOpen(false)} className="text-slate-400 hover:text-white">
                Close
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Core Payment Engine"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Project Key (Code)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PAY"
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
                  placeholder="Project scope and details..."
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:outline-none"
                />
              </div>

              {/* Multi Select Project Specific Assignees */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Assign Project Team Members (Select Assignees for this project)
                </label>
                <div className="space-y-1.5 max-h-32 overflow-y-auto bg-slate-900 p-2 border border-slate-800 rounded">
                  {orgUsers.map((u) => (
                    <label key={u.id} className="flex items-center gap-2 text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newProject.assignedUserIds.includes(u.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewProject({
                              ...newProject,
                              assignedUserIds: [...newProject.assignedUserIds, u.id],
                            });
                          } else {
                            setNewProject({
                              ...newProject,
                              assignedUserIds: newProject.assignedUserIds.filter((x) => x !== u.id),
                            });
                          }
                        }}
                      />
                      <span>{u.name} ({u.role})</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsNewProjectModalOpen(false)} className="px-3 py-1.5 text-slate-400">
                  Cancel
                </button>
                <button type="submit" className="bg-indigo-600 text-white font-bold px-4 py-1.5 rounded">
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CREATE ISSUE MODAL (TECH LEAD ONLY) */}
      {/* ========================================================================= */}
      {isNewIssueModalOpen && isTechLead && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-xl w-full max-w-lg p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white">Create & Assign Issue Ticket (Tech Lead)</h3>
              <button onClick={() => setIsNewIssueModalOpen(false)} className="text-slate-400 hover:text-white">
                Close
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
                    {orgProjects.map((p) => (
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
                  placeholder="Technical description..."
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
                  <label className="block font-semibold text-slate-300 mb-1">Select Assignee for this Project</label>
                  <select
                    value={newIssue.assigneeId}
                    onChange={(e) => setNewIssue({ ...newIssue, assigneeId: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-bold text-indigo-300 focus:outline-none"
                  >
                    {orgUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsNewIssueModalOpen(false)} className="px-3 py-1.5 text-slate-400">
                  Cancel
                </button>
                <button type="submit" className="bg-indigo-600 text-white font-bold px-4 py-1.5 rounded">
                  Create & Assign Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ONBOARD CLIENT COMPANY MODAL (SUPER ADMIN ONLY) */}
      {/* ========================================================================= */}
      {isNewCompanyModalOpen && isSuperAdmin && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white">Onboard New Software House Client (Super Admin)</h3>
              <button onClick={() => setIsNewCompanyModalOpen(false)} className="text-slate-400 hover:text-white">
                Close
              </button>
            </div>

            <form onSubmit={handleOnboardCompany} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Software House Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CyberSoft Systems"
                  value={newCompany.name}
                  onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Company Slug</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. cybersoft"
                  value={newCompany.slug}
                  onChange={(e) => setNewCompany({ ...newCompany, slug: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Tech Lead Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Robert Vance"
                  value={newCompany.leadName}
                  onChange={(e) => setNewCompany({ ...newCompany, leadName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Tech Lead Email</label>
                <input
                  type="email"
                  required
                  placeholder="robert@cybersoft.io"
                  value={newCompany.leadEmail}
                  onChange={(e) => setNewCompany({ ...newCompany, leadEmail: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsNewCompanyModalOpen(false)} className="px-3 py-1.5 text-slate-400">
                  Cancel
                </button>
                <button type="submit" className="bg-indigo-600 text-white font-bold px-4 py-1.5 rounded">
                  Onboard Software House
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD TEAM MEMBER MODAL (TECH LEAD ONLY) */}
      {/* ========================================================================= */}
      {isNewUserModalOpen && isTechLead && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white">Add Team Member (Tech Lead)</h3>
              <button onClick={() => setIsNewUserModalOpen(false)} className="text-slate-400 hover:text-white">
                Close
              </button>
            </div>

            <form onSubmit={handleAddTeamMember} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Michael Scott"
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
                  placeholder="michael@company.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:outline-none"
                >
                  <option value="DEVELOPER">DEVELOPER</option>
                  <option value="TECH_LEAD">TECH_LEAD</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsNewUserModalOpen(false)} className="px-3 py-1.5 text-slate-400">
                  Cancel
                </button>
                <button type="submit" className="bg-indigo-600 text-white font-bold px-4 py-1.5 rounded">
                  Add Team Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}