"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
type InstallEvent = Event & { prompt(): Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };
export function InstallControl() {
  const [prompt, setPrompt] = useState<InstallEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    const display = window.matchMedia("(display-mode: standalone)");
    const update = () => setInstalled(display.matches);
    const offer = (event: Event) => { event.preventDefault(); setPrompt(event as InstallEvent); };
    const finish = () => { setInstalled(true); setPrompt(null); };
    update(); display.addEventListener("change", update);
    window.addEventListener("beforeinstallprompt", offer); window.addEventListener("appinstalled", finish);
    return () => { display.removeEventListener("change", update); window.removeEventListener("beforeinstallprompt", offer); window.removeEventListener("appinstalled", finish); };
  }, []);
  async function install() {
    if (!prompt) return;
    try { await prompt.prompt(); const choice = await prompt.userChoice; setMessage(choice.outcome === "accepted" ? "Installation accepted." : "You can install later from your browser menu."); }
    catch { setMessage("Open your browser menu to install this app."); }
    finally { setPrompt(null); }
  }
  return <div className="max-w-md space-y-3 text-sm"><p className="leading-6 text-muted-foreground">{installed ? "Winter Arc OS is open as an installed app." : "Install from your browser's app menu. On iPhone or iPad, use Safari's Share menu, then Add to Home Screen."}</p>
    {prompt && !installed && <Button type="button" variant="outline" className="min-h-11" onClick={install}>Install Winter Arc OS</Button>}
    <p className="text-xs leading-5 text-muted-foreground">Installation needs HTTPS or localhost. Private records require a connection; offline access shows a public reconnect screen.</p>{message && <p role="status">{message}</p>}
  </div>;
}
