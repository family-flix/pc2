<script setup lang="ts">
/**
 * @file 不销毁的路由视图
 */
import { ref, computed, onMounted, toRefs, onUnmounted } from "vue";

import { RouteViewCore } from "@/domains/route_view";
import { cn } from "@/utils";

const { store, immediately, index, className } = defineProps<{
  className?: string;
  store: RouteViewCore;
  index: number;
  immediately?: boolean;
}>();

const state = ref(store.state);
// console.log("[COMPONENT]KeepAliveView", store._name, store.state);

store.ready();
onUnmounted(() => {
  store.setUnload();
});

store.onStateChange((nextState) => {
  console.log("view state change", store._name, nextState);
  state.value = nextState;
});

const styles = computed(() => {
  return {
    display: (() => {
      if (immediately) {
        if (state.value.visible) {
          return "block";
        }
        return "none";
      }
      if (!state.value.mounted) {
        return "none";
      }
      return state.value.visible ? "block" : "none";
    })(),
    "z-index": index,
  };
});
</script>

<template>
  <div :class="className" :style="styles" :data-state="state.visible ? 'open' : 'closed'">
    <slot></slot>
  </div>
</template>
