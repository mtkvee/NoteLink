"use client";

import { FormEvent, useState } from "react";

type ShareResponse =
  | {
      id: string;
      url: string;
    }
  | {
      error: string;
    };

export default function CreateNotePage() {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noteUrl, setNoteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setCopied(false);
    setNoteUrl(null);

    const trimmed = content.trim();
    if (!trimmed) {
      setError("Please enter something to share.");
      return;
    }

    if (trimmed.length > 5000) {
      setError("Note is too long. Maximum is 5000 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ content })
      });

      const data = (await res.json()) as ShareResponse;

      if (!res.ok || "error" in data) {
        setError(
          "error" in data
            ? data.error
            : "Something went wrong. Please try again."
        );
        return;
      }

      setNoteUrl(data.url);
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCopy() {
    if (!noteUrl) return;
    try {
      await navigator.clipboard.writeText(noteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Could not copy to clipboard. Please copy manually.");
    }
  }

  return (
    <main>
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Quick Note Share</h1>
          <p className="card-subtitle">
            Paste or type your note and get a shareable link. No accounts, just
            text.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <textarea
            className="textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write something you'd like to share..."
            maxLength={6000}
          />
          <div className="card-footer">
            <div className="card-footer-row">
              <button
                type="submit"
                className="button-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sharing..." : "Share"}
              </button>
              <span className="helper-text">
                {content.trim().length}/5000
              </span>
            </div>

            {error && <p className="error-text">{error}</p>}

            {noteUrl && (
              <div>
                <p className="helper-text">Your shareable link:</p>
                <p className="note-url">{noteUrl}</p>
                <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    className="button-secondary"
                    onClick={handleCopy}
                  >
                    Copy link
                  </button>
                  {copied && <span className="success-text">Copied</span>}
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}

