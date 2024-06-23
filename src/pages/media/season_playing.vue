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
import Dialog from "@/components/ui/Dialog.vue";
import { createVVTSubtitle } from "@/biz/subtitle/utils";
import { SeasonMediaCore } from "@/biz/media/season";
import { MediaResolutionTypes } from "@/biz/source/constants";
import { PlayerCore, MediaRateOptions } from "@/domains/player";
import { RefCore } from "@/domains/cur";
import { OrientationTypes } from "@/domains/app";
import { RouteViewCore } from "@/domains/route_view";
import { DynamicContentCore } from "@/domains/ui/dynamic-content";
import { ScrollViewCore } from "@/domains/ui/scroll-view";
import { PresenceCore } from "@/domains/ui/presence";
import { DialogCore } from "@/domains/ui/dialog";
import { seconds_to_minute } from "@/utils/index";
import { PopoverCore } from "@/domains/ui";

function SeasonPlayingPageLogic(props: ViewComponentProps) {
  const { app, storage, client, view } = props;
  const settings = storage.get("player_settings");
  const { type: resolution, volume, rate, skip } = settings;
  const $tv = new SeasonMediaCore({
    client,
    resolution,
  });
  const $player = new PlayerCore({ app, volume, rate, skipTime: skip[view.query.id] });
  console.log("[PAGE]play - useInitialize");

  app.onHidden(() => {
    $player.pause();
  });
  app.onShow(() => {
    console.log("[PAGE]play - app.onShow", $player.currentTime);
    // 锁屏后 currentTime 不是锁屏前的
    $player.setCurrentTime($player.currentTime);
  });
  app.onOrientationChange((orientation) => {
    console.log("[PAGE]tv/play - app.onOrientationChange", orientation, app.screen.width);
    if (orientation === "horizontal") {
      if (!$player.hasPlayed && app.env.ios) {
        // fullscreenDialog.show();
        return;
      }
      if ($player.isFullscreen) {
        return;
      }
      $player.requestFullScreen();
      $player.isFullscreen = true;
    }
    if (orientation === "vertical") {
      $player.disableFullscreen();
      // fullscreenDialog.hide();
      // console.log("[PAGE]tv/play - app.onOrientationChange", tv.curSourceFile?.width, tv.curSourceFile?.height);
      if ($tv.$source.profile) {
        const { width, height } = $tv.$source.profile;
        $player.setSize({ width, height });
      }
    }
  });
  $player.onExitFullscreen(() => {
    $player.pause();
    // if (tv.curSourceFile) {
    //   player.setSize({ width: tv.curSourceFile.width, height: tv.curSourceFile.height });
    // }
    if (app.orientation === OrientationTypes.Vertical) {
      $player.disableFullscreen();
    }
  });
  $tv.onProfileLoaded((profile) => {
    app.setTitle($tv.getTitle().join(" - "));
    const { curSource: curEpisode } = profile;
    // const episodeIndex = tv.curGroup ? tv.curGroup.list.findIndex((e) => e.id === curEpisode.id) : -1;
    // console.log("[PAGE]play - tv.onProfileLoaded", curEpisode.name, episodeIndex);
    // const EPISODE_CARD_WIDTH = 120;
    // if (episodeIndex !== -1) {
    //   episodeView.scrollTo({ left: episodeIndex * (EPISODE_CARD_WIDTH + 8) });
    // }
    $tv.playEpisode(curEpisode, { currentTime: curEpisode.currentTime ?? 0 });
    $player.setCurrentTime(curEpisode.currentTime);
    // bottomOperation.show();
  });
  $tv.$source.onSubtitleLoaded((subtitle) => {
    $player.showSubtitle(createVVTSubtitle(subtitle));
  });
  $tv.onEpisodeChange((curEpisode) => {
    app.setTitle($tv.getTitle().join(" - "));
    const { currentTime } = curEpisode;
    // nextEpisodeLoader.unload();
    $player.setCurrentTime(currentTime);
    // const episodeIndex = tv.curGroup ? tv.curGroup.list.findIndex((e) => e.id === curEpisode.id) : -1;
    // const EPISODE_CARD_WIDTH = 120;
    // if (episodeIndex !== -1) {
    //   episodeView.scrollTo({ left: episodeIndex * (EPISODE_CARD_WIDTH + 8) });
    // }
    $player.pause();
  });
  $tv.onTip((msg) => {
    app.tip(msg);
  });
  $tv.onBeforeNextEpisode(() => {
    $player.pause();
  });
  $tv.onSourceFileChange((mediaSource) => {
    console.log("[PAGE]play - tv.onSourceChange", mediaSource.currentTime);
    $player.pause();
    $player.setSize({ width: mediaSource.width, height: mediaSource.height });
    storage.merge("player_settings", {
      type: mediaSource.type,
    });
    // loadSource 后开始 video loadstart 事件
    $player.loadSource(mediaSource);
  });
  $player.onReady(() => {
    $player.disableFullscreen();
  });
  $player.onCanPlay(() => {
    const { currentTime } = $tv;
    console.log("[PAGE]play - player.onCanPlay", $player.hasPlayed, currentTime);
    function applySettings() {
      $player.setCurrentTime(currentTime === 0 ? $player.theTimeSkip : currentTime);
      if (settings.rate) {
        $player.changeRate(Number(rate));
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
    if (!$player.hasPlayed) {
      return;
    }
    $player.play();
  });
  $player.onVolumeChange(({ volume }) => {
    storage.merge("player_settings", {
      volume,
    });
  });
  $player.onProgress(({ currentTime, duration }) => {
    // console.log("[PAGE]tv/play_v2 - onProgress", currentTime, !player._canPlay);
    if (!$player._canPlay) {
      return;
    }
    // player.screenshot().then((url) => {
    //   console.log(url);
    // });
    $tv.handleCurTimeChange({
      currentTime,
      duration,
    });
  });
  $player.onPause(({ currentTime, duration }) => {
    console.log("[PAGE]play - player.onPause", currentTime, duration);
    $tv.updatePlayProgressForce({
      currentTime,
      duration,
    });
  });
  $player.onEnd(() => {
    console.log("[PAGE]play - player.onEnd");
    $tv.playNextEpisode();
  });
  $player.onResolutionChange(({ type }) => {
    console.log("[PAGE]play - player.onResolutionChange", type, $tv.currentTime);
    // player.setCurrentTime(tv.currentTime);
  });
  $player.onSourceLoaded(() => {
    console.log("[PAGE]play - player.onSourceLoaded", $tv.currentTime);
    $player.setCurrentTime($tv.currentTime);
    if (!$player.hasPlayed) {
      return;
    }
  });
  // console.log("[PAGE]play - before player.onError");
  $player.onError(async (error) => {
    console.log("[PAGE]play - player.onError", error);
    await (async () => {
      if (!$tv.curSource) {
        return;
      }
      const files = $tv.curSource.files;
      const curFileId = $tv.curSource.curFileId;
      const curFileIndex = files.findIndex((f) => f.id === curFileId);
      const nextIndex = curFileIndex + 1;
      const nextFile = files[nextIndex];
      if (!nextFile) {
        app.tip({ text: ["视频加载错误", error.message] });
        $player.setInvalid(error.message);
        return;
      }
      await $tv.changeSourceFile(nextFile);
    })();
    $player.pause();
  });
  $player.onUrlChange(async ({ url }) => {
    const $video = $player.node()!;
    console.log("[]player.onUrlChange", url, $player.canPlayType("application/vnd.apple.mpegurl"), $video);
    if ($player.canPlayType("application/vnd.apple.mpegurl")) {
      $player.load(url);
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
    $player.load(url);
  });

  return {
    $tv,
    $player,
    ready() {
      $tv.fetchProfile(view.query.id);
    },
    changeSkipTime(v: number) {
      $logic.$player.changeSkipTime(v);
      const nextSkip = {
        ...skip,
        [view.query.id]: v,
      };
      storage.merge("player_settings", {
        skip: nextSkip,
      });
    },
  };
}
class SeasonPlayingPageView {
  $view: RouteViewCore;
  $scroll = new ScrollViewCore({});

  $mask = new PresenceCore({ mounted: true, visible: true });
  $top = new PresenceCore({ mounted: true, visible: true });
  $bottom = new PresenceCore({ mounted: true, visible: true });
  $control = new PresenceCore({ mounted: true, visible: true });
  $time = new PresenceCore({});
  $subtitle = new PresenceCore({});
  $settings = new DialogCore();
  $episodes = new DialogCore();
  $skip = new DialogCore();
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

const $logic = SeasonPlayingPageLogic(props);
const $page = new SeasonPlayingPageView(props);

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
  $page.$subtitle.show();
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
  // console.log("[PAGE]media/season_playing - handleClickElm", target);
  const { elm, value } = target.dataset;
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
  if (elm === "skip-forward-menu") {
    $logic.$tv.playNextEpisode();
    return;
  }
  if (elm === "episodes-menu") {
    $page.$episodes.show();
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
  if (elm === "skip-menu") {
    const currentTime = $logic.$tv.currentTime;
    const v = Number(currentTime);
    $logic.changeSkipTime(v);
    app.tip({
      text: [`设置片头跳过 ${seconds_to_minute(v)}`],
    });
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
  // if (elm === "skip-item-menu") {
  //   const v = Number(value);
  //   $logic.changeSkipTime(v);
  //   return;
  // }
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
  // hotkeys("*", () => {
  //   console.log(hotkeys.getPressedKeyString()); //=> ['⌘', '⌃', '⇧', 'A', 'F']
  // });
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
$logic.ready();
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
                  {{ profile.curSource?.order }}、{{ profile.curSource?.name }}
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
          <div class="relative z-20 px-4 py-6 pt-10 text-white" @click.stop @mouseup.stop>
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
                  <div
                    class="relative rounded-md space-x-2 cursor-pointer"
                    data-elm="skip-forward-menu"
                    @click="handleClickElm"
                  >
                    <SkipForward class="w-16 h-16" />
                  </div>
                </template>
                <template v-else>
                  <div>
                    <Loader2 class="w-16 h-16 animate animate-spin" />
                  </div>
                </template>
              </div>
              <div class="flex items-center space-x-4">
                <div
                  class="flex items-center p-2 rounded-md space-x-2 cursor-pointer"
                  data-elm="episodes-menu"
                  @click="handleClickElm"
                >
                  <Layers class="w-8 h-8" />
                  <div class="">选集</div>
                </div>
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
                                ? 'relative p-2 rounded-sm text-center cursor-pointer bg-gray-800'
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
                                ? 'relative p-2 rounded-sm text-center cursor-pointer bg-gray-800'
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
                <div class="relative p-2 rounded-md cursor-pointer" data-elm="skip-menu" @click="handleClickElm">
                  <template v-if="playerState?.skipText">
                    <div>片头跳过{{ playerState?.skipText }}</div>
                  </template>
                  <template v-else>
                    <div>设置片头跳过时间</div>
                  </template>
                </div>
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
                                ? 'relative p-2 rounded-sm text-center cursor-pointer bg-gray-8yy00'
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
    <Dialog :store="$page.$episodes">
      <div class="relative box-border h-full px-4 safe-bottom">
        <div class="flex space-x-2 max-w-full overflow-x-auto scroll--hidden">
          <template v-for="group in profile.groups">
            <div :class="group.cur ? 'p-2 underline' : 'p-2'" @click="$logic.$tv.fetchEpisodeOfGroup(group)">
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
  </div>
</template>

<style scoped></style>
