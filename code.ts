const changeScale = (() => {
  const scales = [0.5, 1, 2];
  let currentScale = 0.5;

  function changeScale() {
    const currentIndex = scales.findIndex((item) => item === currentScale);
    const nextIndex = currentIndex + 1;
    currentScale = nextIndex === scales.length ? scales[0] : scales[nextIndex];
    return currentScale;
  }

  return changeScale;
})();

const { showNotify, closeNotify } = (() => {
  let notify: NotificationHandler | null = null;

  function showNotify(text: string, settings: NotificationOptions) {
    if (notify) notify.cancel();
    notify = figma.notify(text, settings);
  }

  function closeNotify() {
    if (notify) notify.cancel();
  }

  return { showNotify, closeNotify };
})();

function updateScale() {
  const currentScale = changeScale();
  const interval = initInterval(currentScale);
  showNotify("Scale is locked", {
    timeout: Infinity,
    button: {
      text: `${currentScale}x`,
      action: () => {
        clearInterval(interval);
        updateScale();
      },
    },
    onDequeue: (reason) => {
      if (reason !== "action_button_click") {
        clearInterval(interval);
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

function initInterval(zoom: number) {
  return setInterval(() => {
    figma.viewport.zoom = zoom;
  }, 14);
}

async function run() {
  showNotify("Cheking your subscription...", {
    timeout: Infinity,
  });

  const data = await new Promise((res) => setTimeout(() => res(1), 5000));
  //checkSubscription("");

  if (true) {
    updateScale();
  } else {
    const interval = initInterval(1);
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
          clearInterval(interval);
          figma.closePlugin();
        }
      },
    });
  }
}

run();
