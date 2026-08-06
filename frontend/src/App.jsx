import React, { useState } from "react";

// Initial Seeded Software Companies
const INITIAL_COMPANIES = [
  {
    id: "comp-1",
    name: "Eprecisio Technologies",
    techLeadEmail: "lead@eprecisio.com",
    techLeadName: "Alex Vance (Tech Lead)",
    createdAt: "2026-08-01",
  },
  {
    id: "comp-2",
    name: "Antigravity Systems",
    techLeadEmail: "lead@antigravity.com",
    techLeadName: "Sarah Connor (Tech Lead)",
    createdAt: "2026-08-02",
  },
];

// Initial Seeded Users
const INITIAL_USERS = [
  // Super Admin (YOU)
  {
    id: "usr-super",
    companyId: null,
    name: "Super Admin (You)",
    email: "ahad8641@gmail.com",
    role: "SUPER_ADMIN",
  },
  // Eprecisio Tech Lead & Assignees
  {
    id: "usr-ep1",
    companyId: "comp-1",
    name: "Alex Vance",
    email: "lead@eprecisio.com",
    role: "TECH_LEAD",
  },
  {
    id: "usr-ep2",
    companyId: "comp-1",
    name: "David Kim",
    email: "david@eprecisio.com",
    role: "ASSIGNEE",
  },
  {
    id: "usr-ep3",
    companyId: "comp-1",
    name: "Maria Garcia",
    email: "maria@eprecisio.com",
    role: "ASSIGNEE",
  },
  // Antigravity Tech Lead & Assignees
  {
    id: "usr-ag1",
    companyId: "comp-2",
    name: "Sarah Connor",
    email: "lead@antigravity.com",
    role: "TECH_LEAD",
  },
  {
    id: "usr-ag2",
    companyId: "comp-2",
    name: "John Reese",
    email: "john@antigravity.com",
    role: "ASSIGNEE",
  },
];

// Initial Seeded Projects
const INITIAL_PROJECTS = [
  {
    id: "prj-ep1",
    companyId: "comp-1",
    key: "EPREC",
    name: "Enterprise Core Backend",
    description: "High performance microservices backend engine",
  },
  {
    id: "prj-ag1",
    companyId: "comp-2",
    key: "ANTI",
    name: "AI Agentic Framework",
    description: "Autonomous LLM trajectory engine",
  },
];

// Initial Seeded Issues / Bugs
const INITIAL_BUGS = [
  {
    id: "EPREC-101",
    companyId: "comp-1",
    projectKey: "EPREC",
    title: "Database connection pool timeout under 10k RPS",
    description: "Asyncpg connection slots exhaust during peak checkout load.",
    status: "OPEN",
    priority: "CRITICAL",
    assigneeEmail: "david@eprecisio.com",
    createdBy: "lead@eprecisio.com",
  },
  {
    id: "ANTI-201",
    companyId: "comp-2",
    projectKey: "ANTI",
    title: "Agent trajectory memory cache sync latency",
    description: "Redis vector store indexing delays response by 250ms.",
    status: "IN_PROGRESS",
    priority: "HIGH",
    assigneeEmail: "john@antigravity.com",
    createdBy: "lead@antigravity.com",
  },
];

const BUG_STATUSES = ["OPEN", "IN_PROGRESS", "IN_REVIEW", "RESOLVED", "CLOSED"];

export default function App() {
  // Master App State
  const [companies, setCompanies] = useState(INITIAL_COMPANIES);
  const [users, setUsers] = useState(INITIAL_USERS);
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [bugs, setBugs] = useState(INITIAL_BUGS);

  // Authentication State
  const [currentUser, setCurrentUser] = useState(INITIAL_USERS[0]); // Default Super Admin
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  // View & Filter States
  const [activeTab, setActiveTab] = useState("COMPANIES"); // 'COMPANIES', 'PROJECTS', 'BUGS', 'ASSIGNEES'
  const [selectedProjectKey, setSelectedProjectKey] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [isAddCompanyModalOpen, setIsAddCompanyModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);

  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const [isAddAssigneeModalOpen, setIsAddAssigneeModalOpen] = useState(false);
  const [editingAssignee, setEditingAssignee] = useState(null);

  const [isAddBugModalOpen, setIsAddBugModalOpen] = useState(false);
  const [selectedBugDetail, setSelectedBugDetail] = useState(null);

  // Form Input States
  const [companyForm, setCompanyForm] = useState({ name: "", techLeadName: "", techLeadEmail: "" });
  const [projectForm, setProjectForm] = useState({ key: "", name: "", description: "" });
  const [assigneeForm, setAssigneeForm] = useState({ name: "", email: "" });
  const [bugForm, setBugForm] = useState({ title: "", description: "", projectKey: "", priority: "MEDIUM", assigneeEmail: "" });

  // Role Helpers
  const isSuperAdmin = currentUser.role === "SUPER_ADMIN";
  const isTechLead = currentUser.role === "TECH_LEAD";
  const isAssignee = currentUser.role === "ASSIGNEE";

  // Data Scoping
  const currentCompany = companies.find((c) => c.id === currentUser.companyId) || companies[0];

  const companyProjects = isSuperAdmin
    ? projects
    : projects.filter((p) => p.companyId === currentUser.companyId);

  const companyAssignees = isSuperAdmin
    ? users.filter((u) => u.role === "ASSIGNEE")
    : users.filter((u) => u.companyId === currentUser.companyId && u.role === "ASSIGNEE");

  const companyBugs = isSuperAdmin
    ? bugs
    : isAssignee
    ? bugs.filter((b) => b.companyId === currentUser.companyId && b.assigneeEmail === currentUser.email)
    : bugs.filter((b) => b.companyId === currentUser.companyId);

  const filteredBugs = companyBugs.filter((b) => {
    const matchesProj = selectedProjectKey === "ALL" || b.projectKey === selectedProjectKey;
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProj && matchesSearch;
  });

  // =========================================================================
  // 1. SUPER ADMIN ACTIONS: SOFTWARE COMPANIES (ADD, UPDATE, DELETE)
  // =========================================================================
  const handleSaveCompany = (e) => {
    e.preventDefault();
    if (!isSuperAdmin) return;

    if (editingCompany) {
      // Update Company
      setCompanies(
        companies.map((c) =>
          c.id === editingCompany.id
            ? { ...c, name: companyForm.name, techLeadName: companyForm.techLeadName, techLeadEmail: companyForm.techLeadEmail }
            : c
        )
      );
      // Update Tech Lead User record
      setUsers(
        users.map((u) =>
          u.companyId === editingCompany.id && u.role === "TECH_LEAD"
            ? { ...u, name: companyForm.techLeadName, email: companyForm.techLeadEmail }
            : u
        )
      );
    } else {
      // Create Company & Auto-Add Tech Lead Authorized Email
      const compId = `comp-${companies.length + 1}`;
      const newComp = {
        id: compId,
        name: companyForm.name.trim(),
        techLeadEmail: companyForm.techLeadEmail.trim().toLowerCase(),
        techLeadName: companyForm.techLeadName.trim(),
        createdAt: new Date().toISOString().split("T")[0],
      };
      const newTechLeadUser = {
        id: `usr-tl-${users.length + 1}`,
        companyId: compId,
        name: companyForm.techLeadName.trim(),
        email: companyForm.techLeadEmail.trim().toLowerCase(),
        role: "TECH_LEAD",
      };

      setCompanies([...companies, newComp]);
      setUsers([...users, newTechLeadUser]);
    }

    setCompanyForm({ name: "", techLeadName: "", techLeadEmail: "" });
    setEditingCompany(null);
    setIsAddCompanyModalOpen(false);
  };

  const handleDeleteCompany = (compId) => {
    if (!isSuperAdmin) return;
    if (!window.confirm("Super Admin Warning: Delete company and all associated projects/bugs?")) return;
    setCompanies(companies.filter((c) => c.id !== compId));
    setUsers(users.filter((u) => u.companyId !== compId));
    setProjects(projects.filter((p) => p.companyId !== compId));
    setBugs(bugs.filter((b) => b.companyId !== compId));
  };

  // =========================================================================
  // 2. TECH LEAD ACTIONS: PROJECTS & ASSIGNEES (ADD, UPDATE, DELETE)
  // =========================================================================
  const handleSaveProject = (e) => {
    e.preventDefault();
    if (!isTechLead && !isSuperAdmin) return;

    if (editingProject) {
      setProjects(
        projects.map((p) =>
          p.id === editingProject.id
            ? { ...p, name: projectForm.name, description: projectForm.description }
            : p
        )
      );
    } else {
      const keyUpper = projectForm.key.toUpperCase().trim();
      const newProj = {
        id: `prj-${projects.length + 1}`,
        companyId: currentUser.companyId || companies[0].id,
        key: keyUpper,
        name: projectForm.name.trim(),
        description: projectForm.description.trim(),
      };
      setProjects([...projects, newProj]);
    }

    setProjectForm({ key: "", name: "", description: "" });
    setEditingProject(null);
    setIsAddProjectModalOpen(false);
  };

  const handleDeleteProject = (projId) => {
    if (!isTechLead && !isSuperAdmin) return;
    if (!window.confirm("Delete project and all associated bugs?")) return;
    const proj = projects.find((p) => p.id === projId);
    setProjects(projects.filter((p) => p.id !== projId));
    if (proj) {
      setBugs(bugs.filter((b) => !(b.companyId === proj.companyId && b.projectKey === proj.key)));
    }
  };

  // Tech Lead: Add/Update Assignee Email
  const handleSaveAssignee = (e) => {
    e.preventDefault();
    if (!isTechLead && !isSuperAdmin) return;

    if (editingAssignee) {
      setUsers(
        users.map((u) =>
          u.id === editingAssignee.id
            ? { ...u, name: assigneeForm.name, email: assigneeForm.email }
            : u
        )
      );
    } else {
      const newAssignee = {
        id: `usr-asg-${users.length + 1}`,
        companyId: currentUser.companyId || companies[0].id,
        name: assigneeForm.name.trim(),
        email: assigneeForm.email.trim().toLowerCase(),
        role: "ASSIGNEE",
      };
      setUsers([...users, newAssignee]);
    }

    setAssigneeForm({ name: "", email: "" });
    setEditingAssignee(null);
    setIsAddAssigneeModalOpen(false);
  };

  const handleDeleteAssignee = (userId) => {
    if (!isTechLead && !isSuperAdmin) return;
    if (!window.confirm("Remove assignee from company?")) return;
    setUsers(users.filter((u) => u.id !== userId));
  };

  // Tech Lead: Create Bug & Assign
  const handleSaveBug = (e) => {
    e.preventDefault();
    if (!isTechLead && !isSuperAdmin) return;

    const targetProjKey = bugForm.projectKey || (companyProjects[0]?.key || "EPREC");
    const targetAssignee = bugForm.assigneeEmail || (companyAssignees[0]?.email || currentUser.email);

    const newBug = {
      id: `${targetProjKey}-${100 + companyBugs.length + 1}`,
      companyId: currentUser.companyId || companies[0].id,
      projectKey: targetProjKey,
      title: bugForm.title.trim(),
      description: bugForm.description.trim(),
      status: "OPEN",
      priority: bugForm.priority,
      assigneeEmail: targetAssignee,
      createdBy: currentUser.email,
    };

    setBugs([newBug, ...bugs]);
    setBugForm({ title: "", description: "", projectKey: "", priority: "MEDIUM", assigneeEmail: "" });
    setIsAddBugModalOpen(false);
  };

  // =========================================================================
  // 3. ASSIGNEE ACTION: UPDATE BUG LIFECYCLE / STATUS ONLY
  // =========================================================================
  const handleUpdateBugStatus = (bugId, newStatus) => {
    setBugs(bugs.map((b) => (b.id === bugId ? { ...b, status: newStatus } : b)));
    if (selectedBugDetail && selectedBugDetail.id === bugId) {
      setSelectedBugDetail({ ...selectedBugDetail, status: newStatus });
    }
  };

  // Login Portal Screen
  if (!isLoggedIn) {
    return (
      <div className="w-full h-screen bg-[#090c15] text-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#0f1422] border border-slate-800 rounded-2xl p-6 space-y-5 shadow-2xl">
          <div className="text-center space-y-1">
            <h1 className="text-xl font-bold text-white tracking-tight">BugForge SaaS Login</h1>
            <p className="text-xs text-slate-400">Select account email to log into system</p>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {users.map((u) => {
              const uComp = companies.find((c) => c.id === u.companyId);
              return (
                <button
                  key={u.id}
                  onClick={() => {
                    setCurrentUser(u);
                    setIsLoggedIn(true);
                    if (u.role === "SUPER_ADMIN") setActiveTab("COMPANIES");
                    else if (u.role === "TECH_LEAD") setActiveTab("PROJECTS");
                    else setActiveTab("BUGS");
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-[#141a2a] hover:bg-slate-800 text-left transition"
                >
                  <div>
                    <div className="text-xs font-bold text-white">{u.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                    <div className="text-[10px] text-slate-500">
                      Company: {u.role === "SUPER_ADMIN" ? "GLOBAL SYSTEM" : uComp ? uComp.name : "N/A"}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      u.role === "SUPER_ADMIN"
                        ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                        : u.role === "TECH_LEAD"
                        ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                        : "bg-slate-800 text-slate-300 border-slate-700"
                    }`}
                  >
                    {u.role}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-[#090c15] text-slate-100 font-sans flex flex-col overflow-hidden">
      {/* ========================================================================= */}
      {/* TOP HEADER & ROLE SWITCHER */}
      {/* ========================================================================= */}
      <header className="h-14 bg-[#0f1422] border-b border-slate-800 px-5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
              BF
            </div>
            <span className="font-bold text-sm text-white tracking-tight">BugForge SaaS</span>
          </div>

          {/* Navigation Bar Tabs */}
          <nav className="flex items-center gap-1 text-xs font-semibold">
            {isSuperAdmin && (
              <button
                onClick={() => setActiveTab("COMPANIES")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeTab === "COMPANIES"
                    ? "bg-purple-600 text-white font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Software Companies ({companies.length})
              </button>
            )}

            {(isSuperAdmin || isTechLead) && (
              <button
                onClick={() => setActiveTab("PROJECTS")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeTab === "PROJECTS"
                    ? "bg-indigo-600 text-white font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Projects ({companyProjects.length})
              </button>
            )}

            <button
              onClick={() => setActiveTab("BUGS")}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === "BUGS"
                  ? "bg-indigo-600 text-white font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Bug Lifecycle ({companyBugs.length})
            </button>

            {(isSuperAdmin || isTechLead) && (
              <button
                onClick={() => setActiveTab("ASSIGNEES")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeTab === "ASSIGNEES"
                    ? "bg-indigo-600 text-white font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Team Assignees ({companyAssignees.length})
              </button>
            )}
          </nav>
        </div>

        {/* User Account Switcher */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-2 bg-[#141a2a] border border-slate-700 px-3 py-1 rounded-lg">
            <span className="text-slate-400">User:</span>
            <select
              value={currentUser.id}
              onChange={(e) => {
                const u = users.find((x) => x.id === e.target.value);
                if (u) {
                  setCurrentUser(u);
                  if (u.role === "SUPER_ADMIN") setActiveTab("COMPANIES");
                  else if (u.role === "TECH_LEAD") setActiveTab("PROJECTS");
                  else setActiveTab("BUGS");
                }
              }}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id} className="bg-slate-900 text-white">
                  {u.name} [{u.role}]
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setIsLoggedIn(false)}
            className="text-slate-400 hover:text-red-400 border border-slate-800 px-2.5 py-1 rounded-lg"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Role Banner Notice */}
      <div
        className={`px-5 py-1.5 text-xs font-semibold border-b flex items-center justify-between ${
          isSuperAdmin
            ? "bg-purple-950/50 border-purple-800/60 text-purple-300"
            : isTechLead
            ? "bg-indigo-950/40 border-indigo-800/60 text-indigo-300"
            : "bg-slate-900 border-slate-800 text-slate-400"
        }`}
      >
        <span>
          {isSuperAdmin
            ? "SUPER ADMIN MODE (ahad8641@gmail.com): Add software companies & set up authorized Tech Lead emails."
            : isTechLead
            ? `TECH LEAD MODE (${currentCompany.name}): Add projects, add assignee team emails, create & assign bugs.`
            : `ASSIGNEE MODE (${currentUser.email}): View assigned bugs & update bug lifecycle status ONLY.`}
        </span>
        <span className="font-mono text-[10px] uppercase font-bold">
          Company: {isSuperAdmin ? "ALL TENANTS" : currentCompany.name} | Role: {currentUser.role}
        </span>
      </div>

      {/* ========================================================================= */}
      {/* MAIN CONTAINER */}
      {/* ========================================================================= */}
      <main className="flex-1 bg-[#090c15] overflow-y-auto p-6">
        {/* ========================================================================= */}
        {/* VIEW 1: SUPER ADMIN - SOFTWARE COMPANIES MANAGEMENT */}
        {/* ========================================================================= */}
        {activeTab === "COMPANIES" && isSuperAdmin && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Software Companies</h2>
                <p className="text-xs text-slate-400">
                  Add software companies and configure their authorized Tech Lead login emails
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingCompany(null);
                  setCompanyForm({ name: "", techLeadName: "", techLeadEmail: "" });
                  setIsAddCompanyModalOpen(true);
                }}
                className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-4 py-2 rounded-lg"
              >
                + Add Software Company (Super Admin)
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {companies.map((comp) => {
                const compProjs = projects.filter((p) => p.companyId === comp.id).length;
                const compDevs = users.filter((u) => u.companyId === comp.id && u.role === "ASSIGNEE").length;

                return (
                  <div key={comp.id} className="bg-[#0f1422] border border-slate-800 rounded-xl p-5 space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-bold text-white">{comp.name}</h3>
                      <div className="flex gap-2 text-xs">
                        <button
                          onClick={() => {
                            setEditingCompany(comp);
                            setCompanyForm({
                              name: comp.name,
                              techLeadName: comp.techLeadName,
                              techLeadEmail: comp.techLeadEmail,
                            });
                            setIsAddCompanyModalOpen(true);
                          }}
                          className="text-indigo-400 font-bold hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCompany(comp.id)}
                          className="text-red-400 font-bold hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="p-3 bg-[#141a2a] border border-slate-800 rounded-lg text-xs space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        Authorized Tech Lead Login Email
                      </span>
                      <div className="font-bold text-white">{comp.techLeadName}</div>
                      <div className="font-mono text-indigo-300">{comp.techLeadEmail}</div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex justify-between text-xs text-slate-400">
                      <span>Projects: {compProjs}</span>
                      <span>Assignees: {compDevs}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: TECH LEAD / SUPER ADMIN - PROJECTS MANAGEMENT */}
        {/* ========================================================================= */}
        {activeTab === "PROJECTS" && (isSuperAdmin || isTechLead) && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Project Repositories</h2>
                <p className="text-xs text-slate-400">
                  Manage software projects for {currentCompany.name}
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingProject(null);
                  setProjectForm({ key: "", name: "", description: "" });
                  setIsAddProjectModalOpen(true);
                }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-lg"
              >
                + Add Project (Tech Lead)
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {companyProjects.map((p) => {
                const projBugs = bugs.filter((b) => b.projectKey === p.key);
                return (
                  <div key={p.id} className="bg-[#0f1422] border border-slate-800 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        [{p.key}]
                      </span>
                      <div className="flex gap-2 text-xs">
                        <button
                          onClick={() => {
                            setEditingProject(p);
                            setProjectForm({ key: p.key, name: p.name, description: p.description });
                            setIsAddProjectModalOpen(true);
                          }}
                          className="text-indigo-400 font-bold hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProject(p.id)}
                          className="text-red-400 font-bold hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-white">{p.name}</h3>
                      <p className="text-xs text-slate-400 mt-1">{p.description}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                      <span className="text-slate-400">{projBugs.length} Total Bugs</span>
                      <button
                        onClick={() => {
                          setSelectedProjectKey(p.key);
                          setActiveTab("BUGS");
                        }}
                        className="text-indigo-400 font-bold hover:underline"
                      >
                        View Lifecycle -&gt;
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: TECH LEAD / SUPER ADMIN - ASSIGNEE TEAM EMAILS */}
        {/* ========================================================================= */}
        {activeTab === "ASSIGNEES" && (isSuperAdmin || isTechLead) && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Team Assignees (Developers)</h2>
                <p className="text-xs text-slate-400">
                  Add and manage developer emails authorized to work on bugs
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingAssignee(null);
                  setAssigneeForm({ name: "", email: "" });
                  setIsAddAssigneeModalOpen(true);
                }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-lg"
              >
                + Add Assignee Email (Tech Lead)
              </button>
            </div>

            <div className="bg-[#0f1422] border border-slate-800 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left text-slate-300">
                <thead className="bg-[#141a2a] text-slate-400 uppercase font-bold text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-3">Assignee Name</th>
                    <th className="p-3">Authorized Email</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Assigned Bugs</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {companyAssignees.map((u) => {
                    const assignedCount = bugs.filter((b) => b.assigneeEmail === u.email).length;
                    return (
                      <tr key={u.id} className="hover:bg-slate-800/40">
                        <td className="p-3 font-bold text-white">{u.name}</td>
                        <td className="p-3 font-mono text-indigo-300">{u.email}</td>
                        <td className="p-3">
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3 font-bold">{assignedCount} bugs</td>
                        <td className="p-3 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingAssignee(u);
                              setAssigneeForm({ name: u.name, email: u.email });
                              setIsAddAssigneeModalOpen(true);
                            }}
                            className="text-indigo-400 font-bold hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteAssignee(u.id)}
                            className="text-red-400 font-bold hover:underline"
                          >
                            Delete
                          </button>
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
        {/* VIEW 4: BUG LIFECYCLE (ACCESSIBLE TO ALL: ASSIGNEE CAN UPDATE STATUS ONLY) */}
        {/* ========================================================================= */}
        {activeTab === "BUGS" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <select
                  value={selectedProjectKey}
                  onChange={(e) => setSelectedProjectKey(e.target.value)}
                  className="bg-[#0f1422] border border-slate-700 rounded px-3 py-1.5 text-xs text-white focus:outline-none"
                >
                  <option value="ALL">All Projects ({companyProjects.length})</option>
                  {companyProjects.map((p) => (
                    <option key={p.key} value={p.key}>
                      [{p.key}] {p.name}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Search bugs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#0f1422] border border-slate-700 rounded px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none w-64"
                />
              </div>

              {(isSuperAdmin || isTechLead) && (
                <button
                  onClick={() => setIsAddBugModalOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-lg"
                >
                  + Create & Assign Bug (Tech Lead)
                </button>
              )}
            </div>

            {/* Kanban Columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {BUG_STATUSES.map((statusKey) => {
                const colBugs = filteredBugs.filter((b) => b.status === statusKey);
                return (
                  <div
                    key={statusKey}
                    className="bg-[#0f1422] border border-slate-800 rounded-xl p-3 flex flex-col min-h-[500px]"
                  >
                    <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
                      <span className="font-bold text-xs text-slate-300 uppercase tracking-wider">
                        {statusKey.replace("_", " ")}
                      </span>
                      <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        {colBugs.length}
                      </span>
                    </div>

                    <div className="flex-1 space-y-2.5">
                      {colBugs.map((bug) => (
                        <div
                          key={bug.id}
                          onClick={() => setSelectedBugDetail(bug)}
                          className="bg-[#141a2a] border border-slate-800 hover:border-indigo-500/60 rounded-xl p-3 cursor-pointer transition space-y-2"
                        >
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-mono font-bold text-indigo-400">{bug.id}</span>
                            <span
                              className={`font-bold px-1.5 py-0.5 rounded ${
                                bug.priority === "CRITICAL"
                                  ? "bg-red-500/20 text-red-300 border border-red-500/30"
                                  : bug.priority === "HIGH"
                                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                  : "bg-slate-800 text-slate-300"
                              }`}
                            >
                              {bug.priority}
                            </span>
                          </div>

                          <p className="text-xs font-semibold text-white leading-snug line-clamp-2">
                            {bug.title}
                          </p>

                          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                            <span className="font-mono">Assignee: {bug.assigneeEmail}</span>
                            {/* ASSIGNEE CAN CHANGE STATUS HERE */}
                            <select
                              value={bug.status}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleUpdateBugStatus(bug.id, e.target.value);
                              }}
                              className="bg-slate-900 border border-slate-700 text-white rounded px-1.5 py-0.5 text-[10px] font-bold focus:outline-none"
                            >
                              {BUG_STATUSES.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ))}

                      {colBugs.length === 0 && (
                        <div className="h-24 border border-dashed border-slate-800 rounded-xl flex items-center justify-center text-[11px] text-slate-600 font-medium">
                          No bugs
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* MODAL 1: ADD/EDIT SOFTWARE COMPANY (SUPER ADMIN ONLY) */}
      {/* ========================================================================= */}
      {isAddCompanyModalOpen && isSuperAdmin && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#0f1422] border border-slate-800 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white">
                {editingCompany ? "Edit Software Company" : "Add New Software Company"}
              </h3>
              <button onClick={() => setIsAddCompanyModalOpen(false)} className="text-slate-400 hover:text-white font-bold">
                Close
              </button>
            </div>

            <form onSubmit={handleSaveCompany} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Eprecisio Technologies"
                  value={companyForm.name}
                  onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Tech Lead Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Vance"
                  value={companyForm.techLeadName}
                  onChange={(e) => setCompanyForm({ ...companyForm, techLeadName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Authorized Tech Lead Email (Login Email)</label>
                <input
                  type="email"
                  required
                  placeholder="lead@eprecisio.com"
                  value={companyForm.techLeadEmail}
                  onChange={(e) => setCompanyForm({ ...companyForm, techLeadEmail: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsAddCompanyModalOpen(false)} className="px-3 py-1.5 text-slate-400">
                  Cancel
                </button>
                <button type="submit" className="bg-purple-600 text-white font-bold px-4 py-1.5 rounded-lg">
                  {editingCompany ? "Update Company" : "Save Company"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD/EDIT PROJECT (TECH LEAD ONLY) */}
      {/* ========================================================================= */}
      {isAddProjectModalOpen && (isTechLead || isSuperAdmin) && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#0f1422] border border-slate-800 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white">
                {editingProject ? "Edit Project" : "Add New Project"}
              </h3>
              <button onClick={() => setIsAddProjectModalOpen(false)} className="text-slate-400 hover:text-white font-bold">
                Close
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-3 text-xs">
              {!editingProject && (
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Project Key (Short Code)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. EPREC"
                    maxLength={10}
                    value={projectForm.key}
                    onChange={(e) => setProjectForm({ ...projectForm, key: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono uppercase focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Enterprise Core Backend"
                  value={projectForm.name}
                  onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows="3"
                  placeholder="Project details..."
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsAddProjectModalOpen(false)} className="px-3 py-1.5 text-slate-400">
                  Cancel
                </button>
                <button type="submit" className="bg-indigo-600 text-white font-bold px-4 py-1.5 rounded-lg">
                  {editingProject ? "Update Project" : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ADD/EDIT TEAM ASSIGNEE EMAIL (TECH LEAD ONLY) */}
      {/* ========================================================================= */}
      {isAddAssigneeModalOpen && (isTechLead || isSuperAdmin) && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#0f1422] border border-slate-800 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white">
                {editingAssignee ? "Edit Assignee Email" : "Add Team Assignee Email"}
              </h3>
              <button onClick={() => setIsAddAssigneeModalOpen(false)} className="text-slate-400 hover:text-white font-bold">
                Close
              </button>
            </div>

            <form onSubmit={handleSaveAssignee} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Assignee Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. David Kim"
                  value={assigneeForm.name}
                  onChange={(e) => setAssigneeForm({ ...assigneeForm, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Assignee Authorized Email</label>
                <input
                  type="email"
                  required
                  placeholder="david@eprecisio.com"
                  value={assigneeForm.email}
                  onChange={(e) => setAssigneeForm({ ...assigneeForm, email: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsAddAssigneeModalOpen(false)} className="px-3 py-1.5 text-slate-400">
                  Cancel
                </button>
                <button type="submit" className="bg-indigo-600 text-white font-bold px-4 py-1.5 rounded-lg">
                  {editingAssignee ? "Update Assignee" : "Add Assignee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: CREATE BUG (TECH LEAD ONLY) */}
      {/* ========================================================================= */}
      {isAddBugModalOpen && (isTechLead || isSuperAdmin) && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#0f1422] border border-slate-800 rounded-2xl w-full max-w-lg p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white">Create & Assign Bug</h3>
              <button onClick={() => setIsAddBugModalOpen(false)} className="text-slate-400 hover:text-white font-bold">
                Close
              </button>
            </div>

            <form onSubmit={handleSaveBug} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Target Project</label>
                  <select
                    value={bugForm.projectKey}
                    onChange={(e) => setBugForm({ ...bugForm, projectKey: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none"
                  >
                    {companyProjects.map((p) => (
                      <option key={p.key} value={p.key}>
                        [{p.key}] {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Priority</label>
                  <select
                    value={bugForm.priority}
                    onChange={(e) => setBugForm({ ...bugForm, priority: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Bug Summary Title</label>
                <input
                  type="text"
                  required
                  placeholder="Summary of issue..."
                  value={bugForm.title}
                  onChange={(e) => setBugForm({ ...bugForm, title: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Technical Description</label>
                <textarea
                  rows="3"
                  placeholder="Steps to reproduce and issue details..."
                  value={bugForm.description}
                  onChange={(e) => setBugForm({ ...bugForm, description: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Assign to Team Assignee</label>
                <select
                  value={bugForm.assigneeEmail}
                  onChange={(e) => setBugForm({ ...bugForm, assigneeEmail: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-bold text-indigo-300 focus:outline-none"
                >
                  {companyAssignees.map((u) => (
                    <option key={u.id} value={u.email}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsAddBugModalOpen(false)} className="px-3 py-1.5 text-slate-400">
                  Cancel
                </button>
                <button type="submit" className="bg-indigo-600 text-white font-bold px-4 py-1.5 rounded-lg">
                  Create & Assign Bug
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: BUG LIFECYCLE DETAIL MODAL (ASSIGNEE STATUS UPDATE) */}
      {/* ========================================================================= */}
      {selectedBugDetail && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#0f1422] border border-slate-800 rounded-2xl w-full max-w-lg p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm text-indigo-400">{selectedBugDetail.id}</span>
                <span className="text-xs text-slate-400">[{selectedBugDetail.projectKey}]</span>
              </div>
              <button onClick={() => setSelectedBugDetail(null)} className="text-slate-400 hover:text-white font-bold text-xs">
                Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <h3 className="text-sm font-bold text-white leading-snug">{selectedBugDetail.title}</h3>
              <p className="text-slate-300 p-3 rounded-lg bg-slate-900 border border-slate-800">{selectedBugDetail.description}</p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Bug Lifecycle / Status</label>
                  <select
                    value={selectedBugDetail.status}
                    onChange={(e) => handleUpdateBugStatus(selectedBugDetail.id, e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2 font-bold text-indigo-300 focus:outline-none"
                  >
                    {BUG_STATUSES.map((st) => (
                      <option key={st} value={s}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Assignee Email</label>
                  <input
                    type="text"
                    disabled
                    value={selectedBugDetail.assigneeEmail}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-400 rounded-lg p-2 font-mono text-[11px] opacity-75 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
              {(isTechLead || isSuperAdmin) && (
                <button
                  onClick={() => {
                    setBugs(bugs.filter((b) => b.id !== selectedBugDetail.id));
                    setSelectedBugDetail(null);
                  }}
                  className="text-red-400 font-bold hover:underline"
                >
                  Delete Bug (Tech Lead)
                </button>
              )}
              <button onClick={() => setSelectedBugDetail(null)} className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg font-bold ml-auto">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}