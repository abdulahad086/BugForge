from enum import Enum


class UserRole(str, Enum):
    SUPER_ADMIN = "SUPER_ADMIN"
    ORGANIZATION_ADMIN = "ORGANIZATION_ADMIN"
    TECH_LEAD = "TECH_LEAD"
    DEVELOPER = "DEVELOPER"
    QA = "QA"
    VIEWER = "VIEWER"


class OrganizationStatus(str, Enum):
    ACTIVE = "ACTIVE"
    SUSPENDED = "SUSPENDED"


class BugStatus(str, Enum):
    OPEN = "OPEN"
    IN_PROGRESS = "IN_PROGRESS"
    IN_REVIEW = "IN_REVIEW"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"


class BugPriority(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class BugSeverity(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    BLOCKER = "BLOCKER"


class AuditAction(str, Enum):
    CREATE = "CREATE"
    UPDATE = "UPDATE"
    DELETE = "DELETE"
    LOGIN = "LOGIN"
    LOGOUT = "LOGOUT"
