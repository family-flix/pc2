<script setup lang="ts">
import { ref } from "vue";

import PopperPrimitiveTrigger from "@/packages/ui/popper/anchor.vue";
import { PopoverCore } from "@/domains/ui/popover/index";

const { store, className } = defineProps<{ store: PopoverCore; className: string }>();

function handleClick(event: MouseEvent) {
  console.log("[PACKAGE]ui/popover - handleClick");
  store.toggle();
}
</script>

<template>
  <PopperPrimitiveTrigger :store="store.popper" :class-name="className">
    <button @click="handleClick">
      <slot></slot>
    </button>
  </PopperPrimitiveTrigger>
</template>
