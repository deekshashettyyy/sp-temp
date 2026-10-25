import { generateQuestionsWithAI } from "./groq.service.js";

const QUESTION_TEMPLATES = [
  {
    id: "explain-function",
    matches: (code) =>
      /\bfunction\s+\w+|\bconst\s+\w+\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/.test(code),
    question:
      "Explain the purpose of the function shown in this file. What are its inputs, and what does it return?",
    topic: "Function understanding",
    evidencePattern:
      /\bfunction\s+\w+|\bconst\s+\w+\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/,
  },
  {
    id: "async-code",
    matches: (code) => /\basync\b|\bawait\b/.test(code),
    question:
      "This file uses asynchronous JavaScript. Explain how the asynchronous operation works and how errors should be handled.",
    topic: "Asynchronous JavaScript",
    evidencePattern: /\basync\b|\bawait\b/,
  },
  {
    id: "express-route",
    // Only ask this when an actual HTTP route definition exists.
    matches: (code) =>
      /\b(?:app|router)\s*\.\s*(?:get|post|put|patch|delete)\s*\(/i.test(code),
    question:
      "Explain the request-handling flow in this route. What happens when a request reaches it?",
    topic: "Backend request handling",
    evidencePattern:
      /\b(?:app|router)\s*\.\s*(?:get|post|put|patch|delete)\s*\(/i,
  },
  {
    id: "error-handling",
    matches: (code) => /\btry\b|\bcatch\b|next\s*\(\s*error\s*\)/.test(code),
    question:
      "How does this code handle errors? What could happen if an error is not handled correctly?",
    topic: "Error handling",
    evidencePattern: /\btry\b|\bcatch\b|next\s*\(\s*error\s*\)/,
  },
  {
    id: "react-component",
    matches: (code, file) =>
      /\.(jsx|tsx)$/i.test(file.path) &&
      /useState|useEffect|<[A-Z][A-Za-z0-9.]*/.test(code),
    question:
      "Explain the React component's rendering logic and how its state or effects affect the user interface.",
    topic: "React component logic",
    evidencePattern:
      /useState|useEffect|export\s+default\s+function|function\s+[A-Z]\w*/,
  },
  {
    id: "data-structures",
    matches: (code) =>
      /\.map\s*\(|\.filter\s*\(|\.reduce\s*\(|new Map\s*\(|new Set\s*\(/.test(code),
    question:
      "Explain how the collection operation in this file works and what its output will be.",
    topic: "Data handling",
    evidencePattern:
      /\.map\s*\(|\.filter\s*\(|\.reduce\s*\(|new Map\s*\(|new Set\s*\(/,
  },
];

const extractEvidence = (code, template) => {
  const lines = code.split(/\r?\n/);
  const pattern = template.evidencePattern;

  // Find the line containing the code relevant to this question.
  const matchIndex = lines.findIndex((line) => pattern.test(line));

  if (matchIndex === -1) {
    return code.slice(0, 500);
  }

  // Include context before the matching line and enough following lines
  // to make the relevant operation understandable.
  const start = Math.max(0, matchIndex - 3);
  const end = Math.min(lines.length, matchIndex + 17);

  let excerpt = lines.slice(start, end).join("\n");

  // Keep the evidence pane reasonably sized.
  if (excerpt.length > 1800) {
    excerpt = excerpt.slice(0, 1800) + "\n// ... excerpt truncated";
  }

  return excerpt;
};

const buildQuestionsForFile = (file) => {
  const code = file.content;

  if (typeof code !== "string" || !code.trim()) {
    return [];
  }

  return QUESTION_TEMPLATES
    .filter((template) => template.matches(code, file))
    .map((template) => ({
      id: `${file.path}:${template.id}`,
      topic: template.topic,
      question: template.question,
      sourceFile: file.path,
      evidence: extractEvidence(code, template),
    }));
};

// export const generateQuestions = (sourceFiles, limit = 5) => {
//   if (!Array.isArray(sourceFiles) || sourceFiles.length === 0) {
//     throw new Error("No source files are available for question generation.");
//   }

  export const generateQuestions = async (sourceFiles, limit = 5) => {
    return generateQuestionsWithAI(sourceFiles, limit);
};

//   const questions = sourceFiles.flatMap(buildQuestionsForFile);

//   const uniqueQuestions = [
//     ...new Map(questions.map((item) => [item.id, item])).values(),
//   ];

//   if (uniqueQuestions.length === 0) {
//     throw new Error(
//       "No supported code patterns were found in the retrieved source files."
//     );
//   }

//   return uniqueQuestions.slice(0, limit);
// };
