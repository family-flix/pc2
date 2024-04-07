<script setup lang="ts">
/**
 * @file 电视剧搜索
 */
import { defineProps, defineComponent, ref } from "vue";

import { MediaItem, fetchMediaList, fetchMediaListProcess } from "@/services/media";
// import { LazyImage } from "@/components/ui/image";
import ListView from "@/components/ui/ListView.vue";
import ScrollView from "@/components/ui/ScrollView.vue";
import { RequestCoreV2 } from "@/domains/request/v2";
import { ListCoreV2 } from "@/domains/list/v2";
import { ButtonCore } from "@/domains/ui/button";
import { InputCore } from "@/domains/ui/input";
import { ScrollViewCore } from "@/domains/ui/scroll-view";
import { NavigatorCore } from "@/domains/navigator";
import { RouteViewCore } from "@/domains/route_view";
import { ImageCore, ImageInListCore } from "@/domains/ui/image";
import { MediaTypes } from "@/constants/index";
import { ViewComponentProps } from "@/store/types";

const { view, client } = defineProps<ViewComponentProps>();

const helper = new ListCoreV2(
  new RequestCoreV2({
    fetch: fetchMediaList,
    process: fetchMediaListProcess,
    client,
  })
);
const nameInput = new InputCore({
  placeholder: "请输入关键字搜索",
});
const searchBtn = new ButtonCore({
  onClick() {
    if (!nameInput.value) {
      return;
    }
    helper.search({ name: nameInput.value });
  },
});
const scroll = new ScrollViewCore();
const poster = new ImageInListCore();

// const [response, helper] = useHelper<PartialSearchedTV>(fetch_tv_list);
const response = ref(helper.response);
function play(media: MediaItem) {
  const { id, type } = media;
  // if (type === MediaTypes.Season) {
  //   tvPlayingPage.query = {
  //     id,
  //   };
  //   rootView.layerSubView(tvPlayingPage);
  //   return;
  // }
  // if (type === MediaTypes.Movie) {
  //   moviePlayingPage.query = {
  //     id,
  //   };
  //   rootView.layerSubView(moviePlayingPage);
  //   return;
  // }
}

// console.log("home/search initialize");
view.onReady(() => {
  console.log("home/search ready");
});
view.onMounted(() => {
  console.log("home/search mounted");
});
view.onShow(() => {
  console.log("home/search show");
});
view.onHidden(() => {
  console.log("home/search hide");
});
scroll.onReachBottom(() => {
  helper.loadMore();
});
helper.onStateChange((nextResponse) => {
  response.value = {
    ...nextResponse,
    dataSource: nextResponse.dataSource.map((media) => {
      return {
        ...media,
        poster_path: ImageCore.url(media.poster_path),
      };
    }),
  };
});
</script>

<template>
  <div class="h-full flex flex-col">
    <div class="w-full p-4">
      <div class="flex space-x-2">
        <Input :store="nameInput" class="" />
        <Button :store="searchBtn" class="w-[80px]">搜索</Button>
      </div>
    </div>
    <scroll-view class="flex-1" :store="scroll">
      <list-view :store="helper" class="p-4 space-y-4">
        <div v-for="media in response.dataSource" class="relative w-[166px] bg-w-bg-2 cursor-pointer">
          <AspectRatio :ratio="10 / 15">
            <LazyImage class="overflow-hidden absolute inset-0 rounded-md" :store="poster.bind(media.poster_path)" />
          </AspectRatio>
          <div class="mt-2">
            <div class="text-lg truncate">{{ media.name }}</div>
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
      </list-view>
    </scroll-view>
  </div>
</template>
