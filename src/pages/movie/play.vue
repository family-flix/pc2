<script setup lang="ts">
import { ref, defineComponent } from "vue";

import { Application } from "@/domains/app";
import { fetch_tv_list } from "@/domains/tv/services";
import { ListCore } from "@/domains/list";
import { RequestCore } from "@/domains/client";
import { ImageCore } from "@/domains/ui/image";
import { PlayerCore } from "@/domains/player";
import { ElementCore } from "@/domains/ui/element";
import { RouteViewCore } from "@/domains/route_view";
import { MovieCore } from "@/domains/movie";
import Video from "@/components/Video.vue";

defineComponent({
  components: {
    Video,
  },
});
const { app, view } = defineProps<{ app: Application; view: RouteViewCore }>();

const helper = new ListCore(new RequestCore(fetch_tv_list), { pageSize: 20 });
const movie = new MovieCore();
const player = new PlayerCore({ app });
const video = new ElementCore({});

const response = ref(helper.response);
const profile = ref(movie.profile);
const curSource = ref(movie.curSource);
function changeSource(source: { file_id: string }) {
  movie.changeSource(source);
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
  // tv.updatePlayProgress();
});
// view.onUnmounted(() => {
//   player.destroy();
// });
// video.onMounted(() => {
//   connect(videoRef.current!, player);
// });

movie.onProfileLoaded((profile) => {
  app.setTitle(movie.getTitle().join(" - "));
  // console.log("[PAGE]play - tv.onProfileLoaded", curEpisode.name);
  movie.play();
  player.setCurrentTime(profile.currentTime);
});
movie.onStateChange((nextProfile) => {
  profile.value = nextProfile;
});
movie.onTip((msg) => {
  app.tip(msg);
});
movie.onSourceChange((mediaSource) => {
  const { width, height } = mediaSource;
  // console.log("[PAGE]play - tv.onSourceChange", width, height);
  const h = Math.ceil((height / width) * app.screen.width);
  // player.setResolution(values.resolution);
  player.pause();
  player.loadSource(mediaSource);
  player.setSize({
    width: app.screen.width,
    height: h,
  });
  console.log("[PAGE]play - tv.onSourceChange", mediaSource.currentTime);
  player.setCurrentTime(mediaSource.currentTime);
  curSource.value = mediaSource;
});
player.onCanPlay(() => {
  if (!view.state.visible) {
    return;
  }
  // console.log("[PAGE]play - player.onCanPlay");
  // cover.hide();
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
player.onEnd(() => {
  console.log("[PAGE]play - player.onEnd");
});
player.onVolumeChange(({ volume }) => {
  console.log("[PAGE]play - player.onVolumeChange", volume);
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
console.log("[PAGE]play - before player.onError");
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
console.log("[PAGE]tv/play - before fetch tv profile", view.params.id);
movie.fetchProfile(view.params.id);
</script>

<template>
  <div class="flex flex-wrap w-full h-screen bg-[#14161a]">
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
