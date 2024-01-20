<script setup lang="ts">
import { ref, defineComponent } from "vue";
import { ArrowLeft, Layers, Play, Pause, FastForward, Rewind, SkipForward, Settings, Maximize } from "lucide-vue-next";
import { CheckCheck, Minimize } from "lucide-vue-next";

import { PlayerCore } from "@/domains/player";
import { createVVTSubtitle } from "@/domains/subtitle/utils";
import { RefCore } from "@/domains/cur";
import { Application } from "@/domains/app";
import { RouteViewCore } from "@/domains/route_view";
import { DynamicContentCore } from "@/domains/ui/dynamic-content";
import { SeasonMediaCore } from "@/domains/media/season";
import { MediaResolutionTypes } from "@/domains/source/constants";
import { ScrollViewCore } from "@/domains/ui/scroll-view";
import { PresenceCore } from "@/domains/ui/presence";
import { DialogCore } from "@/domains/ui/dialog";
import { rootView } from "@/store/views";
import { ViewComponentProps } from "@/types";
import Video from "@/components/Video.vue";
import PlayerProgressBar from "@/components/player-progress-bar/index.vue";
import Presence from "@/components/ui/Presence.vue";
import Dialog from "@/components/ui/Dialog.vue";

class SeasonPlayingPageLogic {
  $app: Application;
  $tv: SeasonMediaCore;
  $player: PlayerCore;
  $settings: RefCore<{
    volume: number;
    rate: number;
    type: MediaResolutionTypes;
  }>;

  settings: {
    volume: number;
    rate: number;
    type: MediaResolutionTypes;
  };

  constructor(props: { app: Application }) {
    const { app } = props;

    this.$app = app;

    const settings = app.cache.get("player_settings", {
      volume: 0.5,
      rate: 1,
      type: MediaResolutionTypes.SD as MediaResolutionTypes,
    });
    this.settings = settings;
    this.$settings = new RefCore({
      value: settings,
    });
    const { type: resolution, volume, rate } = settings;
    const tv = new SeasonMediaCore({
      resolution,
    });
    this.$tv = tv;
    const player = new PlayerCore({ app, volume, rate });
    this.$player = player;

    app.onHidden(() => {
      player.pause();
    });
    app.onShow(() => {
      console.log("[PAGE]play - app.onShow", player.currentTime);
      // 锁屏后 currentTime 不是锁屏前的
      player.setCurrentTime(player.currentTime);
    });
    tv.onProfileLoaded((profile) => {
      app.setTitle(tv.getTitle().join(" - "));
      const { curSource: curEpisode } = profile;
      // const episodeIndex = tv.curGroup ? tv.curGroup.list.findIndex((e) => e.id === curEpisode.id) : -1;
      // console.log("[PAGE]play - tv.onProfileLoaded", curEpisode.name, episodeIndex);
      // const EPISODE_CARD_WIDTH = 120;
      // if (episodeIndex !== -1) {
      //   episodeView.scrollTo({ left: episodeIndex * (EPISODE_CARD_WIDTH + 8) });
      // }
      tv.playEpisode(curEpisode, { currentTime: curEpisode.currentTime ?? 0 });
      player.setCurrentTime(curEpisode.currentTime);
      // bottomOperation.show();
    });
    tv.$source.onSubtitleLoaded((subtitle) => {
      player.setSubtitle(createVVTSubtitle(subtitle));
    });
    tv.onEpisodeChange((curEpisode) => {
      app.setTitle(tv.getTitle().join(" - "));
      const { currentTime } = curEpisode;
      // nextEpisodeLoader.unload();
      player.setCurrentTime(currentTime);
      // const episodeIndex = tv.curGroup ? tv.curGroup.list.findIndex((e) => e.id === curEpisode.id) : -1;
      // const EPISODE_CARD_WIDTH = 120;
      // if (episodeIndex !== -1) {
      //   episodeView.scrollTo({ left: episodeIndex * (EPISODE_CARD_WIDTH + 8) });
      // }
      player.pause();
    });
    tv.onTip((msg) => {
      app.tip(msg);
    });
    tv.onBeforeNextEpisode(() => {
      player.pause();
    });
    tv.onSourceFileChange((mediaSource) => {
      console.log("[PAGE]play - tv.onSourceChange", mediaSource.currentTime);
      player.pause();
      player.setSize({ width: mediaSource.width, height: mediaSource.height });
      app.cache.merge("player_settings", {
        type: mediaSource.type,
      });
      // loadSource 后开始 video loadstart 事件
      player.loadSource(mediaSource);
    });
    player.onCanPlay(() => {
      const { currentTime } = tv;
      console.log("[PAGE]play - player.onCanPlay", player.hasPlayed, currentTime);
      const _self = this;
      function applySettings() {
        player.setCurrentTime(currentTime);
        const { rate } = _self.settings;
        if (rate) {
          player.changeRate(Number(rate));
        }
      }
      (() => {
        if (app.env.android) {
          setTimeout(() => {
            applySettings();
          }, 1000);
          return;
        }
        applySettings();
      })();
      if (!player.hasPlayed) {
        return;
      }
      player.play();
    });
    player.onVolumeChange(({ volume }) => {
      app.cache.merge("player_settings", {
        volume,
      });
    });
    player.onProgress(({ currentTime, duration }) => {
      // console.log("[PAGE]TVPlaying - onProgress", currentTime);
      if (!player._canPlay) {
        return;
      }
      tv.handleCurTimeChange({
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
      console.log("[PAGE]play - player.onResolutionChange", type, tv.currentTime);
      // player.setCurrentTime(tv.currentTime);
    });
    player.onSourceLoaded(() => {
      console.log("[PAGE]play - player.onSourceLoaded", tv.currentTime);
      player.setCurrentTime(tv.currentTime);
      if (!player.hasPlayed) {
        return;
      }
    });
    // console.log("[PAGE]play - before player.onError");
    player.onError((error) => {
      console.log("[PAGE]play - player.onError", error);
      // router.replaceSilently(`/out_players?token=${token}&tv_id=${view.params.id}`);
      (() => {
        // if (error.message.includes("格式")) {
        //   errorTipDialog.show();
        //   return;
        // }
        app.tip({ text: ["视频加载错误", error.message] });
      })();
      player.pause();
    });
    player.onUrlChange(async ({ url }) => {
      const $video = player.node()!;
      console.log("[]player.onUrlChange", url, player.canPlayType("application/vnd.apple.mpegurl"), $video);
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
  }
}
class SeasonPlayingPageView {
  $view: RouteViewCore;
  $scroll = new ScrollViewCore({});

  $mask = new PresenceCore({ mounted: true, open: true });
  $top = new PresenceCore({ mounted: true, open: true });
  $bottom = new PresenceCore({ mounted: true, open: true });
  $control = new PresenceCore({ mounted: true, open: true });
  $time = new PresenceCore({});
  $subtitle = new PresenceCore({});
  $settings = new DialogCore();
  $episodes = new DialogCore();
  $resolution = new DialogCore();
  $source = new DialogCore();
  $rate = new DialogCore();

  $episode = new DynamicContentCore({
    value: 1,
  });

  visible = true;
  // @ts-ignore
  timer: null | NodeJS.Timeout = null;

  constructor(props: { view: RouteViewCore }) {
    const { view } = props;
    this.$view = view;
  }

  show() {
    this.$top.show();
    this.$bottom.show();
    this.$control.show();
    this.$mask.show();
  }
  hide() {
    this.$top.hide();
    this.$bottom.hide();
    this.$control.hide();
    this.$mask.hide();
  }
  toggle() {
    this.$top.toggle();
    this.$bottom.toggle();
    this.$control.toggle();
    this.$mask.toggle();
  }
  attemptToShow() {
    if (this.timer !== null) {
      this.hide();
      clearTimeout(this.timer);
      this.timer = null;
      return false;
    }
    this.show();
    return true;
  }
  prepareHide() {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.timer = setTimeout(() => {
      this.hide();
      this.timer = null;
    }, 2400);
  }
  stopHide() {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}

defineComponent({
  components: {
    Video,
    Presence,
    PlayerProgressBar,
  },
});
const { app, view } = defineProps<ViewComponentProps>();

const $logic = new SeasonPlayingPageLogic({ app });
const $page = new SeasonPlayingPageView({ view });

const pageRef = ref<HTMLDivElement | null>(null);
const profile = ref($logic.$tv.state);
const curSource = ref($logic.$tv.$source.profile);
const subtitleState = ref($logic.$tv.$source.subtitle);
const isFull = ref(false);
// const curReportValue = ref(curReport.value);
// const rate = ref($logic.$player._curRate);
// const targetTime = ref<null | string>(null);
const playerState = ref($logic.$player.state);

function back() {
  rootView.uncoverPrevView();
}
if (view.query.rate) {
  $logic.$player.changeRate(Number(view.query.rate));
}
// function playEpisode(episode) {
//   $logic.$tv.playEpisode(episode);
// }
// function changeSource(source: { file_id: string }) {
//   tv.changeSource(source);
// }
// function changeResolution(type: EpisodeResolutionTypes) {
//   tv.changeResolution(type);
// }
// function changeRate(rate: number) {
//   player.changeRate(rate);
// }
// function loadSubtitle(subtitle: SubtitleFileResp) {
//   tv.loadSubtitleFile(subtitle, tv.currentTime);
// }
// function toggleSubtitleVisible() {
//   player.toggleSubtitleVisible();
//   tv.toggleSubtitleVisible();
// }
// function loadMoreEpisode() {
//   tv.episodeList.loadMore();
// }
view.onHidden(() => {
  $logic.$player.pause();
});
$logic.$tv.onStateChange((v) => {
  profile.value = v;
});
$logic.$tv.onSourceFileChange((v) => {
  // if (v.subtitles.length) {
  //   $page.$subtitle.show();
  // }
  curSource.value = v;
});
$logic.$tv.$source.onSubtitleChange((v) => {
  subtitleState.value = v;
});
// $logic.$player.onRateChange(({ rate }) => {
//   setRate(rate);
// });
$logic.$player.onStateChange((v) => {
  playerState.value = v;
});
// $logic.$player.onTargetTimeChange((v) => {
//   targetTime.value = seconds_to_hour(v);
// });
// $logic.$player.beforeAdjustCurrentTime(() => {
//   $page.$time.show();
//   $page.stopHide();
// });
// $logic.$player.afterAdjustCurrentTime(() => {
//   $page.prepareHide();
//   $page.$time.hide();
// });
async function handleClickEpisode(episode: any) {
  await $logic.$tv.switchEpisode(episode);
}
function changeResolution(resolution: { type: MediaResolutionTypes }) {
  $logic.$tv.changeResolution(resolution.type);
}
function changeRate(rate: number) {
  $logic.$player.changeRate(rate);
  app.cache.merge("player_settings", {
    rate,
  });
}
function changeSourceFile(file: { id: string }) {
  $logic.$tv.changeSourceFile(file);
}
function toggleFullScreen() {
  const element = pageRef.value;
  if (!element) {
    return;
  }
  if (document.fullscreenElement) {
    document.exitFullscreen();
    isFull.value = false;
    return;
  }
  isFull.value = true;
  element.requestFullscreen().catch((err) => {
    console.error(`Error attempting to enable full-screen mode: ${err.message}`);
  });
}

$logic.$tv.fetchProfile(view.query.id);
</script>

<template>
  <div ref="pageRef" class="relative w-full h-screen bg-[#000000]">
    <!-- <div class="absolute top-4 left-4 text-white cursor-pointer" style="z-index: 100" @click="back">
      <ArrowLeft :size="32" />
    </div> -->
    <div class="video flex items-center w-full h-full bg-[#000000]">
      <Video :store="$logic.$player"></Video>
    </div>
    <div class="absolute z-0 inset-0" @click="$page.toggle">
      <div class="absolute top-0 w-full">
        <Presence
          :store="$page.$top"
          class="animate-in fade-in slide-in-from-top data-[state=closed]:animate-out data-[state=closed]:slide-out-to-top data-[state=closed]:fade-out"
        >
          <div class="absolute z-10 inset-0 opacity-80 bg-gradient-to-b to-transparent from-w-black"></div>
          <div class="relative z-20 p-4 text-w-white" @click.stop>
            <div class="flex items-center cursor-pointer" @click="rootView.uncoverPrevView">
              <div class="inline-template p-4">
                <ArrowLeft class="w-8 h-8" />
              </div>
              <template v-if="!!profile.curSource">
                <div class="text-2xl truncate break-all">
                  {{ profile.curSource?.order }}、{{ profile.curSource?.name }}
                </div>
              </template>
            </div>
          </div>
        </Presence>
      </div>
      <div class="absolute bottom-0 w-full safe-bottom">
        <Presence :store="$page.$subtitle">
          <template v-if="subtitleState === null"> </template>
          <template v-else-if="!subtitleState.visible"></template>
          <template v-else>
            <div class="mb-8 space-y-1">
              <template v-for="text in subtitleState.texts">
                <div class="text-center text-lg">
                  {{ text }}
                </div>
              </template>
            </div>
          </template>
        </Presence>
        <Presence
          :store="$page.$bottom"
          class="animate-in fade-in slide-in-from-bottom data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=closed]:fade-out"
        >
          <div class="absolute z-10 inset-0 opacity-80 bg-gradient-to-t to-transparent from-w-black"></div>
          <div class="relative z-20 px-4 py-6 pt-10 text-white" @click.stop @mouseup.stop>
            <div class="px-4">
              <PlayerProgressBar :store="$logic.$player" />
            </div>
            <div class="flex items-center justify-between mt-6 w-full px-4">
              <div class="flex items-center space-x-4">
                <template v-if="!!playerState.ready">
                  <div>
                    <template v-if="playerState.playing">
                      <div class="cursor-pointer" @click="$logic.$player.pause">
                        <Pause class="w-8 h-8" />
                      </div>
                    </template>
                    <template v-else>
                      <div class="cursor-pointer" @click="$logic.$player.play">
                        <Play class="w-8 h-8" />
                      </div>
                    </template>
                  </div>
                </template>
                <div class="relative p-2 rounded-md space-x-2 cursor-pointer">
                  <SkipForward class="w-8 h-8" />
                </div>
              </div>
              <div class="flex items-center space-x-4">
                <div class="flex items-center p-2 rounded-md space-x-2 cursor-pointer" @click="$page.$episodes.show">
                  <Layers class="w-8 h-8" />
                  <div class="">选集</div>
                </div>
                <div class="relative p-2 rounded-md cursor-pointer" @click="$page.$source.show">
                  <div>切换源</div>
                </div>
                <div class="relative p-2 rounded-md cursor-pointer" @click="$page.$resolution.show">
                  <div>{{ curSource?.typeText }}</div>
                </div>
                <div class="relative p-2 rounded-md cursor-pointer" @click="$page.$rate.show">
                  <div>{{ playerState?.rate }}x</div>
                </div>
                <!-- <div class="relative p-2 rounded-md">
                  <Settings class="w-8 h-8" />
                </div> -->
                <div class="relative p-2 rounded-md cursor-pointer" @click="toggleFullScreen">
                  <template v-if="!isFull">
                    <Maximize class="w-8 h-8" />
                  </template>
                  <template v-else>
                    <Minimize class="w-8 h-8" />
                  </template>
                </div>
              </div>
            </div>
          </div>
        </Presence>
      </div>
    </div>
    <Dialog :store="$page.$episodes">
      <div class="relative box-border h-full px-4 safe-bottom">
        <div class="flex space-x-2 max-w-full overflow-x-auto scroll--hidden">
          <template v-for="group in profile.groups">
            <div :class="'p-2'" @click="$logic.$tv.fetchEpisodeOfGroup(group)">
              {{ group.text }}
            </div>
          </template>
        </div>
        <div class="grid gap-2 grid-cols-6">
          <template v-for="episode in profile.curGroup?.list">
            <div
              :class="'relative flex justify-center items-center w-12 h-12 p-2 rounded-md bg-w-fg-3'"
              @click="handleClickEpisode(episode)"
            >
              <template v-if="profile.curSource?.id === episode.id">
                <div class="cursor-pointer">
                  <div class="absolute right-1 top-1 text-w-fg-1" style="font-size: 10px">
                    {{ episode.order }}
                  </div>
                  <div class="flex items-end h-[28px]">
                    <div class="bar bar1"></div>
                    <div class="bar bar2"></div>
                    <div class="bar bar3"></div>
                  </div>
                </div>
              </template>
              <template v-else>
                <div class="cursor-pointer">{{ episode.order }}</div>
              </template>
            </div>
          </template>
        </div>
      </div>
    </Dialog>
    <Dialog :store="$page.$resolution">
      <div class="relative box-border h-full safe-bottom">
        <div class="space-y-2">
          <template v-for="resolution in curSource?.resolutions">
            <div
              :class="'relative flex justify-between p-4 rounded-md bg-w-fg-3 cursor-pointer'"
              @click="changeResolution(resolution)"
            >
              <div class="">{{ resolution.typeText }}</div>
              <template v-if="curSource?.type === resolution.type"><CheckCheck :size="32" /></template>
            </div>
          </template>
        </div>
      </div>
    </Dialog>
    <Dialog :store="$page.$rate">
      <div class="relative box-border h-full safe-bottom">
        <div class="space-y-2">
          <template v-for="rate in [0.5, 0.75, 1, 1.25, 1.5, 2]">
            <div
              :class="'relative flex justify-between p-4 rounded-md bg-w-fg-3 cursor-pointer'"
              @click="changeRate(rate)"
            >
              <div class="">{{ rate }}x</div>
              <template v-if="playerState.rate === rate"><CheckCheck :size="32" /></template>
            </div>
          </template>
        </div>
      </div>
    </Dialog>
    <Dialog :store="$page.$source">
      <div class="relative box-border h-full safe-bottom">
        <div class="space-y-2">
          <template v-for="file in profile.curSource?.files">
            <div
              :class="'relative flex justify-between p-4 rounded-md bg-w-fg-3 cursor-pointer'"
              @click="changeSourceFile(file)"
            >
              <div class="">{{ file.file_name }}</div>
              <template v-if="profile.curSource?.curSourceFileId === file.id"><CheckCheck :size="32" /></template>
            </div>
          </template>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<style scoped></style>
