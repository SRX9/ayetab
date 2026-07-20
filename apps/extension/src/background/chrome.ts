/**
 * Chrome MV3 service worker — open the side panel on toolbar click.
 * Kept as the shared entry name for CRXJS; Firefox uses firefox.ts via its manifest.
 */
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((err: unknown) => {
    console.warn("[AyeTab] Failed to set side panel behavior", err);
  });
