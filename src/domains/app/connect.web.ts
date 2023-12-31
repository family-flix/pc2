import { Application, MEDIA } from "@/domains/app";

export function connect(app: Application) {
  const { router } = app;
  const ownerDocument = globalThis.document;
  app.getComputedStyle = (el: HTMLElement) => {
    return window.getComputedStyle(el);
  };
  app.setTitle = (title: string) => {
    document.title = title;
  };
  app.copy = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
  };
  window.addEventListener("DOMContentLoaded", () => {
    // 1
    const { innerWidth, innerHeight } = window;
    app.setSize({ width: innerWidth, height: innerHeight });
  });
  window.addEventListener("load", () => {
    // console.log("2");
  });
  window.addEventListener("popstate", (event) => {
    const { type } = event;
    const { pathname } = window.location;
    app.emit(app.Events.PopState, { type, pathname });
  });
  window.addEventListener("beforeunload", (event) => {
    // // 取消事件
    // event.preventDefault();
    // // Chrome 以及大部分浏览器需要返回值
    // event.returnValue = "";
    // // 弹出提示框
    // const confirmationMessage = "确定要离开页面吗？";
    // (event || window.event).returnValue = confirmationMessage;
    // return confirmationMessage;
  });
  window.addEventListener("resize", () => {
    const { innerWidth, innerHeight } = window;
    const size = {
      width: innerWidth,
      height: innerHeight,
    };
    // console.log("resize", size);
    // app.emit(app.Events.Resize, { width: innerWidth, height: innerHeight });
    app.resize(size);
  });
  window.addEventListener("blur", () => {
    app.emit(app.Events.Blur);
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      app.emit(app.Events.Hidden);
      return;
    }
    app.emit(app.Events.Show);
  });
  const ua = navigator.userAgent.toLowerCase();
  app.setEnv({
    wechat: ua.indexOf("micromessenger") !== -1,
  });

  const media = window.matchMedia(MEDIA);
  let curTheme = "light";
  const getSystemTheme = (e?: MediaQueryList | MediaQueryListEvent) => {
    console.log("[Domain]app/connect - handleMediaQuery");
    if (!e) {
      e = window.matchMedia(MEDIA);
    }
    const isDark = e.matches;
    const systemTheme = isDark ? "dark" : "light";
    curTheme = systemTheme;
    app.theme = systemTheme;
    return systemTheme;
  };
  media.addListener(getSystemTheme);
  let attribute = "data-theme";
  const defaultTheme = "system";
  const defaultThemes = ["light", "dark"];
  const colorSchemes = ["light", "dark"];
  const attrs = defaultThemes;
  app.applyTheme = () => {
    const d = document.documentElement;
    const name = curTheme;
    if (attribute === "class") {
      d.classList.remove(...attrs);
      if (name) d.classList.add(name);
    } else {
      if (name) {
        d.setAttribute(attribute, name);
      } else {
        d.removeAttribute(attribute);
      }
    }
    const fallback = colorSchemes.includes(defaultTheme) ? defaultTheme : null;
    const colorScheme = colorSchemes.includes(curTheme) ? curTheme : fallback;
    // @ts-ignore
    d.style.colorScheme = colorScheme;
  };
  app.getSystemTheme = getSystemTheme;
  const { availHeight, availWidth } = window.screen;
  if (window.navigator.userAgent.match(/iphone/i)) {
    const matched = [
      // iphonex iphonexs iphone12mini
      "375-812",
      // iPhone XS Max iPhone XR
      "414-896",
      // iPhone pro max iPhone14Plus
      "428-926",
      // iPhone 12/pro 13/14  753
      "390-844",
      // iPhone 14Pro
      "393-852",
      // iPhone 14ProMax
      "430-932",
    ].includes(`${availWidth}-${availHeight}`);
    app.safeArea = !!matched;
  }
  ownerDocument.addEventListener("keydown", (event) => {
    const { key } = event;
    app.keydown({ key });
  });
  ownerDocument.addEventListener("click", (event) => {
    let target = event.target;
    if (target instanceof Document) {
      return;
    }
    if (target === null) {
      return;
    }
    let matched = false;
    while (target) {
      const t = target as HTMLElement;
      if (t.tagName === "A") {
        matched = true;
        break;
      }
      target = t.parentNode;
    }
    if (!matched) {
      return;
    }
    const t = target as HTMLElement;
    const href = t.getAttribute("href");
    if (!href) {
      return;
    }
    if (!href.startsWith("/")) {
      return;
    }
    if (href.startsWith("http")) {
      return;
    }
    event.preventDefault();
    app.emit(app.Events.ClickLink, { href });
  });
  router.back = () => {
    window.history.back();
  };
  router.reload = () => {
    window.location.reload();
  };
  router.onPushState(({ from, path }) => {
    // router.log("[Application ]- onPushState", path);
    window.history.pushState(
      {
        from,
      },
      "",
      path
    );
  });
  router.onReplaceState(({ from, path, pathname }) => {
    // router.log("[Application ]- onReplaceState");
    window.history.replaceState(
      {
        from,
      },
      "",
      path
    );
  });

  const originalBodyPointerEvents = ownerDocument.body.style.pointerEvents;
  app.disablePointer = () => {
    ownerDocument.body.style.pointerEvents = "none";
  };
  app.enablePointer = () => {
    ownerDocument.body.style.pointerEvents = originalBodyPointerEvents;
  };
}
