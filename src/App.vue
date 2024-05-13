<script setup lang="ts">
import { onMounted, ref, defineComponent } from "vue";

import { PageKeys } from "./store/types";
import { messageList, history, app } from "./store/index";
import { routesWithPathname } from "./store/routes";
import { pages } from "./store/views";
import { client } from "./store/request";
import { storage } from "./store/storage";
import StackRouteView from "./components/ui/StackRouteView.vue";
import Toast from "./components/ui/Toast.vue";
import { connect as connectApplication } from "./domains/app/connect.web";
import { connect as connectHistory } from "./domains/history/connect.web";
import { NavigatorCore } from "./domains/navigator/index";
import { DialogCore, ToastCore } from "./domains/ui/index";
import { MediaOriginCountry } from "./constants/index";
import { cn } from "./utils/index";

// import MediaCheck from "./components/MediaCheck.vue";

history.onClickLink(({ href, target }) => {
  const { pathname, query } = NavigatorCore.parse(href);
  const route = routesWithPathname[pathname];
  // console.log("[ROOT]history.onClickLink", pathname, query, route);
  if (!route) {
    app.tip({
      text: ["没有匹配的页面"],
    });
    return;
  }
  if (target === "_blank") {
    const u = history.buildURLWithPrefix(route.name, query);
    window.open(u);
    return;
  }
  history.push(route.name, query);
  return;
});
history.onBack(() => {
  window.history.back();
});
history.$router.onPopState((r) => {
  const { type, pathname, href } = r;
  // console.log("[ROOT]index - app.onPopState", type, pathname, href);
  if (type === "back") {
    history.back();
    return;
  }
  if (type === "forward") {
    history.forward();
    return;
  }
});
history.$router.onPushState(({ from, to, path, pathname }) => {
  console.log("[ROOT]index - before history.pushState", from, to, path, pathname);
  window.history.pushState(
    {
      from,
      to,
    },
    "",
    path
  );
});
history.$router.onReplaceState(({ from, path, pathname }) => {
  console.log("[ROOT]index - before history.replaceState", from, path, pathname);
  window.history.replaceState(
    {
      from,
    },
    "",
    path
  );
});
connectApplication(app);
connectHistory(history);
const view = history.$view;
const toast = new ToastCore();

defineComponent({
  components: {
    // "media-check": MediaCheck,
    "stack-route-view": StackRouteView,
  },
});
const subViews = ref(view.subViews);

onMounted(() => {
  // console.log("[]Application - before start", window.history, window.innerWidth);
  view.onSubViewsChange((nextSubViews) => {
    console.log("[ROOT]rootView.onSubViewsChange", nextSubViews.length);
    subViews.value = nextSubViews;
  });
  history.onRouteChange(({ ignore, reason, view, href }) => {
    console.log("[ROOT]rootView.onRouteChange", href, history.$router.href);
    const { title } = view;
    app.setTitle(title);
    if (ignore) {
      return;
    }
    // if (app.env.ios) {
    //   return;
    // }
    if (reason === "push") {
      history.$router.pushState(href);
    }
    if (reason === "replace") {
      history.$router.replaceState(href);
    }
  });
  app.onTip((msg) => {
    const { text } = msg;
    toast.show({
      texts: text,
    });
  });
  // app.onUpdate(() => {
  //   updateDialog.show();
  // });
  app.onReady(() => {
    // setReady(true);
    const { pathname, query } = history.$router;
    const route = routesWithPathname[pathname];
    console.log("[ROOT]onMount", pathname);
    if (!route) {
      history.push("root.notfound");
      return;
    }
    if (!app.$user.isLogin) {
      if (route.options?.require?.includes("login")) {
        history.push("root.login");
        return;
      }
    }
    client.appendHeaders({
      Authorization: app.$user.token,
    });
    messageList.init();
    if (!history.isLayout(route.name)) {
      history.push(route.name, query, { ignore: true });
      return;
    }
    history.push("root.home_layout.home_index", {}, { ignore: true });
  });
  app.onTip((msg) => {
    const { text } = msg;
    toast.show({
      texts: text,
    });
  });
  // app.onError((err) => {
  //   setError(err);
  // });
  history.$router.prepare(location);
  app.start({
    width: innerWidth,
    height: innerHeight,
  });
});

const className = cn(
  "absolute inset-0 bg-white opacity-100 dark:bg-black overflow-y-auto",
  "animate-in fade-in",
  "data-[state=closed]:animate-out data-[state=closed]:fade-out"
);
</script>

<template>
  <div class="screen w-screen h-screen bg-white">
    <stack-route-view
      v-for="(view, index) in subViews"
      :key="view.id"
      :store="view"
      :className="className"
      :index="index"
    >
      <component
        :is="pages[view.name as Exclude<PageKeys, 'root'>]"
        :app="app"
        :history="history"
        :client="client"
        :storage="storage"
        :pages="pages"
        :view="view"
      ></component>
    </stack-route-view>
  </div>
  <Toast :store="toast" />
  <!-- <media-check /> -->
</template>

<style scoped></style>
