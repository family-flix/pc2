<script setup lang="ts">
import {  ref } from "vue";

import MenuPrimitivePortal from "@/packages/ui/menu/portal.vue";
import { MenuCore } from "@/domains/ui";

const { store, className } = defineProps<{ store: MenuCore; className: string }>();
</script>

<template>
  <MenuPrimitivePortal :class-name="className" :store="store"><slot></slot></MenuPrimitivePortal>
</template>
