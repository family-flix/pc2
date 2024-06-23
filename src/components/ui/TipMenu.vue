<script setup lang="ts">
import { ref } from "vue";

import PopoverPrimitiveRoot from "@/packages/ui/popover/root.vue";
import PopoverPrimitiveTrigger from "@/packages/ui/popover/trigger.vue";
import PopoverPrimitivePortal from "@/packages/ui/popover/portal.vue";
import PopoverPrimitiveContent from "@/packages/ui/popover/content.vue";
import { PopoverCore } from "@/domains/ui/popover";
import { cn } from "@/utils/index";

const { store, className } = defineProps<{ store: PopoverCore; className: string }>();
const state = ref(store.state);

const contentClassName = cn(
  "z-50 rounded-md border bg-popover p-2 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
  "relative rounded-md bg-black shadow-lg focus:shadow-md focus:ring-2 focus:ring-violet-700",
  className
);
</script>

<template>
  <PopoverPrimitiveRoot :store="store" class-name="">
    <div>
      <PopoverPrimitiveTrigger class-name="inline-flex items-center justify-center" :store="store">
        <slot name="trigger"></slot>
      </PopoverPrimitiveTrigger>
      <PopoverPrimitivePortal :store="store" class-name="">
        <PopoverPrimitiveContent :store="store" :class-name="contentClassName">
          <slot name="content"></slot>
        </PopoverPrimitiveContent>
      </PopoverPrimitivePortal>
    </div>
  </PopoverPrimitiveRoot>
</template>
