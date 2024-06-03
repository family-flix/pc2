<script setup lang="ts">
import { ref } from "vue";

import PopperPrimitiveContent from "@/packages/ui/popper/content.vue";
import DismissableLayer from "@/packages/ui/dismissable-layer/dismissable-layer.vue";
import { MenuCore } from "@/domains/ui";

const { store, className } = defineProps<{ store: MenuCore; className: string }>();
</script>

<template>
  <DismissableLayer :store="store.layer">
    <PopperPrimitiveContent :store="store.popper" :class-name="className">
      <slot></slot>
    </PopperPrimitiveContent>
  </DismissableLayer>
</template>
