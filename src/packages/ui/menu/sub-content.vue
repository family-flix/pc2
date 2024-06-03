<script setup lang="ts">
import {  ref } from "vue";

import Presence from "@/packages/ui/presence/presence.vue";
import { MenuCore } from "@/domains/ui/menu/index";

import ContentImpl from "./content-impl.vue";

const { store, className } = defineProps<{ store: MenuCore; className: string }>();
</script>

<template>
  <Presence :store="store.presence">
    <ContentImpl :store="store" :class-name="className">
      <slot></slot>
    </ContentImpl>
  </Presence>
</template>
