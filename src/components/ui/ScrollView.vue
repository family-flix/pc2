<script setup lang="ts">
/*
 * @file 可滚动容器，支持下拉刷新、滚动监听等
 */
import { ref, onMounted } from "vue";

import { ScrollViewCore } from "@/domains/ui/scroll-view";
import { cn } from "@/utils";

const props = defineProps<{
  class?: string;
  store: ScrollViewCore;
}>();
// console.log("[COMPONENT]ScrollView", props.store);
const { store } = props;
const contentRef = ref<HTMLDivElement | null>(null);
const state = ref(store.state);
function handleScroll(event: UIEvent) {
  const $content = contentRef.value;
  if (!$content) {
    return;
  }
  store.setRect({
    height: $content.clientHeight,
    contentHeight: $content.scrollHeight,
  });
  const target = event.currentTarget as HTMLDivElement;
  store.scroll({
    scrollTop: target.scrollTop,
  });
}

store.onStateChange((nextState) => {
  state.value = nextState;
});
onMounted(() => {
  const $content = contentRef.value;
  if (!$content) {
    return;
  }
  const { clientWidth, clientHeight, scrollHeight } = $content;
  store.setRect({
    width: clientWidth,
    height: clientHeight,
    contentHeight: scrollHeight,
  });
});

const className = cn("w-full h-full overflow-y-auto hide-scroll", props.class);
</script>

<template>
  <div :class="className">
    <div
      ref="contentRef"
      :class="className"
      :style="{ transform: `translateY(${state.top}px)` }"
      @scroll="handleScroll"
    >
      <slot></slot>
    </div>
  </div>
</template>
