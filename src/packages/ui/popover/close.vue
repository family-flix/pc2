<script setup lang="ts">
import { ref, defineProps } from "vue";

import { PopoverCore } from "@/domains/ui/popover/index";

const { store, className } = defineProps<{ store: PopoverCore; className: string }>();

function handleClick() {
  store.hide();
}
</script>

<template>
  <button :class="className" @click="handleClick">
    <slot></slot>
  </button>
</template>
