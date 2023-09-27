<script setup lang="ts">
import { ref, defineComponent } from "vue";
import { ArrowLeft, Eye, EyeOff } from "lucide-vue-next";

import { reportSomething } from "@/services";
import { PlayerCore } from "@/domains/player";
import { TVCore } from "@/domains/tv";
import { EpisodeResolutionTypes } from "@/domains/tv/constants";
import { createVVTSubtitle } from "@/domains/subtitle/utils";
import { RequestCore } from "@/domains/request";
import { SubtitleResp } from "@/domains/subtitle/types";
import { RefCore } from "@/domains/cur";
import { rootView } from "@/store/views";
import { ViewComponentProps } from "@/types";
import Video from "@/components/Video.vue";

defineComponent({
  components: {
    Video,
  },
});
const { app, view } = defineProps<ViewComponentProps>();

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
const curReport = new RefCore<string>({
  onChange(v) {
    curReportValue.value = v;
  },
});
const reportRequest = new RequestCore(reportSomething, {
  onLoading(loading) {
    // reportConfirmDialog.okBtn.setLoading(loading);
  },
  onSuccess() {
    app.tip({
      text: ["提交成功"],
    });
    // reportConfirmDialog.hide();
    // reportSheet.hide();
  },
  onFailed(error) {
    app.tip({
      text: ["提交失败", error.message],
    });
  },
});

const profile = ref(tv.profile);
const curSource = ref(tv.curSource);
const subtitleState = ref(tv.subtitle);
const curReportValue = ref(curReport.value);
const rate = ref(player.state.rate);
function back() {
  rootView.uncoverPrevView();
}
function fetchEpisodesOfSeason(season: any) {
  tv.fetchEpisodesOfSeason(season);
}
function playEpisode(episode: any) {
  tv.playEpisode(episode);
}
function changeSource(source: { file_id: string }) {
  tv.changeSource(source);
}
function changeResolution(type: EpisodeResolutionTypes) {
  tv.changeResolution(type);
}
function changeRate(rate: number) {
  player.changeRate(rate);
}
function loadSubtitle(subtitle: SubtitleResp) {
  tv.loadSubtitleFile(subtitle, tv.currentTime);
}
function toggleSubtitleVisible() {
  player.toggleSubtitleVisible();
  tv.toggleSubtitleVisible();
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

app.onHidden(() => {
  player.pause();
});
app.onShow(() => {
  console.log("[PAGE]play - app.onShow", player.currentTime);
  // 锁屏后 currentTime 不是锁屏前的
  player.setCurrentTime(player.currentTime);
});
view.onHidden(() => {
  player.pause();
});
tv.onProfileLoaded((profile) => {
  app.setTitle(tv.getTitle().join(" - "));
  const { curEpisode } = profile;
  // console.log("[PAGE]play - tv.onProfileLoaded", curEpisode.name);
  tv.playEpisode(curEpisode, { currentTime: curEpisode.currentTime, thumbnail: curEpisode.thumbnail });
  player.setCurrentTime(curEpisode.currentTime);
});
tv.onSubtitleLoaded((subtitle) => {
  player.setSubtitle(createVVTSubtitle(subtitle));
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
tv.onSubtitleChange((l) => {
  subtitleState.value = l;
});
tv.onTip((msg) => {
  app.tip(msg);
});
tv.onBeforeNextEpisode(() => {
  player.pause();
});
tv.onResolutionChange(({ type }) => {
  console.log("[PAGE]play - player.onResolutionChange", type);
  app.cache.merge("player_settings", {
    type,
  });
});
tv.onSourceChange((mediaSource) => {
  console.log("[PAGE]play - tv.onSourceChange", mediaSource.currentTime);
  player.pause();
  player.setSize({ width: mediaSource.width, height: mediaSource.height });
  player.loadSource(mediaSource);
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
player.onRateChange((nextState) => {
  rate.value = nextState.rate;
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
player.onResolutionChange(({ type }) => {
  console.log("[PAGE]play - player.onResolutionChange", type);
  player.setCurrentTime(tv.currentTime);
});
player.onSourceLoaded(() => {
  console.log("[PAGE]play - player.onSourceLoaded", tv.currentTime);
});
// console.log("[PAGE]play - before player.onError");
player.onError((error) => {
  console.log("[PAGE]play - player.onError", error);
  (() => {
    // if (error.message.includes("格式")) {
    //   return;
    // }
    app.tip({ text: ["视频加载错误", error.message] });
  })();
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
tv.fetchProfile(view.params.id, {
  season_id: view.query.season_id,
});
</script>

<template>
  <div class="relative flex flex-wrap w-full h-screen bg-[#14161a]">
    <div class="absolute top-4 left-4 text-white cursor-pointer" style="z-index: 100" @click="back">
      <ArrowLeft :size="32" />
    </div>
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
          <div>播放速率</div>
          <div className="">
            <template v-for="rateOpt in [0.5, 0.75, 1, 1.25, 1.5, 2]">
              <div class="">
                <div
                  :class="{
                    'p-4 rounded cursor-pointer': true,
                    'bg-slate-500': rate === rateOpt,
                  }"
                  @click="changeRate(rateOpt)"
                >
                  {{ rateOpt }}x
                </div>
              </div>
            </template>
          </div>
        </div>
        <div class="mt-8 text-white">
          <div class="flex justify-between">
            <div>字幕</div>
            <div @click="toggleSubtitleVisible">
              <block v-if="subtitleState.visible">
                <Eye :size="24" />
              </block>
              <block v-else>
                <EyeOff :size="24" />
              </block>
            </div>
          </div>
          <div className="">
            <template v-for="subtitle in subtitleState.others">
              <div class="">
                <div
                  :class="{
                    'p-4 rounded cursor-pointer': true,
                    'bg-slate-500': subtitle.selected,
                  }"
                  @click="loadSubtitle(subtitle)"
                >
                  {{ subtitle.name }}
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
