"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";

const STORAGE_KEY = "hebun.sidebar.open-sections";
const STORAGE_EVENT = "hebun-sidebar-open-sections";

/**
 * Accordion open/closed state, persisted to localStorage.
 * Renders with `defaultOpen` first (SSR-safe), then applies the stored
 * state after mount. `ensureOpen` force-opens the active page's section.
 */
export function useSidebarState(defaultOpen: string[]) {
  const cacheRef = useRef<{ key: string; value: string[] }>({
    key: `default:${defaultOpen.join("|")}`,
    value: defaultOpen,
  });

  const getSnapshot = useCallback(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      const cacheKey = stored ?? `default:${defaultOpen.join("|")}`;

      if (cacheRef.current.key === cacheKey) {
        return cacheRef.current.value;
      }

      if (!stored) {
        cacheRef.current = {
          key: cacheKey,
          value: defaultOpen,
        };
        return cacheRef.current.value;
      }

      const parsed = JSON.parse(stored);
      cacheRef.current = {
        key: cacheKey,
        value: Array.isArray(parsed) ? parsed : defaultOpen,
      };

      return cacheRef.current.value;
    } catch {
      // corrupt storage — keep defaults
      return defaultOpen;
    }
  }, [defaultOpen]);

  const subscribe = useCallback((onStoreChange: () => void) => {
    window.addEventListener("storage", onStoreChange);
    window.addEventListener(STORAGE_EVENT, onStoreChange);

    return () => {
      window.removeEventListener("storage", onStoreChange);
      window.removeEventListener(STORAGE_EVENT, onStoreChange);
    };
  }, []);

  const open = useSyncExternalStore(subscribe, getSnapshot, () => defaultOpen);

  const persist = (next: string[]) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event(STORAGE_EVENT));
    } catch {
      // storage unavailable — state stays in memory
    }
  };

  const toggle = useCallback((id: string) => {
    const current = getSnapshot();
    const next = current.includes(id)
      ? current.filter((sectionId) => sectionId !== id)
      : [...current, id];
    persist(next);
  }, [getSnapshot]);

  const ensureOpen = useCallback((id: string) => {
    const current = getSnapshot();
    if (current.includes(id)) return;
    persist([...current, id]);
  }, [getSnapshot]);

  return { open, toggle, ensureOpen };
}
