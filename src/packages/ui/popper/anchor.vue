<script setup lang="ts">
import {  onMounted, ref } from "vue";

import { PopperCore } from "@/domains/ui/popper";
import { cn } from "@/utils";

const { store, className } = defineProps<{ store: PopperCore; className: string }>();
const el = ref();
const cx = cn("popper__anchor", className);

onMounted(() => {
  const $anchor = el.value;
  // console.log("[PACKAGE/ui]popper/anchor - onMounted", $anchor);
  store.setReference({
    getRect() {
      const rect = $anchor.getBoundingClientRect();
      return rect;
    },
  });
});
</script>

<template>
  <div ref="el" :class="cx">
    <slot></slot>
  </div>
</template>
