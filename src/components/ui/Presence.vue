<script setup lang="ts">
import { ref } from "vue";

import { PresenceCore } from "@/domains/ui/presence";
import { cn } from "@/utils";

const props = defineProps<{
  store: PresenceCore;
  class?: string;
}>();
const { store } = props;
const state = ref(store.state);
const className = cn("relative", props.class);

store.onStateChange((nextState) => {
  state.value = nextState;
});
</script>

<template>
  <template v-if="state.mounted">
    <div :class="props.class" role="presentation" :data-state="state.visible ? 'open' : 'closed'">
      <slot></slot>
    </div>
  </template>
</template>
