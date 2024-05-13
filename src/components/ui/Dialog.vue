<script setup lang="ts">
import { ref } from "vue";

import { DialogCore } from "@/domains/ui/dialog";
import Presence from "@/components/ui/Presence.vue";

const props = defineProps<{
  store: DialogCore;
  class?: string;
}>();
const { store } = props;
</script>

<template>
  <div>
    <Presence :store="store.present">
      <div class="fixed inset-0 z-50 flex items-start justify-center sm:items-center">
        <div
          :class="'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-all duration-100 data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out'"
          @click="store.hide"
        ></div>
        <div
          :class="'fixed left-[50%] top-[30%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg md:w-full bg-w-bg-0 border-w-bg-2'"
        >
          <div class="flex flex-col space-y-1.5 text-center sm:text-left">
            <slot></slot>
          </div>
        </div>
      </div>
    </Presence>
  </div>
</template>
