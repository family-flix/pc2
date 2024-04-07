<script setup lang="ts">
import { defineProps, ref } from "vue";

import { DropdownMenuCore } from "@/domains/ui/dropdown-menu";
import MenuPrimitiveRoot from "@/packages/ui/menu/root.vue";

const { store, className } = defineProps<{ store: DropdownMenuCore; className: string }>();
</script>

<template>
  <MenuPrimitiveRoot :class-name="className" :store="store.menu">
    <slot></slot>
  </MenuPrimitiveRoot>
</template>
