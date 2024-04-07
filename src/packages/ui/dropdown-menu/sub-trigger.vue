<script setup lang="ts">
import { defineProps, ref } from "vue";

import MenuPrimitiveSubTrigger from "@/packages/ui/menu/sub-trigger.vue";
import { MenuItemCore } from "@/domains/ui/menu/item";

const { store, className } = defineProps<{ store: MenuItemCore; className: string }>();
</script>

<template>
  <MenuPrimitiveSubTrigger :class-name="className" :store="store"><slot></slot></MenuPrimitiveSubTrigger>
</template>
