<script setup lang="ts">
import { ref, defineProps } from "vue";

import { ViewComponentProps } from "@/store/types";
import LazyImage from "@/components/ui/Image.vue";
import AspectRatio from "@/components/ui/AspectRatio.vue";
import { ListCoreV2 } from "@/domains/list/v2";
import {
  PlayHistoryItem,
  deleteHistory,
  fetchPlayingHistories,
  fetchPlayingHistoriesProcess,
} from "@/domains/media/services";
import { RequestCoreV2 } from "@/domains/request/v2";
import { DialogCore, ImageInListCore, NodeInListCore, PopoverCore, ScrollViewCore } from "@/domains/ui";
import { RefCore } from "@/domains/cur";
import { MediaTypes } from "@/constants";

const { app, client, history, store } = defineProps<
  { store: PopoverCore } & Pick<ViewComponentProps, "app" | "client" | "history">
>();

const historyList = new ListCoreV2(
  new RequestCoreV2({
    fetch: fetchPlayingHistories,
    process: fetchPlayingHistoriesProcess,
    client,
  }),
  {
    pageSize: 5,
  }
);
const deletingRequest = new RequestCoreV2({
  client,
  fetch: deleteHistory,
  onLoading(loading) {
    deletingConfirmDialog.okBtn.setLoading(loading);
  },
  onFailed(error) {
    app.tip({
      text: ["删除失败", error.message],
    });
  },
  onSuccess(v) {
    app.tip({
      text: ["删除成功"],
    });
    deletingConfirmDialog.hide();
    historyList.deleteItem((history) => {
      if (history.id === cur.value?.id) {
        return true;
      }
      return false;
    });
    cur.clear();
  },
});

const deletingConfirmDialog = new DialogCore({
  onOk() {
    if (!cur.value) {
      return;
    }
    deletingRequest.run({ history_id: cur.value.id });
  },
});
const poster = new ImageInListCore();
const cur = new RefCore<PlayHistoryItem>();
const scrollView = new ScrollViewCore({
  onScroll(pos) {
    let nextShowTip = false;
    if (pos.scrollTop > app.screen.height) {
      nextShowTip = true;
    }
    // if (showTipRef.current === nextShowTip) {
    //   return;
    // }
    // showTipRef.current = nextShowTip;
    // setShowTip(nextShowTip);
  },
  onReachBottom() {
    historyList.loadMore();
  },
});
const historyCard = new NodeInListCore<PlayHistoryItem>({
  onClick(record) {
    if (!record) {
      return;
    }
    const { type, media_id } = record;
    if (type === MediaTypes.Season) {
      history.push("root.season_playing", { id: media_id });
      return;
    }
    if (type === MediaTypes.Movie) {
      history.push("root.movie_playing", { id: media_id });
      return;
    }
  },
  // onLongPress(record) {
  //   console.log("123");
  //   alert(record?.name);
  // },
});
const thumbnail = new ImageInListCore({
  scale: 1.38,
});

const response = ref(historyList.response);
const showTip = ref(false);
function handleClick(record: PlayHistoryItem) {
  const { type, media_id } = record;
  store.hide();
  if (type === MediaTypes.Season) {
    history.push("root.season_playing", { id: media_id });
    return;
  }
  if (type === MediaTypes.Movie) {
    history.push("root.movie_playing", { id: media_id });
    return;
  }
}
function handleClickBtn2() {
  history.push("root.home_layout.history");
  store.hide();
}

historyList.onStateChange((v) => {
  response.value = v;
});
historyList.init();
</script>

<template>
  <div class="">
    <div class="text-2xl">最近看过</div>
  </div>
  <div class="mt-4 min-w-[328px] min-h-[482px] space-y-2">
    <template v-for="history in response.dataSource">
      <div class="relative flex w-full cursor-pointer select-none">
        <div class="relative flex bg-w-bg-2 rounded-lg" @click="handleClick(history)">
          <div class="relative w-[160px] h-[90px] overflow-hidden rounded-md">
            <AspectRatio :ratio="10 / 15">
              <LazyImage
                class-name="overflow-hidden absolute inset-0"
                :store="thumbnail.bind(history.thumbnail_path)"
                :alt="history.name"
              />
            </AspectRatio>
            <div class="absolute w-full top-0 flex flex-row-reverse items-center">
              <div class="relative z-20 p-2 text-[12px] text-w-bg-0 dark:text-w-fg-0">
                {{ history.episodeCountText }}
              </div>
            </div>
            <template v-if="!!history.hasUpdate">
              <div class="absolute top-2 left-2">
                <div class="huizhang">更新</div>
              </div>
            </template>
          </div>
          <div class="flex-1 ml-2 w-full">
            <div class="overflow-hidden max-w-full text-xl text-w-fg-0 truncate">{{ history.name }}</div>
            <div class="flex items-center text-w-fg-1">
              {{ history.updated }}
              <template v-if="!!history.episodeText">
                <p class="mx-1">·</p>
                <p class="">{{ history.episodeText }}</p>
              </template>
            </div>
            <div class="relative mt-4 w-full">
              <div class="w-full h-[4px] rounded-md bg-w-brand" :style="{ width: `${history.percent}%` }"></div>
              <div class="absolute top-1/2 -translate-y-1/2">{{ history.percent }}%</div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
  <div class="flex items-center justify-center mt-6">
    <div class="bg-w-brand px-4 py-2 rounded-3xl cursor-pointer" @click="handleClickBtn2">
      <div class="text-white text-center">查看全部</div>
    </div>
  </div>
</template>
