<script setup lang="ts">
/**
 * @file 不销毁的路由视图
 */
import { ref, toRefs, onMounted } from "vue";

import { RouteViewCore } from "@/domains/route_view";

const { store, className, index } = defineProps<{
  store: RouteViewCore;
  className: string;
  index: number;
}>();

console.log("[COMPONENT]stack-route-view - render", className);

const state = ref(store.state);

store.ready();
onMounted(() => {
  if (store.isMounted) {
    return;
  }
  console.log("[COMPONENT]stack-route-view - useEffect");
  store.mounted();
  store.showed();
  return () => {
    store.unmounted();
  };
});

store.onStateChange((nextState) => {
  state.value = nextState;
});

const { mounted, visible } = toRefs(state);
</script>

<template>
  <div
    :class="className"
    :style="{ zIndex: index }"
    :data-state="visible ? 'open' : 'closed'"
  >
    <slot></slot>
  </div>
</template>
