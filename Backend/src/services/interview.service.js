
const QUESTION_TEMPLATES = [
  {
    id: "explain-function",
    matches: (code) => /\bfunction\s+\w+|\bconst\s+\w+\s*=\s*(?:async\s*)?\(/.test(code),
    question: "Explain the purpose of the function shown in this file. What are its inputs, and what does it return?",
    topic: "Function understanding",
  },
  {
    id: "async-code",
    matches: (code) => /\basync\b|\bawait\b/.test(code),
    question: "This file uses asynchronous JavaScript. Explain how the asynchronous operation works and how errors should be handled.",
    topic: "Asynchronous JavaScript",
  },
  {
    id: "express-route",
    matches: (code) => /\.get\(|\.post\(|\.put\(|\.delete\(|Router\(/.test(code),
    question: "Explain the request-handling flow in this route. What happens when a request reaches it?",
    topic: "Backend request handling",
  },
  {
    id: "error-handling",
    matches: (code) => /\btry\b|\bcatch\b|next\s*\(\s*error\s*\)/.test(code),
    question: "How does this code handle errors? What could happen if an error is not handled correctly?",
    topic: "Error handling",
  },
  {
    id: "react-component",
    matches: (code, file) =>
      /\.(jsx|tsx)$/i.test(file.path) &&
      /useState|useEffect|<[A-Z][A-Za-z0-9.]*/.test(code),
    question:
      "Explain the React component's rendering logic and how its state or effects affect the user interface.",
    topic: "React component logic",
  },
  {
    id: "data-structures",
    matches: (code) => /\.map\(|\.filter\(|\.reduce\(|new Map\(|new Set\(/.test(code),
    question: "Explain how the collection operation in this file works and what its output will be.",
    topic: "Data handling",
  },
];

const buildQuestionsForFile = (file) => {
  const code = file.content;

  if (typeof code !== "string" || code.trim().length === 0) {
    return [];
  }

  return QUESTION_TEMPLATES
    .filter((template) => template.matches(code, file))
    .map((template) => ({
      id: `${file.path}:${template.id}`,
      topic: template.topic,
      question: template.question,
      sourceFile: file.path,
      evidence: code.slice(0, 500),
    }));
};

export const generateQuestions = (sourceFiles, limit = 5) => {
  if (!Array.isArray(sourceFiles) || sourceFiles.length === 0) {
    throw new Error("No source files are available for question generation.");
  }

  const questions = sourceFiles.flatMap(buildQuestionsForFile);

  const uniqueQuestions = [
    ...new Map(questions.map((item) => [item.id, item])).values(),
  ];

  if (uniqueQuestions.length === 0) {
    throw new Error(
      "No supported code patterns were found in the retrieved source files."
    );
  }

  return uniqueQuestions.slice(0, limit);
};
