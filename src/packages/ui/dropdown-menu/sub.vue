<script setup lang="ts">
import { defineProps } from "vue";

import { MenuCore } from "@/domains/ui/menu/index";
import MenuPrimitiveSub from "@/packages/ui/menu/sub.vue";

const { store, className } = defineProps<{ store: MenuCore; className: string }>();
</script>

<template>
  <MenuPrimitiveSub :class-name="className" :store="store">
    <slot></slot>
  </MenuPrimitiveSub>
</template>
