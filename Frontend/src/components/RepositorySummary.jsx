
export default function RepositorySummary({ repository, analysis }) {
  if (!repository || !analysis) return null;

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">REPOSITORY ANALYSIS</p>
          <h2>{repository.name}</h2>
          <p className="muted">
            {repository.description || "No description provided."}
          </p>
        </div>

        <a
          className="text-link"
          href={repository.url}
          target="_blank"
          rel="noreferrer"
        >
          View on GitHub ↗
        </a>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span>Files in repository</span>
          <strong>{analysis.totalFiles}</strong>
        </div>

        <div className="stat-card">
          <span>Source files retrieved</span>
          <strong>{analysis.sourceFilesRetrieved}</strong>
        </div>

        <div className="stat-card">
          <span>Primary language</span>
          <strong>{repository.language || "Unknown"}</strong>
        </div>

        <div className="stat-card">
          <span>Default branch</span>
          <strong>{repository.defaultBranch}</strong>
        </div>
      </div>

      <h3>Detected technologies</h3>

      <div className="technology-list">
        {analysis.technologies.map((technology) => (
          <span className="technology-tag" key={technology}>
            {technology}
          </span>
        ))}
      </div>
    </section>
  );
}
