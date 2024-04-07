<script setup lang="ts">
import { ref, defineProps } from "vue";

import { MenuItemCore } from "@/domains/ui/menu/item";
import { cn } from "@/utils/index";

const { store: item, className } = defineProps<{ store: MenuItemCore; className: string }>();

const state = ref(item.state);
const el = ref<HTMLDivElement>();
const cx = cn("menu__item-impl", className);

const { open, disabled, focused } = state.value;

function handlePointerMove(event: PointerEvent) {
  if (event.pointerType !== "mouse") {
    return;
  }
  if (!item.state.disabled) {
    // @ts-ignore
    event.currentTarget?.focus();
  }
  item.move();
}
function handlePointerLeave(event: PointerEvent) {
  if (event.pointerType !== "mouse") {
    return;
  }
  // @ts-ignore
  event.currentTarget?.blur();
  item.leave();
}
function handleClick() {
  item.click();
}
function handleFocus() {
  item.focus();
}
function handleBlur() {
  item.blur();
}

item.onStateChange((nextState) => {
  state.value = nextState;
});
item.onBlur(() => {
  const $item = el.value;
  if (!$item) {
    return;
  }
  $item.blur();
});
</script>

<template>
  <div
    ref="el"
    :class="cx"
    role="menuitem"
    aria-haspopup="menu"
    :data-state="open ? 'open' : 'closed'"
    :data-highlighted="focused ? '' : undefined"
    :aria-disabled="disabled || undefined"
    :data-disabled="disabled ? '' : undefined"
    :tabIndex="disabled ? undefined : -1"
    @pointermove="handlePointerMove"
    @pointerleave="handlePointerLeave"
    @click="handleClick"
    @focus="handleFocus"
    @blue="handleBlur"
  >
    <slot></slot>
  </div>
</template>
