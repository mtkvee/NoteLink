"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowUpFromBracket,
  faCopy,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { QRCodeCanvas } from "qrcode.react";
import NotificationBanner, {
  NotificationState,
  NotificationType,
} from "@/components/NotificationBanner";

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
  const [noteId, setNoteId] = useState<string | null>(null);
  const [noteUrl, setNoteUrl] = useState<string | null>(null);
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [hasSuccessfulShare, setHasSuccessfulShare] = useState(false);
  const submitLockRef = useRef(false);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const feedbackTimeoutRef = useRef<number | null>(null);
  const trimmedContent = content.trim();
  const hasValidContent =
    trimmedContent.length > 0 && trimmedContent.length <= 5000;

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

  function resetShareState() {
    if (feedbackTimeoutRef.current) {
      window.clearTimeout(feedbackTimeoutRef.current);
      feedbackTimeoutRef.current = null;
    }

    setContent("");
    setNoteId(null);
    setNoteUrl(null);
    setNotification(null);
    setHasSuccessfulShare(false);
  }

  async function submitShare() {
    if (submitLockRef.current) return;

    submitLockRef.current = true;
    setNotification(null);

    if (!trimmedContent) {
      submitLockRef.current = false;
      return;
    }

    if (trimmedContent.length > 5000) {
      showNotification("Note is too long. Maximum is 5000 characters.", "error");
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
        showNotification(
          "error" in data
            ? data.error
            : "Something went wrong. Please try again.",
          "error",
        );
        return;
      }

      setNoteId(data.id);
      setNoteUrl(data.url);
      setHasSuccessfulShare(true);
      setIsShareModalOpen(true);
    } catch {
      showNotification("Unable to reach the server. Please try again.", "error");
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
      showNotification("Copied", "success");
    } catch {
      showNotification("Copy failed", "error");
    }
  }

  function showNotification(message: string, type: NotificationType) {
    if (feedbackTimeoutRef.current) {
      window.clearTimeout(feedbackTimeoutRef.current);
    }

    setNotification({ message, type });

    feedbackTimeoutRef.current = window.setTimeout(() => {
      setNotification(null);
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
    showNotification("QR downloaded", "info");
  }

  function handleCloseModal() {
    setIsShareModalOpen(false);
    if (hasSuccessfulShare) {
      resetShareState();
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
            maxLength={5000}
          />
          <div className="card-footer">
            <div className="card-footer-row">
              <span className="helper-text">
                {trimmedContent.length} / 5000{" "}
              </span>
              <button
                type="submit"
                className="button-primary"
                disabled={isSubmitting || !hasValidContent}
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
            <div className="share-modal-header">
              {notification && (
                <NotificationBanner notification={notification} />
              )}
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
                <p className="share-modal-warning">
                  Note will auto delete after 72 hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
