"use client";

import { useEffect, useState } from "react";

type CreatedAtTextProps = {
  timestampMs: number | null;
};

export default function CreatedAtText({ timestampMs }: CreatedAtTextProps) {
  const [formatted, setFormatted] = useState<string | null>(null);

  useEffect(() => {
    if (!timestampMs) {
      setFormatted(null);
      return;
    }

    const formatter = new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    setFormatted(formatter.format(new Date(timestampMs)));
  }, [timestampMs]);

  if (!formatted) {
    return <>Created recently</>;
  }

  return (
    <>
      Created at <span>{formatted}</span>
    </>
  );
}
