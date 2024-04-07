<script setup lang="ts">
import { ref, defineProps } from "vue";

import { PopoverCore } from "@/domains/ui/popover/index";

import ContentNonModal from "./content-non-modal.vue";

const { store, className } = defineProps<{ store: PopoverCore; className: string }>();
</script>

<template>
  <ContentNonModal :store="store" :class-name="className">
    <slot></slot>
  </ContentNonModal>
</template>
