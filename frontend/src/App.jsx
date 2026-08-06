import React, { useState } from "react";

// Pre-seeded Companies
const INITIAL_COMPANIES = [
  {
    id: "comp-eprecisio",
    name: "Eprecisio Technologies",
    techLeadEmail: "lead@eprecisio.com",
    techLeadName: "Alex Vance",
    createdAt: "2026-08-01",
  },
  {
    id: "comp-antigravity",
    name: "Antigravity Systems",
    techLeadEmail: "lead@antigravity.com",
    techLeadName: "Sarah Connor",
    createdAt: "2026-08-02",
  },
];

// Pre-seeded Authorized Users (Email + Password Authentication)
const INITIAL_USERS = [
  // Super Admin (YOU)
  {
    id: "usr-super",
    companyId: null,
    name: "Super Administrator",
    email: "ahad8641@gmail.com",
    password: "password123",
    role: "SUPER_ADMIN",
  },
  // Eprecisio Company Users
  {
    id: "usr-ep-tl",
    companyId: "comp-eprecisio",
    name: "Alex Vance (Tech Lead)",
    email: "lead@eprecisio.com",
    password: "password123",
    role: "TECH_LEAD",
  },
  {
    id: "usr-ep-dev1",
    companyId: "comp-eprecisio",
    name: "David Kim",
    email: "david@eprecisio.com",
    password: "password123",
    role: "ASSIGNEE",
  },
  {
    id: "usr-ep-dev2",
    companyId: "comp-eprecisio",
    name: "Maria Garcia",
    email: "maria@eprecisio.com",
    password: "password123",
    role: "ASSIGNEE",
  },
  // Antigravity Company Users
  {
    id: "usr-ag-tl",
    companyId: "comp-antigravity",
    name: "Sarah Connor (Tech Lead)",
    email: "lead@antigravity.com",
    password: "password123",
    role: "TECH_LEAD",
  },
  {
    id: "usr-ag-dev1",
    companyId: "comp-antigravity",
    name: "John Reese",
    email: "john@antigravity.com",
    password: "password123",
    role: "ASSIGNEE",
  },
];

// Pre-seeded Projects
const INITIAL_PROJECTS = [
  {
    id: "prj-ep1",
    companyId: "comp-eprecisio",
    key: "EPREC",
    name: "Enterprise Core Engine",
    description: "Backend REST API and async database pool engine",
  },
  {
    id: "prj-ag1",
    companyId: "comp-antigravity",
    key: "ANTI",
    name: "AI Trajectory Engine",
    description: "Agentic AI memory and LLM trajectory manager",
  },
];

// Pre-seeded Bugs / Issues
const INITIAL_BUGS = [
  {
    id: "EPREC-101",
    companyId: "comp-eprecisio",
    projectKey: "EPREC",
    title: "Database connection pool exhaustion under load",
    description: "Asyncpg connection slots run out under 10k RPS peak load.",
    status: "OPEN",
    priority: "CRITICAL",
    assigneeEmail: "david@eprecisio.com",
    createdBy: "lead@eprecisio.com",
  },
  {
    id: "ANTI-201",
    companyId: "comp-antigravity",
    projectKey: "ANTI",
    title: "Vector database indexing latency delay",
    description: "Redis vector store indexing delays agent response.",
    status: "IN_PROGRESS",
    priority: "HIGH",
    assigneeEmail: "john@antigravity.com",
    createdBy: "lead@antigravity.com",
  },
];

const BUG_STATUSES = ["OPEN", "IN_PROGRESS", "IN_REVIEW", "RESOLVED", "CLOSED"];

export default function App() {
  // Master State
  const [companies, setCompanies] = useState(INITIAL_COMPANIES);
  const [users, setUsers] = useState(INITIAL_USERS);
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [bugs, setBugs] = useState(INITIAL_BUGS);

  // Authentication State
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [currentUser, setCurrentUser] = useState(null); // Null when logged out

  // Active View & Filters
  const [activeTab, setActiveTab] = useState("BUGS"); // 'COMPANIES', 'PROJECTS', 'ASSIGNEES', 'BUGS'
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

  // Form Inputs
  const [companyForm, setCompanyForm] = useState({ name: "", techLeadName: "", techLeadEmail: "", techLeadPassword: "" });
  const [projectForm, setProjectForm] = useState({ key: "", name: "", description: "" });
  const [assigneeForm, setAssigneeForm] = useState({ name: "", email: "", password: "" });
  const [bugForm, setBugForm] = useState({ title: "", description: "", projectKey: "", priority: "MEDIUM", assigneeEmail: "" });

  // Handle Login Authentication
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError("");

    const inputEmail = authEmail.trim().toLowerCase();
    const foundUser = users.find(
      (u) => u.email.toLowerCase() === inputEmail && u.password === authPassword
    );

    if (!foundUser) {
      setLoginError("Invalid email address or password.");
      return;
    }

    setCurrentUser(foundUser);
    setAuthEmail("");
    setAuthPassword("");

    // Set Default Tab per Role
    if (foundUser.role === "SUPER_ADMIN") setActiveTab("COMPANIES");
    else if (foundUser.role === "TECH_LEAD") setActiveTab("PROJECTS");
    else setActiveTab("BUGS");
  };

  // Handle Logout
  const handleLogout = () => {
    setCurrentUser(null);
    setLoginError("");
  };

  // Quick Preset Fill for Testing Convenience
  const fillPresetLogin = (email) => {
    setAuthEmail(email);
    setAuthPassword("password123");
  };

  // Role Checks
  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";
  const isTechLead = currentUser?.role === "TECH_LEAD";
  const isAssignee = currentUser?.role === "ASSIGNEE";

  // Data Scoping by Logged In User's Company ONLY (Strict Tenant Isolation)
  const userCompany = companies.find((c) => c.id === currentUser?.companyId);

  const scopedProjects = isSuperAdmin
    ? projects
    : projects.filter((p) => p.companyId === currentUser?.companyId);

  const scopedAssignees = isSuperAdmin
    ? users.filter((u) => u.role === "ASSIGNEE")
    : users.filter((u) => u.companyId === currentUser?.companyId && u.role === "ASSIGNEE");

  const scopedBugs = isSuperAdmin
    ? bugs
    : isAssignee
    ? bugs.filter((b) => b.companyId === currentUser?.companyId && b.assigneeEmail.toLowerCase() === currentUser?.email.toLowerCase())
    : bugs.filter((b) => b.companyId === currentUser?.companyId);

  const filteredBugs = scopedBugs.filter((b) => {
    const matchesProj = selectedProjectKey === "ALL" || b.projectKey === selectedProjectKey;
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProj && matchesSearch;
  });

  // Actions: Super Admin Software Companies
  const handleSaveCompany = (e) => {
    e.preventDefault();
    if (!isSuperAdmin) return;

    if (editingCompany) {
      setCompanies(
        companies.map((c) =>
          c.id === editingCompany.id
            ? { ...c, name: companyForm.name, techLeadName: companyForm.techLeadName, techLeadEmail: companyForm.techLeadEmail }
            : c
        )
      );
      setUsers(
        users.map((u) =>
          u.companyId === editingCompany.id && u.role === "TECH_LEAD"
            ? { ...u, name: companyForm.techLeadName, email: companyForm.techLeadEmail }
            : u
        )
      );
    } else {
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
        password: companyForm.techLeadPassword || "password123",
        role: "TECH_LEAD",
      };

      setCompanies([...companies, newComp]);
      setUsers([...users, newTechLeadUser]);
    }

    setCompanyForm({ name: "", techLeadName: "", techLeadEmail: "", techLeadPassword: "" });
    setEditingCompany(null);
    setIsAddCompanyModalOpen(false);
  };

  const handleDeleteCompany = (compId) => {
    if (!isSuperAdmin) return;
    if (!window.confirm("Delete company and all company data?")) return;
    setCompanies(companies.filter((c) => c.id !== compId));
    setUsers(users.filter((u) => u.companyId !== compId));
    setProjects(projects.filter((p) => p.companyId !== compId));
    setBugs(bugs.filter((b) => b.companyId !== compId));
  };

  // Actions: Tech Lead Projects
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
        companyId: currentUser.companyId,
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
    if (!window.confirm("Delete project and its bugs?")) return;
    const proj = projects.find((p) => p.id === projId);
    setProjects(projects.filter((p) => p.id !== projId));
    if (proj) {
      setBugs(bugs.filter((b) => !(b.companyId === proj.companyId && b.projectKey === proj.key)));
    }
  };

  // Actions: Tech Lead Assignee Team
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
        companyId: currentUser.companyId,
        name: assigneeForm.name.trim(),
        email: assigneeForm.email.trim().toLowerCase(),
        password: assigneeForm.password || "password123",
        role: "ASSIGNEE",
      };
      setUsers([...users, newAssignee]);
    }

    setAssigneeForm({ name: "", email: "", password: "" });
    setEditingAssignee(null);
    setIsAddAssigneeModalOpen(false);
  };

  const handleDeleteAssignee = (userId) => {
    if (!isTechLead && !isSuperAdmin) return;
    if (!window.confirm("Remove assignee email from company?")) return;
    setUsers(users.filter((u) => u.id !== userId));
  };

  // Actions: Tech Lead Create Bug
  const handleSaveBug = (e) => {
    e.preventDefault();
    if (!isTechLead && !isSuperAdmin) return;

    const targetProjKey = bugForm.projectKey || (scopedProjects[0]?.key || "EPREC");
    const targetAssignee = bugForm.assigneeEmail || (scopedAssignees[0]?.email || currentUser.email);

    const newBug = {
      id: `${targetProjKey}-${100 + scopedBugs.length + 1}`,
      companyId: currentUser.companyId,
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

  // Action: Update Bug Lifecycle Status Only (Assignees & Tech Leads)
  const handleUpdateBugStatus = (bugId, newStatus) => {
    setBugs(bugs.map((b) => (b.id === bugId ? { ...b, status: newStatus } : b)));
    if (selectedBugDetail && selectedBugDetail.id === bugId) {
      setSelectedBugDetail({ ...selectedBugDetail, status: newStatus });
    }
  };

  // =========================================================================
  // SCREEN 1: STRICT EMAIL & PASSWORD LOGIN PORTAL (NO DROPDOWN)
  // =========================================================================
  if (!currentUser) {
    return (
      <div className="w-full h-screen bg-[#090c15] text-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#0f1422] border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl">
          <div className="text-center space-y-1">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 font-black text-white text-sm flex items-center justify-center mx-auto mb-2">
              BF
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">BugForge Enterprise Login</h1>
            <p className="text-xs text-slate-400">Enter authorized company email & password</p>
          </div>

          {loginError && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-semibold">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="your.email@company.com"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Password</label>
              <input
                type="password"
                required
                placeholder="********"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-lg text-xs transition"
            >
              Sign In to Company Workspace
            </button>
          </form>

          {/* Quick Demo Presets */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Quick Test Accounts (Password: password123)
            </span>
            <div className="space-y-1 text-[11px]">
              <button
                onClick={() => fillPresetLogin("ahad8641@gmail.com")}
                className="w-full text-left p-1.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 hover:bg-purple-500/20 flex justify-between"
              >
                <span>Super Admin (You)</span>
                <span className="font-mono">ahad8641@gmail.com</span>
              </button>
              <button
                onClick={() => fillPresetLogin("lead@eprecisio.com")}
                className="w-full text-left p-1.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/20 flex justify-between"
              >
                <span>Eprecisio Tech Lead</span>
                <span className="font-mono">lead@eprecisio.com</span>
              </button>
              <button
                onClick={() => fillPresetLogin("david@eprecisio.com")}
                className="w-full text-left p-1.5 rounded bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 flex justify-between"
              >
                <span>Eprecisio Assignee</span>
                <span className="font-mono">david@eprecisio.com</span>
              </button>
              <button
                onClick={() => fillPresetLogin("lead@antigravity.com")}
                className="w-full text-left p-1.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/20 flex justify-between"
              >
                <span>Antigravity Tech Lead</span>
                <span className="font-mono">lead@antigravity.com</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // SCREEN 2: AUTHENTICATED WORKSPACE (ISOLATED PER USER EMAIL & COMPANY)
  // =========================================================================
  return (
    <div className="w-full h-screen bg-[#090c15] text-slate-100 font-sans flex flex-col overflow-hidden">
      {/* HEADER: NO ROLE DROPDOWN, ONLY LOGGED IN EMAIL & LOGOUT */}
      <header className="h-14 bg-[#0f1422] border-b border-slate-800 px-5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
              BF
            </div>
            <span className="font-bold text-sm text-white tracking-tight">BugForge SaaS</span>
          </div>

          <nav className="flex items-center gap-1 text-xs font-semibold">
            {isSuperAdmin && (
              <button
                onClick={() => setActiveTab("COMPANIES")}
                className={`px-3 py-1.5 rounded-lg ${
                  activeTab === "COMPANIES" ? "bg-purple-600 text-white font-bold" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Software Companies ({companies.length})
              </button>
            )}

            {(isSuperAdmin || isTechLead) && (
              <button
                onClick={() => setActiveTab("PROJECTS")}
                className={`px-3 py-1.5 rounded-lg ${
                  activeTab === "PROJECTS" ? "bg-indigo-600 text-white font-bold" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Projects ({scopedProjects.length})
              </button>
            )}

            <button
              onClick={() => setActiveTab("BUGS")}
              className={`px-3 py-1.5 rounded-lg ${
                activeTab === "BUGS" ? "bg-indigo-600 text-white font-bold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Bug Lifecycle ({scopedBugs.length})
            </button>

            {(isSuperAdmin || isTechLead) && (
              <button
                onClick={() => setActiveTab("ASSIGNEES")}
                className={`px-3 py-1.5 rounded-lg ${
                  activeTab === "ASSIGNEES" ? "bg-indigo-600 text-white font-bold" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Team Assignees ({scopedAssignees.length})
              </button>
            )}
          </nav>
        </div>

        {/* LOGGED IN ACCOUNT IDENTITY (STRICTLY LOGGED IN) */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-2 bg-[#141a2a] border border-slate-700 px-3 py-1 rounded-lg">
            <span className="text-slate-400">Logged in:</span>
            <span className="font-bold text-white">{currentUser.name}</span>
            <span className="font-mono text-indigo-300 text-[11px]">({currentUser.email})</span>
          </div>

          <button
            onClick={handleLogout}
            className="text-slate-400 hover:text-red-400 border border-slate-800 px-3 py-1 rounded-lg font-bold"
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
            ? "SUPER ADMIN WORKSPACE (ahad8641@gmail.com): Add software companies & set authorized Tech Lead login emails."
            : isTechLead
            ? `TECH LEAD WORKSPACE (${userCompany?.name}): Manage projects, add team assignee emails, create & assign bugs.`
            : `ASSIGNEE WORKSPACE (${currentUser.email}): View assigned bugs & update bug lifecycle status ONLY.`}
        </span>
        <span className="font-mono text-[10px] uppercase font-bold">
          Tenant: {isSuperAdmin ? "GLOBAL SYSTEM" : userCompany?.name} | Role: {currentUser.role}
        </span>
      </div>

      {/* MAIN WORKSPACE CONTENT */}
      <main className="flex-1 bg-[#090c15] overflow-y-auto p-6">
        {/* ========================================================================= */}
        {/* VIEW 1: SUPER ADMIN - SOFTWARE COMPANIES (ADD, EDIT, DELETE) */}
        {/* ========================================================================= */}
        {activeTab === "COMPANIES" && isSuperAdmin && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Software Companies</h2>
                <p className="text-xs text-slate-400">
                  Add software companies and configure authorized Tech Lead login emails
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingCompany(null);
                  setCompanyForm({ name: "", techLeadName: "", techLeadEmail: "", techLeadPassword: "" });
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
                              techLeadPassword: "",
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
        {/* VIEW 2: TECH LEAD - PROJECTS (ADD, EDIT, DELETE) */}
        {/* ========================================================================= */}
        {activeTab === "PROJECTS" && (isSuperAdmin || isTechLead) && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Project Repositories</h2>
                <p className="text-xs text-slate-400">
                  Manage software projects for {userCompany?.name}
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
              {scopedProjects.map((p) => {
                const projBugs = bugs.filter((b) => b.projectKey === p.key && b.companyId === p.companyId);
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
        {/* VIEW 3: TECH LEAD - ASSIGNEE EMAILS (ADD, EDIT, DELETE) */}
        {/* ========================================================================= */}
        {activeTab === "ASSIGNEES" && (isSuperAdmin || isTechLead) && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Team Assignees (Developers)</h2>
                <p className="text-xs text-slate-400">
                  Add and manage authorized developer emails for {userCompany?.name}
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingAssignee(null);
                  setAssigneeForm({ name: "", email: "", password: "" });
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
                    <th className="p-3">Authorized Login Email</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Assigned Bugs</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {scopedAssignees.map((u) => {
                    const assignedCount = bugs.filter((b) => b.assigneeEmail.toLowerCase() === u.email.toLowerCase()).length;
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
                              setAssigneeForm({ name: u.name, email: u.email, password: "" });
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
        {/* VIEW 4: BUG LIFECYCLE (ASSIGNEES UPDATE LIFECYCLE STATUS ONLY) */}
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
                  <option value="ALL">All Projects ({scopedProjects.length})</option>
                  {scopedProjects.map((p) => (
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

            {/* Kanban Lifecycle Columns */}
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
                            {/* ASSIGNEES CAN CHANGE BUG STATUS HERE */}
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
      {/* MODAL 1: SUPER ADMIN ADD/EDIT COMPANY */}
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
                <label className="block font-semibold text-slate-300 mb-1">Software Company Name</label>
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

              {!editingCompany && (
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Tech Lead Initial Password</label>
                  <input
                    type="text"
                    required
                    placeholder="password123"
                    value={companyForm.techLeadPassword}
                    onChange={(e) => setCompanyForm({ ...companyForm, techLeadPassword: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono focus:outline-none"
                  />
                </div>
              )}

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
      {/* MODAL 2: TECH LEAD ADD/EDIT PROJECT */}
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
                  placeholder="e.g. Enterprise Core Engine"
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
      {/* MODAL 3: TECH LEAD ADD/EDIT ASSIGNEE EMAIL */}
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
                <label className="block font-semibold text-slate-300 mb-1">Authorized Assignee Email (Login Email)</label>
                <input
                  type="email"
                  required
                  placeholder="david@eprecisio.com"
                  value={assigneeForm.email}
                  onChange={(e) => setAssigneeForm({ ...assigneeForm, email: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono focus:outline-none"
                />
              </div>

              {!editingAssignee && (
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Initial Password</label>
                  <input
                    type="text"
                    required
                    placeholder="password123"
                    value={assigneeForm.password}
                    onChange={(e) => setAssigneeForm({ ...assigneeForm, password: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono focus:outline-none"
                  />
                </div>
              )}

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
      {/* MODAL 4: TECH LEAD CREATE BUG */}
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
                    {scopedProjects.map((p) => (
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
                <label className="block font-semibold text-slate-300 mb-1">Assign to Team Assignee Email</label>
                <select
                  value={bugForm.assigneeEmail}
                  onChange={(e) => setBugForm({ ...bugForm, assigneeEmail: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-bold text-indigo-300 focus:outline-none"
                >
                  {scopedAssignees.map((u) => (
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
      {/* MODAL 5: BUG LIFECYCLE DETAIL MODAL (STATUS UPDATE BY ASSIGNEE) */}
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
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Assigned Email</label>
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