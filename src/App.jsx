import { useEffect, useState } from "react";
import "./App.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:8080/api/job-applications";

const AUTH_URL = API_URL.replace("/api/job-applications", "/api/auth");

function App() {
  const [token, setToken] = useState(localStorage.getItem("jobtrackr_token"));
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("jobtrackr_user") || "null")
  );
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [applications, setApplications] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    saved: 0,
    applied: 0,
    interview: 0,
    offer: 0,
    rejected: 0,
  });
  const [form, setForm] = useState({
    companyName: "",
    jobTitle: "",
    status: "SAVED",
    location: "",
    appliedDate: new Date().toISOString().slice(0, 10),
  });
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState("");

  function authHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const [applicationsResponse, summaryResponse] = await Promise.all([
        fetch(API_URL, { headers: authHeaders() }),
        fetch(`${API_URL}/summary`, { headers: authHeaders() }),
      ]);

      if (!applicationsResponse.ok || !summaryResponse.ok) {
        throw new Error("Could not load your job applications.");
      }

      setApplications(await applicationsResponse.json());
      setSummary(await summaryResponse.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) {
      loadDashboard();
    }
  }, [token]);

  function handleAuthChange(event) {
    const { name, value } = event.target;

    setAuthForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    setError("");

    const endpoint = authMode === "login" ? "/login" : "/register";
    const requestBody =
      authMode === "login"
        ? {
            email: authForm.email,
            password: authForm.password,
          }
        : authForm;

    const response = await fetch(`${AUTH_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      setError(
        authMode === "login"
          ? "Login failed. Check your email and password."
          : "Could not create the account. Try another email or a longer password."
      );
      return;
    }

    const authData = await response.json();

    localStorage.setItem("jobtrackr_token", authData.token);
    localStorage.setItem(
      "jobtrackr_user",
      JSON.stringify({ name: authData.name, email: authData.email })
    );

    setUser({ name: authData.name, email: authData.email });
    setToken(authData.token);
  }

  function logout() {
    localStorage.removeItem("jobtrackr_token");
    localStorage.removeItem("jobtrackr_user");
    setToken(null);
    setUser(null);
    setApplications([]);
    setError("");
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const response = await fetch(API_URL, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(form),
    });

    if (!response.ok) {
      setError("Could not save the application.");
      return;
    }

    setForm({
      companyName: "",
      jobTitle: "",
      status: "SAVED",
      location: "",
      appliedDate: new Date().toISOString().slice(0, 10),
    });

    loadDashboard();
  }

  async function updateStatus(application, status) {
    const response = await fetch(`${API_URL}/${application.id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({
        companyName: application.companyName,
        jobTitle: application.jobTitle,
        status,
        location: application.location,
        appliedDate: application.appliedDate,
      }),
    });

    if (!response.ok) {
      setError("Could not update the application status.");
      return;
    }

    loadDashboard();
  }

  async function deleteApplication(id) {
    if (!window.confirm("Delete this job application permanently?")) {
      return;
    }

    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });

    if (!response.ok) {
      setError("Could not delete the application.");
      return;
    }

    loadDashboard();
  }

  const visibleApplications =
    selectedStatus === "ALL"
      ? applications
      : applications.filter(
          (application) => application.status === selectedStatus
        );

  if (!token) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <p className="eyebrow">JOB SEARCH DASHBOARD</p>
          <h1>JobTrackr</h1>
          <p className="subtitle">
            Organize every opportunity in one private dashboard.
          </p>

          <form className="auth-form" onSubmit={handleAuthSubmit}>
            {authMode === "register" && (
              <input
                name="name"
                placeholder="Your name"
                value={authForm.name}
                onChange={handleAuthChange}
                required
              />
            )}

            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={authForm.email}
              onChange={handleAuthChange}
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={authForm.password}
              onChange={handleAuthChange}
              minLength="8"
              required
            />

            <button type="submit">
              {authMode === "login" ? "Log in" : "Create account"}
            </button>
          </form>

          {error && <p className="auth-error">{error}</p>}

          <button
            className="text-button"
            onClick={() => {
              setError("");
              setAuthMode(authMode === "login" ? "register" : "login");
            }}
          >
            {authMode === "login"
              ? "New here? Create an account"
              : "Already have an account? Log in"}
          </button>
        </section>
      </main>
    );
  }

  if (loading) {
    return <p className="page-message">Loading JobTrackr...</p>;
  }

  return (
    <main className="app">
      <header className="header">
        <div>
          <p className="eyebrow">JOB SEARCH DASHBOARD</p>
          <h1>JobTrackr</h1>
          <p className="subtitle">
            Welcome back, {user?.name || "there"}.
          </p>
        </div>

        <div className="header-actions">
          <span className="application-count">
            {summary.total} applications
          </span>
          <button className="logout-button" onClick={logout}>
            Log out
          </button>
        </div>
      </header>

      {error && <p className="auth-error">{error}</p>}

      <section className="stats-grid">
        <StatCard label="Saved" value={summary.saved} color="blue" />
        <StatCard label="Applied" value={summary.applied} color="purple" />
        <StatCard label="Interviews" value={summary.interview} color="orange" />
        <StatCard label="Offers" value={summary.offer} color="green" />
      </section>

      <section className="applications-section">
        <form className="application-form" onSubmit={handleSubmit}>
          <input
            name="companyName"
            placeholder="Company name"
            value={form.companyName}
            onChange={handleChange}
            required
          />

          <input
            name="jobTitle"
            placeholder="Job title"
            value={form.jobTitle}
            onChange={handleChange}
            required
          />

          <input
            name="location"
            placeholder="Location"
            value={form.location}
            onChange={handleChange}
          />

          <select name="status" value={form.status} onChange={handleChange}>
            <option value="SAVED">Saved</option>
            <option value="APPLIED">Applied</option>
            <option value="INTERVIEW">Interview</option>
            <option value="OFFER">Offer</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <input
            type="date"
            name="appliedDate"
            value={form.appliedDate}
            onChange={handleChange}
          />

          <button type="submit">Add application</button>
        </form>

        <div className="section-heading">
          <div>
            <h2>Your applications</h2>
            <p>Only you can view and manage these records.</p>
          </div>

          <select
            className="filter-select"
            value={selectedStatus}
            onChange={(event) => setSelectedStatus(event.target.value)}
          >
            <option value="ALL">All statuses</option>
            <option value="SAVED">Saved</option>
            <option value="APPLIED">Applied</option>
            <option value="INTERVIEW">Interview</option>
            <option value="OFFER">Offer</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {visibleApplications.length === 0 ? (
          <p className="empty-state">
            No applications yet. Add your first application using the form above.
          </p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Role</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Applied</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleApplications.map((application) => (
                  <tr key={application.id}>
                    <td className="company">{application.companyName}</td>
                    <td>{application.jobTitle}</td>
                    <td>{application.location || "—"}</td>
                    <td>
                      <select
                        className={`status-select ${application.status.toLowerCase()}`}
                        value={application.status}
                        onChange={(event) =>
                          updateStatus(application, event.target.value)
                        }
                      >
                        <option value="SAVED">SAVED</option>
                        <option value="APPLIED">APPLIED</option>
                        <option value="INTERVIEW">INTERVIEW</option>
                        <option value="OFFER">OFFER</option>
                        <option value="REJECTED">REJECTED</option>
                      </select>
                    </td>
                    <td>{application.appliedDate || "—"}</td>
                    <td>
                      <button
                        className="delete-button"
                        onClick={() => deleteApplication(application.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

function StatCard({ label, value, color }) {
  return (
    <article className={`stat-card ${color}`}>
      <p>{label}</p>
      <strong>{value}</strong>
    </article>
  );
}

export default App;