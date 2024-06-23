<script setup lang="ts">
import { ref, defineComponent, onMounted, onUnmounted } from "vue";
import { ArrowLeft, Layers, Play, Pause, FastForward, Rewind, SkipForward, Settings, Maximize } from "lucide-vue-next";
import hotkeys from "hotkeys-js";
import { CheckCheck, Minimize, Loader2, Captions, CaptionsOff } from "lucide-vue-next";

import { ViewComponentProps } from "@/store/types";
import Video from "@/components/Video.vue";
import PlayerProgressBar from "@/components/player-progress-bar/index.vue";
import Presence from "@/components/ui/Presence.vue";
import Popover from "@/components/ui/TipMenu.vue";
import { MovieMediaCore } from "@/biz/media/movie";
import { createVVTSubtitle } from "@/biz/subtitle/utils";
import { MediaResolutionTypes } from "@/biz/source/constants";
import { PlayerCore, MediaRateOptions } from "@/domains/player";
import { RefCore } from "@/domains/cur";
import { OrientationTypes } from "@/domains/app";
import { RouteViewCore } from "@/domains/route_view";
import { ScrollViewCore } from "@/domains/ui/scroll-view";
import { PresenceCore } from "@/domains/ui/presence";
import { DialogCore } from "@/domains/ui/dialog";
import { DynamicContentCore } from "@/domains/ui/dynamic-content";
import { PopoverCore } from "@/domains/ui";

function MoviePlayingPageLogic(props: ViewComponentProps) {
  const { app, client, storage } = props;

  const settings = storage.get("player_settings");
  const $settings = new RefCore<{
    volume: number;
    rate: number;
    type: MediaResolutionTypes;
  }>({
    value: settings,
  });
  const { type: resolution, volume, rate } = settings;
  const tv = new MovieMediaCore({
    resolution,
    client,
  });
  const $tv = tv;
  const player = new PlayerCore({ app, volume, rate });
  const $report = new RefCore<string>();
  //     const reportSheet = new DialogCore();
  const $player = player;

  app.onHidden(() => {
    player.pause();
  });
  app.onShow(() => {
    console.log("[PAGE]play - app.onShow", player.currentTime);
    // 锁屏后 currentTime 不是锁屏前的
    player.setCurrentTime(player.currentTime);
  });
  app.onOrientationChange((orientation) => {
    console.log("[PAGE]tv/play - app.onOrientationChange", orientation, app.screen.width);
    if (orientation === "horizontal") {
      if (!player.hasPlayed && app.env.ios) {
        //   $$fullscreenDialog.show();
        return;
      }
      if (player.isFullscreen) {
        return;
      }
      player.requestFullScreen();
      player.isFullscreen = true;
    }
    if (orientation === "vertical") {
      player.disableFullscreen();
      // $$fullscreenDialog.hide();
    }
  });
  player.onExitFullscreen(() => {
    player.pause();
    if (app.orientation === OrientationTypes.Vertical) {
      player.disableFullscreen();
    }
  });
  tv.onProfileLoaded((profile) => {
    app.setTitle(tv.getTitle().join(" - "));
    const { curSource } = profile;
    // console.log("[PAGE]play - tv.onProfileLoaded", curEpisode.name);
    tv.playSource(curSource, { currentTime: curSource.currentTime ?? 0 });
    player.setCurrentTime(curSource.currentTime);
  });
  tv.$source.onSubtitleLoaded((subtitle) => {
    player.showSubtitle(createVVTSubtitle(subtitle));
  });
  tv.onTip((msg) => {
    app.tip(msg);
  });
  tv.onSourceFileChange((mediaSource) => {
    // console.log("[PAGE]play - tv.onSourceChange", mediaSource.currentTime);
    player.pause();
    player.setSize({ width: mediaSource.width, height: mediaSource.height });
    storage.merge("player_settings", {
      type: mediaSource.type,
    });
    // loadSource 后开始 video loadstart 事件
    player.loadSource(mediaSource);
  });
  player.onReady(() => {
    player.disableFullscreen();
  });
  player.onCanPlay(() => {
    const { currentTime } = tv;
    console.log("[PAGE]play - player.onCanPlay", player.hasPlayed, currentTime);
    function applySettings() {
      player.setCurrentTime(currentTime);
      const { rate } = $settings.value!;
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
    storage.merge("player_settings", {
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
  // player.onEnd(() => {
  //   console.log("[PAGE]play - player.onEnd");
  //   tv.playNextEpisode();
  // });
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
    //       episodesSheet.hide();
    //       sourcesSheet.hide();
    //       resolutionSheet.hide();
  });
  // console.log("[PAGE]play - before player.onError");
  player.onError(async (error) => {
    console.log("[PAGE]play - player.onError", tv.curSource?.name, tv.curSource?.curFileId);
    // router.replaceSilently(`/out_players?token=${token}&tv_id=${view.params.id}`);
    await (async () => {
      if (!tv.curSource) {
        return;
      }
      const files = tv.curSource.files;
      const curFileId = tv.curSource.curFileId;
      const curFileIndex = files.findIndex((f) => f.id === curFileId);
      const nextIndex = curFileIndex + 1;
      const nextFile = files[nextIndex];
      if (!nextFile) {
        app.tip({ text: ["视频加载错误", error.message] });
        player.setInvalid(error.message);
        return;
      }
      await tv.changeSourceFile(nextFile);
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
      Hls.attachMedia($video as HTMLVideoElement);
      Hls.on(Hls2.Events.MEDIA_ATTACHED, () => {
        Hls.loadSource(url);
      });
      return;
    }
    player.load(url);
  });

  return {
    $tv,
    $player,
    $report,
  };
}

class MoviePlayingPageView {
  $view: RouteViewCore;
  $scroll = new ScrollViewCore({});

  $mask = new PresenceCore({ mounted: true, visible: true });
  $top = new PresenceCore({ mounted: true, visible: true });
  $bottom = new PresenceCore({ mounted: true, visible: true });
  $control = new PresenceCore({ mounted: true, visible: true });
  $time = new PresenceCore({});
  $subtitle = new PresenceCore({});
  $settings = new DialogCore();
  $resolutionMenu = new PopoverCore({
    align: "center",
    side: "top",
    toBody: false,
  });
  $sourceMenu = new PopoverCore({
    align: "center",
    side: "top",
    toBody: false,
  });
  $rateMenu = new PopoverCore({
    align: "center",
    side: "top",
    toBody: false,
  });
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

  showControls() {
    this.visible = true;
    app.showCursor();
    this.$top.show();
    this.$bottom.show();
    this.$control.show();
    this.$mask.show();
  }
  hideControls() {
    this.visible = false;
    app.hideCursor();
    this.$top.hide({ destroy: false });
    this.$bottom.hide({ destroy: false });
    this.$control.hide({ destroy: false });
    this.$mask.hide({ destroy: false });
  }
  toggleControls() {
    if (this.visible) {
      this.hideControls();
      return;
    }
    this.showControls();
  }
  attemptToShowControls() {
    if (this.timer !== null) {
      this.hideControls();
      clearTimeout(this.timer);
      this.timer = null;
      return false;
    }
    this.showControls();
    return true;
  }
  prepareHideControls() {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.timer = setTimeout(() => {
      this.hideControls();
      this.timer = null;
    }, 2400);
  }
  stopHideControls() {
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
const props = defineProps<ViewComponentProps>();
const { app, view, client, storage, history } = props;

const $logic = MoviePlayingPageLogic(props);
const $page = new MoviePlayingPageView(props);

const pageRef = ref<HTMLDivElement | null>(null);
const profile = ref($logic.$tv.state);
const curSource = ref($logic.$tv.$source.profile);
const subtitleState = ref($logic.$tv.$source.subtitle);
const isFull = ref(false);
// const curReportValue = ref(curReport.value);
// const rate = ref($logic.$player._curRate);
// const targetTime = ref<null | string>(null);
const playerState = ref($logic.$player.state);

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
function changeResolution(resolution: { type: MediaResolutionTypes }) {
  $logic.$tv.changeResolution(resolution.type);
}
function changeRate(rate: number) {
  $logic.$player.changeRate(rate);
  storage.merge("player_settings", {
    rate,
  });
}
function changeSourceFile(file: { id: string }) {
  $logic.$tv.changeSourceFile(file);
}
function handleClickElm(event: MouseEvent) {
  const target = event.currentTarget as HTMLDivElement | null;
  if (target === null) {
    return;
  }
  console.log("[PAGE]media/moving_playing - handleClickElm", target);
  const { elm } = target.dataset;
  if (!elm) {
    return;
  }
  if (elm === "screen") {
    $page.toggleControls();
    return;
  }
  if (elm === "play-menu") {
    $logic.$player.play();
    return;
  }
  if (elm === "pause-menu") {
    $logic.$player.pause();
    return;
  }
  if (elm === "arrow-left-menu") {
    console.log("history.$router.histories.length", history.$router.histories.length);
    if (history.$router.histories.length === 0) {
      history.clear();
      history.push("root.home_layout.home_index", {});
      return;
    }
    history.back();
    return;
  }
  if (elm === "subtitle-menu") {
    if ($logic.$tv.$source.subtitle === null) {
      return;
    }
    $logic.$player.toggleSubtitleVisible();
    $logic.$tv.$source.toggleSubtitleVisible();
    return;
  }
  if (elm === "screen-menu") {
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
}
function handleMouseMove() {
  if ($page.visible === true) {
    return;
  }
  $page.showControls();
}
onMounted(() => {
  hotkeys("space", (event, handler) => {
    event.preventDefault();
    if ($logic.$player.playing) {
      $page.showControls();
      $logic.$player.pause();
      return;
    }
    $logic.$player.play();
    $page.hideControls();
  });
  hotkeys("left", (event) => {
    event.preventDefault();
    $logic.$player.rewind(2);
  });
  hotkeys("right", (event) => {
    event.preventDefault();
    $logic.$player.speedUp(2);
  });
  document.documentElement.addEventListener("mousemove", handleMouseMove);
});
onUnmounted(() => {
  document.documentElement.removeEventListener("mousemove", handleMouseMove);
  $logic.$tv.destroy();
  $logic.$player.destroy();
  hotkeys.unbind("space");
  hotkeys.unbind("left");
  hotkeys.unbind("right");
});
$logic.$tv.fetchProfile(view.query.id);
</script>

<template>
  <div ref="pageRef" class="relative w-full h-screen bg-[#000000]">
    <div class="video flex items-center w-full h-full bg-[#000000]">
      <Video :store="$logic.$player"></Video>
    </div>
    <div class="absolute z-0 inset-0" data-elm="screen" @click="handleClickElm">
      <div class="absolute top-0 w-full">
        <Presence
          :store="$page.$top"
          class="animate-in fade-in slide-in-from-top data-[state=closed]:animate-out data-[state=closed]:slide-out-to-top data-[state=closed]:fade-out"
        >
          <div class="absolute z-10 inset-0 opacity-80 bg-gradient-to-b to-transparent from-w-black"></div>
          <div class="relative z-20 p-4 text-w-white" @click.stop>
            <div class="flex items-center cursor-pointer" data-elm="arrow-left-menu" @click="handleClickElm">
              <div class="inline-template p-4">
                <ArrowLeft class="w-12 h-12" />
              </div>
              <template v-if="!!profile.curSource">
                <div class="text-4xl truncate break-all">
                  {{ profile.curSource?.name }}
                </div>
              </template>
            </div>
          </div>
        </Presence>
      </div>
      <div class="absolute bottom-0 w-full safe-bottom">
        <Presence
          :store="$page.$bottom"
          class="animate-in fade-in slide-in-from-bottom data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=closed]:fade-out"
        >
          <div class="absolute z-10 inset-0 opacity-80 bg-gradient-to-t to-transparent from-w-black"></div>
          <div class="relative z-20 px-4 py-6 pt-10 text-w-white" @click.stop @mouseup.stop>
            <div class="px-4">
              <PlayerProgressBar :app="app" :store="$logic.$player" />
            </div>
            <div class="flex items-center justify-between mt-6 w-full px-4">
              <div class="flex items-center space-x-4 min-h-[64px]">
                <template v-if="!!playerState.ready">
                  <div>
                    <template v-if="playerState.playing">
                      <div class="cursor-pointer" data-elm="pause-menu" @click="handleClickElm">
                        <Pause class="w-16 h-16" />
                      </div>
                    </template>
                    <template v-else>
                      <div class="cursor-pointer" data-elm="play-menu" @click="handleClickElm">
                        <Play class="w-16 h-16" />
                      </div>
                    </template>
                  </div>
                </template>
                <template v-else>
                  <div>
                    <Loader2 class="w-16 h-16 animate animate-spin" />
                  </div>
                </template>
              </div>
              <div class="relative flex items-center space-x-4">
                <Popover :store="$page.$resolutionMenu" class-name="">
                  <template v-slot:trigger>
                    <div class="relative p-2 rounded-md cursor-pointer">
                      <div>{{ curSource?.typeText }}</div>
                    </div>
                  </template>
                  <template v-slot:content>
                    <div class="z-10 relative rounded-md">
                      <div class="space-y-2">
                        <template v-for="resolution in curSource?.resolutions">
                          <div
                            :class="
                              curSource?.type === resolution.type
                                ? 'relative p-2 rounded-sm text-center cursor-pointer bg-gray-200'
                                : 'relative p-2 rounded-sm text-center cursor-pointer'
                            "
                            @click="changeResolution(resolution)"
                          >
                            <div class="">{{ resolution.typeText }}</div>
                          </div>
                        </template>
                      </div>
                    </div>
                  </template>
                </Popover>
                <Popover :store="$page.$rateMenu" class-name="">
                  <template v-slot:trigger>
                    <div class="relative p-2 rounded-md cursor-pointer">
                      <div>{{ playerState.rate }}x</div>
                    </div>
                  </template>
                  <template v-slot:content>
                    <div class="rounded-md">
                      <div class="space-y-2">
                        <template v-for="rate in MediaRateOptions">
                          <div
                            :class="
                              playerState.rate === rate
                                ? 'relative p-2 rounded-sm text-center cursor-pointer bg-gray-200'
                                : 'relative p-2 rounded-sm text-center cursor-pointer'
                            "
                            @click="changeRate(rate)"
                          >
                            <div class="">{{ rate }}</div>
                          </div>
                        </template>
                      </div>
                    </div>
                  </template>
                </Popover>
                <template v-if="subtitleState">
                  <div class="relative p-2 rounded-md cursor-pointer" data-elm="subtitle-menu" @click="handleClickElm">
                    <template v-if="subtitleState.visible">
                      <Captions class="w-8 h-8" />
                    </template>
                    <template v-else>
                      <CaptionsOff class="w-8 h-8" />
                    </template>
                  </div>
                </template>
                <Popover :store="$page.$sourceMenu" class-name="">
                  <template v-slot:trigger>
                    <div class="relative p-2 rounded-md cursor-pointer">
                      <div>切换源</div>
                    </div>
                  </template>
                  <template v-slot:content>
                    <div class="rounded-md">
                      <div class="space-y-2">
                        <template v-for="file in profile.curSource?.files">
                          <div
                            :class="
                              profile.curSource?.curFileId === file.id
                                ? 'relative p-2 rounded-sm text-center cursor-pointer bg-gray-200'
                                : 'relative p-2 rounded-sm text-center cursor-pointer'
                            "
                            @click="changeSourceFile(file)"
                          >
                            <div class="">{{ file.name }}</div>
                          </div>
                        </template>
                      </div>
                    </div>
                  </template>
                </Popover>
                <div class="relative p-2 rounded-md cursor-pointer" data-elm="screen-menu" @click="handleClickElm">
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
  </div>
</template>

<style scoped></style>
