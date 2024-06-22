<script setup lang="ts">
/**
 * @file 不销毁的路由视图
 */
import { ref, onMounted } from "vue";

import { RouteViewCore } from "@/domains/route_view";
import { cn } from "@/utils";

const { store, className, index } = defineProps<{
  store: RouteViewCore;
  className: string;
  index: number;
}>();

// console.log("[COMPONENT]stack-route-view - render", className);

const state = ref(store.$presence.state);
store.$presence.onStateChange((nextState) => {
  state.value = nextState;
});
store.ready();
onMounted(() => {
  if (store.mounted) {
    return;
  }
  // console.log("[COMPONENT]stack-route-view - useEffect");
  store.setShow();
  return () => {
    store.setUnmounted();
    store.destroy();
  };
});

// const { mounted, visible } = toRefs(state);
const cls = cn(
  "presence",
  state.value.enter && store.animation.in ? `animate-in ${store.animation.in}` : "",
  state.value.exit && store.animation.out ? `animate-out ${store.animation.out}` : "",
  className
);
</script>

<template>
  <template v-if="state.mounted">
    <div
      :class="cls"
      :data-state="state.visible ? 'open' : 'closed'"
      :style="{ 'z-index': index, display: state.visible ? 'block' : 'none' }"
    >
      <slot></slot>
    </div>
  </template>
</template>
