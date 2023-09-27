<script setup lang="ts">
import { ref, defineComponent } from "vue";
import { ArrowLeft } from "lucide-vue-next";

import { Application } from "@/domains/app";
import { PlayerCore } from "@/domains/player";
import { RouteViewCore } from "@/domains/route_view";
import { MovieCore } from "@/domains/movie";
import { createVVTSubtitle } from "@/domains/subtitle/utils";
import Video from "@/components/Video.vue";
import { rootView } from "@/store/views";

defineComponent({
  components: {
    Video,
  },
});
const { app, view } = defineProps<{ app: Application; view: RouteViewCore }>();

const movie = new MovieCore();
const player = new PlayerCore({ app });

const profile = ref(movie.profile);
const curSource = ref(movie.curSource);
const subtitleState = ref(movie.subtitle);
const rate = ref(player.state.rate);
function changeSource(source: { file_id: string }) {
  movie.changeSource(source);
}
function back() {
  rootView.uncoverPrevView();
}
// console.log("[PAGE]play - useInitialize");
app.onHidden(() => {
  player.pause();
  // tv.updatePlayProgress();
});
app.onShow(() => {
  console.log("[PAGE]play - app.onShow", player.currentTime);
  // 锁屏后 currentTime 不是锁屏前的
  player.setCurrentTime(player.currentTime);
});
view.onHidden(() => {
  player.pause();
});
movie.onProfileLoaded((profile) => {
  app.setTitle(movie.getTitle().join(" - "));
  movie.play();
  player.setCurrentTime(profile.currentTime);
});
movie.onSubtitleLoaded((subtitle) => {
  player.setSubtitle(createVVTSubtitle(subtitle));
});
movie.onStateChange((nextProfile) => {
  profile.value = nextProfile;
});
movie.onTip((msg) => {
  app.tip(msg);
});
movie.onSubtitleChange((l) => {
  subtitleState.value = l;
});
movie.onSourceChange((mediaSource) => {
  const { width, height } = mediaSource;
  player.pause();
  player.loadSource(mediaSource);
  player.setSize({
    width,
    height,
  });
  player.setCurrentTime(mediaSource.currentTime);
  curSource.value = mediaSource;
});
player.onCanPlay(() => {
  if (!view.state.visible) {
    return;
  }
  if (!movie.canAutoPlay) {
    return;
  }
  player.play();
});
player.onProgress(({ currentTime, duration }) => {
  // console.log("[PAGE]TVPlaying - onProgress", currentTime);
  movie.setCurrentTime(currentTime);
  movie.updatePlayProgress({
    currentTime,
    duration,
  });
});
player.onPause(({ currentTime, duration }) => {
  console.log("[PAGE]play - player.onPause", currentTime, duration);
  movie.updatePlayProgressForce({
    currentTime,
    duration,
  });
});
player.onVolumeChange(({ volume }) => {
  app.cache.merge("player_settings", {
    volume,
  });
});
player.onRateChange((nextState) => {
  rate.value = nextState.rate;
});
player.onSizeChange(({ height }) => {
  console.log("[PAGE]play - player.onSizeChange");
});
player.onResolutionChange(({ type }) => {
  console.log("[PAGE]play - player.onResolutionChange", type);
  player.setCurrentTime(movie.currentTime);
});
player.onSourceLoaded(() => {
  console.log("[PAGE]play - player.onSourceLoaded", player.currentTime);
  player.setCurrentTime(player.currentTime);
});
player.onError((error) => {
  console.log("[PAGE]play - player.onError");
  app.tip({ text: ["视频加载错误", error.message] });
  player.pause();
});
player.onUrlChange(async ({ url, thumbnail }) => {
  const $video = player.node()!;
  console.log("[PAGE]play - player.onUrlChange", player.currentTime);
  //   player.setCurrentTime(player.currentTime);
  if (player.canPlayType("application/vnd.apple.mpegurl")) {
    player.load(url);
    return;
  }
  const mod = await import("hls.js");
  const Hls2 = mod.default;
  if (Hls2.isSupported() && url.includes("m3u8")) {
    // console.log("[PAGE]TVPlaying - need using hls.js");
    const Hls = new Hls2({ fragLoadingTimeOut: 2000 });
    Hls.attachMedia($video);
    Hls.on(Hls2.Events.MEDIA_ATTACHED, () => {
      Hls.loadSource(url);
    });
    return;
  }
  player.load(url);
});
movie.fetchProfile(view.params.id);
</script>

<template>
  <div class="flex flex-wrap w-full h-screen bg-[#14161a]">
    <div class="absolute top-4 left-4 text-white cursor-pointer" style="z-index: 100" @click="back">
      <ArrowLeft :size="32" />
    </div>
    <div class="flex-1 flex items-center w-full h-full bg-black">
      <Video :store="player"></Video>
    </div>
    <div class="profile p-4 h-full w-[380px] md:w-[240px] overflow-y-auto">
      <div v-if="profile">
        <div class="text-3xl text-white">{{ profile.name }}</div>
        <div class="text-white">{{ profile.overview }}</div>
        <div class="mt-8 text-xl text-white">可选播放源</div>
        <div class="sources mt-2">
          <div v-for="source in profile.sources" @click="changeSource(source)">
            <div
              :class="{
                'break-all': true,
                'py-2 text-white': true,
                'text-lg': source.file_id === curSource?.file_id,
              }"
            >
              {{ source.file_name }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
