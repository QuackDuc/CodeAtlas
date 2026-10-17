/**
 * data.js - Static Mock Data for CodeAtlas 4-Screen Prototype
 * Academic Presentation Prototype
 */

const CODEATLAS_MOCK = {
  // Repository Meta
  repo: {
    name: "CodeAtlas Demo",
    status: "Analysis Complete",
    description: "Core backend architecture and intelligence services",
    stats: {
      files: 124,
      classes: 38,
      functions: 216,
      modules: 17
    }
  },

  // Screen 2: Dashboard Overview Graph (5 core connected components)
  dashboardGraph: {
    nodes: [
      { id: "main.py", label: "main.py", type: "entry", role: "Application Entry", x: 130, y: 160 },
      { id: "AuthService", label: "AuthService", type: "service", role: "Auth Business Logic", x: 380, y: 90 },
      { id: "UserController", label: "UserController", type: "controller", role: "API Route Controller", x: 380, y: 230 },
      { id: "UserRepository", label: "UserRepository", type: "repository", role: "Data Access Object", x: 630, y: 160 },
      { id: "Database", label: "Database", type: "database", role: "Persistence Engine", x: 860, y: 160 }
    ],
    edges: [
      { from: "main.py", to: "AuthService", label: "initializes" },
      { from: "main.py", to: "UserController", label: "registers routes" },
      { from: "AuthService", to: "UserRepository", label: "verifies user" },
      { from: "UserController", to: "UserRepository", label: "queries" },
      { from: "UserRepository", to: "Database", label: "executes SQL" },
      { from: "AuthService", to: "Database", label: "stores session" }
    ]
  },

  // Screen 3: Codebase Map (9 nodes with distinct types and details)
  codebaseMap: {
    nodes: [
      {
        id: "main.py",
        label: "main.py",
        type: "File",
        color: "#38BDF8", // Cyan-blue
        x: 100,
        y: 190,
        badge: "Entrypoint",
        details: {
          type: "File",
          file: "main.py",
          module: "root",
          functions: ["bootstrap()", "run()", "setup_routes()"],
          dependencies: ["LoginController", "UserController", "Database"],
          usedBy: ["System Runtime"],
          description: "Root application orchestrator, initializes DI containers and mounts API controllers."
        }
      },
      {
        id: "LoginController",
        label: "LoginController",
        type: "Controller",
        color: "#818CF8", // Indigo
        x: 280,
        y: 100,
        badge: "API Handler",
        details: {
          type: "Class",
          file: "login.py",
          module: "src.auth",
          functions: ["handle_login_request()", "handle_logout()"],
          dependencies: ["AuthService", "PasswordValidator"],
          usedBy: ["main.py"],
          description: "Parses authentication requests from HTTP transport and delegates to AuthService."
        }
      },
      {
        id: "UserController",
        label: "UserController",
        type: "Controller",
        color: "#818CF8", // Indigo
        x: 280,
        y: 280,
        badge: "API Handler",
        details: {
          type: "Class",
          file: "user_service.py",
          module: "src.users",
          functions: ["get_user_profile()", "register_endpoint()"],
          dependencies: ["UserService"],
          usedBy: ["main.py"],
          description: "Accepts user domain REST queries and delegates actions to UserService."
        }
      },
      {
        id: "AuthService",
        label: "AuthService",
        type: "Class",
        color: "#A855F7", // Violet/Purple
        x: 480,
        y: 100,
        badge: "Domain Service",
        details: {
          type: "Class",
          file: "auth_service.py",
          module: "src.auth",
          functions: ["login()", "logout()", "validate_user()", "generate_session_token()"],
          dependencies: ["UserRepository", "Database", "PasswordValidator"],
          usedBy: ["LoginController"],
          description: "Core authentication business logic validating credentials and managing active developer tokens."
        }
      },
      {
        id: "UserService",
        label: "UserService",
        type: "Service",
        color: "#A855F7", // Violet/Purple
        x: 480,
        y: 280,
        badge: "Domain Service",
        details: {
          type: "Class",
          file: "user_service.py",
          module: "src.users",
          functions: ["get_profile()", "update_permissions()", "register_user()"],
          dependencies: ["UserRepository", "UserModel"],
          usedBy: ["UserController"],
          description: "Coordinates user entity mutations, team permissions, and registration workflows."
        }
      },
      {
        id: "PasswordValidator",
        label: "PasswordValidator",
        type: "Utility",
        color: "#10B981", // Emerald
        x: 380,
        y: 20,
        badge: "Utility",
        details: {
          type: "Class",
          file: "login.py",
          module: "src.auth",
          functions: ["check_password_complexity()", "validate_entropy()"],
          dependencies: [],
          usedBy: ["LoginController", "AuthService"],
          description: "Validates minimum security complexity thresholds for authentication credentials."
        }
      },
      {
        id: "UserRepository",
        label: "UserRepository",
        type: "Class",
        color: "#6366F1", // Indigo
        x: 680,
        y: 190,
        badge: "DAO / Repository",
        details: {
          type: "Class",
          file: "user_model.py",
          module: "src.users",
          functions: ["find()", "get_by_id()", "save()", "update_status()"],
          dependencies: ["Database", "UserModel"],
          usedBy: ["AuthService", "UserService"],
          description: "Data access layer executing SQL queries for user entities and password hashes."
        }
      },
      {
        id: "UserModel",
        label: "UserModel",
        type: "Model",
        color: "#EC4899", // Pink
        x: 680,
        y: 320,
        badge: "Data Model",
        details: {
          type: "Class",
          file: "user_model.py",
          module: "src.users",
          functions: ["verify_hash()", "create_new()", "serialize()"],
          dependencies: [],
          usedBy: ["UserRepository", "UserService"],
          description: "In-memory domain schema representing user entities and authentication metadata."
        }
      },
      {
        id: "Database",
        label: "Database",
        type: "Database",
        color: "#4F8CFF", // CodeAtlas Blue
        x: 880,
        y: 190,
        badge: "Persistence Adapter",
        details: {
          type: "Class",
          file: "database.py",
          module: "src.database",
          functions: ["connect()", "query()", "store_session()", "invalidate_session()"],
          dependencies: ["ConnectionPool", "settings.py"],
          usedBy: ["AuthService", "UserRepository"],
          description: "Underlying persistence adapter providing transactional queries and session tables."
        }
      }
    ],
    edges: [
      { from: "main.py", to: "LoginController", label: "delegates" },
      { from: "main.py", to: "UserController", label: "delegates" },
      { from: "LoginController", to: "AuthService", label: "calls" },
      { from: "LoginController", to: "PasswordValidator", label: "uses" },
      { from: "UserController", to: "UserService", label: "calls" },
      { from: "AuthService", to: "UserRepository", label: "queries" },
      { from: "AuthService", to: "Database", label: "persists" },
      { from: "UserService", to: "UserRepository", label: "mutates" },
      { from: "UserService", to: "UserModel", label: "instantiates" },
      { from: "UserRepository", to: "UserModel", label: "maps" },
      { from: "UserRepository", to: "Database", label: "executes SQL" }
    ]
  },

  // Screen 4: AI Assistant Q&A Knowledge Base
  aiQA: [
    {
      question: "How does authentication work?",
      answer: "Authentication begins with LoginController, which calls AuthService. AuthService validates the user through UserRepository and stores the session through Database.",
      referencedFiles: [
        { name: "auth_service.py", path: "src/auth/auth_service.py" },
        { name: "login.py", path: "src/auth/login.py" },
        { name: "user_model.py", path: "src/users/user_model.py" },
        { name: "database.py", path: "src/database/database.py" }
      ]
    },
    {
      question: "Which components depend on Database?",
      answer: "Two primary components directly depend on Database: UserRepository (which executes SQL queries for user entity retrieval and updates) and AuthService (which writes session tokens directly into the sessions store). Both receive the database connection pool initialized in main.py.",
      referencedFiles: [
        { name: "database.py", path: "src/database/database.py" },
        { name: "user_model.py", path: "src/users/user_model.py" },
        { name: "auth_service.py", path: "src/auth/auth_service.py" }
      ]
    },
    {
      question: "Where is user registration implemented?",
      answer: "User registration is implemented in UserService.register_user() within src/users/user_service.py. It creates a new UserModel entity with a cryptographically salted password hash and persists it using UserRepository.save().",
      referencedFiles: [
        { name: "user_service.py", path: "src/users/user_service.py" },
        { name: "user_model.py", path: "src/users/user_model.py" },
        { name: "database.py", path: "src/database/database.py" }
      ]
    }
  ]
};
