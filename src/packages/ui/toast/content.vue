<script setup lang="ts">
import { defineProps, ref } from "vue";

import { ToastCore } from "@/domains/ui/toast";
import { cn } from "@/utils/index";

const { store, className: ca } = defineProps<{ store: ToastCore; className?: string; role?: string }>();
const open = ref(store.open);
const className = cn("toast__content", ca);

store.onOpenChange((nextOpen) => {
  open.value = nextOpen;
});
</script>

<template>
  <div class="fixed z-[99] left-[50%] translate-x-[-50%] top-60 w-120 h-120">
    <div :data-state="open ? 'open' : 'closed'" :class="className">
      <slot></slot>
    </div>
  </div>
</template>
