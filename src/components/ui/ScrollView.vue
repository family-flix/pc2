<script setup lang="ts">
/*
 * @file 可滚动容器，支持下拉刷新、滚动监听等
 */
import { ref, onMounted } from "vue";

import { ScrollViewCore } from "@/domains/ui/scroll-view";
import { cn } from "@/utils";
import { connectScroll } from "@/domains/ui/scroll-view/connect.web";

const props = defineProps<{
  class?: string;
  store: ScrollViewCore;
}>();
// console.log("[COMPONENT]ScrollView", props.store);
const { store } = props;
const contentRef = ref<HTMLDivElement | null>(null);
const state = ref(store.state);
// @ts-ignore
function handleScroll(event: Event) {
  const $content = contentRef.value;
  if (!$content) {
    return;
  }
  store.setRect({
    height: $content.clientHeight,
    contentHeight: $content.scrollHeight,
  });
  const target = event.currentTarget as HTMLDivElement;
  if ($content.scrollTop + 120 >= $content.scrollHeight) {
  }
}

// store.onStateChange((nextState) => {
//   state.value = nextState;
// });
onMounted(() => {
  const $content = contentRef.value;
  if (!$content) {
    return;
  }
  const { clientWidth, clientHeight, scrollHeight } = $content;
  connectScroll(store, $content);
  store.setRect({
    width: clientWidth,
    height: clientHeight,
    contentHeight: scrollHeight,
  });
});

const className = cn("scroll-view w-full h-full overflow-y-auto hide-scroll", props.class);
</script>

<template>
  <div :class="className">
    <div ref="contentRef" :class="className">
      <slot></slot>
    </div>
  </div>
</template>
