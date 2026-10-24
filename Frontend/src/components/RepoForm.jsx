
import { useState } from "react";

export default function RepoForm({ onAnalyze, loading }) {
  const [repositoryUrl, setRepositoryUrl] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    onAnalyze(repositoryUrl.trim());
  };

  return (
    <form className="repo-form" onSubmit={handleSubmit}>
      <label htmlFor="repositoryUrl">
        Public GitHub repository
      </label>

      <div className="repo-input-row">
        <input
          id="repositoryUrl"
          type="url"
          placeholder="https://github.com/owner/repository"
          value={repositoryUrl}
          onChange={(event) => setRepositoryUrl(event.target.value)}
          required
          disabled={loading}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Analyzing..." : "Analyze repository"}
        </button>
      </div>

      <p className="muted">
        SkillProof inspects repository metadata and source files
        to prepare technical interview questions.
      </p>
    </form>
  );
}
