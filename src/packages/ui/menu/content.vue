<script setup lang="ts">
import {  onMounted, ref } from "vue";

import Presence from "@/packages/ui/presence/presence.vue";
import { MenuCore } from "@/domains/ui";

import ContentNonModal from "./content-non-modal.vue";

const { store, className } = defineProps<{ store: MenuCore; className: string; role?: string }>();
</script>

<template>
  <Presence :store="store.presence">
    <ContentNonModal :store="store" :class-name="className">
      <slot></slot>
    </ContentNonModal>
  </Presence>
</template>
