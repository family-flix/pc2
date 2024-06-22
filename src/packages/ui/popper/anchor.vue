<script setup lang="ts">
import { onMounted, ref } from "vue";

import { PopperCore } from "@/domains/ui/popper";
import { cn, sleep } from "@/utils/index";

const { store, className } = defineProps<{ store: PopperCore; className: string }>();
const el = ref();
const cls = cn("__a popper__anchor", className);

async function handleAnimationEnd(event: AnimationEvent) {
  const $anchor = event.currentTarget as null | HTMLDivElement;
  if (!$anchor) {
    return;
  }
  console.log("[PACKAGE/ui]popper/anchor - onMounted", $anchor, $anchor.getBoundingClientRect());
  await sleep(200);
  store.setReference({
    getRect() {
      const rect = $anchor.getBoundingClientRect();
      return rect;
    },
  });
}
</script>

<template>
  <div ref="el" :class="cls" @animationend="handleAnimationEnd">
    <slot></slot>
  </div>
</template>
