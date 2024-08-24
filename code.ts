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
    notify = figma.notify(text, settings);
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
  showNotify("Scale is locked", {
    timeout: Infinity,
    button: {
      text: `${currentScale}x`,
      action: () => {
        changeLocker();
        setTimeout(() => {
          updateScale();
        }, 10);
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

async function checkSubscription(email: string) {
  try {
    const response = await fetch("https://yourdomain.com/check-access", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    return data.access;
  } catch (error) {
    console.error("Subscribtion check error:", error);
    return false;
  }
}

async function run() {
  showNotify("Cheking your subscription...", {
    timeout: Infinity,
  });

  const data = await new Promise((res) => setTimeout(() => res(1), 1000));
  //checkSubscription("");

  if (true) {
    updateScale();
  } else {
    initLocker();
    showNotify("Scale is locked (free trial)", {
      timeout: 300 * 1000,
      button: {
        text: "Get full version",
        action: () => {
          figma.showUI("<div>Привет</div");
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
}

run();
