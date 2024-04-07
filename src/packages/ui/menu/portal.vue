<script setup lang="ts">
import { defineProps } from "vue";

import Presence from "@/packages/ui/presence/presence.vue";
import { MenuCore } from "@/domains/ui";

const { store, className } = defineProps<{ store: MenuCore; className: string }>();
</script>

<template>
  <Presence :store="store.presence" :class-name="className">
    <Teleport to="body">
      <slot></slot>
    </Teleport>
  </Presence>
</template>
