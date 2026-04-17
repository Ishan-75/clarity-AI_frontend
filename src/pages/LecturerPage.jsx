import React, { useState } from "react";
import "../styles/responsive.css";
import "../styles/app.css";

const API_BASE = "http://127.0.0.1:8000/api/v1";

export default function LecturerPage() {
  const emptyForm = {
    prof_name: "",
    subject_code: "",
    title: "",
    text: "",
  };

  const [form, setForm] = useState(emptyForm);
  const [response, setResponse] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);
    setQuiz(null);

    try {
      const res = await fetch(`${API_BASE}/lectures`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      setResponse({ status: res.status, data });

      if (res.ok && data?.id) {
        // 🔥 Clear inputs AFTER successful save
        setForm(emptyForm);

        // Fetch quiz
        try {
          const qres = await fetch(`${API_BASE}/quizzes/${data.id}`);
          if (qres.ok) {
            const qdata = await qres.json();
            setQuiz(qdata);
          } else {
            setQuiz({ error: `Failed to load quiz: ${qres.status}` });
          }
        } catch (err) {
          setQuiz({ error: String(err) });
        }

        // Optional: focus first input
        setTimeout(() => {
          document.querySelector("input")?.focus();
        }, 0);
      }
    } catch (err) {
      setResponse({ status: "network-error", data: String(err) });
    }

    setLoading(false);
  };

  return (
    <div className="container lecture-page dashboard">
      <h2>Professor — Upload Lecture</h2>

      <form onSubmit={submit} className="form">
        <input
          placeholder="Professor Name"
          value={form.prof_name}
          onChange={(e) =>
            setForm({ ...form, prof_name: e.target.value })
          }
          className="input"
          required
        />

        <input
          placeholder="Subject Code"
          value={form.subject_code}
          onChange={(e) =>
            setForm({ ...form, subject_code: e.target.value })
          }
          className="input"
          required
        />

        <input
          placeholder="Title"
          value={form.title}
          onChange={(e) =>
            setForm({ ...form, title: e.target.value })
          }
          className="input"
        />

        <textarea
          placeholder="Lecture text"
          value={form.text}
          onChange={(e) =>
            setForm({ ...form, text: e.target.value })
          }
          rows={8}
          className="input"
          required
        />

        <button
          type="submit"
          className="submit"
          disabled={loading}
        >
          {loading ? "Saving..." : "Update"}
        </button>
      </form>

      {/* Lecture Result */}
      {response && (
        <div className="result card">
          <h3>Lecture saved ({response.status})</h3>

          {response.status === "network-error" ? (
            <div className="error">{response.data}</div>
          ) : (
            <div>
              <div>
                <strong>ID:</strong> {response.data.id}
              </div>
              <div>
                <strong>Title:</strong> {response.data.title}
              </div>
              <div>
                <strong>Professor:</strong>{" "}
                {response.data.prof_name} — {response.data.subject_code}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quiz Preview */}
      {quiz && (
        <div className="result card">
          <h3>Generated Quiz Preview</h3>

          {quiz.error && (
            <div className="error">{quiz.error}</div>
          )}

          {quiz.quiz &&
            quiz.quiz.map((q, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <strong>Q{i + 1}:</strong> {q.question}
                <div style={{ color: "#888" }}>
                  Answer:{" "}
                  {q.type === "mcq"
                    ? q.correctAnswer
                    : q.answer}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}