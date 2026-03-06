export const siteConfig = {
  name: "NoteLink",
  description:
    "Create a secure shareable link for plain text notes in seconds.",
  url:
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "") ??
    "https://note-linkshare.vercel.app",
  ogImagePath: "/opengraph-image",
} as const;
