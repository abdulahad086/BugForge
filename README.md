#  BugForge — Enterprise Multi-Tenant Bug Tracker & Jira Kanban Platform

[![Build Status](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-blue.svg)](https://github.com/abdulahad086/BugForge/actions)
[![Docker](https://img.shields.io/badge/Docker-Multi--Stage-blue?logo=docker)](https://github.com/abdulahad086/BugForge)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.141-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16.3-4169E1?logo=postgresql)](https://www.postgresql.org)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**BugForge** is a production-grade, enterprise-ready multi-tenant bug tracking and Jira Kanban lifecycle management platform. Engineered with a microservices-inspired architecture, it features isolated company scoping, OWASP-compliant security, high-performance WebGL animations, automated CI/CD pipelines, and single-click cloud deployment on Azure Virtual Machines.

---

##  Key Architectural Highlights

- **Multi-Tenant Data Isolation**: Strict tenant scoping ensures Software Companies (Super Admin, Tech Leads, Devs) can only access their company's projects, users, and bug tickets.
- **Glassmorphism UI & WebGL Graphics**: Integrated React Bits UI components including `<ParticleText />`, `<RippleGrid />`, and `<GlassSurface />` with interactive particle sampling canvas engines.
- **Asynchronous FastAPI Backend**: Built on Python 3.13, FastAPI, Pydantic V2 data validation, and OWASP-recommended **Argon2id** password hashing.
- **Robust Persistence & Migrations**: PostgreSQL 16 database with SQLAlchemy ORM models, Alembic schema migrations, and Docker Volume hard disk persistence.
- **Automated CI/CD & GitOps Pipeline**: GitHub Actions workflows running automated Pytest test suites, Vite production builds, multi-platform Docker container image publishing to GitHub Container Registry (`ghcr.io`), and GitOps ArgoCD triggers.
- **Cloud Infrastructure as Code (IaC)**: Provisioned via Terraform on Azure Linux Virtual Machine (Ubuntu 22.04 LTS) with zero-downtime container updates.

---

##  System Architecture

```
[Developer Laptop] ──(git push)──> [GitHub Repository]
                                        │
                                        ▼ (Webhook)
                          [GitHub Actions CI/CD Worker]
                                ├──  Backend Pytest Test Suite
                                ├──  Frontend Vite Production Build
                                └──  Multi-Stage Docker Image Build
                                        │
                                        ▼ (Push Images)
                        [GHCR - GitHub Container Registry]
                                        │
                                        ▼ (SSH Deployment Signal)
                       [Azure Linux Virtual Machine (Ubuntu 22.04)]
                                        │
                                ┌───────┴────────┐
                                ▼                ▼
                         [Docker Engine] [Docker Compose]
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
   Frontend Container    Backend Container      Database Container
 (Nginx + React App)    (FastAPI + Uvicorn)     (PostgreSQL 16 + Volume)
      (Port 80)               (Port 8000)             (Port 5432)
        ▲                       ▲                       ▲
        │                       │                       │
        └───────────────────────┴───────────────────────┘
                                ▲
                                │ HTTP GET / POST
                          [User Browser]
```

---

##  Technology Stack

| Domain | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite 8, Tailwind CSS | High-performance SPA with Obsidian Dark Aesthetics |
| **UI Components** | React Bits Components | Canvas-based `<ParticleText />`, `<GlassSurface />`, `<RippleGrid />` |
| **Backend** | Python 3.13, FastAPI | Asynchronous RESTful API framework with OpenAPI / Swagger |
| **Data Validation** | Pydantic V2 | Strict type safety, input sanitization, & JSON schema parsing |
| **Security** | Argon2id, PyJWT | OWASP-compliant password hashing & stateless JWT authentication |
| **Database** | PostgreSQL 16, SQLAlchemy 2 | Relational database with asyncpg driver and ORM modeling |
| **Database Migrations**| Alembic | Version-controlled DB schema migration tracking |
| **Containerization** | Docker, Docker Compose | Isolated multi-stage Linux containers |
| **CI/CD Pipeline** | GitHub Actions | Automated linting, unit testing, container build & push |
| **Container Registry**| GHCR (`ghcr.io`) | GitHub Container Registry for image distribution |
| **Infrastructure** | Terraform, Azure VM | IaC provisioning on Azure Linux Virtual Machines (Ubuntu 22.04) |

---

##  Quick Start (Local Development)

### Prerequisites
- [Docker Engine](https://docs.docker.com/get-docker/) & Docker Compose
- Node.js 22+ (for local frontend dev)
- Python 3.13+ (for local backend dev)

### Running via Docker Compose (Recommended)

1. **Clone Repository**:
   ```bash
   git clone https://github.com/abdulahad086/BugForge.git
   cd BugForge
   ```

2. **Launch Container Stack**:
   ```bash
   docker compose up -d --build
   ```

3. **Access Application**:
   - **Frontend App**: [http://localhost](http://localhost) (Port 80)
   - **FastAPI OpenAPI Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs) (Port 8000)
   - **Backend Health Check**: [http://localhost:8000/api/health](http://localhost:8000/api/health)

---

##  Azure Cloud Deployment

Deploy BugForge to an Azure Linux Virtual Machine with a single automated script:

### Step 1: Provision Azure Virtual Machine
You can provision using Terraform or Azure CLI:
```bash
cd infrastructure/terraform
terraform init
terraform apply
```

### Step 2: Run Single-Command Deployment
On your Azure Linux VM terminal, execute:
```bash
curl -sSL https://raw.githubusercontent.com/abdulahad086/BugForge/main/scripts/deploy_azure_vm.sh | bash
```

This automated bootstrap script will:
1. Install Docker & Docker Compose dependencies.
2. Pull latest container images from GHCR (`ghcr.io/abdulahad086/bugforge-backend:latest`).
3. Spin up PostgreSQL database, FastAPI backend, and Nginx frontend with auto-restart policies.

---

##  Testing & Quality Assurance

BugForge includes automated test suites for continuous integration quality control:

### Running Backend Pytest Suite
```bash
cd backend
source venv/bin/activate
PYTHONPATH=. python -m pytest tests/
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p center>Crafted with  by <b>Abdul Ahad</b> —  DevOps & Full Stack Software Engineer</p>
