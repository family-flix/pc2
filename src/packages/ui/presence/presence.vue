<script setup lang="ts">
import { defineProps, ref } from "vue";

import { PresenceCore } from "@/domains/ui";
import { cn } from "@/utils/index";

const { store, className } = defineProps<{ store: PresenceCore; className?: string }>();
const cx = cn("presence", className);

const state = ref(store.state);

function handleAnimationEnd() {
  store.unmount();
}

store.onStateChange((v) => {
  state.value = v;
});
</script>

<template>
  <template v-if="state.mounted">
    <div
      :class="cx"
      role="presentation"
      :data-state="state.open ? 'open' : 'closed'"
      @animationend="handleAnimationEnd"
    >
      <slot></slot>
    </div>
  </template>
</template>
