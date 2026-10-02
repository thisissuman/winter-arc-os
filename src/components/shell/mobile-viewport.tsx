"use client";

import { useEffect } from "react";

function isEditing(element: Element | null) {
  return (element instanceof HTMLInputElement && !["checkbox", "radio", "button", "submit", "reset", "hidden"].includes(element.type))
    || element instanceof HTMLTextAreaElement
    || element instanceof HTMLSelectElement
    || element instanceof HTMLElement && element.isContentEditable;
}

export function MobileViewport() {
  useEffect(() => {
    const root = document.documentElement;
    const viewport = window.visualViewport;
    let unobstructedHeight = viewport?.height ?? window.innerHeight;
    let viewportWidth = viewport?.width ?? window.innerWidth;
    let focusFrame = 0;

    function update() {
      const height = viewport?.height ?? window.innerHeight;
      const width = viewport?.width ?? window.innerWidth;
      const editing = isEditing(document.activeElement);
      if (Math.abs(width - viewportWidth) > 80) unobstructedHeight = height;
      viewportWidth = width;
      if (!editing) unobstructedHeight = height;
      const keyboardOpen = editing && unobstructedHeight - height > 120;
      root.style.setProperty("--workspace-visual-height", `${Math.round(height)}px`);
      root.style.setProperty("--workspace-keyboard-inset", `${Math.round(Math.max(0, window.innerHeight - (viewport?.offsetTop ?? 0) - height))}px`);
      if (keyboardOpen) root.dataset.workspaceKeyboard = "open";
      else delete root.dataset.workspaceKeyboard;
    }

    function afterFocus() {
      window.cancelAnimationFrame(focusFrame);
      focusFrame = window.requestAnimationFrame(update);
    }

    update();
    document.addEventListener("focusin", afterFocus);
    document.addEventListener("focusout", afterFocus);
    window.addEventListener("resize", update);
    viewport?.addEventListener("resize", update);
    viewport?.addEventListener("scroll", update);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("focusin", afterFocus);
      document.removeEventListener("focusout", afterFocus);
      window.removeEventListener("resize", update);
      viewport?.removeEventListener("resize", update);
      viewport?.removeEventListener("scroll", update);
      delete root.dataset.workspaceKeyboard;
      root.style.removeProperty("--workspace-visual-height");
      root.style.removeProperty("--workspace-keyboard-inset");
    };
  }, []);
  return null;
}
