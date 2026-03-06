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