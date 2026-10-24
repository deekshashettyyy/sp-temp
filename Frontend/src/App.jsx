
import { useState } from "react";
import RepoForm from "./components/RepoForm.jsx";
import RepositorySummary from "./components/RepositorySummary.jsx";
import QuestionList from "./components/QuestionList.jsx";
import { startInterview } from "./services/interviewApi.js";
import "./App.css";

export default function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [activePage, setActivePage] = useState("dashboard");

  const handleAnalyze = async (repositoryUrl) => {
    setLoading(true);
    setError("");
    setResult(null);
    setActivePage("dashboard");

    try {
      const data = await startInterview(repositoryUrl);
      setResult(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  const goToInterview = () => {
    setActivePage("interview");
    document.getElementById("interview-workspace")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="workspace">
      <aside className="sidebar">
        <a className="brand" href="#dashboard">
          <span className="brand-symbol">S</span>
          <span>skillproof</span>
        </a>

        <div className="sidebar-section">
          <p className="sidebar-label">WORKSPACE</p>

          <button
            className={`nav-item ${activePage === "dashboard" ? "active" : ""}`}
            onClick={() => {
              setActivePage("dashboard");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <span className="nav-icon">▦</span>
            Dashboard
          </button>

          <button
            className="nav-item"
            onClick={() => {
              setActivePage("dashboard");
              document.getElementById("repository-form")?.scrollIntoView({
                behavior: "smooth",
              });
            }}
          >
            <span className="nav-icon">⌕</span>
            Analyze repository
          </button>

          <button
            className={`nav-item ${activePage === "interview" ? "active" : ""}`}
            onClick={goToInterview}
            disabled={!result?.questions?.length}
          >
            <span className="nav-icon">▤</span>
            Interview
          </button>
        </div>

        <div className="sidebar-bottom">
          <div className="system-status">
            <span className="status-dot" />
            <div>
              <strong>Local environment</strong>
              <span>Prototype running</span>
            </div>
          </div>
          <p className="sidebar-version">SKILLPROOF · DEVELOPMENT</p>
        </div>
      </aside>

      <div className="workspace-main">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Workspace</span>
            <span className="breadcrumb-separator">/</span>
            <strong>
              {activePage === "interview" ? "Interview" : "Dashboard"}
            </strong>
          </div>

          <div className="topbar-right">
            <span className="environment-tag">LOCAL</span>
            <span className="avatar">SP</span>
          </div>
        </header>

        <main className="page-content" id="dashboard">
          <section className="page-heading">
            <div>
              <p className="eyebrow">DEVELOPER WORKSPACE</p>
              <h1>Repository workspace</h1>
              <p className="page-description">
                Analyze your codebase and explore technical questions
                grounded in your implementation.
              </p>
            </div>
          </section>

          <section className="section-block" id="repository-form">
            <div className="section-title">
              <div>
                <h2>Analyze a repository</h2>
                <p>Connect a public GitHub repository to get started.</p>
              </div>
              <span className="step-label">01 / ANALYSIS</span>
            </div>

            <RepoForm onAnalyze={handleAnalyze} loading={loading} />
          </section>

          {loading && (
            <div className="notice" role="status">
              <span className="spinner" />
              <div>
                <strong>Analyzing repository</strong>
                <p>
                  Retrieving repository metadata and preparing questions...
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="error-notice" role="alert">
              <strong>Unable to analyze repository</strong>
              <p>{error}</p>
            </div>
          )}

          {!result && !loading && !error && (
            <section className="empty-workspace">
              <div className="empty-icon">{"</>"}</div>
              <div>
                <h3>Your next interview starts with your code.</h3>
                <p>
                  Enter a public GitHub URL above. SkillProof will inspect
                  the repository and prepare questions using retrieved source
                  files.
                </p>
              </div>
              <span className="empty-step">WAITING FOR REPOSITORY</span>
            </section>
          )}

          {result && (
            <>
              <section className="section-block results-section">
                <div className="section-title">
                  <div>
                    <h2>Repository overview</h2>
                    <p>Details retrieved from GitHub.</p>
                  </div>
                  <span className="step-label">02 / OVERVIEW</span>
                </div>

                <RepositorySummary
                  repository={result.repository}
                  analysis={result.analysis}
                />
              </section>

              <section
                className="section-block interview-section"
                id="interview-workspace"
              >
                <div className="section-title">
                  <div>
                    <h2>Technical interview</h2>
                    <p>
                      Questions generated from the retrieved source files.
                    </p>
                  </div>
                  <span className="step-label">03 / INTERVIEW</span>
                </div>

                <QuestionList questions={result.questions} />
              </section>
            </>
          )}
        </main>

        <footer className="workspace-footer">
          <span>SkillProof</span>
          <span>Repository-grounded technical assessment</span>
        </footer>
      </div>
    </div>
  );
}
