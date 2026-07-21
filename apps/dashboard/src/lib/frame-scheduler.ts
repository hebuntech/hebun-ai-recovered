/*
 * Single-shot frame scheduling with a browser-safe fallback.
 *
 * requestAnimationFrame does not run while the document is hidden, which left
 * the dashboard refresh stuck in its loading state until the tab was shown
 * again. This schedules the callback on the next animation frame when frames
 * are actually being produced, and otherwise falls back to a one-shot task.
 *
 * The fallback is deliberately not a poll and not a repeating timer: it is one
 * task that either runs or is cancelled. The callback executes exactly once,
 * whichever path wins.
 */

export type CancelScheduledFrame = () => void;

function documentIsHidden(): boolean {
  return typeof document !== "undefined" && document.visibilityState === "hidden";
}

export function scheduleFrame(callback: () => void): CancelScheduledFrame {
  let settled = false;
  const run = () => {
    if (settled) return;
    settled = true;
    cleanup();
    callback();
  };

  let cleanup = () => {};

  // No frame loop available (hidden document, or a non-browser environment
  // such as server rendering or a test harness): take the fallback directly.
  if (typeof requestAnimationFrame !== "function" || documentIsHidden()) {
    const timer = setTimeout(run, 0);
    cleanup = () => clearTimeout(timer);
    return () => {
      settled = true;
      cleanup();
    };
  }

  const frame = requestAnimationFrame(run);
  // The document can be hidden after the frame is requested, which stalls it
  // indefinitely. Recover once on that transition rather than polling for it.
  const onVisibilityChange = () => {
    if (documentIsHidden()) run();
  };
  document.addEventListener("visibilitychange", onVisibilityChange);
  cleanup = () => {
    cancelAnimationFrame(frame);
    document.removeEventListener("visibilitychange", onVisibilityChange);
  };

  return () => {
    settled = true;
    cleanup();
  };
}
