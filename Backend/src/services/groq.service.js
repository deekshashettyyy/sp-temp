
import Groq from "groq-sdk";
import "dotenv/config";

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  throw new Error("GROQ_API_KEY is missing from Backend/.env");
}

const groq = new Groq({ apiKey });
const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

async function requestJSON(systemPrompt, userPrompt) {
  const response = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.2,
  });

  const content = response.choices[0]?.message?.content;

  if (!content) {
    throw new Error("Groq returned an empty response");
  }

  return JSON.parse(content);
}

// Generate questions grounded in the submitted repository.
export async function generateQuestionsWithAI(sourceFiles, limit = 5) {
  if (!Array.isArray(sourceFiles) || sourceFiles.length === 0) {
    throw new Error("No source files were provided for question generation");
  }

  // Limit the amount of code sent to the model.
  const files = sourceFiles
    .filter((file) => typeof file.content === "string" && file.content.trim())
    .slice(0, 8)
    .map((file) => ({
      path: file.path,
      content: file.content.slice(0, 7000),
    }));

  const result = await requestJSON(
    `You are a technical interviewer for SkillProof.
Generate interview questions that test understanding of the supplied source code.

Rules:
- Questions must be specific to the provided implementation.
- Do not invent functions, variables, routes, or behavior.
- Mix code comprehension, design decisions, debugging, and edge cases where relevant.
- Avoid repetitive or generic questions.
- Evidence must be copied verbatim from one supplied file.
- Preserve every character, including whitespace and indentation.
- Never use ellipses (...), placeholders, summaries, or omitted lines.
- Keep evidence short: approximately 3–8 consecutive source lines.
- Select evidence only from the supplied file content.
- Return fewer questions rather than inventing or approximating evidence.
- Return ONLY valid JSON.
- Return this structure:
{
  "questions": [
    {
      "topic": "short topic",
      "question": "the interview question",
      "sourceFile": "exact supplied file path",
      "evidence": "exact excerpt copied from that file",
      "difficulty": "easy"
    }
  ]
}
Difficulty must be easy, medium, or hard.`,
    JSON.stringify({
      requestedQuestionCount: Math.min(Math.max(limit, 1), 10),
      files,
    })
  );

  if (!Array.isArray(result.questions)) {
    throw new Error("Groq returned an invalid questions format");
  }

  
  const validQuestions = result.questions
    .filter((q, index) => {
      if (
        typeof q.question !== "string" ||
        typeof q.sourceFile !== "string" ||
        typeof q.evidence !== "string" ||
        !q.question.trim() ||
        !q.evidence.trim()
      ) {
        console.log(`Question ${index + 1}: Invalid fields`);
        return false;
      }

      const source = files.find(
        (file) => file.path === q.sourceFile
      );

      if (!source) {
        console.log(
          `Question ${index + 1}: File path not found:`,
          q.sourceFile
        );
        return false;
      }

      if (!source.content.includes(q.evidence)) {
        console.log(
          `Question ${index + 1}: Evidence mismatch`,
          {
            sourceFile: q.sourceFile,
            evidence: q.evidence.slice(0, 150),
          }
        );
        return false;
      }

      return true;
    })
    .slice(0, Math.min(Math.max(limit, 1), 10))
    .map((q, index) => ({
      id: `${q.sourceFile}:groq-${index + 1}`,
      topic: q.topic || "Code understanding",
      question: q.question,
      sourceFile: q.sourceFile,
      evidence: q.evidence,
      difficulty: ["easy", "medium", "hard"].includes(q.difficulty)
        ? q.difficulty
        : "medium",
    }));

console.log("Groq generated:", result.questions.length);
console.log("Valid questions:", validQuestions.length);


  if (validQuestions.length === 0) {
    throw new Error(
      "Groq did not return questions with verifiable code evidence"
    );
  }

  return validQuestions;
}

// Evaluate a student's answer against the actual question and code.
export async function evaluateAnswerWithAI({
  question,
  answer,
  sourceFile,
  evidence,
}) {
  const result = await requestJSON(
    `You are a fair technical interviewer evaluating a student's answer.

Evaluate technical correctness, not just answer length or keywords.
Use the supplied code evidence as the source of truth.
Do not assume behavior that the evidence does not establish.
Give partial credit for partially correct answers.
Do not reward confident but incorrect explanations.
Keep feedback constructive and specific.
Return ONLY valid JSON with this structure:
{
  "score": 0,
  "level": "Needs improvement",
  "summary": "brief assessment",
  "strengths": ["specific strength"],
  "improvements": ["specific correction or missing concept"],
  "correctAnswer": "a concise technically accurate answer",
  "evidenceLimitations": "what cannot be concluded from the supplied snippet"
}
Score must be a number from 0 to 10.
Scoring rubric:
- 0-2: Mostly incorrect, irrelevant, or demonstrates little understanding.
- 3-4: Shows limited understanding but has major errors or omissions.
- 5-6: Partially correct, with the main idea understood but important gaps.
- 7-8: Correct explanation with minor omissions or inaccuracies.
- 9-10: Accurate, complete explanation with appropriate reasoning.

Evaluate only what the question asks.
Do not infer unseen implementation details from a small code snippet.
Clearly identify assumptions and missing context.
Do not give high scores merely because an answer is long or uses technical terms.
Level must be Needs improvement, Developing, Good, or Excellent.
If the answer is empty, assign 0.`,
    JSON.stringify({
      question,
      studentAnswer: answer,
      sourceFile: sourceFile || "Not provided",
      codeEvidence: evidence || "No code evidence provided",
    })
  );

  const score = Number(result.score);

  if (!Number.isFinite(score) || score < 0 || score > 10) {
    throw new Error("Groq returned an invalid evaluation score");
  }

  const asStringArray = (value) =>
    Array.isArray(value)
      ? value.filter((item) => typeof item === "string")
      : [];

  return {
    question,
    score,
    level: ["Needs improvement", "Developing", "Good", "Excellent"].includes(
      result.level
    )
      ? result.level
      : "Developing",
    summary:
      typeof result.summary === "string" ? result.summary : "",
    strengths: asStringArray(result.strengths),
    improvements: asStringArray(result.improvements),
    correctAnswer:
      typeof result.correctAnswer === "string"
        ? result.correctAnswer
        : "",
    evidenceLimitations:
      typeof result.evidenceLimitations === "string"
        ? result.evidenceLimitations
        : "",
    evaluationType: "ai",
    disclaimer: "AI-generated feedback may contain errors.",
  };
}
