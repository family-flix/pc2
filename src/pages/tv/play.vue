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
import { TVCore } from "@/domains/tv";
import Video from "@/components/Video.vue";

defineComponent({
  components: {
    Video,
  },
});
const { app, view } = defineProps<{ app: Application; view: RouteViewCore }>();

const helper = new ListCore(new RequestCore(fetch_tv_list), { pageSize: 20 });
const tv = new TVCore();
const player = new PlayerCore({ app });
const video = new ElementCore({});

const response = ref(helper.response);
const profile = ref(tv.profile);
const source = ref(tv.curSource);
const _player = ref(player);
function fetchEpisodesOfSeason(season) {
  tv.fetchEpisodesOfSeason(season);
}
function playEpisode(episode) {
  tv.playEpisode(episode);
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
video.onMounted(() => {
  connect(videoRef.current!, player);
});

tv.onProfileLoaded((profile) => {
  app.setTitle(tv.getTitle().join(" - "));
  const { curEpisode } = profile;
  // console.log("[PAGE]play - tv.onProfileLoaded", curEpisode.name);
  tv.playEpisode(curEpisode, {
    currentTime: curEpisode.currentTime,
    thumbnail: curEpisode.thumbnail,
  });
  player.setCurrentTime(curEpisode.currentTime);
});
tv.onEpisodeChange((nextEpisode) => {
  app.setTitle(tv.getTitle().join(" - "));
  const { currentTime, thumbnail } = nextEpisode;
  player.setCurrentTime(currentTime);
  player.setPoster(ImageCore.url(thumbnail));
  player.pause();
});
tv.onStateChange((nextProfile) => {
  profile.value = nextProfile;
});
tv.onTip((msg) => {
  app.tip(msg);
});
tv.onSourceChange((mediaSource) => {
  const { width, height } = mediaSource;
  // console.log("[PAGE]play - tv.onSourceChange", width, height);
  const h = Math.ceil((height / width) * app.size.width);
  // player.setResolution(values.resolution);
  player.pause();
  player.loadSource(mediaSource);
  player.setSize({
    width: app.size.width,
    height: h,
  });
  player.setCurrentTime(mediaSource.currentTime);
  source.value = mediaSource;
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
  tv.setCurrentTime(currentTime);
  tv.updatePlayProgress({
    currentTime,
    duration,
  });
});
player.onPause(({ currentTime, duration }) => {
  console.log("[PAGE]play - player.onPause", currentTime, duration);
  tv.updatePlayProgressForce({
    currentTime,
    duration,
  });
});
player.onEnd(() => {
  console.log("[PAGE]play - player.onEnd");
  tv.playNextEpisode();
});
player.onVolumeChange(({ volume }) => {
  console.log("[PAGE]play - player.onVolumeChange", volume);
});
player.onSizeChange(({ height }) => {
  console.log("[PAGE]play - player.onSizeChange");
});
player.onResolutionChange(({ type }) => {
  console.log("[PAGE]play - player.onResolutionChange", type);
  player.setCurrentTime(tv.currentTime);
});
player.onSourceLoaded(() => {
  // console.log("[PAGE]play - player.onSourceLoaded", tv.currentTime);
});
console.log("[PAGE]play - before player.onError");
player.onError((error) => {
  console.log("[PAGE]play - player.onError");
  app.tip({ text: ["视频加载错误", error.message] });
  player.pause();
});
player.onUrlChange(async ({ url, thumbnail }) => {
  const $video = player.node()!;
  console.log("[PAGE]play - player.onUrlChange", url, $video);
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
tv.fetchProfile(view.params.id);
</script>

<template>
  <div class="flex flex-wrap">
    <div class="p-4 w-[980px]">
      <Video :store="_player"></Video>
    </div>
    <div class="profile flex-1 p-4">
      <div v-if="profile">
        <div class="text-3xl">{{ profile.name }}</div>
        <div class="seasons mt-4">
          <div
            v-for="season in profile.seasons"
            @click="fetchEpisodesOfSeason(season)"
          >
            <div class="text-xl">{{ season.name }}</div>
          </div>
        </div>
        <div class="episodes max-h-[360px] overflow-y-auto mt-2" v-if="profile">
          <div
            v-for="episode in profile.curEpisodes"
            @click="playEpisode(episode)"
          >
            <div
              :class="{
                'py-2': true,
                underline: episode.id === profile.curEpisode.id,
              }"
            >
              {{ episode.name }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
