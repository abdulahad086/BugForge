import React, { useState } from "react";
import RippleGrid from "./RippleGrid";
import FluidGlass from "./FluidGlass";

// Pre-seeded Software Companies
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

// Pre-seeded Authorized Accounts (Email & Password)
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
  // Eprecisio Tech Lead & Assignees (Dev & QA)
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
    name: "David Kim (Dev)",
    email: "david@eprecisio.com",
    password: "password123",
    role: "ASSIGNEE",
  },
  {
    id: "usr-ep-dev2",
    companyId: "comp-eprecisio",
    name: "Maria Garcia (QA)",
    email: "maria@eprecisio.com",
    password: "password123",
    role: "ASSIGNEE",
  },
  // Antigravity Tech Lead & Assignees
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
    name: "John Reese (Dev)",
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
    name: "Enterprise Core Backend",
    description: "High performance microservices engine",
  },
  {
    id: "prj-ag1",
    companyId: "comp-antigravity",
    key: "ANTI",
    name: "AI Agentic Framework",
    description: "Autonomous LLM trajectory engine",
  },
];

// High-Res SVG Image Mock Data URLs for Screenshots
const DEMO_SCREENSHOT_1 = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'><rect width='800' height='450' fill='%230f172a'/><rect x='40' y='40' width='720' height='60' rx='8' fill='%231e293b'/><text x='70' y='75' fill='%23ef4444' font-family='sans-serif' font-weight='bold' font-size='18'>HTTP 504 Gateway Timeout - Broken Navigation &amp; Connection Exhaustion</text><rect x='40' y='120' width='720' height='290' rx='8' fill='%231e293b'/><text x='70' y='160' fill='%2394a3b8' font-family='monospace' font-size='14'>StackTrace: connection slot allocation timeout after 5000ms</text><text x='70' y='190' fill='%2394a3b8' font-family='monospace' font-size='14'>at asyncpg.pool.acquire() line 142</text><text x='70' y='220' fill='%2338bdf8' font-family='monospace' font-size='14'>Status: 500 Internal Server Error [CLICK IMAGE TO ENLARGE]</text></svg>";

const DEMO_SCREENSHOT_2 = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'><rect width='800' height='450' fill='%230b0f19'/><rect x='30' y='30' width='740' height='390' rx='10' fill='%23111827' stroke='%23374151'/><text x='60' y='80' fill='%23f59e0b' font-family='sans-serif' font-weight='bold' font-size='20'>Vector Indexing Latency Spike Trace</text><rect x='60' y='110' width='680' height='260' rx='6' fill='%231f2937'/><text x='90' y='160' fill='%2310b981' font-family='monospace' font-size='15'>Latency: 285ms (Threshold: 50ms)</text><text x='90' y='200' fill='%23ef4444' font-family='monospace' font-size='15'>Worker Thread Deadlock in AST indexing loop</text></svg>";

// Pre-seeded Bugs matching 12-field schema
const INITIAL_BUGS = [
  {
    id: "BUG-001",
    companyId: "comp-eprecisio",
    projectKey: "EPREC",
    category: "Functional",
    title: "Broken navigation links on corporate portal footer",
    stepsToReproduce: "1. Open homepage\n2. Scroll to footer\n3. Click the About page links and footer social icons.",
    expectedResult: "Each link should open the correct page or social media profile.",
    actualResult: "Several links do not navigate anywhere.",
    impact: "Users cannot reach intended pages; reduces site credibility and trust.",
    severity: "Low",
    priority: "P4 - Low",
    status: "To Do",
    evidence: DEMO_SCREENSHOT_1,
    notes: "Requires footer navigation link target updates.",
    assigneeEmail: "david@eprecisio.com",
    createdBy: "lead@eprecisio.com",
  },
  {
    id: "BUG-002",
    companyId: "comp-eprecisio",
    projectKey: "EPREC",
    category: "Performance",
    title: "Database connection pool exhaustion under 10k RPS load",
    stepsToReproduce: "1. Trigger JMeter load test with 10,000 threads\n2. Observe backend health check endpoint.",
    expectedResult: "Connection pool recycles slots with sub-50ms latency.",
    actualResult: "Asyncpg pool exhausts slots causing 504 Gateway Timeouts.",
    impact: "Checkout API service crashes during peak traffic sales events.",
    severity: "Critical",
    priority: "P1 - Urgent",
    status: "In Progress",
    evidence: DEMO_SCREENSHOT_1,
    notes: "Requires asyncpg max_overflow increase and Redis caching.",
    assigneeEmail: "david@eprecisio.com",
    createdBy: "lead@eprecisio.com",
  },
  {
    id: "BUG-003",
    companyId: "comp-antigravity",
    projectKey: "ANTI",
    category: "Backend/API",
    title: "Vector database indexing latency delay",
    stepsToReproduce: "1. Send trajectory batch payload\n2. Query vector index within 100ms.",
    expectedResult: "Vector index updates synchronously.",
    actualResult: "Redis vector store indexing delays response by 250ms.",
    impact: "Agent trajectory memory lookup times out.",
    severity: "Major",
    priority: "P2 - High",
    status: "In Review",
    evidence: DEMO_SCREENSHOT_2,
    notes: "Investigating worker thread event loop queue.",
    assigneeEmail: "john@antigravity.com",
    createdBy: "lead@antigravity.com",
  },
];

const BUG_CATEGORIES = ["Functional", "UI/UX", "Security", "Performance", "Backend/API", "Integration", "Database"];
const SEVERITY_LEVELS = ["Blocker", "Critical", "Major", "Minor", "Low"];
const PRIORITY_LEVELS = ["P1 - Urgent", "P2 - High", "P3 - Medium", "P4 - Low"];
const BUG_STATUSES = ["To Do", "In Progress", "In Review", "Resolved", "Closed"];

export default function App() {
  // Master State
  const [companies, setCompanies] = useState(INITIAL_COMPANIES);
  const [users, setUsers] = useState(INITIAL_USERS);
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [bugs, setBugs] = useState(INITIAL_BUGS);

  // Authentication State
  const [currentUser, setCurrentUser] = useState(null); // Default null: show Login Screen first
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // View Layout State: 'KANBAN' vs 'TABLE'
  const [bugLayoutView, setBugLayoutView] = useState("KANBAN");

  // Navigation & Search
  const [activeTab, setActiveTab] = useState("COMPANIES");
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

  // Fullscreen Lightbox Modal State
  const [expandedImageSrc, setExpandedImageSrc] = useState(null);

  // Change Password Modal State
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordMessage, setPasswordMessage] = useState({ type: "", text: "" });

  // Form Inputs
  const [companyForm, setCompanyForm] = useState({ name: "", techLeadName: "", techLeadEmail: "", techLeadPassword: "" });
  const [projectForm, setProjectForm] = useState({ key: "", name: "", description: "" });
  const [assigneeForm, setAssigneeForm] = useState({ name: "", email: "", password: "" });

  // 12-Field Bug Form
  const [bugForm, setBugForm] = useState({
    projectKey: "",
    category: "Functional",
    title: "",
    stepsToReproduce: "",
    expectedResult: "",
    actualResult: "",
    impact: "",
    severity: "Minor",
    priority: "P3 - Medium",
    status: "To Do",
    evidence: "",
    notes: "",
    assigneeEmail: "",
  });

  // Handle Login Authentication
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError("");

    const inputEmail = authEmail.trim().toLowerCase();
    const foundUser = users.find(
      (u) => u.email.toLowerCase() === inputEmail && u.password === authPassword
    );

    if (!foundUser) {
      setLoginError("Invalid email address or password. Please try again.");
      return;
    }

    setCurrentUser(foundUser);
    setAuthEmail("");
    setAuthPassword("");

    if (foundUser.role === "SUPER_ADMIN") setActiveTab("COMPANIES");
    else if (foundUser.role === "TECH_LEAD") setActiveTab("PROJECTS");
    else setActiveTab("BUGS");
  };

  // Handle Logout
  const handleLogout = () => {
    setCurrentUser(null);
    setLoginError("");
  };

  // Change Password Action
  const handleChangePasswordSubmit = (e) => {
    e.preventDefault();
    setPasswordMessage({ type: "", text: "" });

    if (passwordForm.currentPassword !== currentUser.password) {
      setPasswordMessage({ type: "error", text: "Current password does not match." });
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordMessage({ type: "error", text: "New password must be at least 6 characters." });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({ type: "error", text: "New passwords do not match." });
      return;
    }

    setUsers(
      users.map((u) => (u.id === currentUser.id ? { ...u, password: passwordForm.newPassword } : u))
    );
    setCurrentUser({ ...currentUser, password: passwordForm.newPassword });

    setPasswordMessage({ type: "success", text: "Password updated successfully!" });
    setTimeout(() => {
      setIsChangePasswordModalOpen(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordMessage({ type: "", text: "" });
    }, 1500);
  };

  // Handle Screenshot File Upload / Paste Box
  const handleImageFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setBugForm({ ...bugForm, evidence: uploadEvent.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImagePaste = (e) => {
    const items = e.clipboardData && e.clipboardData.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          const reader = new FileReader();
          reader.onload = (pasteEvent) => {
            setBugForm({ ...bugForm, evidence: pasteEvent.target.result });
          };
          reader.readAsDataURL(file);
          break;
        }
      }
    }
  };

  // Role Checks
  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";
  const isTechLead = currentUser?.role === "TECH_LEAD";
  const isAssignee = currentUser?.role === "ASSIGNEE";

  // Data Isolation: Company Level Scoping
  const userCompany = companies.find((c) => c.id === currentUser?.companyId);

  const scopedProjects = projects.filter((p) => p.companyId === currentUser?.companyId);
  const scopedAssignees = users.filter((u) => u.companyId === currentUser?.companyId && u.role === "ASSIGNEE");

  // SHARED COMPANY PROJECT BUGS BOARD
  const scopedBugs = bugs.filter((b) => b.companyId === currentUser?.companyId);

  const filteredBugs = scopedBugs.filter((b) => {
    const matchesProj = selectedProjectKey === "ALL" || b.projectKey === selectedProjectKey;
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProj && matchesSearch;
  });

  // Actions: Super Admin Companies
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
    if (!window.confirm("Delete software company and all associated data?")) return;
    setCompanies(companies.filter((c) => c.id !== compId));
    setUsers(users.filter((u) => u.companyId !== compId));
    setProjects(projects.filter((p) => p.companyId !== compId));
    setBugs(bugs.filter((b) => b.companyId !== compId));
  };

  // Actions: Tech Lead Projects
  const handleSaveProject = (e) => {
    e.preventDefault();
    if (!isTechLead) return;

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
    if (!isTechLead) return;
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
    if (!isTechLead) return;

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
    if (!isTechLead) return;
    if (!window.confirm("Remove assignee email from company?")) return;
    setUsers(users.filter((u) => u.id !== userId));
  };

  // Actions: Create Bug
  const handleSaveBug = (e) => {
    e.preventDefault();
    if (!isTechLead && !isAssignee) return;

    const targetProjKey = bugForm.projectKey || (scopedProjects[0]?.key || "EPREC");
    const targetAssignee = bugForm.assigneeEmail || (scopedAssignees[0]?.email || currentUser.email);

    const bugNum = String(scopedBugs.length + 1).padStart(3, "0");
    const newBug = {
      id: `BUG-${bugNum}`,
      companyId: currentUser.companyId,
      projectKey: targetProjKey,
      category: bugForm.category,
      title: bugForm.title.trim(),
      stepsToReproduce: bugForm.stepsToReproduce.trim(),
      expectedResult: bugForm.expectedResult.trim(),
      actualResult: bugForm.actualResult.trim(),
      impact: bugForm.impact.trim(),
      severity: bugForm.severity,
      priority: bugForm.priority,
      status: bugForm.status || "To Do",
      evidence: bugForm.evidence || DEMO_SCREENSHOT_1,
      notes: bugForm.notes.trim() || "N/A",
      assigneeEmail: targetAssignee,
      createdBy: currentUser.email,
    };

    setBugs([newBug, ...bugs]);
    setBugForm({
      projectKey: "",
      category: "Functional",
      title: "",
      stepsToReproduce: "",
      expectedResult: "",
      actualResult: "",
      impact: "",
      severity: "Minor",
      priority: "P3 - Medium",
      status: "To Do",
      evidence: "",
      notes: "",
      assigneeEmail: "",
    });
    setIsAddBugModalOpen(false);
  };

  // Status Update
  const handleUpdateBugStatus = (bugId, newStatus) => {
    setBugs(bugs.map((b) => (b.id === bugId ? { ...b, status: newStatus } : b)));
    if (selectedBugDetail && selectedBugDetail.id === bugId) {
      setSelectedBugDetail({ ...selectedBugDetail, status: newStatus });
    }
  };

  // =========================================================================
  // SCREEN 1: LOGIN SCREEN WITH RIPPLEGRID & FLUIDGLASS BACKGROUND
  // =========================================================================
  if (!currentUser) {
    return (
      <div className="w-full h-screen bg-[#090c15] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
        {/* REACT BITS DUAL ANIMATED BACKGROUND: RIPPLEGRID + FLUIDGLASS */}
        <RippleGrid
          enableRainbow={false}
          gridColor="#6366f1"
          rippleIntensity={0.06}
          gridSize={12}
          gridThickness={16}
          mouseInteraction={true}
          mouseInteractionRadius={1.2}
          opacity={0.65}
        />
        <FluidGlass
          mode="lens"
          lensProps={{
            scale: 0.35,
            ior: 1.25,
            thickness: 6,
            chromaticAberration: 0.2,
            anisotropy: 0.02,
          }}
        />

        {/* ULTRA-PROMINENT LIQUID GLASS MODAL */}
        <div className="w-full max-w-md glass-modal rounded-2xl p-7 space-y-6 z-10">
          <div className="text-center space-y-2">
            <div className="w-11 h-11 rounded-xl bg-indigo-600 font-black text-white text-sm flex items-center justify-center mx-auto shadow-lg shadow-indigo-600/50">
              BF
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">BugForge Enterprise Login</h1>
            <p className="text-xs text-slate-400">Enter authorized email address and password</p>
          </div>

          {loginError && (
            <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/40 text-red-200 text-xs font-semibold text-center">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Email Address</label>
              <input
                type="email"
                required
                placeholder="your.email@company.com"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                className="w-full glass-input rounded-lg p-2.5 text-white font-mono text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Password</label>
              <input
                type="password"
                required
                placeholder="Enter password..."
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                className="w-full glass-input rounded-lg p-2.5 text-white text-xs focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-lg text-xs transition shadow-lg shadow-indigo-600/40 cursor-pointer"
            >
              Log In to Workspace
            </button>
          </form>
        </div>
      </div>
    );
  }

  // =========================================================================
  // SCREEN 2: AUTHENTICATED WORKSPACE WITH RIPPLEGRID & FLUIDGLASS BACKGROUND
  // =========================================================================
  return (
    <div className="w-full h-screen bg-[#090c15] text-slate-100 font-sans flex flex-col overflow-hidden relative">
      {/* REACT BITS DUAL ANIMATED BACKGROUND: RIPPLEGRID + FLUIDGLASS */}
      <RippleGrid
        enableRainbow={false}
        gridColor="#4f46e5"
        rippleIntensity={0.04}
        gridSize={14}
        gridThickness={14}
        mouseInteraction={true}
        mouseInteractionRadius={1.0}
        opacity={0.45}
      />
      <FluidGlass
        mode="lens"
        lensProps={{
          scale: 0.35,
          ior: 1.2,
          thickness: 5,
          chromaticAberration: 0.15,
          anisotropy: 0.015,
        }}
      />

      {/* GLASS HEADER */}
      <header className="h-14 glass-header px-5 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-md shadow-indigo-600/40">
              BF
            </div>
            <span className="font-bold text-sm text-white tracking-tight">BugForge SaaS</span>
          </div>

          <nav className="flex items-center gap-1 text-xs font-semibold">
            {isSuperAdmin && (
              <button
                onClick={() => setActiveTab("COMPANIES")}
                className="px-3 py-1.5 rounded-lg bg-purple-600 text-white font-bold cursor-pointer"
              >
                Software Companies ({companies.length})
              </button>
            )}

            {isTechLead && (
              <>
                <button
                  onClick={() => setActiveTab("PROJECTS")}
                  className={`px-3 py-1.5 rounded-lg cursor-pointer ${
                    activeTab === "PROJECTS" ? "bg-indigo-600 text-white font-bold" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Projects ({scopedProjects.length})
                </button>
                <button
                  onClick={() => setActiveTab("BUGS")}
                  className={`px-3 py-1.5 rounded-lg cursor-pointer ${
                    activeTab === "BUGS" ? "bg-indigo-600 text-white font-bold" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Shared Bug Board ({scopedBugs.length})
                </button>
                <button
                  onClick={() => setActiveTab("ASSIGNEES")}
                  className={`px-3 py-1.5 rounded-lg cursor-pointer ${
                    activeTab === "ASSIGNEES" ? "bg-indigo-600 text-white font-bold" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Team Assignees ({scopedAssignees.length})
                </button>
              </>
            )}

            {isAssignee && (
              <button
                onClick={() => setActiveTab("BUGS")}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold cursor-pointer"
              >
                Shared Team Bug Board ({scopedBugs.length})
              </button>
            )}
          </nav>
        </div>

        {/* IDENTITY & CHANGE PASSWORD */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-2 glass-panel px-3 py-1 rounded-lg">
            <span className="text-slate-400">Logged in as:</span>
            <span className="font-bold text-white">{currentUser.name}</span>
            <span className="font-mono text-indigo-300 text-[11px]">({currentUser.email})</span>
          </div>

          <button
            onClick={() => {
              setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
              setPasswordMessage({ type: "", text: "" });
              setIsChangePasswordModalOpen(true);
            }}
            className="text-slate-300 hover:text-white glass-panel px-3 py-1 rounded-lg font-bold cursor-pointer"
          >
            Change Password
          </button>

          <button
            onClick={handleLogout}
            className="text-slate-400 hover:text-red-400 glass-panel px-3 py-1 rounded-lg font-bold cursor-pointer"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Role Banner Notice */}
      <div
        className={`px-5 py-1.5 text-xs font-semibold border-b flex items-center justify-between z-10 glass-header ${
          isSuperAdmin
            ? "text-purple-300"
            : isTechLead
            ? "text-indigo-300"
            : "text-slate-400"
        }`}
      >
        <span>
          {isSuperAdmin
            ? "SUPER ADMIN WORKSPACE: Software company management ONLY. Internal tenant data is private."
            : isTechLead
            ? `TECH LEAD WORKSPACE (${userCompany?.name}): Projects, team assignee emails, bug creation & assignment.`
            : `TEAM MEMBER WORKSPACE (${currentUser.name} - ${currentUser.email}): Shared company board view. You can create & report bugs and update bug lifecycle statuses.`}
        </span>
        <span className="font-mono text-[10px] uppercase font-bold">
          Tenant: {isSuperAdmin ? "GLOBAL SYSTEM" : userCompany?.name} | Role: {currentUser.role}
        </span>
      </div>

      {/* MAIN WORKSPACE CONTENT CONTAINER OVERLAY */}
      <main className="flex-1 bg-transparent overflow-y-auto p-6 z-10">
        {/* VIEW 1: SUPER ADMIN COMPANIES */}
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
                className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer shadow-lg shadow-purple-600/30"
              >
                + Add Software Company (Super Admin)
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {companies.map((comp) => (
                <div key={comp.id} className="glass-panel rounded-xl p-5 space-y-3">
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
                        className="text-indigo-400 font-bold hover:underline cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCompany(comp.id)}
                        className="text-red-400 font-bold hover:underline cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="p-3 glass-card rounded-lg text-xs space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      Authorized Tech Lead Login Email
                    </span>
                    <div className="font-bold text-white">{comp.techLeadName}</div>
                    <div className="font-mono text-indigo-300">{comp.techLeadEmail}</div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex justify-between text-xs text-slate-400">
                    <span>Registered: {comp.createdAt}</span>
                    <span className="text-emerald-400 font-mono text-[11px]">ACTIVE TENANT</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 2: TECH LEAD PROJECTS */}
        {activeTab === "PROJECTS" && isTechLead && (
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
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer shadow-lg shadow-indigo-600/30"
              >
                + Add Project (Tech Lead)
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {scopedProjects.map((p) => {
                const projBugs = bugs.filter((b) => b.projectKey === p.key && b.companyId === p.companyId);
                return (
                  <div key={p.id} className="glass-panel rounded-xl p-4 space-y-3">
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
                          className="text-indigo-400 font-bold hover:underline cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProject(p.id)}
                          className="text-red-400 font-bold hover:underline cursor-pointer"
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
                        className="text-indigo-400 font-bold hover:underline cursor-pointer"
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

        {/* VIEW 3: TECH LEAD ASSIGNEE EMAILS */}
        {activeTab === "ASSIGNEES" && isTechLead && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Team Assignees (Developers & QA)</h2>
                <p className="text-xs text-slate-400">
                  Add and manage authorized developer and QA emails for {userCompany?.name}
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingAssignee(null);
                  setAssigneeForm({ name: "", email: "", password: "" });
                  setIsAddAssigneeModalOpen(true);
                }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer shadow-lg shadow-indigo-600/30"
              >
                + Add Assignee Email (Tech Lead)
              </button>
            </div>

            <div className="glass-panel rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left text-slate-300">
                <thead className="bg-[#141a2a]/90 text-slate-400 uppercase font-bold text-[10px] border-b border-slate-800">
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
                            className="text-indigo-400 font-bold hover:underline cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteAssignee(u.id)}
                            className="text-red-400 font-bold hover:underline cursor-pointer"
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

        {/* VIEW 4: SHARED COMPANY BUG BOARD */}
        {activeTab === "BUGS" && (isTechLead || isAssignee) && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <select
                  value={selectedProjectKey}
                  onChange={(e) => setSelectedProjectKey(e.target.value)}
                  className="glass-input rounded px-3 py-1.5 text-xs text-white focus:outline-none"
                >
                  <option value="ALL">All Company Projects ({scopedProjects.length})</option>
                  {scopedProjects.map((p) => (
                    <option key={p.key} value={p.key}>
                      [{p.key}] {p.name}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Search by ID, Title, Category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="glass-input rounded px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none w-64"
                />

                {/* VIEW LAYOUT TOGGLE */}
                <div className="flex glass-panel p-0.5 rounded-lg text-xs font-bold">
                  <button
                    onClick={() => setBugLayoutView("KANBAN")}
                    className={`px-3 py-1 rounded-md transition cursor-pointer ${
                      bugLayoutView === "KANBAN"
                        ? "bg-indigo-600 text-white"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Jira Kanban Board
                  </button>
                  <button
                    onClick={() => setBugLayoutView("TABLE")}
                    className={`px-3 py-1 rounded-md transition cursor-pointer ${
                      bugLayoutView === "TABLE"
                        ? "bg-indigo-600 text-white"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Data Table Register
                  </button>
                </div>
              </div>

              <button
                onClick={() => setIsAddBugModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-lg shadow-indigo-600/30 cursor-pointer"
              >
                + Create Bug Ticket ({isTechLead ? "Tech Lead" : "Dev / QA"})
              </button>
            </div>

            {/* JIRA STYLE KANBAN COLUMNS BOARD */}
            {bugLayoutView === "KANBAN" ? (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {BUG_STATUSES.map((statusKey) => {
                  const colBugs = filteredBugs.filter((b) => b.status === statusKey);
                  return (
                    <div
                      key={statusKey}
                      className="glass-panel rounded-xl p-3 flex flex-col min-h-[520px]"
                    >
                      <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
                        <span className="font-bold text-xs text-slate-300 uppercase tracking-wider">
                          {statusKey}
                        </span>
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          {colBugs.length}
                        </span>
                      </div>

                      <div className="flex-1 space-y-2.5">
                        {colBugs.map((bug) => (
                          <div
                            key={bug.id}
                            onClick={() => setSelectedBugDetail(bug)}
                            className="glass-card rounded-xl p-3 cursor-pointer space-y-2.5"
                          >
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-mono font-bold text-indigo-400">{bug.id}</span>
                              <span
                                className={`font-bold px-1.5 py-0.5 rounded ${
                                  bug.priority.includes("P1") || bug.priority.includes("Urgent")
                                    ? "bg-red-500/20 text-red-300 border border-red-500/30"
                                    : bug.priority.includes("P2") || bug.priority.includes("High")
                                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                    : "bg-slate-800 text-slate-300 border border-slate-700"
                                }`}
                              >
                                {bug.priority}
                              </span>
                            </div>

                            <div className="text-[10px] font-bold text-slate-400 uppercase">
                              [{bug.category}]
                            </div>

                            <p className="text-xs font-semibold text-white leading-snug line-clamp-2">
                              {bug.title}
                            </p>

                            {/* SCREENSHOT THUMBNAIL ON KANBAN CARD */}
                            {bug.evidence && bug.evidence.startsWith("data:image") && (
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedImageSrc(bug.evidence);
                                }}
                                className="relative rounded-lg overflow-hidden border border-slate-700 group cursor-zoom-in"
                              >
                                <img src={bug.evidence} alt="Evidence Screenshot" className="w-full h-20 object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] font-bold text-white transition">
                                  Click to Enlarge Screenshot
                                </div>
                              </div>
                            )}

                            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                              <span className="font-mono text-indigo-300 truncate max-w-[120px]">
                                {bug.assigneeEmail}
                              </span>
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
                          <div className="h-28 border border-dashed border-slate-800 rounded-xl flex items-center justify-center text-[11px] text-slate-600 font-medium">
                            No bugs in {statusKey}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* COMMERCIAL TABLE REGISTER VIEW */
              <div className="glass-panel rounded-xl overflow-hidden text-xs">
                <div className="p-3 border-b border-slate-800 flex justify-between items-center bg-[#141a2a]/90">
                  <h3 className="font-bold text-white">Commercial Bug Tracking Register</h3>
                  <span className="text-slate-400 font-mono text-[11px]">{filteredBugs.length} Reported Issues</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-slate-300 border-collapse">
                    <thead className="bg-[#182032]/90 text-slate-400 uppercase font-bold text-[10px] border-b border-slate-800">
                      <tr>
                        <th className="p-3 whitespace-nowrap">Bug ID</th>
                        <th className="p-3 whitespace-nowrap">Category</th>
                        <th className="p-3 whitespace-nowrap">Title / Summary</th>
                        <th className="p-3 whitespace-nowrap">Severity</th>
                        <th className="p-3 whitespace-nowrap">Priority</th>
                        <th className="p-3 whitespace-nowrap">Status (Lifecycle)</th>
                        <th className="p-3 whitespace-nowrap">Assignee</th>
                        <th className="p-3 whitespace-nowrap">Screenshot Evidence</th>
                        <th className="p-3 text-right whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {filteredBugs.map((bug) => (
                        <tr key={bug.id} className="hover:bg-slate-800/40 transition">
                          <td className="p-3 font-mono font-bold text-indigo-400 whitespace-nowrap">{bug.id}</td>
                          <td className="p-3 whitespace-nowrap font-medium text-slate-300">{bug.category}</td>
                          <td className="p-3 max-w-xs font-semibold text-white">
                            <button
                              onClick={() => setSelectedBugDetail(bug)}
                              className="hover:text-indigo-300 text-left line-clamp-1 cursor-pointer"
                            >
                              {bug.title}
                            </button>
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <span
                              className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                                bug.severity === "Blocker" || bug.severity === "Critical"
                                  ? "bg-red-500/20 text-red-300 border border-red-500/30"
                                  : "bg-slate-800 text-slate-300 border border-slate-700"
                              }`}
                            >
                              {bug.severity}
                            </span>
                          </td>
                          <td className="p-3 whitespace-nowrap font-bold text-slate-300 text-[11px]">{bug.priority}</td>
                          <td className="p-3 whitespace-nowrap">
                            <select
                              value={bug.status}
                              onChange={(e) => handleUpdateBugStatus(bug.id, e.target.value)}
                              className="bg-slate-900 border border-slate-700 text-white rounded px-2 py-1 text-[11px] font-bold focus:outline-none"
                            >
                              {BUG_STATUSES.map((st) => (
                                <option key={st} value={st}>
                                  {st}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="p-3 whitespace-nowrap font-mono text-indigo-300 text-[11px]">{bug.assigneeEmail}</td>
                          <td className="p-3 whitespace-nowrap">
                            {bug.evidence && bug.evidence.startsWith("data:image") ? (
                              <button
                                onClick={() => setExpandedImageSrc(bug.evidence)}
                                className="flex items-center gap-1.5 text-indigo-400 font-bold hover:underline text-[11px] cursor-pointer"
                              >
                                <span>[View Screenshot]</span>
                              </button>
                            ) : (
                              <span className="text-slate-500 text-[10px]">No image</span>
                            )}
                          </td>
                          <td className="p-3 text-right whitespace-nowrap">
                            <button
                              onClick={() => setSelectedBugDetail(bug)}
                              className="text-indigo-400 font-bold hover:underline cursor-pointer"
                            >
                              View Full 12 Fields
                            </button>
                          </td>
                        </tr>
                      ))}

                      {filteredBugs.length === 0 && (
                        <tr>
                          <td colSpan={9} className="p-8 text-center text-slate-500 text-xs">
                            No bugs found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* FULLSCREEN LIGHTBOX MODAL */}
      {expandedImageSrc && (
        <div
          onClick={() => setExpandedImageSrc(null)}
          className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4 cursor-zoom-out backdrop-blur-sm"
        >
          <div className="max-w-5xl w-full max-h-[90vh] flex flex-col items-center space-y-3">
            <div className="flex justify-between w-full text-white text-xs font-bold px-2">
              <span>Enlarged Screenshot Evidence View</span>
              <span>Click anywhere to close</span>
            </div>
            <img
              src={expandedImageSrc}
              alt="Enlarged Screenshot"
              className="max-w-full max-h-[80vh] object-contain rounded-xl border border-slate-700 shadow-2xl bg-slate-900"
            />
          </div>
        </div>
      )}

      {/* CHANGE PASSWORD MODAL */}
      {isChangePasswordModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-modal rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Change Account Password</h3>
              <button
                onClick={() => setIsChangePasswordModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold cursor-pointer"
              >
                Close
              </button>
            </div>

            {passwordMessage.text && (
              <div
                className={`p-3 rounded-lg text-xs font-semibold text-center ${
                  passwordMessage.type === "success"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-red-500/20 text-red-300 border border-red-500/30"
                }`}
              >
                {passwordMessage.text}
              </div>
            )}

            <form onSubmit={handleChangePasswordSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  placeholder="Enter current password..."
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full glass-input rounded-lg p-2.5 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters..."
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full glass-input rounded-lg p-2.5 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Re-enter new password..."
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full glass-input rounded-lg p-2.5 text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsChangePasswordModalOpen(false)}
                  className="px-3 py-1.5 text-slate-400 cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit" className="bg-indigo-600 text-white font-bold px-4 py-2 rounded-lg cursor-pointer">
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD COMPANY */}
      {isAddCompanyModalOpen && isSuperAdmin && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-modal rounded-2xl w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white">
                {editingCompany ? "Edit Software Company" : "Add New Software Company"}
              </h3>
              <button onClick={() => setIsAddCompanyModalOpen(false)} className="text-slate-400 hover:text-white font-bold cursor-pointer">
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
                  className="w-full glass-input rounded-lg p-2 text-white focus:outline-none"
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
                  className="w-full glass-input rounded-lg p-2 text-white focus:outline-none"
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
                  className="w-full glass-input rounded-lg p-2 text-white font-mono focus:outline-none"
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
                    className="w-full glass-input rounded-lg p-2 text-white font-mono focus:outline-none"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsAddCompanyModalOpen(false)} className="px-3 py-1.5 text-slate-400 cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="bg-purple-600 text-white font-bold px-4 py-1.5 rounded-lg cursor-pointer">
                  {editingCompany ? "Update Company" : "Save Company"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD PROJECT */}
      {isAddProjectModalOpen && isTechLead && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-modal rounded-2xl w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white">
                {editingProject ? "Edit Project" : "Add New Project"}
              </h3>
              <button onClick={() => setIsAddProjectModalOpen(false)} className="text-slate-400 hover:text-white font-bold cursor-pointer">
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
                    className="w-full glass-input rounded-lg p-2 text-white font-mono uppercase focus:outline-none"
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
                  className="w-full glass-input rounded-lg p-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows="3"
                  placeholder="Project details..."
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  className="w-full glass-input rounded-lg p-2 text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsAddProjectModalOpen(false)} className="px-3 py-1.5 text-slate-400 cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="bg-indigo-600 text-white font-bold px-4 py-1.5 rounded-lg cursor-pointer">
                  {editingProject ? "Update Project" : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD ASSIGNEE EMAIL */}
      {isAddAssigneeModalOpen && isTechLead && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-modal rounded-2xl w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white">
                {editingAssignee ? "Edit Assignee Email" : "Add Team Assignee Email"}
              </h3>
              <button onClick={() => setIsAddAssigneeModalOpen(false)} className="text-slate-400 hover:text-white font-bold cursor-pointer">
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
                  className="w-full glass-input rounded-lg p-2 text-white focus:outline-none"
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
                  className="w-full glass-input rounded-lg p-2 text-white font-mono focus:outline-none"
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
                    className="w-full glass-input rounded-lg p-2 text-white font-mono focus:outline-none"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsAddAssigneeModalOpen(false)} className="px-3 py-1.5 text-slate-400 cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="bg-indigo-600 text-white font-bold px-4 py-1.5 rounded-lg cursor-pointer">
                  {editingAssignee ? "Update Assignee" : "Add Assignee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: CREATE BUG */}
      {isAddBugModalOpen && (isTechLead || isAssignee) && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-modal rounded-2xl w-full max-w-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">
                Create & Assign Commercial Bug Ticket ({isTechLead ? "Tech Lead" : "Dev / QA"})
              </h3>
              <button onClick={() => setIsAddBugModalOpen(false)} className="text-slate-400 hover:text-white font-bold cursor-pointer">
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
                    className="w-full glass-input rounded-lg p-2 text-white focus:outline-none"
                  >
                    {scopedProjects.map((p) => (
                      <option key={p.key} value={p.key}>
                        [{p.key}] {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={bugForm.category}
                    onChange={(e) => setBugForm({ ...bugForm, category: e.target.value })}
                    className="w-full glass-input rounded-lg p-2 text-white focus:outline-none"
                  >
                    {BUG_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Title / Summary</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Broken navigation links on corporate portal footer"
                  value={bugForm.title}
                  onChange={(e) => setBugForm({ ...bugForm, title: e.target.value })}
                  className="w-full glass-input rounded-lg p-2.5 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Steps to Reproduce</label>
                <textarea
                  rows="3"
                  required
                  placeholder="1. Open homepage&#10;2. Scroll to footer&#10;3. Click link..."
                  value={bugForm.stepsToReproduce}
                  onChange={(e) => setBugForm({ ...bugForm, stepsToReproduce: e.target.value })}
                  className="w-full glass-input rounded-lg p-2.5 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Expected Result</label>
                  <textarea
                    rows="2"
                    placeholder="Each link should open the correct page..."
                    value={bugForm.expectedResult}
                    onChange={(e) => setBugForm({ ...bugForm, expectedResult: e.target.value })}
                    className="w-full glass-input rounded-lg p-2 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Actual Result</label>
                  <textarea
                    rows="2"
                    placeholder="Links do not navigate anywhere..."
                    value={bugForm.actualResult}
                    onChange={(e) => setBugForm({ ...bugForm, actualResult: e.target.value })}
                    className="w-full glass-input rounded-lg p-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Impact</label>
                <input
                  type="text"
                  placeholder="e.g. Users cannot reach intended pages; reduces site credibility"
                  value={bugForm.impact}
                  onChange={(e) => setBugForm({ ...bugForm, impact: e.target.value })}
                  className="w-full glass-input rounded-lg p-2 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Severity</label>
                  <select
                    value={bugForm.severity}
                    onChange={(e) => setBugForm({ ...bugForm, severity: e.target.value })}
                    className="w-full glass-input rounded-lg p-2 text-white focus:outline-none"
                  >
                    {SEVERITY_LEVELS.map((sev) => (
                      <option key={sev} value={sev}>
                        {sev}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Priority</label>
                  <select
                    value={bugForm.priority}
                    onChange={(e) => setBugForm({ ...bugForm, priority: e.target.value })}
                    className="w-full glass-input rounded-lg p-2 text-white focus:outline-none"
                  >
                    {PRIORITY_LEVELS.map((pri) => (
                      <option key={pri} value={pri}>
                        {pri}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Status (Lifecycle)</label>
                  <select
                    value={bugForm.status}
                    onChange={(e) => setBugForm({ ...bugForm, status: e.target.value })}
                    className="w-full glass-input rounded-lg p-2 text-white focus:outline-none font-bold"
                  >
                    {BUG_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* LARGE SCREENSHOT DROPZONE */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Screenshot Evidence (Large Drag/Drop or Paste Image Box)
                </label>
                <div
                  onPaste={handleImagePaste}
                  className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-4 glass-card text-center space-y-2 relative"
                >
                  {bugForm.evidence ? (
                    <div className="space-y-2">
                      <img
                        src={bugForm.evidence}
                        alt="Screenshot Preview"
                        onClick={() => setExpandedImageSrc(bugForm.evidence)}
                        className="max-h-48 mx-auto rounded-lg border border-slate-700 object-contain cursor-zoom-in"
                      />
                      <div className="flex justify-center gap-3 text-xs">
                        <span className="text-emerald-400 font-bold">Screenshot Attached</span>
                        <button
                          type="button"
                          onClick={() => setBugForm({ ...bugForm, evidence: "" })}
                          className="text-red-400 font-bold hover:underline cursor-pointer"
                        >
                          Remove Image
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="cursor-pointer block space-y-1">
                      <div className="text-xs font-bold text-white">
                        Click to Choose Image File or Paste (Ctrl+V / Cmd+V)
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Supports PNG, JPG, WebP screenshot evidence files
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Assign to Team Assignee Email</label>
                <select
                  value={bugForm.assigneeEmail}
                  onChange={(e) => setBugForm({ ...bugForm, assigneeEmail: e.target.value })}
                  className="w-full glass-input rounded-lg p-2 text-white font-bold text-indigo-300 focus:outline-none"
                >
                  {scopedAssignees.map((u) => (
                    <option key={u.id} value={u.email}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Notes</label>
                <input
                  type="text"
                  placeholder="Additional technical notes..."
                  value={bugForm.notes}
                  onChange={(e) => setBugForm({ ...bugForm, notes: e.target.value })}
                  className="w-full glass-input rounded-lg p-2 text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setIsAddBugModalOpen(false)} className="px-3 py-1.5 text-slate-400 cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="bg-indigo-600 text-white font-bold px-4 py-2 rounded-lg cursor-pointer">
                  Create & Assign Bug
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: BUG DETAIL */}
      {selectedBugDetail && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-modal rounded-2xl w-full max-w-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-base text-indigo-400">{selectedBugDetail.id}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                  Category: {selectedBugDetail.category}
                </span>
                <span className="text-xs text-slate-400 font-mono">[{selectedBugDetail.projectKey}]</span>
              </div>
              <button onClick={() => setSelectedBugDetail(null)} className="text-slate-400 hover:text-white font-bold text-xs cursor-pointer">
                Close
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Title / Summary
                </span>
                <h3 className="text-base font-bold text-white leading-snug">{selectedBugDetail.title}</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg glass-card space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Steps to Reproduce
                  </span>
                  <p className="whitespace-pre-line text-slate-300 leading-relaxed">{selectedBugDetail.stepsToReproduce}</p>
                </div>

                <div className="space-y-2">
                  <div className="p-2.5 rounded-lg glass-card">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                      Expected Result
                    </span>
                    <p className="text-slate-300">{selectedBugDetail.expectedResult}</p>
                  </div>
                  <div className="p-2.5 rounded-lg glass-card">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                      Actual Result
                    </span>
                    <p className="text-slate-300">{selectedBugDetail.actualResult}</p>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg glass-card">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                  Impact
                </span>
                <p className="text-slate-300">{selectedBugDetail.impact}</p>
              </div>

              <div className="grid grid-cols-3 gap-3 p-3 rounded-lg glass-panel">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Severity</span>
                  <span className="font-bold text-red-400">{selectedBugDetail.severity}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Priority</span>
                  <span className="font-bold text-amber-400">{selectedBugDetail.priority}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Status (Lifecycle)</span>
                  <select
                    value={selectedBugDetail.status}
                    onChange={(e) => handleUpdateBugStatus(selectedBugDetail.id, e.target.value)}
                    className="w-full glass-input rounded px-2 py-1 font-bold text-indigo-300 focus:outline-none"
                  >
                    {BUG_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* SCREENSHOT EVIDENCE BOX */}
              <div className="p-3 rounded-lg glass-card space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Screenshot Evidence (Click Image to Enlarge Fullscreen)
                </span>
                {selectedBugDetail.evidence && selectedBugDetail.evidence.startsWith("data:image") ? (
                  <div
                    onClick={() => setExpandedImageSrc(selectedBugDetail.evidence)}
                    className="relative rounded-lg overflow-hidden border border-slate-700 group cursor-zoom-in max-h-56 bg-slate-950 flex items-center justify-center p-2"
                  >
                    <img
                      src={selectedBugDetail.evidence}
                      alt="Bug Evidence Screenshot"
                      className="max-h-48 object-contain rounded"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs font-bold text-white transition">
                      Click to View Fullscreen Image
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-400 text-xs font-mono">{selectedBugDetail.evidence || "No screenshot attached."}</p>
                )}
              </div>

              <div className="p-2.5 rounded-lg glass-card">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                  Assigned Email
                </span>
                <span className="font-mono text-indigo-300">{selectedBugDetail.assigneeEmail}</span>
              </div>

              {selectedBugDetail.notes && (
                <div className="p-2.5 rounded-lg glass-card">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">Notes</span>
                  <p className="text-slate-400">{selectedBugDetail.notes}</p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
              {isTechLead && (
                <button
                  onClick={() => {
                    setBugs(bugs.filter((b) => b.id !== selectedBugDetail.id));
                    setSelectedBugDetail(null);
                  }}
                  className="text-red-400 font-bold hover:underline cursor-pointer"
                >
                  Delete Bug (Tech Lead)
                </button>
              )}
              <button onClick={() => setSelectedBugDetail(null)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold ml-auto cursor-pointer">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}