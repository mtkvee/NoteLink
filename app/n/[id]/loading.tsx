import CircularProgress from "@mui/material/CircularProgress";

export default function LoadingNotePage() {
  return (
    <main>
      <CircularProgress size={28} aria-label="Loading note" sx={{ color: "#606060" }} />
    </main>
  );
}
