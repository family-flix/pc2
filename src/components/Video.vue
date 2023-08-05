<script setup lang="ts">
import { ref, onMounted } from "vue";

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
  <div class="relative w-full h-screen">
    <div class="absolute z-20 top-0 left-0">
      <div class="bar flex items-center justify-between py-4 px-4">
        <div class="bar__main flex items-center">
          <div></div>
        </div>
        <div class="bar__sub flex items-center"></div>
      </div>
    </div>
    <video
      ref="videoRef"
      class="absolute top-[50%] translate-y-[-50%] z-10 w-full"
      :poster="state.poster"
      :height="state.height"
      :controls="false"
      :webkit-playsinline="true"
      :playsInline="true"
      preload="none"
    ></video>
    <div class="absolute z-20 bottom-0 left-0">
      <div class="bar flex items-center justify-between py-4 px-4">
        <div class="bar__main flex items-center space-x-4">
          <template v-if="state.playing">
            <div>
              <div class="p-4 cursor-pointer text-white" @click="pause">
                暂停
              </div>
            </div>
          </template>
          <template v-else>
            <div>
              <div class="p-4 cursor-pointer text-white" @click="play">
                播放
              </div>
            </div>
          </template>
        </div>
        <div class="bar__sub flex items-center"></div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
