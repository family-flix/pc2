<script setup lang="ts">
import PopperPrimitiveAnchor from "@/packages/ui/popper/anchor.vue";
import { MenuCore } from "@/domains/ui";

const { store, className } = defineProps<{ store: MenuCore; className: string }>();
</script>

<template>
  <PopperPrimitiveAnchor :store="store.popper" :className="className">
    <slot></slot>
  </PopperPrimitiveAnchor>
</template>
