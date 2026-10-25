
export default function RepositorySummary({ repository, analysis }) {
  if (!repository || !analysis) return null;

  const stats = [
    { label: "Repository files", value: analysis.totalFiles ?? 0 },
    { label: "Files inspected", value: analysis.sourceFilesRetrieved ?? 0 },
    { label: "Primary language", value: repository.language || "Unknown" },
    { label: "Default branch", value: repository.defaultBranch || "Unknown" },
  ];

  const technologies = analysis.technologies || [];

  return (
    <section className="sp-repository-card">
      <div className="sp-repository-heading">
        <div>
          <p className="sp-eyebrow">REPOSITORY ANALYSIS</p>
          <h2>{repository.name}</h2>
          <p className="sp-repository-description">
            {repository.description || "No description provided."}
          </p>
        </div>

        <a
          className="sp-github-link"
          href={repository.url}
          target="_blank"
          rel="noreferrer"
        >
          View on GitHub ↗
        </a>
      </div>

      <div className="sp-repository-stats">
        {stats.map((stat) => (
          <div className="sp-repository-stat" key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </div>
        ))}
      </div>

      <div className="sp-technologies">
        <h3>Detected technologies</h3>
        {technologies.length > 0 ? (
          <div className="sp-technology-list">
            {technologies.map((technology) => (
              <span key={technology}>{technology}</span>
            ))}
          </div>
        ) : (
          <p>No technologies detected yet.</p>
        )}
      </div>
    </section>
  );
}
