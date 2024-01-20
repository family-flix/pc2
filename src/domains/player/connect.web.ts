import { PlayerCore } from ".";

/** 连接 $video 标签和 player 领域 */
export function connect($video: HTMLVideoElement, player: PlayerCore) {
  $video.onloadstart = () => {
    // 1
    console.log("[COMPONENT]VideoPlayer/connect - $video.onloadstart");
    player.handleStartLoad();
  };
  $video.onloadedmetadata = function (event) {
    // 2
    console.log("[COMPONENT]VideoPlayer/connect - $video.onloadedmetadata");
    // @ts-ignore
    const width = this.videoWidth;
    // @ts-ignore
    const height = this.videoHeight;
    player.handleLoadedmetadata({
      width,
      height,
    });
  };
  $video.onload = () => {
    console.log("[COMPONENT]VideoPlayer/connect - $video.onload");
    player.handleLoad();
  };
  // 这个居然会在调整时间进度后调用？？？
  $video.oncanplay = (event) => {
    console.log("[COMPONENT]VideoPlayer/connect - $video.oncanplay");
    // const { duration } = event.currentTarget as HTMLVideoElement;
    // console.log("[COMPONENT]VideoPlayer/connect - listen $video can play");
    player.handleCanPlay();
  };
  $video.onplay = () => {
    console.log("[COMPONENT]VideoPlayer/connect - $video.onplay");
    player.handlePlay();
  };
  $video.onplaying = () => {
    console.log("[COMPONENT]VideoPlayer/connect - $video.onplaying");
    player.handlePlaying();
  };
  $video.ontimeupdate = (event) => {
    // console.log("[COMPONENT]VideoPlayer/connect - $video.ontimeupdate");
    const { currentTime, duration } = event.currentTarget as HTMLVideoElement;
    player.handleTimeUpdate({ currentTime, duration });
  };
  $video.onpause = (event) => {
    console.log("[COMPONENT]VideoPlayer/connect - $video.onpause");
    const { currentTime, duration } = event.currentTarget as HTMLVideoElement;
    // player.emit(PlayerCore.Events.Pause, { currentTime, duration });
    player.handlePause({ currentTime, duration });
  };
  $video.onwaiting = () => {
    console.log("[COMPONENT]VideoPlayer/connect - $video.onwaiting");
    //     player.emitEnded();
  };
  $video.onended = () => {
    console.log("[COMPONENT]VideoPlayer/connect - $video.onended");
    player.handleEnded();
  };
  $video.onvolumechange = (event) => {
    const { volume } = event.currentTarget as HTMLVideoElement;
    const cur_volume = volume;
    // console.log("[COMPONENT]VideoPlayer/connect - $video.onvolumechange", cur_volume, player._curVolume);
    if (player._curVolume === cur_volume) {
      return;
    }
    player.handleVolumeChange(cur_volume);
  };
  $video.onresize = () => {
    const { videoHeight, videoWidth } = $video;
    // console.log("[]Video - onResize", videoWidth, videoHeight);
    player.handleResize({ width: videoWidth, height: videoHeight });
  };
  $video.onerror = (event) => {
    console.log("[COMPONENT]VideoPlayer/connect - $video.onerror");
    const msg = (() => {
      if (typeof event === "string") {
        return new Error(event);
      }
      // @ts-ignore
      const errorCode = event.target?.error?.code;
      // https://developer.mozilla.org/en-US/docs/Web/API/MediaError
      if (errorCode === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED) {
        return new Error("不支持的视频格式");
      }
      if (errorCode === MediaError.MEDIA_ERR_DECODE) {
        return new Error("视频解码错误");
      }
      if (errorCode === MediaError.MEDIA_ERR_ABORTED) {
        return new Error("视频加载中止");
      }
      return new Error("unknown");
    })();
    player.handleError(msg.message);
  };
  $video.addEventListener("webkitstartfullscreen", () => {
    player.handleFullscreenChange(true);
  });
  $video.addEventListener("webkitendfullscreen", () => {
    player.handleFullscreenChange(false);
  });
  player.bindAbstractNode({
    $node: $video,
    async play() {
      try {
        await $video.play();
      } catch (err) {
        // ...
      }
    },
    pause() {
      $video.pause();
    },
    canPlayType(type: string) {
      return !!$video.canPlayType(type);
    },
    load(url: string) {
      // console.log("[DOMAIN]player/connect - load", url, $video);
      $video.src = url;
      $video.load();
    },
    setCurrentTime(currentTime: number) {
      $video.currentTime = currentTime;
    },
    setVolume(volume: number) {
      $video.volume = volume;
    },
    setRate(rate: number) {
      // console.log("[DOMAIN]player/connect - setRate", rate, $video);
      $video.playbackRate = rate;
    },
    enableFullscreen() {
      $video.removeAttribute("webkit-playsinline");
      $video.removeAttribute("playsinline");
    },
    disableFullscreen() {
      $video.setAttribute("webkit-playsinline", "true");
      $video.setAttribute("playsinline", "true");
    },
    showSubtitle() {
      if ($video.textTracks[0]) {
        $video.textTracks[0].mode = "showing";
      }
    },
    hideSubtitle() {
      // console.log("[DOMAIN]player/connect - hideSubtitle", $video.textTracks[0]);
      if ($video.textTracks[0]) {
        $video.textTracks[0].mode = "hidden";
      }
    },
    showAirplay() {
      // @ts-ignore
      if ($video.webkitShowPlaybackTargetPicker) {
        // @ts-ignore
        $video.webkitShowPlaybackTargetPicker;
        return;
      }
      alert("AirPlay not supported.");
    },
    pictureInPicture() {
      // @ts-ignore
      if ($video.webkitSetPresentationMode) {
        // @ts-ignore
        $video.webkitSetPresentationMode("picture-in-picture");
        return;
      }
      alert("Picture-in-Picture not supported.");
    },
  });
}
