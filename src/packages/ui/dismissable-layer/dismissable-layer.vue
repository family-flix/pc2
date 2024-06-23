<script setup lang="ts">
import { ref, onUnmounted, onMounted } from "vue";

import { DismissableLayerCore } from "@/domains/ui";

const { store } = defineProps<{ store: DismissableLayerCore }>();
const el = ref<HTMLDivElement>();
const timer = ref<number | null>(null);
const node = ref({});

const ownerDocument = globalThis?.document;
const handlePointerDown = (event: MouseEvent) => {
  console.log("handle click document", event.target, event);
  if (!event.target) {
    return;
  }
  const f = () => {
    store.handlePointerDownOnTop();
  };
  // if (event.pointerType === "touch") {
  //   ownerDocument.removeEventListener("click", f);
  //   ownerDocument.addEventListener("click", f, {
  //     once: true,
  //   });
  //   return;
  // }
  store.handlePointerDownOnTop();
};
function handleElPointerDown() {
  store.pointerDown();
}
onMounted(() => {
  store.layers.add(node.value);
  timer.value = window.setTimeout(() => {
    console.log("register content of pointerdown");
    ownerDocument.addEventListener("click", handlePointerDown);
  }, 0);
});
onUnmounted(() => {
  store.layers.delete(node.value);
  store.layersWithOutsidePointerEventsDisabled.delete(node.value);
  if (timer.value !== null) {
    window.clearTimeout(timer.value);
  }
  ownerDocument.removeEventListener("click", handlePointerDown);
  ownerDocument.removeEventListener("click", store.handlePointerDownOnTop);
  // app.enablePointer();
});
</script>

<template>
  <div ref="el" class="dismissable-layer" @pointerdown="handleElPointerDown">
    <slot></slot>
  </div>
</template>
