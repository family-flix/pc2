<script setup lang="ts">
import { ref, onMounted, defineComponent } from "vue";
import { Play, Pause } from "lucide-vue-next";

import { PlayerCore } from "@/domains/player";
import { connect } from "@/domains/player/connect.web";

const { store } = defineProps<{ store: PlayerCore }>();
const videoRef = ref<HTMLVideoElement | null>(null);
const state = ref(store.state);
function play() {
  store.play();
}
function pause() {
  store.pause();
}

store.onStateChange((nextState) => {
  state.value = nextState;
});
onMounted(() => {
  const $video = videoRef.value;
  console.log("[COMPONENT]Video - onMounted", $video);
  if ($video === null) {
    return;
  }
  store.setMounted();
  connect($video, store);
});
// const { width, height, ready, poster } = toRefs(state);
</script>

<template>
  <video
    ref="videoRef"
    class="w-full"
    :poster="state.poster"
    :height="state.height"
    :controls="false"
    preload="none"
  ></video>
</template>

<style scoped></style>
