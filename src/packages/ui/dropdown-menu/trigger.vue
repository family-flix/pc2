<script setup lang="ts">
import { defineProps, ref } from "vue";

import { DropdownMenuCore } from "@/domains/ui/dropdown-menu";
import MenuPrimitiveAnchor from "@/packages/ui/menu/anchor.vue";

const { store, className } = defineProps<{ store: DropdownMenuCore; className: string }>();

function handlePointerDown() {
  // console.log("[PACKAGE/ui]dropdown-menu/triggers - handlePointerDown");
  store.toggle();
}
function handleKeydown(event: KeyboardEvent) {
  if (store.state.disabled) {
    return;
  }
  if (["Enter", " "].includes(event.key)) {
    store.toggle();
    return;
  }
  if (event.key === "ArrowDown") {
    //
  }
  if (["Enter", " ", "ArrowDown"].includes(event.key)) {
    event.preventDefault();
  }
}
</script>

<template>
  <MenuPrimitiveAnchor :class-name="className" :store="store.menu">
    <button @pointerdown="handlePointerDown" @keydown="handleKeydown"><slot></slot></button>
  </MenuPrimitiveAnchor>
</template>
