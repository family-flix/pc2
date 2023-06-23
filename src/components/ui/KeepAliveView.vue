<script setup lang="ts">
/**
 * @file 不销毁的路由视图
 */
import { ref, onMounted, toRefs } from "vue";

import { RouteViewCore } from "@/domains/route_view";
import { cn } from "@/utils";

const props = defineProps<{
  class?: string;
  store: RouteViewCore;
  index: number;
}>();
const { store, index } = props;

const state = ref(store.state);
console.log("[COMPONENT]KeepAliveView", store._name, store.state);

store.ready();
onMounted(() => {
  if (store.isMounted) {
    return;
  }
  //   console.log("[COMPONENT]keep-alice-route-view - useEffect");
  store.mounted();
  store.showed();
  return () => {
    store.unmounted();
  };
});

store.onStateChange((nextState) => {
  console.log("view state change", store._name, nextState);
  state.value = nextState;
});

// const { mounted, visible } = toRefs(state);
const className = props.class;
</script>

<template>
  <div
    :class="className"
    :style="{
      display: state.mounted ? 'block' : 'none',
      'z-index': index,
    }"
    :data-state="state.visible ? 'open' : 'closed'"
  >
    <slot></slot>
  </div>
</template>
