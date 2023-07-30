<script setup lang="ts">
import { ref, defineComponent } from "vue";

import { Application } from "@/domains/app";
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

// const helper = new ListCore(new RequestCore(fetch_tv_list), { pageSize: 20 });
const tv = new TVCore();
const player = new PlayerCore({ app });
const video = new ElementCore({});

// const response = ref(helper.response);
const profile = ref(tv.profile);
const source = ref(tv.curSource);
function fetchEpisodesOfSeason(season: any) {
  tv.fetchEpisodesOfSeason(season);
}
function playEpisode(episode: any) {
  tv.playEpisode(episode);
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
    scheme:
      "intent:$durl#Intent;package=com.mxtech.videoplayer.ad;S.title=$name;end",
  },
  {
    icon: "mxplayer-pro",
    name: "MX Player Pro",
    scheme:
      "intent:$durl#Intent;package=com.mxtech.videoplayer.pro;S.title=$name;end",
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
  let u = url;
  // if (u.includes("pdsapi")) {
  //   await (async () => {
  //     try {
  //       const r = axios.create({
  //         maxRedirects: 0,
  //         transformResponse: [],
  //       });
  //       const resp = await r.get(u, {
  //         maxRedirects: 0, // 禁止自动重定向
  //         validateStatus: function (status) {
  //           return status >= 200 && status < 300; // 只处理 2xx 状态码
  //         },
  //       });
  //       console.log({ ...resp.headers, status: resp.status });
  //       if (resp.status === 302) {
  //         const redirectUrl = resp.headers.location;
  //         u = redirectUrl;
  //       }
  //     } catch (err) {
  //       setTimeout(() => {
  //         console.log(err);
  //       }, 2000);
  //     }
  //   })();
  // }
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
tv.fetchProfile(view.params.id);
</script>

<template>
  <div class="flex flex-wrap w-full h-screen bg-[#14161a]">
    <div class="flex-1 flex items-center w-full h-full bg-black">
      <Video :store="player"></Video>
    </div>
    <div class="profile p-4 h-full w-[380px] md:w-[240px] overflow-y-auto">
      <div v-if="profile">
        <div class="text-3xl text-white">{{ profile.name }}</div>
        <div class="seasons flex items-center space-x-2 mt-4">
          <div
            v-for="season in profile.seasons"
            @click="fetchEpisodesOfSeason(season)"
          >
            <div class="text-xl text-white">{{ season.name }}</div>
          </div>
        </div>
        <div class="episodes flex flex-wrap mt-2" v-if="profile">
          <div
            v-for="episode in profile.curEpisodes"
            @click="playEpisode(episode)"
          >
            <div
              :class="{
                'inline-flex items-center justify-center w-[60px] h-[60px] mr-[8px] text-center mb-[8px] bg-[#1d1f23]': true,
                'py-2': true,
                'cursor-pointer': true,
                underline: episode.id === profile.curEpisode.id,
              }"
            >
              <div
                :class="{
                  'text-white': episode.id !== profile.curEpisode.id,
                  'text-green-800': episode.id === profile.curEpisode.id,
                }"
              >
                {{ episode.episode }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
