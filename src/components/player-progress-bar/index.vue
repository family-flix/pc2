<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import hotkeys from "hotkeys-js";

import { ViewComponentProps } from "@/store/types";
import { Handler, base } from "@/domains/base";
import { PlayerCore } from "@/domains/player/index";
import { PresenceCore } from "@/domains/ui/presence";
import { cn, seconds_to_hour } from "@/utils/index";

const props = defineProps<
  Pick<ViewComponentProps, "app"> & {
    store: PlayerCore;
    class?: string;
  }
>();
const { app, store } = props;

const cursorWidth = 6;

function VideoProgressBarComponent(props: { store: PlayerCore }) {
  const { store } = props;

  const isDragRef = {
    current: false,
  };
  const cursorRef = {
    current: null as null | HTMLDivElement,
  };
  const barRef = {
    current: null as null | HTMLDivElement,
  };
  const movingRef = {
    current: false,
  };
  const rectRef = {
    current: { width: 0, left: 0 },
  };
  const targetTimeRef = {
    current: null as null | HTMLDivElement,
  };
  const tmpCurRef = {
    current: 0,
  };
  const touchStartTimeRef = {
    current: 0,
  };
  const timerRef = {
    current: null as null | NodeJS.Timer,
  };
  const hasShowRef = {
    current: false,
  };
  const startXRef = {
    current: 0,
  };
  const curRef = {
    current: 0,
  };
  const leftRef = {
    current: -6,
  };
  const $time = new PresenceCore();
  enum Events {
    Change,
  }
  type TheTypesOfEvents = {
    [Events.Change]: {
      currentTime: string;
      duration: string;
    };
  };
  const emitter = base<TheTypesOfEvents>();

  return {
    $time,
    leftRef,
    barRef,
    cursorRef,
    handleTouchStart(event: {
      clientX: number;
      touches: Record<number, { clientX: number }>;
      stopPropagation: () => void;
    }) {
      event.stopPropagation();
      console.log("[COMPONENT]onTouchStart");
      const finger = (() => {
        if (event.touches) {
          return event.touches[0];
        }
        return {
          clientX: event.clientX,
        };
      })();
      isDragRef.current = true;
      movingRef.current = true;
      store.startAdjustCurrentTime();
      store.pause();
      const startX = finger.clientX;
      const rect = rectRef.current;
      const cur = startX - rect.left;
      const posX = finger.clientX - rect.left;
      // const percent = posX / rect.width;
      startXRef.current = startX;
      curRef.current = cur;
      touchStartTimeRef.current = new Date().valueOf();
      timerRef.current = setTimeout(function () {
        if (timerRef.current !== null) {
          console.log("long press");
          isDragRef.current = true;
          movingRef.current = true;
          if (!hasShowRef.current) {
            hasShowRef.current = true;
            $time.show();
          }
          curRef.current = posX;
        }
      }, 200);
      const $bar = barRef.current;
      const $cursor = cursorRef.current;
      if ($bar) {
        $bar.style.width = posX + "px";
      }
      if ($cursor) {
        leftRef.current = posX - cursorWidth;
        $cursor.style.left = posX - cursorWidth + "px";
      }
      // updateProgressBar({ clientX: touches[0].clientX });
    },
    handleTouchMove(event: {
      clientX: number;
      touches: Record<number, { clientX: number }>;
      stopPropagation: () => void;
    }) {
      event.stopPropagation();
      if (isDragRef.current === false) {
        return;
      }
      const finger = (() => {
        if (event.touches) {
          return event.touches[0];
        }
        return {
          clientX: event.clientX,
        };
      })();
      const distance = finger.clientX - startXRef.current + curRef.current;
      const rect = rectRef.current;
      // isDragRef.current = true;
      if (distance < 0) {
        return;
      }
      if (distance > rect.width) {
        return;
      }
      const posX = finger.clientX - rect.left;
      const percent = posX / rect.width;
      tmpCurRef.current = distance;
      const $bar = barRef.current;
      const $cursor = cursorRef.current;
      if ($bar) {
        $bar.style.width = posX + "px";
      }
      if ($cursor) {
        leftRef.current = posX - cursorWidth;
        $cursor.style.left = posX - cursorWidth + "px";
      }
      const text = seconds_to_hour(percent * store._duration);
      const $target = targetTimeRef.current;
      if ($target) {
        $target.innerText = `${text}/${seconds_to_hour(store._duration)}`;
      }
      // const { clientX } = event.touches[0];
      // console.log("[COMPONENT]onTouchMove", clientX);
      // updateProgressBar({ clientX });
    },
    handleTouchEnd(event: { stopPropagation: () => void }) {
      event.stopPropagation();
      isDragRef.current = false;
      movingRef.current = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      const now = new Date().valueOf();
      if (now - touchStartTimeRef.current <= 200) {
        const percent = curRef.current / rectRef.current.width;
        // console.log("the reason is click", curRef.current);
        const targetTime = percent * store._duration;
        store.adjustCurrentTime(targetTime);
        return;
      }
      if (hasShowRef.current) {
        $time.hide();
        hasShowRef.current = false;
      }
      curRef.current = tmpCurRef.current;
      const percent = curRef.current / rectRef.current.width;
      const targetTime = percent * store._duration;
      // console.log("before store.adjustCurrentTime", targetTime, percent, store._duration);
      store.adjustCurrentTime(targetTime);
    },
    handleAnimationEnd(event: { currentTarget: HTMLDivElement }) {
      const { currentTarget: target } = event;
      const client = target.getBoundingClientRect();
      rectRef.current = {
        width: client.width,
        left: client.left,
      };
      const percent = (store.currentTime / store._duration) * client.width;
      const $bar = barRef.current;
      const $cursor = cursorRef.current;
      if ($bar) {
        $bar.style.width = percent + "px";
      }
      if ($cursor) {
        $cursor.style.left = percent - cursorWidth + "px";
      }
    },
    ready() {
      const unlisten1 = store.onProgress((v) => {
        const rect = rectRef.current;
        if (rect && rect.width) {
          const percent = Math.floor((store.currentTime / store._duration) * rect.width);
          const $bar = barRef.current;
          const $cursor = cursorRef.current;
          if ($bar) {
            $bar.style.width = percent + "px";
          }
          if ($cursor) {
            $cursor.style.left = percent - cursorWidth + "px";
          }
        }
        emitter.emit(Events.Change, {
          currentTime: seconds_to_hour(v.currentTime),
          duration: seconds_to_hour(v.duration),
        });
      });
      function update() {
        const rect = rectRef.current;
        if (!rect) {
          return;
        }
        const percent = (store.currentTime / store._duration) * rect.width;
        const $bar = barRef.current;
        const $cursor = cursorRef.current;
        if ($bar) {
          $bar.style.width = percent + "px";
        }
        if ($cursor) {
          $cursor.style.left = percent - cursorWidth + "px";
        }
        emitter.emit(Events.Change, {
          currentTime: seconds_to_hour(store.currentTime),
          duration: seconds_to_hour(store._duration),
        });
      }
      const unlisten2 = store.onCanPlay(() => {
        update();
      });
      update();
      return () => {
        unlisten1();
        unlisten2();
      };
    },
    onChange(handler: Handler<TheTypesOfEvents[Events.Change]>) {
      return emitter.on(Events.Change, handler);
    },
  };
}

const $com = VideoProgressBarComponent({ store });

const barRef = ref(null);
const cursorRef = ref(null);
const times = ref({
  currentTime: seconds_to_hour(store._currentTime),
  duration: seconds_to_hour(store._duration),
});
onMounted(() => {
  const $bar = barRef.value;
  const $cursor = cursorRef.value;
  $com.barRef.current = $bar;
  $com.cursorRef.current = $cursor;
  $com.onChange((values) => {
    times.value = values;
  });
  $com.ready();
  // document.addEventListener("mousemove", handleTouchMove);
  // document.addEventListener("mouseup", handleTouchEnd);
  // document.addEventListener("pointerup", handleTouchEnd);
});
onUnmounted(() => {
  // document.removeEventListener("mousemove", handleTouchMove);
  // document.removeEventListener("mouseup", handleTouchEnd);
  // document.removeEventListener("pointerup", handleTouchEnd);
});
</script>

<template>
  <div
    class="flex items-center user-select-none"
    @mousedown="$com.handleTouchStart"
    @mousemove="$com.handleTouchMove"
    @mouseup="$com.handleTouchEnd"
  >
    <div class="w-[72px] text-xl">{{ times.currentTime }}</div>
    <div class="__a relative mx-4 w-full bg-gray-300 cursor-pointer rounded-md" @animationend="$com.handleAnimationEnd">
      <div
        class="progress__mask absolute top-1/2 left-0 w-full bg-w-fg-3 rounded-sm"
        style="height: 12px; transform: translateY(-50%)"
      ></div>
      <div
        ref="barRef"
        class="progress__bar absolute top-1/2 left-0 bg-green-500"
        style="width: 0px; height: 12px; transform: translateY(-50%)"
      ></div>
      <div
        ref="cursorRef"
        class="progress__cursor absolute top-1/2"
        style="
          left: 0px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background-color: #fff;
          transform: translate(0px, -50%);
        "
      ></div>
    </div>
    <div class="text-xl">{{ times.duration }}</div>
  </div>
</template>
