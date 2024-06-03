<script setup lang="ts">
import { ref } from "vue";

import Presence from "@/packages/ui/presence/presence.vue";
import { PopoverCore } from "@/domains/ui/popover/index";

const { store, className } = defineProps<{ store: PopoverCore; className: string }>();
</script>

<template>
  <Presence :store="store.present" :class-name="className">
    <Teleport to="body">
      <slot></slot>
    </Teleport>
  </Presence>
</template>
