<script setup lang="ts">
import {  ref } from "vue";

import { ToastCore } from "@/domains/ui/toast";
import { cn } from "@/utils/index";

const { store, className: ca } = defineProps<{ store: ToastCore; className: string; role?: string }>();
const open = ref(store.open);
const className = cn("toast__overlay", ca);

store.onOpenChange((nextOpen) => {
  open.value = nextOpen;
});
</script>

<template>
  <div :data-state="open ? 'open' : 'closed'" :class="className"></div>
</template>
