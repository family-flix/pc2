<script setup lang="ts">
import { ref } from "vue";

import { cn } from "@/utils";
import { InputCore } from "@/domains/ui/input";

const props = defineProps<{
  ratio: number;
  class?: string;
}>();
const { ratio = 1 / 1 } = props;

const className = cn(props.class);
</script>

<template>
  <div :class="className" :style="{ position: 'relative', width: '100%', paddingBottom: `${100 / ratio}%` }">
    <slot></slot>
  </div>
</template>
