import React, { useState } from "react";

// Pre-seeded Multi-Tenant Software Houses (Organizations)
const INITIAL_ORGANIZATIONS = [
  { id: "org-eprecisio", name: "Eprecisio Technologies", slug: "eprecisio", logo: "EP", domain: "eprecisio.com", status: "ACTIVE", createdAt: "2026-08-01" },
  { id: "org-antigravity", name: "Antigravity Systems", slug: "antigravity", logo: "AG", domain: "antigravity.com", status: "ACTIVE", createdAt: "2026-08-02" },
  { id: "org-stack8s", name: "Stack8s Cloud", slug: "stack8s", logo: "S8", domain: "stack8s.io", status: "ACTIVE", createdAt: "2026-08-03" },
];

// Pre-seeded Users across 6 Roles
const INITIAL_USERS = [
  // Super Admin (Only ONE)
  { id: "usr-super", orgId: null, name: "Super Administrator", email: "ahad8641@gmail.com", role: "SUPER_ADMIN" },

  // Eprecisio Users
  { id: "usr-ep1", orgId: "org-eprecisio", name: "Eprecisio Org Admin", email: "admin@eprecisio.com", role: "ORGANIZATION_ADMIN" },
  { id: "usr-ep2", orgId: "org-eprecisio", name: "Tech Lead Eprecisio", email: "lead@eprecisio.com", role: "TECH_LEAD" },
  { id: "usr-ep3", orgId: "org-eprecisio", name: "Dev Eprecisio", email: "dev@eprecisio.com", role: "DEVELOPER" },
  { id: "usr-ep4", orgId: "org-eprecisio", name: "QA Tester Eprecisio", email: "qa@eprecisio.com", role: "QA" },

  // Antigravity Users
  { id: "usr-ag1", orgId: "org-antigravity", name: "Antigravity Org Admin", email: "admin@antigravity.com", role: "ORGANIZATION_ADMIN" },
  { id: "usr-ag2", orgId: "org-antigravity", name: "Tech Lead Antigravity", email: "lead@antigravity.com", role: "TECH_LEAD" },
  { id: "usr-ag3", orgId: "org-antigravity", name: "Dev Antigravity", email: "dev@antigravity.com", role: "DEVELOPER" },
  { id: "usr-ag4", orgId: "org-antigravity", name: "Viewer Antigravity", email: "viewer@antigravity.com", role: "VIEWER" },

  // Stack8s Users
  { id: "usr-s8-1", orgId: "org-stack8s", name: "Stack8s Org Admin", email: "admin@stack8s.io", role: "ORGANIZATION_ADMIN" },
  { id: "usr-s8-2", orgId: "org-stack8s", name: "Dev Stack8s", email: "dev@stack8s.io", role: "DEVELOPER" },
];

// Tenant-Isolated Projects
const INITIAL_PROJECTS = [
  // Eprecisio Projects
  { id: "prj-ep1", orgId: "org-eprecisio", key: "EPREC", name: "Eprecisio Enterprise Core", description: "Core enterprise backend services", leadId: "usr-ep2" },
  
  // Antigravity Projects
  { id: "prj-ag1", orgId: "org-antigravity", key: "ANTI", name: "Antigravity AI Platform", description: "Agentic AI platform infrastructure", leadId: "usr-ag2" },

  // Stack8s Projects
  { id: "prj-s8-1", orgId: "org-stack8s", key: "STK", name: "Stack8s K8s Engine", description: "Kubernetes orchestration manager", leadId: "usr-s8-1" },
];

// Tenant-Isolated Issues
const INITIAL_ISSUES = [
  // Eprecisio Issues
  { id: "EPREC-101", orgId: "org-eprecisio", projectKey: "EPREC", type: "BUG", title: "Eprecisio payment gateway latency timeout", description: "Payment processing thread times out under peak concurrent requests.", status: "OPEN", priority: "CRITICAL", severity: "BLOCKER", assigneeId: "usr-ep3", reporterId: "usr-ep4", createdAt: "2026-08-05" },

  // Antigravity Issues
  { id: "ANTI-201", orgId: "org-antigravity", projectKey: "ANTI", type: "FEATURE", title: "Antigravity agent memory indexing optimization", description: "Implement vector store caching for agent trajectory logs.", status: "IN_PROGRESS", priority: "HIGH", severity: "HIGH", assigneeId: "usr-ag3", reporterId: "usr-ag2", createdAt: "2026-08-04" },

  // Stack8s Issues
  { id: "STK-301", orgId: "org-stack8s", projectKey: "STK", type: "BUG", title: "Stack8s pod autoscaler metrics scrape failure", description: "Prometheus exporter drops scrape targets when pod count exceeds 100.", status: "OPEN", priority: "HIGH", severity: "HIGH", assigneeId: "usr-s8-2", reporterId: "usr-s8-1", createdAt: "2026-08-05" },
];

const STATUSES = ["OPEN", "IN_PROGRESS", "IN_REVIEW", "RESOLVED", "CLOSED"];

export default function App() {
  // Master State
  const [organizations, setOrganizations] = useState(INITIAL_ORGANIZATIONS);
  const [users, setUsers] = useState(INITIAL_USERS);
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [issues, setIssues] = useState(INITIAL_ISSUES);

  // Authentication State
  const [currentUser, setCurrentUser] = useState(INITIAL_USERS[0]); // Default Super Admin (ahad8641@gmail.com)
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  // Filters & Search
  const [selectedProjectKey, setSelectedProjectKey] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [isNewOrgModalOpen, setIsNewOrgModalOpen] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isNewIssueModalOpen, setIsNewIssueModalOpen] = useState(false);
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  const [selectedIssueDetail, setSelectedIssueDetail] = useState(null);

  // Form States
  const [newOrg, setNewOrg] = useState({ name: "", slug: "", domain: "", adminName: "", adminEmail: "", adminPassword: "" });
  const [newProject, setNewProject] = useState({ name: "", key: "", description: "" });
  const [newIssue, setNewIssue] = useState({ title: "", description: "", type: "BUG", priority: "MEDIUM", severity: "MEDIUM", projectKey: "EPREC", assigneeId: "" });
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "DEVELOPER" });

  // Role Checks
  const isSuperAdmin = currentUser.role === "SUPER_ADMIN";
  const isOrgAdmin = currentUser.role === "ORGANIZATION_ADMIN";
  const isTechLead = currentUser.role === "TECH_LEAD";
  const isQA = currentUser.role === "QA";
  const isDev = currentUser.role === "DEVELOPER";
  const isViewer = currentUser.role === "VIEWER";

  // Permissions Check for Bug Assignment (ONLY ORGANIZATION_ADMIN and TECH_LEAD can assign)
  const canAssignBugs = isSuperAdmin || isOrgAdmin || isTechLead;
  // Permissions Check for Project Creation (ORGANIZATION_ADMIN and TECH_LEAD)
  const canCreateProjects = isSuperAdmin || isOrgAdmin || isTechLead;
  // Permissions Check for Project Deletion (ORGANIZATION_ADMIN)
  const canDeleteProjects = isSuperAdmin || isOrgAdmin;

  // Tenant Isolation Scoping
  const currentOrg = isSuperAdmin
    ? organizations[0]
    : organizations.find((o) => o.id === currentUser.orgId) || organizations[0];

  const tenantProjects = isSuperAdmin
    ? projects
    : projects.filter((p) => p.orgId === currentUser.orgId);

  const tenantUsers = isSuperAdmin
    ? users
    : users.filter((u) => u.orgId === currentUser.orgId);

  const tenantIssues = isSuperAdmin
    ? issues
    : issues.filter((i) => i.orgId === currentUser.orgId);

  const filteredIssues = tenantIssues.filter((issue) => {
    const matchesProject = selectedProjectKey === "ALL" || issue.projectKey === selectedProjectKey;
    const matchesSearch =
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProject && matchesSearch;
  });

  // Action: Super Admin Creates Software House & Auto Provisions Org Admin
  const handleCreateSoftwareHouse = (e) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      alert("Access Denied: Only Super Admin (ahad8641@gmail.com) can create software houses.");
      return;
    }
    const orgId = `org-${organizations.length + 1}`;
    const org = {
      id: orgId,
      name: newOrg.name.trim(),
      slug: newOrg.slug.toLowerCase().trim(),
      logo: newOrg.name.substring(0, 2).toUpperCase(),
      domain: newOrg.domain.trim() || `${newOrg.slug}.com`,
      status: "ACTIVE",
      createdAt: new Date().toISOString().split("T")[0],
    };

    const adminUser = {
      id: `usr-${users.length + 1}`,
      orgId: orgId,
      name: newOrg.adminName.trim(),
      email: newOrg.adminEmail.trim(),
      role: "ORGANIZATION_ADMIN",
    };

    setOrganizations([...organizations, org]);
    setUsers([...users, adminUser]);
    setNewOrg({ name: "", slug: "", domain: "", adminName: "", adminEmail: "", adminPassword: "" });
    setIsNewOrgModalOpen(false);
  };

  // Action: Super Admin Suspend/Activate Organization
  const handleToggleOrgStatus = (orgId) => {
    if (!isSuperAdmin) return;
    setOrganizations(
      organizations.map((o) =>
        o.id === orgId ? { ...o, status: o.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE" } : o
      )
    );
  };

  // Action: Super Admin Delete Organization
  const handleDeleteOrg = (orgId) => {
    if (!isSuperAdmin) return;
    if (!window.confirm("Super Admin Warning: Permanently delete organization and all tenant data?")) return;
    setOrganizations(organizations.filter((o) => o.id !== orgId));
    setUsers(users.filter((u) => u.orgId !== orgId));
    setProjects(projects.filter((p) => p.orgId !== orgId));
    setIssues(issues.filter((i) => i.orgId !== orgId));
  };

  // Action: Create Project
  const handleCreateProject = (e) => {
    e.preventDefault();
    if (!canCreateProjects) {
      alert("Access Denied: Only Organization Admin or Tech Lead can create projects.");
      return;
    }
    const keyUpper = newProject.key.toUpperCase().trim();
    if (tenantProjects.some((p) => p.key === keyUpper)) {
      alert(`Project key ${keyUpper} already exists in your organization.`);
      return;
    }
    const project = {
      id: `prj-${projects.length + 1}`,
      orgId: currentUser.orgId,
      key: keyUpper,
      name: newProject.name.trim(),
      description: newProject.description,
      leadId: currentUser.id,
    };
    setProjects([...projects, project]);
    setNewProject({ name: "", key: "", description: "" });
    setIsNewProjectModalOpen(false);
  };

  // Action: Delete Project
  const handleDeleteProject = (projectKey) => {
    if (!canDeleteProjects) {
      alert("Access Denied: Only Organization Admin can delete projects.");
      return;
    }
    if (!window.confirm(`Delete project ${projectKey} and all associated issues?`)) return;
    setProjects(projects.filter((p) => !(p.orgId === currentUser.orgId && p.key === projectKey)));
    setIssues(issues.filter((i) => !(i.orgId === currentUser.orgId && i.projectKey === projectKey)));
  };

  // Action: Create Issue (QA, Tech Lead, Org Admin, Super Admin)
  const handleCreateIssue = (e) => {
    e.preventDefault();
    if (isViewer || isDev) {
      alert("Access Denied: Developers and Viewers cannot create issues.");
      return;
    }
    if (!newIssue.title) return;

    // Check Bug Assignment permission
    let assignedId = "";
    if (canAssignBugs) {
      assignedId = newIssue.assigneeId || tenantUsers.find((u) => u.role === "DEVELOPER")?.id || currentUser.id;
    }

    const issue = {
      ...newIssue,
      id: `${newIssue.projectKey}-${100 + tenantIssues.length + 1}`,
      orgId: currentUser.orgId,
      status: "OPEN",
      assigneeId: assignedId,
      reporterId: currentUser.id,
      createdAt: new Date().toISOString().split("T")[0],
    };

    setIssues([issue, ...issues]);
    setIsNewIssueModalOpen(false);
  };

  // Action: Update Status & Reassign
  const handleUpdateStatus = (issueId, newStatus) => {
    setIssues(issues.map((i) => (i.id === issueId ? { ...i, status: newStatus } : i)));
    if (selectedIssueDetail && selectedIssueDetail.id === issueId) {
      setSelectedIssueDetail({ ...selectedIssueDetail, status: newStatus });
    }
  };

  const handleReassignIssue = (issueId, newAssigneeId) => {
    if (!canAssignBugs) {
      alert("Access Denied: Only Organization Admin or Tech Lead can assign/reassign bugs.");
      return;
    }
    setIssues(issues.map((i) => (i.id === issueId ? { ...i, assigneeId: newAssigneeId } : i)));
    if (selectedIssueDetail && selectedIssueDetail.id === issueId) {
      setSelectedIssueDetail({ ...selectedIssueDetail, assigneeId: newAssigneeId });
    }
  };

  // Action: Invite / Add User inside Organization
  const handleAddOrgUser = (e) => {
    e.preventDefault();
    if (!isOrgAdmin && !isSuperAdmin) {
      alert("Access Denied: Only Organization Admin can add users.");
      return;
    }
    const user = {
      id: `usr-${users.length + 1}`,
      orgId: currentUser.orgId,
      name: newUser.name.trim(),
      email: newUser.email.trim(),
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

  // Login Screen
  if (!isLoggedIn) {
    return (
      <div className="w-full h-screen bg-[#090C15] text-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-[#0F1422] border border-slate-800 rounded-xl p-6 space-y-5 shadow-2xl">
          <div className="text-center space-y-1">
            <h1 className="text-xl font-bold text-white tracking-tight">BugForge Multi-Tenant SaaS Portal</h1>
            <p className="text-xs text-slate-400">Select role account to sign in & test strict data isolation</p>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {users.map((u) => {
              const uOrg = organizations.find((o) => o.id === u.orgId);
              return (
                <button
                  key={u.id}
                  onClick={() => {
                    setCurrentUser(u);
                    setIsLoggedIn(true);
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-[#141A2A] hover:bg-slate-800 text-left transition"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{u.name}</span>
                      <span className="text-[10px] font-mono text-slate-500">({u.email})</span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Tenant: {u.role === "SUPER_ADMIN" ? "SYSTEM GLOBAL" : uOrg ? uOrg.name : "N/A"}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      u.role === "SUPER_ADMIN"
                        ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                        : u.role === "ORGANIZATION_ADMIN"
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
    <div className="w-full h-screen bg-[#090C15] text-slate-100 font-sans flex flex-col overflow-hidden">
      {/* ========================================================================= */}
      {/* TOP HEADER & ACCOUNT ROLE SWITCHER */}
      {/* ========================================================================= */}
      <header className="h-14 bg-[#0F1422] border-b border-slate-800 px-5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
              BF
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm text-white tracking-tight">BugForge SaaS</span>
              <span className="text-[10px] font-mono text-slate-400">
                {isSuperAdmin ? "SUPER ADMIN GLOBAL OVERWATCH" : `Tenant: ${currentOrg.name}`}
              </span>
            </div>
          </div>
        </div>

        {/* User Account Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#141A2A] border border-slate-700 px-3 py-1 rounded text-xs">
            <span className="text-slate-400">Account:</span>
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
                  {u.name} [{u.role}]
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setIsLoggedIn(false)}
            className="text-xs text-slate-400 hover:text-red-400 border border-slate-800 px-2.5 py-1 rounded"
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
            : isOrgAdmin
            ? "bg-indigo-950/40 border-indigo-800/60 text-indigo-300"
            : isTechLead
            ? "bg-blue-950/40 border-blue-800/60 text-blue-300"
            : "bg-slate-900 border-slate-800 text-slate-400"
        }`}
      >
        <span>
          {isSuperAdmin
            ? "SUPER ADMIN DASHBOARD ROUTE (ahad8641@gmail.com): Software House Management, Org Provisioning, and Platform Analytics."
            : isOrgAdmin
            ? `ORGANIZATION ADMIN DASHBOARD (${currentOrg.name}): Full tenant management (Users, Projects, Teams, Roles).`
            : isTechLead
            ? `TECH LEAD DASHBOARD (${currentOrg.name}): Project management, bug assignment, sprint releases, backlog.`
            : isDev
            ? `DEVELOPER DASHBOARD (${currentOrg.name}): View assigned bugs, update status, add fix comments.`
            : isQA
            ? `QA DASHBOARD (${currentOrg.name}): Bug reporting, verification, and reopen controls.`
            : `READ-ONLY DASHBOARD (${currentOrg.name}): View-only access.`}
        </span>
        <span className="font-mono text-[10px] uppercase font-bold">Role: {currentUser.role}</span>
      </div>

      {/* ========================================================================= */}
      {/* ROLE DASHBOARD VIEW 1: SUPER ADMIN DASHBOARD */}
      {/* ========================================================================= */}
      {isSuperAdmin ? (
        <div className="flex-1 bg-[#090C15] overflow-y-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Super Admin Overwatch Dashboard</h1>
              <p className="text-xs text-slate-400">Platform-wide Software House organization management and analytics</p>
            </div>
            <button
              onClick={() => setIsNewOrgModalOpen(true)}
              className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-lg shadow-purple-600/30"
            >
              + Create Software House (Organization)
            </button>
          </div>

          {/* Platform Analytics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#0F1422] border border-slate-800 rounded-xl p-4">
              <span className="text-xs text-slate-400 font-bold uppercase">Software Houses</span>
              <p className="text-3xl font-black text-white mt-1">{organizations.length}</p>
            </div>
            <div className="bg-[#0F1422] border border-slate-800 rounded-xl p-4">
              <span className="text-xs text-slate-400 font-bold uppercase">Total Platform Users</span>
              <p className="text-3xl font-black text-purple-400 mt-1">{users.length}</p>
            </div>
            <div className="bg-[#0F1422] border border-slate-800 rounded-xl p-4">
              <span className="text-xs text-slate-400 font-bold uppercase">Total Projects</span>
              <p className="text-3xl font-black text-indigo-400 mt-1">{projects.length}</p>
            </div>
            <div className="bg-[#0F1422] border border-slate-800 rounded-xl p-4">
              <span className="text-xs text-slate-400 font-bold uppercase">Total Reported Bugs</span>
              <p className="text-3xl font-black text-blue-400 mt-1">{issues.length}</p>
            </div>
          </div>

          {/* Software House Management Table */}
          <div className="bg-[#0F1422] border border-slate-800 rounded-xl overflow-hidden text-xs">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-sm text-white">Registered Software Houses (Organizations)</h3>
              <span className="text-slate-400 text-xs font-mono">{organizations.length} Active Tenants</span>
            </div>

            <table className="w-full text-left text-slate-300">
              <thead className="bg-[#141A2A] text-slate-400 uppercase font-bold text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3">Logo</th>
                  <th className="p-3">Organization Name</th>
                  <th className="p-3">Slug / Domain</th>
                  <th className="p-3">Org Admin</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Created</th>
                  <th className="p-3 text-right">Super Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {organizations.map((org) => {
                  const orgAdmin = users.find((u) => u.orgId === org.id && u.role === "ORGANIZATION_ADMIN");
                  return (
                    <tr key={org.id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-bold text-purple-400">{org.logo}</td>
                      <td className="p-3 font-bold text-white">{org.name}</td>
                      <td className="p-3 text-slate-400 font-mono">{org.slug} ({org.domain})</td>
                      <td className="p-3 font-medium text-slate-200">{orgAdmin ? `${orgAdmin.name} (${orgAdmin.email})` : "Unassigned"}</td>
                      <td className="p-3">
                        <span
                          className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${
                            org.status === "ACTIVE"
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                              : "bg-red-500/20 text-red-300 border-red-500/30"
                          }`}
                        >
                          {org.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500 font-mono text-[10px]">{org.createdAt}</td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => handleToggleOrgStatus(org.id)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-[11px]"
                        >
                          {org.status === "ACTIVE" ? "Suspend Org" : "Activate Org"}
                        </button>
                        <button
                          onClick={() => handleDeleteOrg(org.id)}
                          className="px-2.5 py-1 rounded bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 font-semibold text-[11px]"
                        >
                          Delete Org
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* ROLE DASHBOARD VIEW 2: TENANT DASHBOARDS (ORG ADMIN / TECH LEAD / DEV / QA / VIEWER) */
        /* ========================================================================= */
        <div className="flex-1 bg-[#090C15] overflow-y-auto p-6 space-y-5">
          {/* Header Controls & Filters */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {currentOrg.name} Dashboard
              </h2>
              <p className="text-xs text-slate-400">
                Tenant Isolated Workspace | {tenantProjects.length} Projects | {tenantIssues.length} Issues
              </p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={selectedProjectKey}
                onChange={(e) => setSelectedProjectKey(e.target.value)}
                className="bg-[#0F1422] border border-slate-700 rounded px-3 py-1.5 text-xs text-white focus:outline-none"
              >
                <option value="ALL">All Tenant Projects</option>
                {tenantProjects.map((p) => (
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
                className="bg-[#0F1422] border border-slate-700 rounded px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none w-56"
              />

              {canCreateProjects && (
                <button
                  onClick={() => setIsNewProjectModalOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded"
                >
                  + Add Project
                </button>
              )}

              {!isViewer && !isDev && (
                <button
                  onClick={() => setIsNewIssueModalOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded"
                >
                  + Create Issue
                </button>
              )}

              {(isOrgAdmin || isSuperAdmin) && (
                <button
                  onClick={() => setIsNewUserModalOpen(true)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold px-3 py-1.5 rounded"
                >
                  + Add Org User
                </button>
              )}
            </div>
          </div>

          {/* Multi-Tenant Data Isolation Kanban Board */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {STATUSES.map((statusKey) => {
              const colIssues = filteredIssues.filter((i) => i.status === statusKey);
              return (
                <div
                  key={statusKey}
                  className="bg-[#0F1422] border border-slate-800 rounded-xl p-3 flex flex-col min-h-[500px]"
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
                        onClick={() => setSelectedIssueDetail(issue)}
                        className="bg-[#141A2A] border border-slate-800 hover:border-indigo-500/60 rounded-xl p-3 cursor-pointer transition space-y-2"
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

                        <p className="text-xs font-semibold text-white leading-snug line-clamp-2">
                          {issue.title}
                        </p>

                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                          <span>Assignee: {getUserName(issue.assigneeId)}</span>
                          <select
                            disabled={isViewer}
                            value={issue.status}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleUpdateStatus(issue.id, e.target.value);
                            }}
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
                      <div className="h-24 border border-dashed border-slate-800 rounded-xl flex items-center justify-center text-[11px] text-slate-600 font-medium">
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
      {/* MODAL 1: CREATE SOFTWARE HOUSE (SUPER ADMIN ONLY) */}
      {/* ========================================================================= */}
      {isNewOrgModalOpen && isSuperAdmin && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#0F1422] border border-slate-800 rounded-xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white">Create Software House (Organization)</h3>
              <button onClick={() => setIsNewOrgModalOpen(false)} className="text-slate-400 hover:text-white font-bold">
                Close
              </button>
            </div>

            <form onSubmit={handleCreateSoftwareHouse} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Organization Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Antigravity Systems"
                  value={newOrg.name}
                  onChange={(e) => setNewOrg({ ...newOrg, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Slug Code</label>
                  <input
                    type="text"
                    required
                    placeholder="antigravity"
                    value={newOrg.slug}
                    onChange={(e) => setNewOrg({ ...newOrg, slug: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Domain</label>
                  <input
                    type="text"
                    placeholder="antigravity.com"
                    value={newOrg.domain}
                    onChange={(e) => setNewOrg({ ...newOrg, domain: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <span className="block font-bold text-purple-400 mb-2">Initial Organization Admin User Provisioning</span>
                <div className="space-y-2">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Admin Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Admin Antigravity"
                      value={newOrg.adminName}
                      onChange={(e) => setNewOrg({ ...newOrg, adminName: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Admin Email</label>
                    <input
                      type="email"
                      required
                      placeholder="admin@antigravity.com"
                      value={newOrg.adminEmail}
                      onChange={(e) => setNewOrg({ ...newOrg, adminEmail: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Temporary Password</label>
                    <input
                      type="password"
                      required
                      placeholder="********"
                      value={newOrg.adminPassword}
                      onChange={(e) => setNewOrg({ ...newOrg, adminPassword: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsNewOrgModalOpen(false)} className="px-3 py-1.5 text-slate-400">
                  Cancel
                </button>
                <button type="submit" className="bg-purple-600 text-white font-bold px-4 py-1.5 rounded">
                  Provision Software House
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ISSUE DETAIL & STRICT BUG ASSIGNMENT CONTROL */}
      {/* ========================================================================= */}
      {selectedIssueDetail && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#0F1422] border border-slate-800 rounded-xl w-full max-w-lg p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm text-indigo-400">{selectedIssueDetail.id}</span>
                <span className="text-xs text-slate-400">[{selectedIssueDetail.projectKey}]</span>
              </div>
              <button onClick={() => setSelectedIssueDetail(null)} className="text-slate-400 hover:text-white font-bold text-xs">
                Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <h3 className="text-sm font-bold text-white leading-snug">{selectedIssueDetail.title}</h3>
              <p className="text-slate-300 p-3 rounded bg-slate-900 border border-slate-800">{selectedIssueDetail.description}</p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Status</label>
                  <select
                    disabled={isViewer}
                    value={selectedIssueDetail.status}
                    onChange={(e) => handleUpdateStatus(selectedIssueDetail.id, e.target.value)}
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
                  <label className="block text-slate-400 font-semibold mb-1">
                    Assignee {canAssignBugs ? "(Admin/Tech Lead Editable)" : "(Restricted - Admin/Tech Lead Only)"}
                  </label>
                  <select
                    disabled={!canAssignBugs}
                    value={selectedIssueDetail.assigneeId}
                    onChange={(e) => handleReassignIssue(selectedIssueDetail.id, e.target.value)}
                    className={`w-full bg-slate-900 border border-slate-700 text-white rounded p-2 focus:outline-none ${
                      !canAssignBugs ? "opacity-60 cursor-not-allowed" : "font-bold text-indigo-300"
                    }`}
                  >
                    {tenantUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
              {canDeleteProjects ? (
                <button
                  onClick={() => {
                    setIssues(issues.filter((i) => i.id !== selectedIssueDetail.id));
                    setSelectedIssueDetail(null);
                  }}
                  className="text-red-400 font-bold hover:underline"
                >
                  Delete Issue
                </button>
              ) : (
                <span className="text-slate-500">Bug Assignment Protected</span>
              )}
              <button onClick={() => setSelectedIssueDetail(null)} className="bg-indigo-600 text-white px-4 py-1.5 rounded font-bold">
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: CREATE PROJECT */}
      {/* ========================================================================= */}
      {isNewProjectModalOpen && canCreateProjects && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#0F1422] border border-slate-800 rounded-xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white">Create New Project</h3>
              <button onClick={() => setIsNewProjectModalOpen(false)} className="text-slate-400 hover:text-white font-bold">
                Close
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Core Engine"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Project Key</label>
                <input
                  type="text"
                  required
                  placeholder="ENG"
                  maxLength={10}
                  value={newProject.key}
                  onChange={(e) => setNewProject({ ...newProject, key: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono uppercase focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows="2"
                  placeholder="Project details..."
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:outline-none"
                />
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
      {/* MODAL 4: CREATE ISSUE */}
      {/* ========================================================================= */}
      {isNewIssueModalOpen && !isViewer && !isDev && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#0F1422] border border-slate-800 rounded-xl w-full max-w-lg p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white">Create New Issue Ticket</h3>
              <button onClick={() => setIsNewIssueModalOpen(false)} className="text-slate-400 hover:text-white font-bold">
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
                    {tenantProjects.map((p) => (
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
                  <label className="block font-semibold text-slate-300 mb-1">
                    Select Assignee {canAssignBugs ? "" : "(Org Admin / Tech Lead Only)"}
                  </label>
                  <select
                    disabled={!canAssignBugs}
                    value={newIssue.assigneeId}
                    onChange={(e) => setNewIssue({ ...newIssue, assigneeId: e.target.value })}
                    className={`w-full bg-slate-900 border border-slate-700 text-white rounded p-2 focus:outline-none ${
                      !canAssignBugs ? "opacity-50 cursor-not-allowed" : "font-bold text-indigo-300"
                    }`}
                  >
                    {tenantUsers.map((u) => (
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
                  Create Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: ADD TENANT USER (ORG ADMIN ONLY) */}
      {/* ========================================================================= */}
      {isNewUserModalOpen && (isOrgAdmin || isSuperAdmin) && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#0F1422] border border-slate-800 rounded-xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white">Add User to {currentOrg.name}</h3>
              <button onClick={() => setIsNewUserModalOpen(false)} className="text-slate-400 hover:text-white font-bold">
                Close
              </button>
            </div>

            <form onSubmit={handleAddOrgUser} className="space-y-3 text-xs">
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
                <label className="block font-semibold text-slate-300 mb-1">Assign Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:outline-none"
                >
                  <option value="TECH_LEAD">TECH_LEAD</option>
                  <option value="DEVELOPER">DEVELOPER</option>
                  <option value="QA">QA</option>
                  <option value="VIEWER">VIEWER</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsNewUserModalOpen(false)} className="px-3 py-1.5 text-slate-400">
                  Cancel
                </button>
                <button type="submit" className="bg-indigo-600 text-white font-bold px-4 py-1.5 rounded">
                  Add Organization User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}