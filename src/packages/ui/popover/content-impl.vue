<script setup lang="ts">
import { ref } from "vue";

import PopperPrimitiveContent from "@/packages/ui/popper/content.vue";
import DismissableLayer from "@/packages/ui/dismissable-layer/dismissable-layer.vue";
import { PopoverCore } from "@/domains/ui/popover/index";

const { store, className } = defineProps<{ store: PopoverCore; className: string }>();

const state = ref(store.present.state);

store.present.onStateChange((v) => {
  state.value = v;
});
</script>

<template>
  <DismissableLayer :store="store.layer">
    <PopperPrimitiveContent :store="store.popper" :class-name="className">
      <slot></slot>
    </PopperPrimitiveContent>
  </DismissableLayer>
</template>
