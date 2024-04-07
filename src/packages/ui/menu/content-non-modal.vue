<script setup lang="ts">
import { ref, defineProps } from "vue";

import { MenuCore } from "@/domains/ui";

import ContentImpl from "./content-impl.vue";

const { store, className } = defineProps<{ store: MenuCore; className: string }>();
</script>

<template>
  <ContentImpl :store="store" :class-name="className"><slot></slot></ContentImpl>
</template>
