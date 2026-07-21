import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { scheduleFrame } from "../../src/lib/frame-scheduler";

type Listener = () => void;

interface FakeBrowser {
  readonly runFrames: () => void;
  readonly hide: () => void;
  readonly show: () => void;
  readonly pendingFrames: () => number;
  readonly restore: () => void;
}

/** Installs a controllable requestAnimationFrame + document.visibilityState. */
function installBrowser(options: { readonly framesRun: boolean } = { framesRun: true }): FakeBrowser {
  const globals = globalThis as unknown as Record<string, unknown>;
  const original = {
    raf: globals.requestAnimationFrame,
    caf: globals.cancelAnimationFrame,
    document: globals.document,
  };
  let frames = new Map<number, Listener>();
  let nextHandle = 1;
  let visibility: "visible" | "hidden" = "visible";
  const visibilityListeners = new Set<Listener>();

  globals.requestAnimationFrame = (callback: Listener) => {
    const handle = nextHandle++;
    // When frames do not run (hidden tab), the callback is never invoked.
    if (options.framesRun) frames.set(handle, callback);
    return handle;
  };
  globals.cancelAnimationFrame = (handle: number) => { frames.delete(handle); };
  globals.document = {
    get visibilityState() { return visibility; },
    addEventListener: (type: string, listener: Listener) => {
      if (type === "visibilitychange") visibilityListeners.add(listener);
    },
    removeEventListener: (type: string, listener: Listener) => {
      if (type === "visibilitychange") visibilityListeners.delete(listener);
    },
  };

  return {
    runFrames() {
      const pending = [...frames.values()];
      frames = new Map();
      for (const callback of pending) callback();
    },
    hide() {
      visibility = "hidden";
      for (const listener of [...visibilityListeners]) listener();
    },
    show() {
      visibility = "visible";
      for (const listener of [...visibilityListeners]) listener();
    },
    pendingFrames: () => frames.size,
    restore() {
      globals.requestAnimationFrame = original.raf;
      globals.cancelAnimationFrame = original.caf;
      globals.document = original.document;
    },
  };
}

const tick = () => new Promise((resolve) => setTimeout(resolve, 5));

/** Visible tab: the callback runs on the animation frame, not the fallback. */
async function runsOnFrameWhenVisible(): Promise<void> {
  const browser = installBrowser();
  try {
    let runs = 0;
    scheduleFrame(() => { runs += 1; });
    assert.equal(runs, 0, "must not run synchronously");
    browser.runFrames();
    assert.equal(runs, 1);
    await tick();
    assert.equal(runs, 1, "the fallback must not double-run it");
  } finally {
    browser.restore();
  }
}

/** Hidden tab: frames never fire, so the fallback must run the callback. */
async function fallsBackWhenHidden(): Promise<void> {
  const browser = installBrowser({ framesRun: false });
  try {
    browser.hide();
    let runs = 0;
    scheduleFrame(() => { runs += 1; });
    assert.equal(browser.pendingFrames(), 0, "no frame should be pending in a hidden tab");
    await tick();
    assert.equal(runs, 1, "hidden tab must still complete the refresh");
  } finally {
    browser.restore();
  }
}

/** Tab hidden after scheduling: the stalled frame is recovered exactly once. */
async function recoversWhenTabBecomesHidden(): Promise<void> {
  const browser = installBrowser({ framesRun: false });
  try {
    let runs = 0;
    scheduleFrame(() => { runs += 1; });
    assert.equal(runs, 0);
    browser.hide();
    assert.equal(runs, 1, "hiding the tab must release the stalled frame");
    browser.show();
    browser.hide();
    await tick();
    assert.equal(runs, 1, "recovery must be single-shot");
  } finally {
    browser.restore();
  }
}

/** The callback runs exactly once regardless of which path wins. */
async function runsExactlyOnce(): Promise<void> {
  const browser = installBrowser();
  try {
    let runs = 0;
    scheduleFrame(() => { runs += 1; });
    browser.runFrames();
    browser.hide();
    browser.show();
    browser.runFrames();
    await tick();
    assert.equal(runs, 1, "no duplicate refresh");
  } finally {
    browser.restore();
  }
}

/**
 * Both paths racing: the tab hides while a frame is already queued, and
 * cancelling does not withdraw it. The callback must still run only once.
 */
async function racingPathsRunOnce(): Promise<void> {
  const globals = globalThis as unknown as Record<string, unknown>;
  const original = { raf: globals.requestAnimationFrame, caf: globals.cancelAnimationFrame, document: globals.document };
  const queued: Listener[] = [];
  let visibility: "visible" | "hidden" = "visible";
  const listeners = new Set<Listener>();
  globals.requestAnimationFrame = (callback: Listener) => { queued.push(callback); return queued.length; };
  // Deliberately ineffective: models a browser that still delivers the frame.
  globals.cancelAnimationFrame = () => {};
  globals.document = {
    get visibilityState() { return visibility; },
    addEventListener: (_: string, listener: Listener) => listeners.add(listener),
    removeEventListener: (_: string, listener: Listener) => listeners.delete(listener),
  };
  try {
    let runs = 0;
    scheduleFrame(() => { runs += 1; });
    visibility = "hidden";
    for (const listener of [...listeners]) listener();
    assert.equal(runs, 1, "hiding must release the callback");
    for (const callback of queued) callback();
    await tick();
    assert.equal(runs, 1, "an undelivered cancel must not cause a second run");
  } finally {
    globals.requestAnimationFrame = original.raf;
    globals.cancelAnimationFrame = original.caf;
    globals.document = original.document;
  }
}

/** Cancelling before the frame fires suppresses the callback on every path. */
async function cancelSuppressesAllPaths(): Promise<void> {
  const browser = installBrowser();
  try {
    let runs = 0;
    const cancel = scheduleFrame(() => { runs += 1; });
    cancel();
    browser.runFrames();
    browser.hide();
    await tick();
    assert.equal(runs, 0, "a cancelled schedule must never run");
  } finally {
    browser.restore();
  }

  const hidden = installBrowser({ framesRun: false });
  try {
    hidden.hide();
    let runs = 0;
    scheduleFrame(() => { runs += 1; })();
    await tick();
    assert.equal(runs, 0, "a cancelled fallback must never run");
  } finally {
    hidden.restore();
  }
}

/** No requestAnimationFrame at all (SSR / harness): the fallback still runs. */
async function worksWithoutRequestAnimationFrame(): Promise<void> {
  const globals = globalThis as unknown as Record<string, unknown>;
  const original = { raf: globals.requestAnimationFrame, document: globals.document };
  globals.requestAnimationFrame = undefined;
  globals.document = undefined;
  try {
    let runs = 0;
    scheduleFrame(() => { runs += 1; });
    await tick();
    assert.equal(runs, 1);
  } finally {
    globals.requestAnimationFrame = original.raf;
    globals.document = original.document;
  }
}

/** The scheduler must not poll or install a repeating timer. */
function introducesNoPolling(): void {
  const source = readFileSync("src/lib/frame-scheduler.ts", "utf8");
  for (const forbidden of ["setInterval", "requestIdleCallback", "while (", "for (;;)"]) {
    assert.equal(source.includes(forbidden), false, `scheduler must not use ${forbidden}`);
  }
  // Exactly one one-shot timer, always paired with a clear.
  assert.equal((source.match(/setTimeout/g) ?? []).length, 1);
  assert.equal(source.includes("clearTimeout"), true);
}

async function main(): Promise<void> {
  await runsOnFrameWhenVisible();
  await fallsBackWhenHidden();
  await recoversWhenTabBecomesHidden();
  await runsExactlyOnce();
  await racingPathsRunOnce();
  await cancelSuppressesAllPaths();
  await worksWithoutRequestAnimationFrame();
  introducesNoPolling();
  console.log("dashboard frame scheduler checks passed");
}

void main();
