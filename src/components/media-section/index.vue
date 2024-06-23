<script setup lang="ts">
import { defineComponent, ref } from "vue";
import { ArrowRightCircle, ChevronRight } from "lucide-vue-next";

import { ViewComponentProps } from "@/store/types";
import { MediaItem, fetchMediaList, fetchMediaListProcess } from "@/services/media";
import AspectRatio from "@/components/ui/AspectRatio.vue";
import LazyImage from "@/components/ui/Image.vue";
import { ListCore } from "@/domains/list/index";
import { DeviceSizeTypes } from "@/domains/app/index";
import { getPageSizeByDeviceSize } from "@/domains/list/utils";
import { RequestCore } from "@/domains/request/index";
import { ImageInListCore } from "@/domains/ui/image";
import {
  MediaTypes,
  MediaOriginCountry,
  SeasonMediaOriginCountryTexts,
  MovieMediaOriginCountryTexts,
} from "@/constants/index";

const props = defineProps<
  { title: string; showExtra?: boolean; type?: MediaTypes; params: Record<string, string | number> } & Pick<
    ViewComponentProps,
    "app" | "client" | "storage" | "history"
  >
>();
const { app, client, storage, history, title, params, showExtra = false } = props;
defineComponent({
  LazyImage,
  AspectRatio,
});

const seasonList = new ListCore(
  new RequestCore(fetchMediaList, {
    process: fetchMediaListProcess,
    client,
  }),
  {
    pageSize: (() => {
      const map: Record<DeviceSizeTypes, number> = {
        sm: 6,
        md: 12,
        lg: 12,
        xl: 14,
        "2xl": 14,
      };
      return map[app.curDeviceSize];
    })(),
    search: {
      ...params,
    },
  }
);
const poster = new ImageInListCore();

const tvResponse = ref(seasonList.response);
const extra = ref({
  language: MediaOriginCountry.CN,
});
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
function handleClickElm(event: MouseEvent) {
  const target = event.currentTarget as HTMLDivElement | null;
  if (target === null) {
    return;
  }
  const { elm, value } = target.dataset;
  if (elm === "language" && value) {
    extra.value.language = value as MediaOriginCountry;
    seasonList.search({
      language: value,
    });
    return;
  }
  if (elm === "all") {
    if (Number(value) === MediaTypes.Movie) {
      history.push("root.home_layout.movie_list");
      return;
    }
    if (Number(value) === MediaTypes.Season) {
      history.push("root.home_layout.season_list");
      return;
    }
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
      <div class="flex items-center">
        <div class="text-3xl">{{ title }}</div>
        <div v-if="showExtra" class="flex items-center ml-4 space-x-2">
          <template v-for="language in [MediaOriginCountry.CN, MediaOriginCountry.US, MediaOriginCountry.KR]">
            <div
              :class="
                extra.language === language
                  ? 'px-2 py-1 rounded bg-green-100 cursor-pointer'
                  : 'px-2 py-1 rounded bg-gray-100 cursor-pointer'
              "
              data-elm="language"
              :data-value="language"
              @click="handleClickElm"
            >
              {{ MovieMediaOriginCountryTexts[language] }}
            </div>
          </template>
          <div></div>
        </div>
      </div>
      <div
        v-if="props.type"
        class="extra flex items-center cursor-pointer"
        data-elm="all"
        :data-value="props.type"
        @click="handleClickElm"
      >
        <div class="">全部</div>
        <ChevronRight class="w-6 h-6" />
      </div>
    </div>
    <div class="grid grid-cols-6 gap-4 mt-4 min-h-[634px] 2xl:grid-cols-7">
      <div
        v-for="media in tvResponse.dataSource"
        class="relative w-[166px] bg-w-bg-2 cursor-pointer"
        @click="handleClickMedia(media)"
      >
        <AspectRatio :ratio="10 / 15">
          <LazyImage
            :key="media.poster_path"
            class="overflow-hidden absolute inset-0 rounded-md"
            :store="poster.bind(media.poster_path)"
          />
        </AspectRatio>
        <div class="mt-2">
          <div class="text-xl truncate">{{ media.name }}</div>
          <div class="">{{ media.air_date }}</div>
        </div>
        <div class="absolute top-2 right-2 space-y-2">
          <template v-if="media.vote">
            <div className="flex flex-row-reverse items-center w-full ">
              <div className="huizhang huizhang--blue relative z-20 p-2 text-[12px] text-w-bg-0 dark:text-w-fg-0">
                {{ media.vote }}
              </div>
            </div>
          </template>
          <template v-if="media.episode_count_text">
            <div className="flex flex-row-reverse items-center w-full">
              <div className="huizhang relative z-20 p-2 text-[12px] text-w-bg-0 dark:text-w-fg-0">
                {{ media.episode_count_text }}
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
