<script setup lang="ts">
import { ArrowLeft } from "lucide-vue-next";

import { ViewComponentProps } from "@/store/types";

const { app, view } = defineProps<ViewComponentProps>();

function back() {
  // rootView.uncoverPrevView();
}
</script>

<template>
  <div class="relative flex flex-wrap w-full h-screen">
    <div class="absolute top-4 left-4 cursor-pointer" style="z-index: 100" @click="back">
      <ArrowLeft :size="32" />
    </div>
  </div>
</template>

<style scoped></style>
