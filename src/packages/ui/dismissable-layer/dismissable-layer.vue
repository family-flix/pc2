<script setup lang="ts">
import { DismissableLayerCore } from "@/domains/ui";
import { ref, defineProps, onUnmounted, onMounted } from "vue";

const { store } = defineProps<{ store: DismissableLayerCore }>();
const el = ref<HTMLDivElement>();
const timer = ref<number | null>(null);
const node = ref({});

const ownerDocument = globalThis?.document;
const handlePointerDown = (event: PointerEvent) => {
  console.log("handle click document", event.target);
  if (!event.target) {
    return;
  }
  const f = () => {
    store.handlePointerDownOnTop();
  };
  if (event.pointerType === "touch") {
    ownerDocument.removeEventListener("click", f);
    ownerDocument.addEventListener("click", f, {
      once: true,
    });
    return;
  }
  store.handlePointerDownOnTop();
};
function handleElPointerDown() {
  store.pointerDown();
}
onMounted(() => {
  store.layers.add(node.value);
  timer.value = window.setTimeout(() => {
    console.log('register content of pointerdown');
    ownerDocument.addEventListener("pointerdown", handlePointerDown);
  }, 0);
});
onUnmounted(() => {
  store.layers.delete(node.value);
  store.layersWithOutsidePointerEventsDisabled.delete(node.value);
  if (timer.value !== null) {
    window.clearTimeout(timer.value);
  }
  ownerDocument.removeEventListener("pointerdown", handlePointerDown);
  ownerDocument.removeEventListener("click", store.handlePointerDownOnTop);
  // app.enablePointer();
});
</script>

<template>
  <div ref="el" class="dismissable-layer" @pointerdown="handleElPointerDown">
    <slot></slot>
  </div>
</template>
