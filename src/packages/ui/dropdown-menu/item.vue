<script setup lang="ts">
import { defineProps, ref } from "vue";

import MenuPrimitiveItem from "@/packages/ui/menu/item.vue";
import { MenuCore, MenuItemCore } from "@/domains/ui";

const { store, className } = defineProps<{ store: MenuItemCore; className: string }>();
</script>

<template>
  <MenuPrimitiveItem :class-name="className" :store="store"><slot></slot></MenuPrimitiveItem>
</template>
