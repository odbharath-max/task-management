import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api";

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const userId = "test-user";

  // Get all tasks
  const fetchTasks = async () => {
    try {
      const response = await fetch(`${API_URL}/tasks`);

      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }

      const data = await response.json();

      // Backend may return an array directly
      setTasks(Array.isArray(data) ? data : data.tasks || []);
    } catch (error) {
      console.error("Fetch tasks error:", error);
      setMessage("Could not load tasks");
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Create task
  const createTask = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setMessage("Please enter a task title");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          status: "pending",
          userId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create task");
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

  // Delete task
  const deleteTask = async (id) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete task");
      }

      setMessage("Task deleted successfully!");

      fetchTasks();
    } catch (error) {
      console.error("Delete task error:", error);
      setMessage(error.message);
    }
  };

  // Update task status
  const updateStatus = async (task) => {
    const newStatus =
      task.status === "completed" ? "pending" : "completed";

    try {
      const response = await fetch(`${API_URL}/tasks/${task._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: task.title,
          description: task.description,
          status: newStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update task");
      }

      setMessage("Task updated successfully!");

      fetchTasks();
    } catch (error) {
      console.error("Update task error:", error);
      setMessage(error.message);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>Task Management</h1>
          <p>Organize your tasks and stay productive.</p>
        </div>
      </header>

      <main className="container">

        {/* Create Task */}
        <section className="card">
          <h2>Create New Task</h2>

          <form onSubmit={createTask}>
            <input
              type="text"
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <textarea
              placeholder="Task description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="4"
            />

            <button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Add Task"}
            </button>
          </form>

          {message && <p className="message">{message}</p>}
        </section>

        {/* Tasks */}
        <section className="tasks-section">
          <div className="section-title">
            <h2>My Tasks</h2>
            <button className="refresh" onClick={fetchTasks}>
              Refresh
            </button>
          </div>

          {tasks.length === 0 ? (
            <div className="empty">
              <h3>No tasks yet</h3>
              <p>Create your first task above.</p>
            </div>
          ) : (
            <div className="task-list">
              {tasks.map((task) => (
                <div className="task-card" key={task._id}>

                  <div className="task-content">
                    <h3>{task.title}</h3>

                    <p>
                      {task.description || "No description"}
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
                      onClick={() => updateStatus(task)}
                    >
                      {task.status === "completed"
                        ? "Mark Pending"
                        : "Complete"}
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() => deleteTask(task._id)}
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