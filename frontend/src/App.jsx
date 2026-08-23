import { useEffect, useState } from "react";
import "./App.css";

const API_URL =
  "https://task-management-backend-7854.onrender.com/api";

function App() {
  // =========================
  // AUTHENTICATION
  // =========================

  const [isLogin, setIsLogin] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [user, setUser] = useState(null);

  // =========================
  // TASKS
  // =========================

  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // =========================
  // CHECK LOGIN
  // =========================

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");

    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setLoggedIn(true);
    }
  }, []);

  // =========================
  // GET TOKEN
  // =========================

  const getToken = () => {
    return localStorage.getItem("token");
  };

  // =========================
  // REGISTER
  // =========================

  const register = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      setMessage("Please fill all fields");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      setMessage("Registration successful! Please login.");

      setName("");
      setEmail("");
      setPassword("");

      setIsLogin(true);
    } catch (error) {
      console.error("Register error:", error);
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOGIN
  // =========================

  const login = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setMessage("Please enter email and password");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setUser(data.user);
      setLoggedIn(true);

      setEmail("");
      setPassword("");

      setMessage("Login successful!");
    } catch (error) {
      console.error("Login error:", error);
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOGOUT
  // =========================

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setLoggedIn(false);
    setTasks([]);

    setMessage("Logged out successfully");
  };

  // =========================
  // GET TASKS
  // =========================

  const fetchTasks = async () => {
    try {
      const token = getToken();

      if (!token) {
        return;
      }

      const response = await fetch(`${API_URL}/tasks`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          logout();
          throw new Error("Session expired. Please login again.");
        }

        throw new Error(data.message || "Failed to fetch tasks");
      }

      setTasks(Array.isArray(data) ? data : data.tasks || []);
      setMessage("");
    } catch (error) {
      console.error("Fetch tasks error:", error);
      setMessage(error.message);
    }
  };

  // Load tasks after login
  useEffect(() => {
    if (loggedIn) {
      fetchTasks();
    }
  }, [loggedIn]);

  // =========================
  // CREATE TASK
  // =========================

  const createTask = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setMessage("Please enter a task title");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const token = getToken();

      const response = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          status: "pending",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          logout();
        }

        throw new Error(
          data.message || "Failed to create task"
        );
      }

      setMessage("Task created successfully!");

      setTitle("");
      setDescription("");

      fetchTasks();
    } catch (error) {
      console.error("Create task error:", error);
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // DELETE TASK
  // =========================

  const deleteTask = async (id) => {
    try {
      const token = getToken();

      const response = await fetch(
        `${API_URL}/tasks/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          logout();
        }

        throw new Error(
          data.message || "Failed to delete task"
        );
      }

      setMessage("Task deleted successfully!");

      fetchTasks();
    } catch (error) {
      console.error("Delete task error:", error);
      setMessage(error.message);
    }
  };

  // =========================
  // UPDATE TASK STATUS
  // =========================

  const updateStatus = async (task) => {
    const newStatus =
      task.status === "completed"
        ? "pending"
        : "completed";

    try {
      const token = getToken();

      const response = await fetch(
        `${API_URL}/tasks/${task._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: task.title,
            description: task.description,
            status: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          logout();
        }

        throw new Error(
          data.message || "Failed to update task"
        );
      }

      setMessage("Task updated successfully!");

      fetchTasks();
    } catch (error) {
      console.error("Update task error:", error);
      setMessage(error.message);
    }
  };

  // =========================
  // LOGIN / REGISTER SCREEN
  // =========================

  if (!loggedIn) {
    return (
      <div className="app">
        <header className="header">
          <div>
            <h1>Task Management</h1>
            <p>Organize your tasks and stay productive.</p>
          </div>
        </header>

        <main className="container">
          <section className="card">
            <h2>
              {isLogin ? "Login" : "Create Account"}
            </h2>

            <form
              onSubmit={isLogin ? login : register}
            >
              {!isLogin && (
                <input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                />
              )}

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
              />

              <button
                type="submit"
                disabled={loading}
              >
                {loading
                  ? "Please wait..."
                  : isLogin
                  ? "Login"
                  : "Register"}
              </button>
            </form>

            {message && (
              <p className="message">{message}</p>
            )}

            <p style={{ marginTop: "15px" }}>
              {isLogin
                ? "Don't have an account?"
                : "Already have an account?"}

              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setMessage("");
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#2563eb",
                  cursor: "pointer",
                  marginLeft: "5px",
                  fontWeight: "bold",
                }}
              >
                {isLogin ? "Register" : "Login"}
              </button>
            </p>
          </section>
        </main>
      </div>
    );
  }

  // =========================
  // TASK DASHBOARD
  // =========================

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>Task Management</h1>

          <p>
            Welcome, {user?.name}
          </p>
        </div>

        <button
          onClick={logout}
          style={{
            marginTop: "15px",
            padding: "10px 20px",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </header>

      <main className="container">
        {/* CREATE TASK */}

        <section className="card">
          <h2>Create New Task</h2>

          <form onSubmit={createTask}>
            <input
              type="text"
              placeholder="Task title"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
            />

            <textarea
              placeholder="Task description"
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              rows="4"
            />

            <button
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Creating..."
                : "Add Task"}
            </button>
          </form>

          {message && (
            <p className="message">{message}</p>
          )}
        </section>

        {/* TASKS */}

        <section className="tasks-section">
          <div className="section-title">
            <h2>My Tasks</h2>

            <button
              className="refresh"
              onClick={fetchTasks}
            >
              Refresh
            </button>
          </div>

          {tasks.length === 0 ? (
            <div className="empty">
              <h3>No tasks yet</h3>
              <p>
                Create your first task above.
              </p>
            </div>
          ) : (
            <div className="task-list">
              {tasks.map((task) => (
                <div
                  className="task-card"
                  key={task._id}
                >
                  <div className="task-content">
                    <h3>{task.title}</h3>

                    <p>
                      {task.description ||
                        "No description"}
                    </p>

                    <span
                      className={`status ${
                        task.status === "completed"
                          ? "completed"
                          : "pending"
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>

                  <div className="task-actions">
                    <button
                      className="complete-btn"
                      onClick={() =>
                        updateStatus(task)
                      }
                    >
                      {task.status === "completed"
                        ? "Mark Pending"
                        : "Complete"}
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() =>
                        deleteTask(task._id)
                      }
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;