"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowUpFromBracket,
  faCopy,
  faTriangleExclamation,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { QRCodeCanvas } from "qrcode.react";

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
  const [noteId, setNoteId] = useState<string | null>(null);
  const [noteUrl, setNoteUrl] = useState<string | null>(null);
  const [copyError, setCopyError] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showIndicator, setShowIndicator] = useState(false);
  const [isIndicatorVisible, setIsIndicatorVisible] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const submitLockRef = useRef(false);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const feedbackTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!showIndicator) return;

    setIsIndicatorVisible(true);

    const fadeTimer = window.setTimeout(() => {
      setIsIndicatorVisible(false);
    }, 2100);

    const hideTimer = window.setTimeout(() => {
      setShowIndicator(false);
    }, 2500);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(hideTimer);
    };
  }, [showIndicator]);

  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) {
        window.clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isShareModalOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsShareModalOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isShareModalOpen]);

  async function submitShare() {
    if (submitLockRef.current) return;

    submitLockRef.current = true;
    setError(null);
    setNoteId(null);
    setCopyError(null);
    setFeedbackMessage(null);
    setShowFeedback(false);
    setShowIndicator(false);
    setIsIndicatorVisible(false);
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

      setNoteId(data.id);
      setNoteUrl(data.url);
      setShowIndicator(true);
      setIsShareModalOpen(true);
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setIsSubmitting(false);
      submitLockRef.current = false;
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await submitShare();
  }

  async function handleCopy() {
    if (!noteUrl) return;
    try {
      await navigator.clipboard.writeText(noteUrl);
      setCopyError(null);
      showSharedFeedback("Copied");
    } catch {
      setCopyError("Copy failed");
    }
  }

  function showSharedFeedback(message: string) {
    if (feedbackTimeoutRef.current) {
      window.clearTimeout(feedbackTimeoutRef.current);
    }

    setFeedbackMessage(message);
    setShowFeedback(true);

    feedbackTimeoutRef.current = window.setTimeout(() => {
      setShowFeedback(false);
      setFeedbackMessage(null);
      feedbackTimeoutRef.current = null;
    }, 2000);
  }

  function handleQrDownload() {
    if (!noteUrl) return;

    const qrCanvas = document.getElementById(
      "notelink-qr",
    ) as HTMLCanvasElement | null;
    if (!qrCanvas) return;

    const fallbackId = noteUrl.split("/n/")[1]?.split(/[?#]/)[0] || null;
    const resolvedNoteId = noteId || fallbackId;
    const downloadFileName = resolvedNoteId
      ? `notelink-${resolvedNoteId}-qr.png`
      : "notelink-qr.png";

    const downloadLink = document.createElement("a");
    downloadLink.href = qrCanvas.toDataURL("image/png");
    downloadLink.download = downloadFileName;
    downloadLink.click();
    showSharedFeedback("QR downloaded");
  }

  function handleCloseModal() {
    setIsShareModalOpen(false);
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
          </div>
        </form>
      </div>

      {isShareModalOpen && noteUrl && (
        <div
          className="share-modal-backdrop"
          onClick={handleCloseModal}
          aria-hidden="true"
        >
          <div
            className="share-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            {showFeedback && feedbackMessage && (
              <p className="share-modal-feedback">{feedbackMessage}</p>
            )}

            <div className="share-modal-header">
              <h2 id="share-modal-title" className="share-modal-title">
                Share
              </h2>
              <button
                ref={closeButtonRef}
                type="button"
                className="share-modal-close"
                onClick={handleCloseModal}
                aria-label="Close share dialog"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <div className="share-link-block">
              <p className="helper-text">Your shareable link:</p>
              <div className="note-url-row">
                <p className="note-url">{noteUrl}</p>
                <div className="note-url-copy">
                  <button
                    type="button"
                    className="icon-button"
                    onClick={handleCopy}
                    aria-label="Copy share link"
                  >
                    <FontAwesomeIcon icon={faCopy} />
                  </button>
                </div>
              </div>
              {copyError && <p className="error-text">{copyError}</p>}
              <div className="qr-share-block">
                <p className="helper-text">Scan QR or Click to download</p>
                <button
                  type="button"
                  className="qr-code-button"
                  onClick={handleQrDownload}
                  aria-label="Download QR code"
                >
                  <div className="qr-code-frame">
                    <QRCodeCanvas
                      id="notelink-qr"
                      value={noteUrl}
                      size={168}
                      level="M"
                      includeMargin
                      bgColor="#ffffff"
                      fgColor="#111827"
                    />
                  </div>
                </button>
              </div>
              <p className="warning-indicator">
                <span>Note will auto delete after 78 hours.</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
