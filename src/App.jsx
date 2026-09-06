import { useEffect, useState } from "react";
import "./App.css";

// const API_URL = "http://localhost:8080/api/job-applications";
const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:8080/api/job-applications";

function App() {
  const [applications, setApplications] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    saved: 0,
    applied: 0,
    interview: 0,
    offer: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

const [form, setForm] = useState({
  companyName: "",
  jobTitle: "",
  status: "SAVED",
  location: "",
  appliedDate: new Date().toISOString().slice(0, 10),
});

const [selectedStatus, setSelectedStatus] = useState("ALL");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [applicationsResponse, summaryResponse] = await Promise.all([
          fetch(API_URL),
          fetch(`${API_URL}/summary`),
        ]);

        if (!applicationsResponse.ok || !summaryResponse.ok) {
          throw new Error("Could not load job applications.");
        }

        setApplications(await applicationsResponse.json());
        setSummary(await summaryResponse.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return <p className="page-message">Loading JobTrackr...</p>;
  }

  if (error) {
    return <p className="page-message error-message">{error}</p>;
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
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(form),
  });

  if (!response.ok) {
    setError("Could not save the application.");
    return;
  }

  window.location.reload();
}

async function updateStatus(application, status) {
  const response = await fetch(`${API_URL}/${application.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
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

  window.location.reload();
}

async function deleteApplication(id) {
  const confirmed = window.confirm(
    "Delete this job application permanently?"
  );

  if (!confirmed) {
    return;
  }

  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    setError("Could not delete the application.");
    return;
  }

  window.location.reload();
}

const visibleApplications =
  selectedStatus === "ALL"
    ? applications
    : applications.filter(
        (application) => application.status === selectedStatus
      );

  return (
    <main className="app">
      <header className="header">
        <div>
          <p className="eyebrow">JOB SEARCH DASHBOARD</p>
          <h1>JobTrackr</h1>
          <p className="subtitle">Keep every opportunity organized.</p>
        </div>
        <span className="application-count">{summary.total} applications</span>
      </header>

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
           <p>Track your current job-search progress.</p>
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

        {applications.length === 0 ? (
          <p className="empty-state">No applications yet. Add your first application using the form above.</p>
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
                       onChange={(event) => updateStatus(application, event.target.value)}
                     >
                       <option value="SAVED">SAVED</option>
                       <option value="APPLIED">APPLIED</option>
                       <option value="INTERVIEW">INTERVIEW</option>
                       <option value="OFFER">OFFER</option>
                       <option value="REJECTED">REJECTED</option>
                     </select>
                   </td>
                    <td>{application.appliedDate || "—"}</td>
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