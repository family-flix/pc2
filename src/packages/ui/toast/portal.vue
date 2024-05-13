<script setup lang="ts">
import { ref, defineProps } from "vue";

import Presence from "@/packages/ui/presence/presence.vue";
import { ToastCore } from "@/domains/ui/toast/index";

const { store, className } = defineProps<{ store: ToastCore; className?: string }>();
</script>

<template>
  <Presence :store="store.present" :class-name="className">
    <Teleport to="body">
      <slot></slot>
    </Teleport>
  </Presence>
</template>
