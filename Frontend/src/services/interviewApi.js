
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const startInterview = async (repositoryUrl) => {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}/api/interviews/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ repositoryUrl }),
    });
  } catch {
    throw new Error(
      "Cannot reach SkillProof's backend. Make sure the server is running."
    );
  }

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Failed to analyze repository.");
  }

  return result.data;
};
