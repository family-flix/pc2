<script setup lang="ts">
import { defineProps, onMounted, ref } from "vue";

import { PopperCore } from "@/domains/ui/popper";

const { width, height, class: className } = defineProps<{ width: number; height: number; class: string }>();
</script>

<template>
  <svg :class="className" :width="width" :height="height" viewBox="0 0 30 10" preserveAspectRatio="none">
    <slot></slot>
  </svg>
</template>
