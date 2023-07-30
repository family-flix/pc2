<script setup lang="ts">
/**
 * @file 电视剧搜索
 */
import { defineComponent, ref } from "vue";

import {
  search_tv_and_movie,
  SearchResultItem,
  MediaTypes,
} from "@/domains/tv/services";
// import { LazyImage } from "@/components/ui/image";
import { RequestCore } from "@/domains/client";
import { ListCore } from "@/domains/list";
import { ButtonCore } from "@/domains/ui/button";
import { InputCore } from "@/domains/ui/input";
import { ScrollViewCore } from "@/domains/ui/scroll-view";
import { NavigatorCore } from "@/domains/navigator";
import { RouteViewCore } from "@/domains/route_view";
import { ImageCore } from "@/domains/ui/image";
import ListView from "@/components/ui/ListView.vue";
import ScrollView from "@/components/ui/ScrollView.vue";

const helper = new ListCore(new RequestCore(search_tv_and_movie));
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

defineComponent({
  "scroll-view": ScrollView,
  "list-view": ListView,
});
const { router, view } = defineProps<{
  router: NavigatorCore;
  view: RouteViewCore;
}>();
// const [response, helper] = useHelper<PartialSearchedTV>(fetch_tv_list);
const response = ref(helper.response);
function play(tv: SearchResultItem) {
  const { id, tv_id, type } = tv;
  if (type === MediaTypes.TV) {
    router.push(`/tv/play/${tv_id}?season_id=${id}`);
    return;
  }
  router.push(`/movie/play/${id}`);
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
        <div v-for="t in response.dataSource" class="flex" @click="play(t)">
          <img
            class="w-[240px] mr-4 object-cover"
            :src="t.poster_path"
            :alt="t.name"
          />
          <div class="flex-1 overflow-hidden text-ellipsis">
            <h2 class="truncate text-2xl">{{ t.name }}</h2>
            <p class="mt-2">{{ t.season_number }}</p>
            <div class="mt-4">
              <p
                class="text-lg break-all whitespace-pre-wrap truncate line-clamp-6"
              >
                {{ t.overview }}
              </p>
            </div>
          </div>
        </div>
      </list-view>
    </scroll-view>
  </div>
</template>
