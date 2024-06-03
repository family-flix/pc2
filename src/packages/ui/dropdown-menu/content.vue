<script setup lang="ts">
import {  ref } from "vue";

import MenuPrimitiveContent from "@/packages/ui/menu/content.vue";
import { DropdownMenuCore, MenuCore } from "@/domains/ui";

const { store, className } = defineProps<{ store: DropdownMenuCore; className: string }>();
</script>

<template>
  <MenuPrimitiveContent :class-name="className" :store="store.menu"><slot></slot></MenuPrimitiveContent>
</template>
