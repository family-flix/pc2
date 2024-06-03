<script setup lang="ts">
import { ref } from "vue";

import { MenuItemCore } from "@/domains/ui/menu/item";

import ItemImpl from "./item-impl.vue";

const { store, className } = defineProps<{ store: MenuItemCore; className: string }>();
</script>

<template>
  <ItemImpl :store="store" :class-name="className">
    <slot></slot>
  </ItemImpl>
</template>
