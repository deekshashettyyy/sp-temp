
import { useState } from "react";
import { evaluateAnswer } from "../services/answerApi.js";

export default function QuestionList({ questions }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!questions?.length) {
    return (
      <section className="panel">
        <h2>No interview questions available</h2>
        <p className="muted">
          Try a repository containing supported source code.
        </p>
      </section>
    );
  }

  const question = questions[activeIndex];
  const currentFeedback = feedback[question.id];

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!answer.trim()) {
      setError("Please write an answer before submitting.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await evaluateAnswer({
        question: question.question,
        answer: answer.trim(),
        sourceFile: question.sourceFile,
      });

      setFeedback((previous) => ({
        ...previous,
        [question.id]: {
          ...result,
          submittedAnswer: answer.trim(),
        },
      }));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  const goToQuestion = (nextIndex) => {
    setActiveIndex(nextIndex);
    setAnswer("");
    setError("");
  };

  return (
    <section className="panel interview-panel" id="interview">
      <div className="section-heading">
        <div>
          <p className="eyebrow">TECHNICAL INTERVIEW</p>
          <h2>Your repository-based questions</h2>
          <p className="muted">
            Explain your reasoning and refer to the implementation where possible.
          </p>
        </div>

        <span className="question-counter">
          {activeIndex + 1} / {questions.length}
        </span>
      </div>

      <div className="progress-track">
        <div
          className="progress-value"
          style={{
            width: `${((activeIndex + 1) / questions.length) * 100}%`,
          }}
        />
      </div>

      <div className="question-navigation">
        {questions.map((item, index) => (
          <button
            key={item.id}
            type="button"
            className={`question-nav-item ${
              index === activeIndex ? "active" : ""
            } ${feedback[item.id] ? "answered" : ""}`}
            onClick={() => goToQuestion(index)}
            aria-label={`Go to question ${index + 1}`}
          >
            {String(index + 1).padStart(2, "0")}
            {feedback[item.id] && <span className="answered-dot" />}
          </button>
        ))}
      </div>

      <span className="technology-tag">{question.topic}</span>

      <h3 className="question-text">{question.question}</h3>

      <div className="evidence-box">
        <div className="evidence-heading">
          <span>Source evidence</span>
          <code>{question.sourceFile}</code>
        </div>

        <pre>
          <code>{question.evidence}</code>
        </pre>
      </div>

      <form className="answer-form" onSubmit={handleSubmit}>
        <label htmlFor="interview-answer">Your answer</label>

        <textarea
          id="interview-answer"
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          placeholder="Explain how the code works, why this approach is used, and any relevant trade-offs..."
          rows={5}
          maxLength={10000}
          disabled={loading}
        />

        <div className="answer-form-footer">
          <span>{answer.length}/10,000 characters</span>

          <button type="submit" disabled={loading || !answer.trim()}>
            {loading ? "Evaluating..." : "Submit answer"}
          </button>
        </div>
      </form>

      {error && (
        <div className="error-notice" role="alert">
          {error}
        </div>
      )}

      {currentFeedback && (
        <section className="feedback-panel" aria-live="polite">
          <div className="feedback-heading">
            <div>
              <p className="eyebrow">ANSWER REVIEW</p>
              <h3>{currentFeedback.level}</h3>
            </div>

            <div className="score-display">
              <strong>{currentFeedback.score}</strong>
              <span>/ 100</span>
            </div>
          </div>

          <p className="feedback-disclaimer">
            {currentFeedback.disclaimer}
          </p>

          <div className="feedback-columns">
            <div>
              <h4>Strengths</h4>
              {currentFeedback.strengths.length ? (
                <ul>
                  {currentFeedback.strengths.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="muted">No strengths identified by the current rules.</p>
              )}
            </div>

            <div>
              <h4>Areas to improve</h4>
              {currentFeedback.improvements.length ? (
                <ul>
                  {currentFeedback.improvements.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="muted">No additional suggestions from the current rules.</p>
              )}
            </div>
          </div>
        </section>
      )}

      <div className="question-actions">
        <button
          type="button"
          className="secondary-button"
          onClick={() => goToQuestion(activeIndex - 1)}
          disabled={activeIndex === 0 || loading}
        >
          ← Previous
        </button>

        <button
          type="button"
          onClick={() => goToQuestion(activeIndex + 1)}
          disabled={activeIndex === questions.length - 1 || loading}
        >
          Next question →
        </button>
      </div>

      <p className="muted">
        Feedback currently uses rule-based heuristics. Answers are held in
        component state and are not yet saved to MongoDB.
      </p>
    </section>
  );
}
