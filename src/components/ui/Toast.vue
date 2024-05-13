<script setup lang="ts">
import { ref } from "vue";
import ToastPrimitiveRoot from "@/packages/ui/toast/root.vue";
import ToastPrimitiveOverlay from "@/packages/ui/toast/overlay.vue";
import ToastPrimitivePortal from "@/packages/ui/toast/portal.vue";
import ToastPrimitiveContent from "@/packages/ui/toast/content.vue";
import { ToastCore } from "@/domains/ui/toast";
import { cn } from "@/utils";

const props = defineProps<{ store: ToastCore }>();
const { store } = props;

const state = ref(store.state);
store.onStateChange((nextState) => {
  console.log('[COMPONENT]Toast - state change', nextState.texts)
  state.value = nextState;
});

const portalClassName = cn(
  "data-[state=open]:fade-in-90",
  "data-[state=closed]:animate-out data-[state=closed]:fade-out"
);
const contentClassName = cn(
  "grid gap-4 rounded-lg bg-w-bg-4 text-w-bg-0 dark:text-w-fg-0 p-6 sm:max-w-lg sm:rounded-lg",
  "animate-in sm:zoom-in-90",
  "data-[state=open]:fade-in-90",
  "data-[state=closed]:animate-out data-[state=closed]:fade-out"
);
</script>

<template>
  <ToastPrimitivePortal :store="store" :class-name="portalClassName">
    <ToastPrimitiveContent :store="store" :class-name="contentClassName">
      <template v-for="text in state.texts">
        <div class="text-center">
          {{ text }}
        </div>
      </template>
    </ToastPrimitiveContent>
  </ToastPrimitivePortal>
</template>
