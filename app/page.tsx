"use client";

import { FormEvent, useRef, useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpFromBracket } from "@fortawesome/free-solid-svg-icons";

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
  const [copyError, setCopyError] = useState<string | null>(null);
  const submitLockRef = useRef(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitLockRef.current) return;

    submitLockRef.current = true;
    setError(null);
    setCopied(false);
    setCopyError(null);
    setNoteUrl(null);

    const trimmed = content.trim();
    if (!trimmed) {
      setError("Please enter something to share.");
      submitLockRef.current = false;
      return;
    }

    if (trimmed.length > 5000) {
      setError("Note is too long. Maximum is 5000 characters.");
      submitLockRef.current = false;
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      const data = (await res.json()) as ShareResponse;

      if (!res.ok || "error" in data) {
        setError(
          "error" in data
            ? data.error
            : "Something went wrong. Please try again.",
        );
        return;
      }

      setNoteUrl(data.url);
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setIsSubmitting(false);
      submitLockRef.current = false;
    }
  }

  async function handleCopy() {
    if (!noteUrl) return;
    try {
      await navigator.clipboard.writeText(noteUrl);
      setCopyError(null);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
      setCopyError("Copy failed");
    }
  }

  return (
    <main>
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">NoteLink</h1>
          <p className="card-subtitle">
            Paste or type your note and get a shareable link. No accounts, just
            text.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <textarea
            className="textarea overflow-y-scroll scrollbar-hide"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write something you'd like to share..."
            maxLength={6000}
          />
          <div className="card-footer">
            <div className="card-footer-row">
              <span className="helper-text">
                {content.trim().length} / 5000{" "}
              </span>
              <button
                type="submit"
                className="button-primary"
                disabled={isSubmitting}
                aria-label="Share"
                aria-busy={isSubmitting}
              >
                <span className="button-primary-content">
                  <span className="button-primary-icon" aria-hidden="true">
                    {isSubmitting ? (
                      <CircularProgress
                        size={16}
                        color="inherit"
                        thickness={5}
                      />
                    ) : (
                      <FontAwesomeIcon icon={faArrowUpFromBracket} />
                    )}
                  </span>
                </span>
              </button>
            </div>

            {error && <p className="error-text">{error}</p>}

            {noteUrl && (
              <div className="share-link-block">
                <p className="helper-text">Your shareable link:</p>
                <div className="note-url-row">
                  <p className="note-url">{noteUrl}</p>
                  <div className="note-url-copy">
                    <IconButton
                      type="button"
                      onClick={handleCopy}
                      aria-label="Copy share link"
                      size="small"
                    >
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                    {copied && <span className="success-text">Copied</span>}
                  </div>
                </div>
                {copyError && <p className="error-text">{copyError}</p>}
              </div>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}
