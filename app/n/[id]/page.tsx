import Link from "next/link";
import { getFirestore } from "@/lib/firebaseAdmin";

type Note = {
  content: string;
  createdAt?: FirebaseFirestore.Timestamp | null;
};

interface NoteViewPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function NoteViewPage({ params }: NoteViewPageProps) {
  const { id } = await params;

  let note: Note | null = null;
  let error: string | null = null;

  try {
    const firestore = getFirestore();
    const docSnap = await firestore.collection("notes").doc(id).get();

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
    note = {
      content: data.content,
      createdAt: data.createdAt ?? null
    };
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

  const createdAtString =
    note.createdAt && "toDate" in note.createdAt
      ? note.createdAt.toDate().toLocaleString()
      : null;

  return (
    <main>
      <div className="note-container">
        <h1 className="note-title">Shared note</h1>
        <p className="note-meta">
          {createdAtString ? (
            <>
              Created at <span>{createdAtString}</span>
            </>
          ) : (
            "Created recently"
          )}
        </p>
        <div className="note-content">{note.content}</div>
        <p
          style={{
            marginTop: "1.5rem",
            fontSize: "0.8rem",
            color: "#9ca3af",
            textAlign: "right"
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

