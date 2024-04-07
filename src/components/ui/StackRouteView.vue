<script setup lang="ts">
/**
 * @file 不销毁的路由视图
 */
import { ref, onMounted } from "vue";

import { RouteViewCore } from "@/domains/route_view";

const { store, className, index } = defineProps<{
  store: RouteViewCore;
  className: string;
  index: number;
}>();

// console.log("[COMPONENT]stack-route-view - render", className);

const state = ref(store.state);
store.ready();
onMounted(() => {
  if (store.mounted) {
    return;
  }
  // console.log("[COMPONENT]stack-route-view - useEffect");
  store.setMounted();
  store.showed();
  return () => {
    store.setUnmounted();
  };
});

store.onStateChange((nextState) => {
  state.value = nextState;
});

// const { mounted, visible } = toRefs(state);
</script>

<template>
  <template v-if="state.mounted">
    <div :class="className" :style="{ 'z-index': index }" :data-state="state.visible ? 'open' : 'closed'">
      <slot></slot>
    </div>
  </template>
</template>
