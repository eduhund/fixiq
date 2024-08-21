const interval = setInterval(() => {
  figma.viewport.zoom = 1;
}, 14);

figma.notify("Scale is locked", {
  timeout: Infinity,
  onDequeue: () => {
    clearInterval(interval);
    figma.closePlugin();
  },
});
