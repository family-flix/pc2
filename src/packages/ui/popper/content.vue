<script setup lang="ts">
import {  onMounted, ref } from "vue";

import { PopperCore } from "@/domains/ui/popper";
import { cn } from "@/utils";

const { store, className: ca, role } = defineProps<{ store: PopperCore; className: string; role?: string }>();
const state = ref(store.state);
const el = ref<HTMLDivElement>();
const className = cn("popper__content", ca);

store.onStateChange((v) => {
  state.value = v;
});

onMounted(() => {
  const $content = el.value;
  if (!$content) {
    return;
  }
  // console.log($el);
  store.setFloating({
    getRect() {
      const rect = $content.getBoundingClientRect();
      // console.log("[COMPONENT]PopperContent - getRect of floating", $content, rect);
      return rect;
    },
  });
});
</script>

<template>
  <div
    ref="el"
    :role="role"
    :style="{
      position: state.strategy,
      left: 0,
      top: 0,
      transform: state.isPlaced
        ? `translate3d(${Math.round(state.x)}px, ${Math.round(state.y)}px, 0)`
        : 'translate3d(0, -200%, 0)',
      'min-width': 'max-content',
      'z-index': 99,
    }"
    :tabIndex="-1"
  >
    <div :class="className" :data-side="state.placedSide" :data-align="state.placedAlign">
      <slot></slot>
    </div>
  </div>
</template>
