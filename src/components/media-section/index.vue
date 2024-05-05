<script setup lang="ts">
import { defineComponent, ref } from "vue";

import { ViewComponentProps } from "@/store/types";
import { MediaItem, fetchMediaList, fetchMediaListProcess } from "@/services/media";
import AspectRatio from "@/components/ui/AspectRatio.vue";
import LazyImage from "@/components/ui/Image.vue";
import { ListCoreV2 } from "@/domains/list/v2";
import { getPageSizeByDeviceSize } from "@/domains/list/utils";
import { RequestCoreV2 } from "@/domains/request/v2";
import { ImageInListCore } from "@/domains/ui/image";
import { MediaTypes } from "@/constants/index";

const { app, client, storage, history, title, params } = defineProps<
  { title: string; params: Record<string, string | number> } & Pick<
    ViewComponentProps,
    "app" | "client" | "storage" | "history"
  >
>();
defineComponent({
  LazyImage,
  AspectRatio,
});

const seasonList = new ListCoreV2(
  new RequestCoreV2({
    fetch: fetchMediaList,
    process: fetchMediaListProcess,
    client,
  }),
  {
    // pageSize: getPageSizeByDeviceSize(app.curDeviceSize).pageSize,
    pageSize: 14,
    search: {
      ...params,
    },
  }
);
const poster = new ImageInListCore();

const tvResponse = ref(seasonList.response);
function handleClickMedia(media: MediaItem) {
  const { id, type } = media;
  if (type === MediaTypes.Season) {
    history.push("root.season_playing", { id });
    return;
  }
  if (type === MediaTypes.Movie) {
    history.push("root.movie_playing", { id });
    return;
  }
}

seasonList.onStateChange((nextResponse) => {
  tvResponse.value = nextResponse;
});

seasonList.init();
</script>

<template>
  <div>
    <div class="flex items-center justify-between">
      <div class="text-3xl">{{ title }}</div>
      <!-- <div class="extra cursor-pointer">
        <div>More</div>
      </div> -->
    </div>
    <div class="grid grid-cols-7 gap-4 mt-4 min-h-[634px]">
      <div
        v-for="media in tvResponse.dataSource"
        class="relative w-[166px] bg-w-bg-2 cursor-pointer"
        @click="handleClickMedia(media)"
      >
        <AspectRatio :ratio="10 / 15">
          <LazyImage class="overflow-hidden absolute inset-0 rounded-md" :store="poster.bind(media.poster_path)" />
        </AspectRatio>
        <div class="mt-2">
          <div class="text-xl truncate">{{ media.name }}</div>
          <div class="">{{ media.air_date }}</div>
        </div>
        <template v-if="media.episode_count_text">
          <div className="absolute w-full top-2 right-2 flex flex-row-reverse items-center">
            <div className="huizhang relative z-20 p-2 text-[12px] text-w-bg-0 dark:text-w-fg-0">
              {{ media.episode_count_text }}
            </div>
          </div>
        </template>
        <template v-if="media.vote">
          <div className="absolute w-full top-8 right-2 flex flex-row-reverse items-center">
            <div className="huizhang huizhang--blue relative z-20 p-2 text-[12px] text-w-bg-0 dark:text-w-fg-0">
              {{ media.vote }}
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped></style>