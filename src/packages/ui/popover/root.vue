<script setup lang="ts">
import { ref } from "vue";

import PopperPrimitiveRoot from "@/packages/ui/popper/root.vue";
import { PopoverCore } from "@/domains/ui/popover/index";

const { store } = defineProps<{ store: PopoverCore }>();
</script>

<template>
  <PopperPrimitiveRoot>
    <slot></slot>
  </PopperPrimitiveRoot>
</template>
