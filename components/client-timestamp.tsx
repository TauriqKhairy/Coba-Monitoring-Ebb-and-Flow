"use client";

import React, { useState, useEffect } from "react";
import { formatTimestamp } from "@/lib/utils";

export function ClientTimestamp({
  timestamp,
  fallback = "-",
}: {
  timestamp?: number | string | null;
  fallback?: string;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <span suppressHydrationWarning>{fallback}</span>;
  }

  return (
    <span suppressHydrationWarning>
      {timestamp ? formatTimestamp(timestamp) : fallback}
    </span>
  );
}
