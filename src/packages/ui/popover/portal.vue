<script setup lang="ts">
import Presence from "@/packages/ui/presence/presence.vue";
import { PopoverCore } from "@/domains/ui/popover/index";

const { store, className } = defineProps<{ store: PopoverCore; className: string }>();
</script>

<template>
  <Presence :store="store.present" :class-name="className">
    <template v-if="store.toBody">
      <Teleport to="body">
        <slot></slot>
      </Teleport>
    </template>
    <template v-else>
      <slot></slot>
    </template>
  </Presence>
</template>
