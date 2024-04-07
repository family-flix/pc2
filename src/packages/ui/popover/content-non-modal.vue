<script setup lang="ts">
import { ref, defineProps } from "vue";

import { PopoverCore } from "@/domains/ui/popover/index";

import ContentImpl from "./content-impl.vue";

const { store, className } = defineProps<{ store: PopoverCore; className: string }>();
</script>

<template>
  <ContentImpl :store="store" :class-name="className">
    <slot></slot>
  </ContentImpl>
</template>
