<script setup lang="ts">
import { ArrowLeft } from "lucide-vue-next";

import { ViewComponentProps } from "@/types";
// import { rootView, test1Page } from "@/store/views";

const { app, view } = defineProps<ViewComponentProps>();

function back() {
  // rootView.uncoverPrevView();
}
function gotoTestPage() {
  // rootView.layerSubView(test1Page);
}
</script>

<template>
  <div class="relative flex flex-wrap w-full h-screen">
    <div class="absolute top-4 left-4 cursor-pointer" style="z-index: 100" @click="gotoTestPage">前往测试页面</div>
  </div>
</template>

<style scoped></style>
