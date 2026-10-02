"use client";

import { useEffect, useState } from "react";

export function Connectivity() {
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    if ("serviceWorker" in navigator && window.isSecureContext)
      navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => { /* Online app remains usable without installation support. */ });
    return () => { window.removeEventListener("online", update); window.removeEventListener("offline", update); };
  }, []);
  return offline ? <div role="status" className="sticky top-0 z-40 border-b bg-card px-6 py-3 text-center text-sm">You are offline. Changes cannot be saved or queued. Reconnect before submitting.</div> : null;
}
