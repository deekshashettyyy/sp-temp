
import { useState } from "react";
import RepoForm from "./components/RepoForm.jsx";
import RepositorySummary from "./components/RepositorySummary.jsx";
import QuestionList from "./components/QuestionList.jsx";
import { startInterview } from "./services/interviewApi.js";
import "./App.css";

const steps = [
  { number: "01", title: "Connect", description: "Choose a public repository." },
  { number: "02", title: "Understand", description: "Inspect its architecture." },
  { number: "03", title: "Demonstrate", description: "Answer questions from your code." },
];

export default function App() {
  const [screen, setScreen] = useState("home");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleAnalyze = async (repositoryUrl) => {
    setLoading(true);
    setError("");
    setResult(null);
    setScreen("analyzing");

    try {
      const data = await startInterview(repositoryUrl);
      setResult(data);
      setScreen("overview");
    } catch (requestError) {
      setError(requestError.message || "Something went wrong.");
      setScreen("setup");
    } finally {
      setLoading(false);
    }
  };

  const goHome = () => {
    setScreen("home");
    setError("");
  };

  return (
    <div className="sp-app">
      <aside className="sp-sidebar">
        <button className="sp-brand" onClick={goHome} aria-label="SkillProof home">
          <span className="sp-brand-mark">&gt;_</span>
          <span>skillproof</span>
        </button>

        <div className="sp-side-label">WORKSPACE</div>

        <button
          className={`sp-nav-item ${screen === "home" ? "selected" : ""}`}
          onClick={goHome}
        >
          <span>⌂</span> Home
        </button>

        <button
          className={`sp-nav-item ${["setup", "analyzing"].includes(screen) ? "selected" : ""}`}
          onClick={() => setScreen("setup")}
        >
          <span>⌕</span> Analyze repository
        </button>

        <button
          className={`sp-nav-item ${screen === "overview" ? "selected" : ""}`}
          onClick={() => result && setScreen("overview")}
          disabled={!result}
        >
          <span>▤</span> Repository overview
        </button>

        <button
          className={`sp-nav-item ${screen === "interview" ? "selected" : ""}`}
          onClick={() => result && setScreen("interview")}
          disabled={!result?.questions?.length}
        >
          <span>↗</span> Interview
        </button>

        <div className="sp-sidebar-bottom">
          <div className="sp-status">
            <span className="sp-status-dot" />
            <div>
              <strong>Local environment</strong>
              <span>Prototype running</span>
            </div>
          </div>
          <p>SKILLPROOF · DEVELOPMENT</p>
        </div>
      </aside>

      <div className="sp-main">
        <header className="sp-topbar">
          <div className="sp-breadcrumb">
            Workspace <span>/</span>{" "}
            <strong>
              {{
                home: "Home",
                setup: "Connect repository",
                analyzing: "Analysis",
                overview: "Repository overview",
                interview: "Technical interview",
              }[screen]}
            </strong>
          </div>
          <span className="sp-avatar">SP</span>
        </header>

        <main className="sp-content">
          {screen === "home" && (
            <>
              <section className="sp-hero">
                <div className="sp-hero-copy">
                  <p className="sp-eyebrow">DEVELOPER INTELLIGENCE</p>
                  <h1>
                    Your code.
                    <br />
                    Understood.
                  </h1>
                  <p className="sp-hero-description">
                    Prepare for technical interviews using the code you
                    actually wrote — not generic questions from a textbook.
                  </p>
                  <button
                    className="sp-primary-button"
                    onClick={() => {
                      setError("");
                      setScreen("setup");
                    }}
                  >
                    Analyze a repository <span>→</span>
                  </button>
                  <p className="sp-privacy-note">
                    Public GitHub repositories · No code execution
                  </p>
                </div>

                <div className="sp-preview" aria-label="Illustrative code preview">
                  <div className="sp-preview-bar">
                    <div className="sp-window-dots">
                      <i />
                      <i />
                      <i />
                    </div>
                    <span>app / api / route.js</span>
                    <span className="sp-preview-badge">SOURCE PREVIEW</span>
                  </div>
                  <div className="sp-code">
                    <div><span>01</span><code><b>export async function</b> GET(req) {"{"}</code></div>
                    <div><span>02</span><code>  <em>const</em> data = <i>await</i> fetchData();</code></div>
                    <div><span>03</span><code>  <em>return</em> Response.json(data);</code></div>
                    <div><span>04</span><code>{"}"}</code></div>
                  </div>
                  <div className="sp-preview-footer">
                    <span className="sp-preview-check">✓</span>
                    <div>
                      <strong>Questions grounded in real code</strong>
                      <p>Architecture · Implementation · Design decisions</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="sp-how">
                <div className="sp-section-heading">
                  <p className="sp-eyebrow">A CLEAR THREE-STEP PROCESS</p>
                  <h2>From repository to interview.</h2>
                </div>
                <div className="sp-steps">
                  {steps.map((step) => (
                    <article className="sp-step" key={step.number}>
                      <span className="sp-step-number">{step.number}</span>
                      <h3>{step.title}</h3>
                      <p>{step.description}</p>
                    </article>
                  ))}
                </div>
              </section>
            </>
          )}

          {screen === "setup" && (
            <section className="sp-setup">
              <button className="sp-back-button" onClick={goHome}>
                ← Back to home
              </button>

              <p className="sp-eyebrow">STEP 01 / REPOSITORY</p>
              <h1>Bring your code.</h1>
              <p className="sp-setup-description">
                Start with a public GitHub repository. SkillProof will inspect
                its source files and prepare technical questions.
              </p>

              <div className="sp-setup-card">
                <div className="sp-setup-card-heading">
                  <span className="sp-github-mark">GH</span>
                  <div>
                    <h2>Connect a repository</h2>
                    <p>Paste the URL of your public GitHub project.</p>
                  </div>
                </div>

                <RepoForm onAnalyze={handleAnalyze} loading={loading} />

                {error && (
                  <div className="sp-error" role="alert">
                    <strong>We couldn't analyze that repository.</strong>
                    <p>{error}</p>
                  </div>
                )}

                <div className="sp-privacy">
                  <span>⌑</span>
                  <p>
                    Public repositories only. Your code is inspected as source
                    material; SkillProof does not execute repository code.
                  </p>
                </div>
              </div>

              <div className="sp-progress-steps">
                {steps.map((step, index) => (
                  <div className="sp-progress-step" key={step.number}>
                    <span className={index === 0 ? "current" : ""}>
                      {step.number}
                    </span>
                    <div>
                      <strong>{step.title}</strong>
                      <p>{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {screen === "analyzing" && (
            <section className="sp-analyzing" role="status">
              <div className="sp-loader" />
              <p className="sp-eyebrow">REPOSITORY ANALYSIS</p>
              <h1>Getting to know your code.</h1>
              <p>
                SkillProof is retrieving repository details and preparing
                technical questions. This may take a little while.
              </p>
              <div className="sp-analysis-status">
                <span className="sp-status-dot" />
                Analysis in progress
              </div>
            </section>
          )}

          {screen === "overview" && result && (
            <section className="sp-result-screen">
              <p className="sp-eyebrow">ANALYSIS COMPLETE</p>
              <h1>Repository overview.</h1>
              <p className="sp-result-description">
                Review the repository details before moving into your interview.
              </p>

              <RepositorySummary
                repository={result.repository}
                analysis={result.analysis}
              />

              <div className="sp-next-card">
                <div>
                  <p className="sp-eyebrow">NEXT STEP</p>
                  <h2>Ready to explore your code?</h2>
                  <p>
                    Answer questions based on the source files retrieved
                    from your repository.
                  </p>
                </div>
                <button
                  className="sp-primary-button"
                  onClick={() => setScreen("interview")}
                  disabled={!result.questions?.length}
                >
                  Start interview <span>→</span>
                </button>
              </div>
            </section>
          )}

          {screen === "interview" && result && (
            <section className="sp-result-screen">
              <button
                className="sp-back-button"
                onClick={() => setScreen("overview")}
              >
                ← Repository overview
              </button>
              <p className="sp-eyebrow">YOUR TECHNICAL ASSESSMENT</p>
              <h1>Explain your thinking.</h1>
              <p className="sp-result-description">
                Work through questions grounded in your repository.
              </p>
              <QuestionList questions={result.questions} />
            </section>
          )}
        </main>

        <footer className="sp-footer">
          <span>skillproof.</span>
          <span>Built around the code you write.</span>
        </footer>
      </div>
    </div>
  );
}
