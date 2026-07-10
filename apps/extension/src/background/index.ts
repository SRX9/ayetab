chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {
  // Firefox uses sidebar_action instead of chrome.sidePanel
});
