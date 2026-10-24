
const TECHNICAL_TERMS = [
  "function",
  "component",
  "state",
  "props",
  "api",
  "request",
  "response",
  "database",
  "error",
  "async",
  "await",
  "validation",
  "algorithm",
  "complexity",
  "security",
  "authentication",
  "middleware",
  "performance",
  "data",
  "return",
];

export const evaluateAnswer = ({ question, answer, sourceFile }) => {
  const normalizedAnswer = answer.trim();
  const words = normalizedAnswer.split(/\s+/).filter(Boolean);
  const lowerAnswer = normalizedAnswer.toLowerCase();

  const technicalTermsFound = TECHNICAL_TERMS.filter((term) =>
    lowerAnswer.includes(term)
  );

  const hasExplanation =
    /\b(because|therefore|so that|this means|for example|which allows|in order to)\b/i
      .test(normalizedAnswer);

  const hasCodeReference =
    /\b(function|method|variable|class|component|line|file|parameter|return)\b/i
      .test(normalizedAnswer);

  let score = 0;

  if (words.length >= 15) score += 25;
  if (words.length >= 40) score += 20;
  if (technicalTermsFound.length >= 2) score += 20;
  if (technicalTermsFound.length >= 4) score += 15;
  if (hasExplanation) score += 10;
  if (hasCodeReference) score += 10;

  score = Math.min(score, 100);

  let level;

  if (score >= 70) {
    level = "Detailed response";
  } else if (score >= 40) {
    level = "Developing response";
  } else {
    level = "Needs more detail";
  }

  const strengths = [];

  if (words.length >= 15) {
    strengths.push("You provided more than a brief one-line response.");
  }

  if (technicalTermsFound.length > 0) {
    strengths.push(
      `Your answer uses technical terminology: ${technicalTermsFound
        .slice(0, 5)
        .join(", ")}.`
    );
  }

  if (hasExplanation) {
    strengths.push("You attempted to explain the reasoning behind your answer.");
  }

  const improvements = [];

  if (words.length < 15) {
    improvements.push(
      "Explain your reasoning in more detail and describe how the implementation works."
    );
  }

  if (technicalTermsFound.length < 2) {
    improvements.push(
      "Include relevant technical concepts and connect them to the question."
    );
  }

  if (!hasCodeReference) {
    improvements.push(
      `Refer to the relevant implementation in ${sourceFile || "the source file"}.`
    );
  }

  if (!hasExplanation) {
    improvements.push(
      "Explain why the approach works, not just what it does."
    );
  }

  return {
    question,
    score,
    level,
    strengths,
    improvements,
    technicalTermsFound,
    evaluationType: "heuristic",
    disclaimer:
      "This preliminary score measures answer structure and keyword signals. It does not establish technical correctness.",
  };
};
