<script setup lang="ts">
import PopperPrimitiveRoot from "@/packages/ui/popper/root.vue";
import { MenuCore } from "@/domains/ui";

const { store, className } = defineProps<{ store: MenuCore; className?: string }>();
</script>

<template>
  <PopperPrimitiveRoot :store="store.popper">
    <slot></slot>
  </PopperPrimitiveRoot>
</template>
