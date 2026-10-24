
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const evaluateAnswer = async ({
  question,
  answer,
  sourceFile,
}) => {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}/api/answers/evaluate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question,
        answer,
        sourceFile,
      }),
    });
  } catch {
    throw new Error("Cannot connect to the SkillProof backend.");
  }

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Answer evaluation failed.");
  }

  return result.data;
};
