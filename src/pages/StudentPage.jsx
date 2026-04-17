import React, { useState, useEffect } from "react";
import "../styles/responsive.css";
import Navbar from "../components/Navbar";

const API_BASE = "http://127.0.0.1:8000/api/v1";
const STORAGE_KEY = "studentPageState";

export default function StudentPage() {
  const [lectureId, setLectureId] = useState("");
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [mode, setMode] = useState("id"); // 'id' | 'search' | 'list'
  const [allLectures, setAllLectures] = useState([]); // original full list
  const [lectures, setLectures] = useState([]); // filtered/sorted display list
  const [search, setSearch] = useState("");
  const [sessionId, setSessionId] = useState(""); // Track quiz session for evaluation
  const [validationErrors, setValidationErrors] = useState([]); // Validation errors

  const loadQuiz = async (id) => {
    const useId = id || lectureId;
    if (!useId) return setQuiz({ error: "No lecture id selected" });
    setQuiz(null);
    setResult(null);
    setValidationErrors([]);
    const res = await fetch(`${API_BASE}/quizzes/${useId}`);
    if (!res.ok) {
      setQuiz({ error: `Failed to load: ${res.status}` });
      return;
    }
    const data = await res.json();
    setQuiz(data);
    setSessionId(data.sessionId || ""); // Store session ID for submission
    setAnswers(Array(data.quiz.length).fill(""));
    return data;
  };

  useEffect(() => {
    // fetch recent lectures for dropdown
    const load = async () => {
      try {
        const r2 = await fetch(`${API_BASE}/lectures`);
        if (r2.ok) {
          const list = await r2.json();
          setAllLectures(list);
          setLectures(list);
        }
      } catch (e) {
        /**/
      }
    };
    load();
  }, []);

  // Restore saved UI state from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const s = JSON.parse(raw);
      if (s.mode) setMode(s.mode);
      if (s.search) setSearch(s.search);
      if (s.lectureId) {
        setLectureId(s.lectureId);
        if (s.sessionId) setSessionId(s.sessionId);
        // load quiz and then restore answers if present
        loadQuiz(s.lectureId)
          .then(() => {
            if (s.answers && Array.isArray(s.answers)) setAnswers(s.answers);
          })
          .catch(() => {});
      }
    } catch (e) {
      /**/
    }
  }, []);

  // Persist selected state to localStorage so reload preserves UI
  useEffect(() => {
    try {
      const toSave = { lectureId, mode, search, answers, sessionId };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {
      /**/
    }
  }, [lectureId, mode, search, answers, sessionId]);

  // Count words in a string
  const countWords = (text) => {
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  };

  // Basic frontend validation - only structural checks, no semantic rules
  const validateAnswers = () => {
    const errors = [];

    if (!sessionId) {
      errors.push("Quiz session ID missing. Please reload the quiz.");
      return errors;
    }

    quiz.quiz.forEach((q, idx) => {
      const answer = (answers[idx] || "").trim();

      // For all answer types: ensure non-empty
      if (!answer) {
        errors.push(`Question ${idx + 1}: Answer cannot be empty`);
        return;
      }

      // For short answers and fill-in: basic length validation
      if (q.type === "short" || q.type === "fill") {
        // Must be at least 2 characters (avoid trivial answers like "a" or "1")
        if (answer.length < 2) {
          errors.push(
            `Question ${idx + 1}: Answer too short (minimum 2 characters)`,
          );
        }
        // Must be less than 5000 characters (catch paste spam)
        else if (answer.length > 5000) {
          errors.push(
            `Question ${idx + 1}: Answer too long (maximum 5000 characters)`,
          );
        }
      }
    });

    return errors;
  };

  const submit = async () => {
    // Validate before submitting
    const errors = validateAnswers();
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);

    const payload = {
      student_reg: "S0001",
      answers,
      sessionId, // CRITICAL: Include session ID to evaluate against the same quiz
    };

    const res = await fetch(`${API_BASE}/quizzes/${lectureId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      setValidationErrors([
        `Error submitting quiz: ${res.status} ${res.statusText}`,
      ]);
      return;
    }

    const data = await res.json();
    setResult(data);
  };

  return (
      <>
    <div className="container">
      <h2>Student — Generate Quiz</h2>

      <div className="modes">
        <label className={mode === "id" ? "active" : ""}>
          <input
            type="radio"
            checked={mode === "id"}
            onChange={() => setMode("id")}
          />{" "}
          By Lecture ID
        </label>
        <label className={mode === "search" ? "active" : ""}>
          <input
            type="radio"
            checked={mode === "search"}
            onChange={() => setMode("search")}
          />{" "}
          Search by name
        </label>
        <label className={mode === "list" ? "active" : ""}>
          <input
            type="radio"
            checked={mode === "list"}
            onChange={() => setMode("list")}
          />{" "}
          Select from list
        </label>
      </div>

      {mode === "id" && (
        <div className="small-form">
          <input
            placeholder="Lecture ID"
            value={lectureId}
            onChange={(e) => setLectureId(e.target.value)}
            className="lecture-id input"
          />
          <button onClick={() => loadQuiz()} className="quiz-get submit">
            Load Quiz
          </button>
        </div>
      )}

      {mode === "search" && (
        <div className="small-form">
          <input
            placeholder="Search by title or prof"
            value={search}
            onChange={(e) => {
              const query = e.target.value.toLowerCase();
              setSearch(e.target.value);
              setQuiz(null);
              setResult(null);
              if (query.trim() === "") {
                setLectures(allLectures);
                return;
              }
              const filtered = allLectures.filter(
                (l) =>
                  l.title.toLowerCase().includes(query) ||
                  l.prof_name.toLowerCase().includes(query) ||
                  l.subject_code.toLowerCase().includes(query),
              );
              setLectures(filtered);
            }}
            className="lecture-id input"
          />
        </div>
      )}

      {mode === "list" && (
        <div className="small-form">
          <select
            value={lectureId}
            onChange={(e) => setLectureId(e.target.value)}
            className="lecture-id input"
          >
            <option value="">-- select lecture --</option>
            {lectures.map((l) => (
              <option key={l.id} value={l.id}>
                {l.title} — {l.prof_name} ({l.subject_code})
              </option>
            ))}
          </select>
          <button onClick={() => loadQuiz()} className="quiz-get submit">
            Load Quiz
          </button>
        </div>
      )}

      {lectures && lectures.length > 0 && mode === "search" && (
        <div className="search-results">
          {lectures.map((l) => (
            <div
              key={l.id}
              className="lecture-row"
              onClick={() => {
                setLectureId(l.id);
                loadQuiz(l.id);
              }}
            >
              <div className="ltitle">{l.title}</div>
              <div className="lmeta">
                {l.prof_name} — {l.subject_code}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* quiz-area */}
      {quiz && quiz.quiz && (
        <div className="quiz animate-fade">
          {/* Show validation errors */}
          {validationErrors.length > 0 && (
            <div
              className="validation-errors"
              style={{
                backgroundColor: "#fee",
                border: "1px solid #fcc",
                borderRadius: "4px",
                padding: "12px",
                marginBottom: "16px",
                color: "#c00",
              }}
            >
              <strong>⚠️ Validation Errors:</strong>
              <ul style={{ marginTop: "8px", marginBottom: "0" }}>
                {validationErrors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {quiz.quiz.map((q, i) => (
            <div key={i} className="question-container">
              <p className="question">
                <strong>Q{i + 1}:</strong> {q.question}
              </p>
              {q.type === "mcq" ? (
                <div className="options">
                  {q.options &&
                    q.options.map((option) => (
                      <label key={option} className="option-label">
                        <input
                          type="radio"
                          name={`q${i}`}
                          value={option}
                          checked={answers[i] === option}
                          onChange={(e) => {
                            const a = [...answers];
                            a[i] = e.target.value;
                            setAnswers(a);
                            setValidationErrors([]); // Clear errors on change
                          }}
                        />
                        {option}
                      </label>
                    ))}
                </div>
              ) : (
                <div>
                  <input
                    type="text"
                    placeholder={
                      q.type === "fill" ? "Fill in the blank" : "Your answer"
                    }
                    value={answers[i] || ""}
                    onChange={(e) => {
                      const a = [...answers];
                      a[i] = e.target.value;
                      setAnswers(a);
                      setValidationErrors([]); // Clear errors on change
                    }}
                    className="answer-input input"
                  />
                </div>
              )}
            </div>
          ))}
          <button onClick={submit} className="quiz-answer-submit submit">
            Submit Answers
          </button>
        </div>
      )}

      {result && (
        <div className="result card animate-pop">
          <h3>Result</h3>
          <div className="score-row">
            <div className="score-number">{result.score}%</div>
            <div className="score-bar">
              <div
                className="score-fill"
                style={{ width: `${result.score}%` }}
              />
            </div>
          </div>
          <div className="incorrect-list">
            {result.incorrect && result.incorrect.length ? (
              result.incorrect.map((it, idx) => (
                <div key={idx} className="incorrect-item">
                  <div className="qtxt">{it.question}</div>
                  <div className="pairs">
                    <div className="exp">
                      Expected: <strong>{it.expected}</strong>
                    </div>
                    <div className="giv">
                      Given: <strong>{it.given}</strong>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="nice">All answers correct — well done!</div>
            )}
          </div>
        </div>
      )}
    </div></>
  );
}
