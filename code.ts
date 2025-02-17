const { getScale, changeScale } = (() => {
  const scales = [0.5, 1, 2];
  let currentScale = 1;

  function getScale() {
    return currentScale;
  }

  function changeScale() {
    const currentIndex = scales.findIndex((item) => item === currentScale);
    const nextIndex = currentIndex + 1;
    currentScale = nextIndex === scales.length ? scales[0] : scales[nextIndex];
    return currentScale;
  }

  return { getScale, changeScale };
})();

const { showNotify, closeNotify } = (() => {
  let notify: NotificationHandler | null = null;

  function closeNotify() {
    if (notify) {
      notify.cancel();
      notify = null;
    }
  }

  function showNotify(text: string, settings: NotificationOptions) {
    closeNotify();
    setTimeout(() => (notify = figma.notify(text, settings)), 10);
  }

  return { showNotify, closeNotify };
})();

const { initLocker, changeLocker, clearLocker } = (() => {
  let interval: number | null = null;

  function initLocker() {
    interval = setInterval(() => {
      figma.viewport.zoom = getScale();
    }, 14);
  }

  function changeLocker() {
    if (interval) clearInterval(interval);
    const scale = changeScale();
    setTimeout(() => {
      interval = setInterval(() => {
        figma.viewport.zoom = scale;
      }, 14);
    }, 10);
  }

  function clearLocker() {
    if (interval) clearInterval(interval);
  }

  return { initLocker, changeLocker, clearLocker };
})();

function updateScale() {
  const currentScale = getScale();
  showNotify("Zoom is locked", {
    timeout: Infinity,
    button: {
      text: `${currentScale}x`,
      action: () => {
        changeLocker();
        updateScale();
      },
    },
    onDequeue: (reason) => {
      if (reason !== "action_button_click") {
        clearLocker();
        closeNotify();
        figma.closePlugin();
      }
    },
  });
}

async function run() {
  initLocker();
  updateScale();
}

run();
