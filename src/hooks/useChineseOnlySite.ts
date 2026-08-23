"use client";

import { useSyncExternalStore } from "react";
import { isChineseOnlyHost } from "@/lib/localeDetection";

function getSnapshot() {
  if (typeof window === "undefined") return false;
  return isChineseOnlyHost(window.location.hostname);
}

function subscribe(onStoreChange: () => void) {
  onStoreChange();
  return () => undefined;
}

export function useChineseOnlySite() {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
