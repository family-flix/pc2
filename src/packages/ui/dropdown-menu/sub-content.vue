<script setup lang="ts">
import { ref, defineProps } from "vue";

import MenuPrimitiveSubContent from "@/packages/ui/menu/sub-content.vue";
import { MenuCore } from "@/domains/ui";

const { store, className } = defineProps<{ store: MenuCore; className: string }>();
</script>

<template>
  <MenuPrimitiveSubContent :store="store" :class-name="className">
    <slot></slot>
  </MenuPrimitiveSubContent>
</template>
