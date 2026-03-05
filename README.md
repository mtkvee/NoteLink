# Quick Note Share

Quick Note Share is a minimal Next.js app for sharing plain text notes through a simple URL. Notes are stored in Firebase Firestore via Firebase Admin on the server, so your credentials are never exposed to the client.

## Features

- **Create note**: centered card on `/` with a textarea and **Share** button.
- **Share flow**:
  - Sends `POST` to `/api/share` with `{ content }`.
  - Validates trimmed content length \(1..5000 chars\).
  - Saves to Firestore collection `notes` with fields: `content`, `createdAt` \(server timestamp\).
  - Returns `{ id, url }`, where `url` is `${origin}/n/${id}`.
- **View note**: `/n/[id]` displays the saved note in read-only form using `white-space: pre-wrap` to preserve line breaks.
- **Copy link**: Copy button uses the Clipboard API and shows a small “Copied” indicator.

## Tech stack

- **Framework**: Next.js \(App Router\)
- **Language**: TypeScript
- **Data store**: Firebase Firestore via `firebase-admin`

## File structure \(key parts\)

- `app/layout.tsx` – Root layout and metadata.
- `app/page.tsx` – CreateNotePage with textarea, Share button, and copyable URL.
- `app/n/[id]/page.tsx` – NoteViewPage that fetches and renders a note by ID.
- `app/n/[id]/loading.tsx` – Loading state for note view.
- `app/api/share/route.ts` – API route that validates input and writes to Firestore.
- `lib/firebaseAdmin.ts` – Firebase Admin initialization and Firestore export.
- `app/globals.css` – Minimal, responsive styling.

## Environment variables

Create a `.env.local` file in the project root and set:

```bash
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-client-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...your key...\n-----END PRIVATE KEY-----\n"

# Optional: used as a fallback to construct absolute URLs
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

**Notes:**

- The `FIREBASE_PRIVATE_KEY` often needs newline characters escaped as `\\n` in `.env.local`. This project replaces `\\n` with real newlines at runtime.
- These variables are only read on the server, and the admin SDK is never bundled into client code.

## Firebase setup

1. **Create a Firebase project** if you haven’t already.
2. **Enable Firestore** in the Firebase console \(use native mode\).
3. **Create a service account key**:
   - Go to **Project settings → Service accounts → Firebase Admin SDK**.
   - Generate a new private key and download the JSON.
   - Take `project_id`, `client_email`, and `private_key` from that JSON and put them into your `.env.local` as shown above.

## Firestore security rules

This app only writes to Firestore via the server-side Admin SDK. To ensure clients cannot write directly but can read single note documents by ID, you can use rules like:

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /notes/{noteId} {
      // Allow anyone to read a single note document
      allow read: if true;

      // Disallow client writes; only server (Admin SDK) can write
      allow write: if false;
    }
  }
}
```

## Development

### Install dependencies

```bash
npm install
```

### Run the dev server

```bash
npm run dev
```

Then open `http://localhost:3000` in your browser.

## Deploying

You can deploy this app to any Next.js-compatible host \(for example, Vercel\).

1. **Set environment variables** in your hosting platform:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY`
   - `NEXT_PUBLIC_APP_URL` \(e.g. `https://your-domain.com`\)
2. **Deploy** using your platform’s Next.js deployment instructions.

Once deployed:

- Go to `/` and create a note.
- Copy the generated URL and open it in a new tab or share it—this will load the note from Firestore via a server-side fetch.

