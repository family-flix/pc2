<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
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
onMounted(() => {
  document.addEventListener("mousemove", handleTouchMove);
  document.addEventListener("mouseup", handleTouchEnd);
  document.addEventListener("pointerup", handleTouchEnd);
});
onUnmounted(() => {
  document.removeEventListener("mousemove", handleTouchMove);
  document.removeEventListener("mouseup", handleTouchEnd);
  document.removeEventListener("pointerup", handleTouchEnd);
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
function handleTouchStart(event: MouseEvent) {
  event.stopPropagation();
  console.log("[COMPONENT]onTouchStart");
  const { clientX } = event;
  isDragRef = true;
  store.startAdjustCurrentTime();
  store.pause();
  updateProgressBar({ clientX });
}
function handleTouchMove(event: MouseEvent) {
  event.stopPropagation();
  if (isDragRef === false) {
    return;
  }
  const { clientX } = event;
  console.log("[COMPONENT]onTouchMove", clientX);
  updateProgressBar({ clientX });
}
function handleTouchEnd(event: MouseEvent) {
  event.stopPropagation();
  console.log("[COMPONENT]onTouchEnd");
  if (isDragRef === false) {
    return;
  }
  isDragRef = false;
  store.adjustCurrentTime(store.virtualProgress * store._duration);
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
  <div class="user-select-none" @click.stop>
    <div class="flex items-center text-sm">
      <div>{{ times.currentTime }}</div>
      <div class="mx-2">/</div>
      <div>{{ times.duration }}</div>
    </div>
    <div class="py-2 cursor-pointer" @mousedown.stop="handleTouchStart">
      <div class="__a mt-2 w-full bg-gray-300 rounded-md overflow-hidden" @animationend="handleAnimationEnd">
        <div class="h-[4px] bg-green-500" :style="{ width: progress + '%' }"></div>
      </div>
    </div>
  </div>
</template>
