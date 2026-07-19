/**
 * Firefox MV3 background — toggle the sidebar on toolbar click.
 * Uses the WebExtensions sidebarAction API (not Chrome's sidePanel).
 */
declare const browser: {
  action: {
    onClicked: {
      addListener: (cb: () => void) => void;
    };
  };
  sidebarAction: {
    toggle: () => Promise<void>;
  };
};

browser.action.onClicked.addListener(() => {
  void browser.sidebarAction.toggle().catch((err: unknown) => {
    console.warn("[AyeTab] Failed to toggle sidebar", err);
  });
});
