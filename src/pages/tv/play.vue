<script setup lang="ts">
import { ref, defineComponent } from "vue";

import { Application } from "@/domains/app";
import { PlayerCore } from "@/domains/player";
import { ElementCore } from "@/domains/ui/element";
import { RouteViewCore } from "@/domains/route_view";
import { TVCore } from "@/domains/tv";
import Video from "@/components/Video.vue";
import { EpisodeResolutionTypes } from "@/domains/tv/constants";
import { ViewComponentProps } from "@/types";

defineComponent({
  components: {
    Video,
  },
});
const { app, router, view } = defineProps<ViewComponentProps>();

// const helper = new ListCore(new RequestCore(fetch_tv_list), { pageSize: 20 });
const { type: resolution, volume } = app.cache.get<{
  type: EpisodeResolutionTypes;
  volume: number;
}>("player_settings", {
  type: "SD",
  volume: 0.5,
});
const tv = new TVCore({
  resolution,
});
const player = new PlayerCore({ app, volume });
const video = new ElementCore({});

// const response = ref(helper.response);
const profile = ref(tv.profile);
const curSource = ref(tv.curSource);
function back() {
  router.back();
}
function fetchEpisodesOfSeason(season: any) {
  tv.fetchEpisodesOfSeason(season);
}
function playEpisode(episode: any) {
  tv.playEpisode(episode);
}
function changeSource(source: any) {
  tv.changeSource(source);
}
function changeResolution(type: any) {
  tv.changeResolution(type);
}
function loadMoreEpisode() {
  tv.episodeList.loadMore();
}

const players: { icon: string; name: string; scheme: string }[] = [
  { icon: "iina", name: "IINA", scheme: "iina://weblink?url=$durl" },
  { icon: "potplayer", name: "PotPlayer", scheme: "potplayer://$durl" },
  { icon: "vlc", name: "VLC", scheme: "vlc://$durl" },
  { icon: "nplayer", name: "nPlayer", scheme: "nplayer-$durl" },
  {
    icon: "infuse",
    name: "Infuse",
    scheme: "infuse://x-callback-url/play?url=$durl",
  },
  {
    icon: "mxplayer",
    name: "MX Player",
    scheme: "intent:$durl#Intent;package=com.mxtech.videoplayer.ad;S.title=$name;end",
  },
  {
    icon: "mxplayer-pro",
    name: "MX Player Pro",
    scheme: "intent:$durl#Intent;package=com.mxtech.videoplayer.pro;S.title=$name;end",
  },
];

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
  player.setPoster(thumbnail);
  player.pause();
});
tv.onStateChange((nextProfile) => {
  profile.value = nextProfile;
});
tv.onTip((msg) => {
  app.tip(msg);
});
tv.onBeforeNextEpisode(() => {
  player.pause();
});
tv.onSourceChange((mediaSource) => {
  console.log("[PAGE]play - tv.onSourceChange", mediaSource.currentTime);
  const { width, height } = mediaSource;
  const h = Math.ceil((height / width) * app.screen.width);
  player.pause();
  player.loadSource(mediaSource);
  player.setSize({
    width: app.screen.width,
    height: h,
  });
  player.setCurrentTime(mediaSource.currentTime);
  curSource.value = mediaSource;
});
player.onCanPlay(() => {
  if (!view.state.visible) {
    return;
  }
  // console.log("[PAGE]play - player.onCanPlay");
  if (!tv.canAutoPlay) {
    return;
  }
  player.play();
  tv.canAutoPlay = false;
});
player.onVolumeChange(({ volume }) => {
  app.cache.merge("player_settings", {
    volume,
  });
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
tv.onResolutionChange(({ type }) => {
  console.log("[PAGE]play - player.onResolutionChange", type);
  app.cache.merge("player_settings", {
    type,
  });
});
// tv.onBeforeChangeSource(() => {
//   player.pause();
// });
player.onSourceLoaded(() => {
  console.log("[PAGE]play - player.onSourceLoaded", tv.currentTime);
});
// console.log("[PAGE]play - before player.onError");
player.onError((error) => {
  console.log("[PAGE]play - player.onError", error);
  // const token = "lg9lT9e03WPcmBn";
  // router.replaceSilently(`/out_players?token=${token}&tv_id=${view.params.id}`);
  app.tip({ text: ["视频加载错误", error.message] });
  player.pause();
});
player.onUrlChange(async ({ url, thumbnail }) => {
  const $video = player.node()!;
  if (player.canPlayType("application/vnd.apple.mpegurl")) {
    player.load(url);
    return;
  }
  const mod = await import("hls.js");
  const Hls2 = mod.default;
  if (Hls2.isSupported() && url.includes("m3u8")) {
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
tv.fetchProfile(view.params.id, {
  season_id: view.query.season_id,
});
</script>

<template>
  <div class="relative flex flex-wrap w-full h-screen bg-[#14161a]">
    <div class="absolute top-4 left-4 text-white cursor-pointer" style="z-index: 100" @click="back">返回</div>
    <div class="flex-1 flex items-center w-full h-full bg-black">
      <Video :store="player"></Video>
    </div>
    <div class="profile p-4 h-full w-[380px] md:w-[240px] overflow-y-auto">
      <div v-if="profile">
        <div class="text-3xl text-white">{{ profile.name }}</div>
        <div class="max-w-full overflow-x-auto">
          <div class="seasons flex items-center space-x-2 pb-8 mt-4">
            <div v-for="season in profile.seasons" @click="fetchEpisodesOfSeason(season)">
              <div
                :class="{
                  'text-xl text-white whitespace-nowrap': true,
                  underline: profile?.curSeason.id === season.id,
                }"
              >
                {{ season.name }}
              </div>
            </div>
          </div>
        </div>
        <div class="episodes flex flex-wrap mt-2" v-if="profile">
          <div v-for="episode in profile.curEpisodes" @click="playEpisode(episode)">
            <div
              :class="{
                'inline-flex items-center justify-center w-[60px] h-[60px] mr-[8px] text-center mb-[8px] bg-[#1d1f23]': true,
                'py-2': true,
                'cursor-pointer': true,
              }"
            >
              <div
                :class="{
                  'text-white': episode.id !== profile.curEpisode.id,
                  'text-green-800': episode.id === profile.curEpisode.id,
                }"
              >
                {{ episode.episode_text }}
              </div>
            </div>
          </div>
          <template v-if="!profile.episodeNoMore">
            <div
              :class="{
                'inline-flex items-center justify-center w-[60px] h-[60px] mr-[8px] text-center mb-[8px] bg-[#1d1f23]': true,
                'py-2': true,
                'cursor-pointer': true,
              }"
            >
              <div
                :class="{
                  'text-white': true,
                }"
                @click="loadMoreEpisode"
              >
                ...
              </div>
            </div>
          </template>
        </div>
        <div class="mt-8 text-white">
          <div>分辨率</div>
          <div className="">
            <template v-for="resolution in curSource?.resolutions">
              <div class="">
                <div
                  :class="{
                    'p-4 rounded cursor-pointer': true,
                    'bg-slate-500': curSource?.typeText === resolution.typeText,
                  }"
                  @click="changeResolution(resolution.type)"
                >
                  {{ resolution.typeText }}
                </div>
              </div>
            </template>
          </div>
        </div>
        <div class="mt-8 text-white">
          <div>可选源</div>
          <div className="safe-bottom h-full">
            <div className="">
              <template v-for="source in profile.curEpisode.sources">
                <div @click="changeSource(source)">
                  <div
                    :class="{
                      'p-4 rounded cursor-pointer': true,
                      'bg-slate-500': curSource?.file_id === source.file_id,
                    }"
                  >
                    <div className="break-all">{{ source.parent_paths }}/{{ source.file_name }}</div>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
