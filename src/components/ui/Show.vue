<script setup lang="ts">
const props = defineProps<{
  when?: boolean;
  fallback?: unknown;
  name?: string;
  class?: string;
}>();
</script>

<template>
  <template v-if="props.when">
    <slot></slot>
  </template>
  <template v-else>
    <slot name="fallback"></slot>
  </template>
</template>
