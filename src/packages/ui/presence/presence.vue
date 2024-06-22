<script setup lang="ts">
import { ref } from "vue";

import { PresenceCore } from "@/domains/ui";
import { cn } from "@/utils/index";

const { store, enterClassName, exitClassName, className } = defineProps<{
  store: PresenceCore;
  enterClassName?: string;
  exitClassName?: string;
  className?: string;
}>();

const state = ref(store.state);
const cls = cn(
  "presence",
  state.value.enter && enterClassName ? enterClassName : "",
  state.value.exit && exitClassName ? exitClassName : "",
  className
);

store.onStateChange((v) => {
  state.value = v;
});
</script>

<template>
  <template v-if="state.mounted">
    <div :class="cls" role="presentation" :style="{ display: state.visible ? 'block' : 'none' }">
      <slot></slot>
    </div>
  </template>
</template>
