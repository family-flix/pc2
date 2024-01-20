<script setup lang="ts">
import { ref } from "vue";
import { PlayerCore } from "@/domains/player";
import { cn, seconds_to_hour } from "@/utils";

const props = defineProps<{
  store: PlayerCore;
  class?: string;
}>();
const { store } = props;

let isDragRef = false;
let rectRef = { width: 0, left: 0 };

const state = ref(store.state);
const progress = ref(store._progress);
const times = ref({
  currentTime: seconds_to_hour(store._currentTime),
  duration: seconds_to_hour(store._duration),
});

store.onStateChange((nextState) => {
  state.value = nextState;
});
store.onCurrentTimeChange((v) => {
  progress.value = v.currentTime;
});
store.onProgress((v) => {
  progress.value = v.progress;
  times.value = {
    currentTime: seconds_to_hour(v.currentTime),
    duration: seconds_to_hour(v.duration),
  };
});
const updateProgressBar = (touch: { clientX: number }) => {
  //     const rect = progressContainer.getBoundingClientRect();
  const rect = rectRef;
  const p = (touch.clientX - rect.left) / rect.width;
  const clampedProgress = Math.min(1, Math.max(0, p));
  store.adjustProgressManually(clampedProgress);
  progress.value = clampedProgress * 100;
};
// const handlerTouchMove = (event: TouchEvent) => {
//   event.stopPropagation();
//   if (isDragRef === false) {
//     return;
//   }
//   const { clientX } = event.touches[0];
//   console.log("[COMPONENT]handlerTouchMove", clientX);
//   updateProgressBar({ clientX });
// };
// const handlerTouchEnd = (event: TouchEvent) => {
//   event.stopPropagation();
//   console.log("[COMPONENT]handlerTouchEnd");
//   isDragRef = false;
// };
function handleTouchEnd(event: TouchEvent) {
  event.stopPropagation();
  console.log("[COMPONENT]onTouchEnd");
  isDragRef = false;
  store.adjustCurrentTime(store.virtualProgress * store._duration);
}
function handleTouchMove(event: TouchEvent) {
  event.stopPropagation();
  if (isDragRef === false) {
    return;
  }
  const { clientX } = event.touches[0];
  console.log("[COMPONENT]onTouchMove", clientX);
  updateProgressBar({ clientX });
}
function handleTouchStart(event: TouchEvent) {
  event.stopPropagation();
  console.log("[COMPONENT]onTouchStart");
  const { touches } = event;
  isDragRef = true;
  store.startAdjustCurrentTime();
  store.pause();
  updateProgressBar({ clientX: touches[0].clientX });
}
function handleAnimationEnd(event: AnimationEvent) {
  const { currentTarget: target } = event;
  if (!target) {
    return;
  }
  const client = (target as HTMLDivElement).getBoundingClientRect();
  rectRef = {
    width: client.width,
    left: client.left,
  };
}
</script>

<template>
  <div class="user-select-none">
    <div class="flex items-center text-sm">
      <div>{{ times.currentTime }}</div>
      <div class="mx-2">/</div>
      <div>{{ times.duration }}</div>
    </div>
    <div
      class="__a mt-2 w-full bg-gray-300 cursor-pointer rounded-md overflow-hidden"
      @animationend="handleAnimationEnd"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <div class="h-[4px] bg-green-500" :style="{ width: progress + '%' }"></div>
    </div>
  </div>
</template>
