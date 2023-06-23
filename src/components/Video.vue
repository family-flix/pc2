<script setup lang="ts">
import { ref, onMounted } from "vue";

import { PlayerCore } from "@/domains/player";
import { connect } from "@/domains/player/connect.web";

const { store } = defineProps<{ store: PlayerCore }>();
const videoRef = ref<HTMLVideoElement | null>(null);

const state = ref(store.state);

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
  <div>
    <video
      ref="videoRef"
      class="w-full relative z-10"
      :poster="state.poster"
      :height="state.height"
      :controls="true"
      :webkit-playsinline="true"
      :playsInline="true"
      preload="none"
    ></video>
  </div>
</template>

<style scoped></style>
