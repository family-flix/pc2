<script setup lang="ts">
import { defineProps, onMounted, ref } from "vue";

import { PopperCore } from "@/domains/ui/popper";

const { store, role } = defineProps<{ store: PopperCore; role: string }>();
const state = ref(store.state);
const el = ref<HTMLDivElement>();

const { placedSide } = state.value;

const OPPOSITE_SIDE = {
  top: "bottom",
  right: "left",
  bottom: "top",
  left: "right",
};
const baseSide = OPPOSITE_SIDE[placedSide];

onMounted(() => {
  const $arrow = el.value;
  if (!$arrow) {
    return;
  }
  store.setArrow($arrow.getBoundingClientRect());
});
</script>

<template>
  <span
    ref="{$arrow}"
    class="popper__arrow"
    :style="{
      position: 'absolute',
      left: '20px',
      top: '0px',
      [baseSide]: 0,
      'transform-origin': {
        top: '',
        right: '0 0',
        bottom: 'center 0',
        left: '100% 0',
      }[placedSide],
      transform: {
        top: 'translateY(100%)',
        right: 'translateY(50%) rotate(90deg) translateX(-50%)',
        bottom: `rotate(180deg)`,
        left: 'translateY(50%) rotate(-90deg) translateX(50%)',
      }[placedSide],
    }"
  >
    <ArrowPrimitive />
  </span>
</template>
