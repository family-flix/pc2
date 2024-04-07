<script setup lang="ts">
import { onMounted, ref } from "vue";

import { InputCore } from "@/domains/ui/input";
import { connect } from "@/domains/ui/input/connect.web";
import { cn } from "@/utils/index";

const props = defineProps<{
  store: InputCore<any>;
  class?: string;
}>();
const { store } = props;

const state = ref(store.state);
const r = ref();

function handleChange(event: Event) {
  store.handleChange(event);
}
onMounted(() => {
  const $input = r.value;
  if (!$input) {
    return;
  }
  connect(store, $input);
});
store.onStateChange((nextState) => {
  state.value = nextState;
});

const className = cn(
  "flex h-10 w-full rounded-md border border-slate-300 bg-transparent py-2 px-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-50 dark:focus:ring-slate-400 dark:focus:ring-offset-slate-900",
  props.class
);
</script>

<template>
  <input
    ref="r"
    :class="className"
    :value="state.value"
    :placeholder="state.placeholder"
    :disabled="state.disabled"
    :type="state.type"
    @change="handleChange"
  />
</template>
