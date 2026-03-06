import type { Metadata } from "next";
import Link from "next/link";
import { getFirestore } from "@/lib/firebaseAdmin";
import { siteConfig } from "@/lib/site";
import CreatedAtText from "./CreatedAtText";

type Note = {
  content: string;
  createdAt?: FirebaseFirestore.Timestamp | null;
  expireAt?: FirebaseFirestore.Timestamp | null;
};

interface NoteViewPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: NoteViewPageProps): Promise<Metadata> {
  const { id } = await params;

  return {
    title: "Shared Note",
    description: "Private shared note view",
    alternates: {
      canonical: `/n/${id}`,
    },
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: {
        index: false,
        follow: false,
        noimageindex: true,
        "max-snippet": -1,
        "max-image-preview": "none",
        "max-video-preview": -1,
      },
    },
    openGraph: {
      title: `Shared note | ${siteConfig.name}`,
      description: "This note page is intentionally not indexed by search engines.",
      url: `/n/${id}`,
      images: [siteConfig.ogImagePath],
    },
  };
}

export default async function NoteViewPage({ params }: NoteViewPageProps) {
  const { id } = await params;

  let note: Note | null = null;
  let error: string | null = null;
  let isExpired = false;

  try {
    const firestore = getFirestore();
    const docRef = firestore.collection("notes").doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return (
        <main>
          <div className="note-container center-text">
            <h1 className="card-title">Note not found</h1>
            <p className="card-subtitle" style={{ marginBottom: "1.25rem" }}>
              This note may have expired, been deleted, or never existed.
            </p>
            <Link href="/" className="muted-link">
              ← Create a new note
            </Link>
          </div>
        </main>
      );
    }

    const data = docSnap.data() as Note;
    const expireAtDate =
      data.expireAt && "toDate" in data.expireAt ? data.expireAt.toDate() : null;

    if (expireAtDate && expireAtDate.getTime() <= Date.now()) {
      await docRef.delete();
      isExpired = true;
    } else {
    note = {
      content: data.content,
      createdAt: data.createdAt ?? null,
        expireAt: data.expireAt ?? null,
      };
    }
  } catch {
    error = "Failed to load this note. Please try again.";
  }

  if (error) {
    return (
      <main>
        <div className="note-container center-text">
          <h1 className="card-title">Something went wrong</h1>
          <p className="card-subtitle" style={{ marginBottom: "1.25rem" }}>
            {error}
          </p>
          <Link href="/" className="muted-link">
            ← Back to create note
          </Link>
        </div>
      </main>
    );
  }

  if (isExpired) {
    return (
      <main>
        <div className="note-container center-text">
          <h1 className="card-title">This note has expired</h1>
          <p className="card-subtitle" style={{ marginBottom: "1.25rem" }}>
            This note was available for 3 days and has now been removed.
          </p>
          <Link href="/" className="muted-link">
            Create your own note
          </Link>
        </div>
      </main>
    );
  }

  if (!note) {
    return (
      <main>
        <div className="note-container center-text">
          <h1 className="card-title">Note unavailable</h1>
          <p className="card-subtitle" style={{ marginBottom: "1.25rem" }}>
            We couldn&apos;t load this note. Please try again.
          </p>
          <Link href="/" className="muted-link">
            ← Back to create note
          </Link>
        </div>
      </main>
    );
  }

  const createdAtTimestampMs =
    note.createdAt && "toDate" in note.createdAt
      ? note.createdAt.toDate().getTime()
      : null;

  return (
    <main>
      <div className="note-container">
        <h1 className="note-title">Shared Note</h1>
        <p className="note-meta">
          <CreatedAtText timestampMs={createdAtTimestampMs} />
        </p>
        <div className="note-content">{note.content}</div>
        <p
          style={{
            marginTop: "1.5rem",
            fontSize: "0.8rem",
            color: "#9ca3af",
            textAlign: "right",
          }}
        >
          <Link href="/" className="muted-link">
            Create your own note →
          </Link>
        </p>
      </div>
    </main>
  );
}
