<script setup lang="ts">
import { defineProps, onMounted, onUnmounted, ref } from "vue";

import ItemImpl from "./item-impl.vue";
import Anchor from "./anchor.vue";
import { MenuItemCore } from "@/domains/ui";

const {
  store: item,
  className,
  onMounted: onMount,
} = defineProps<{ store: MenuItemCore; className: string; onMounted?: (el: HTMLDivElement) => void }>();
const el = ref<HTMLDivElement>();

onMounted(() => {
  const $item = el.value;
  if (!$item) {
    return;
  }
  if (!item.menu) {
    return;
  }
  if (onMount) {
    onMount($item);
  }
  item.menu.popper.setReference({
    getRect() {
      const rect = $item.getBoundingClientRect();
      return rect;
    },
  });
});
onUnmounted(() => {
  if (!item.menu) {
    return;
  }
  item.menu.popper.removeReference();
});
</script>

<template>
  <Anchor :store="item.menu!" class-name="">
    <ItemImpl :class-name="className" :store="item"><slot></slot></ItemImpl>
  </Anchor>
</template>
