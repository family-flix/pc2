<script setup lang="ts">
import { defineComponent, ref } from "vue";
import { fetch_season_list, fetch_tv_list } from "@/domains/tv/services";
import { ListCore } from "@/domains/list";
import { getPageSizeByDeviceSize } from "@/domains/list/utils";
import { RequestCore } from "@/domains/request";
import { ScrollViewCore } from "@/domains/ui/scroll-view";
import ListView from "@/components/ui/ListView.vue";
import ScrollView from "@/components/ui/ScrollView.vue";
import { ViewComponentProps } from "@/types";
import LazyImage from "@/components/ui/Image.vue";

const { app, router } = defineProps<ViewComponentProps>();
defineComponent({
  "lazy-image": LazyImage,
});

const seasonList = new ListCore(new RequestCore(fetch_season_list), {
  pageSize: getPageSizeByDeviceSize(app.curDeviceSize).pageSize,
  search: (() => {
    const { language = [] } = app.cache.get("tv_search", {
      language: [] as string[],
    });
    if (!language.length) {
      return {};
    }
    return {
      language: language.join("|"),
    };
  })(),
});
const scrollView = new ScrollViewCore();

const tvResponse = ref(seasonList.response);
function gotoTVPlaying(season: { id: string; tv_id: string }) {
  const { id, tv_id } = season;
  router.push(`/tv/play/${tv_id}?season_id=${id}`);
}

seasonList.onStateChange((nextResponse) => {
  tvResponse.value = nextResponse;
});
scrollView.onReachBottom(() => {
  seasonList.loadMore();
});

seasonList.init();
</script>

<template>
  <scroll-view :store="scrollView">
    <list-view
      :store="seasonList"
      class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
    >
      <div v-for="item in tvResponse.dataSource" @click="gotoTVPlaying(item)">
        <lazy-image class="w-[360px] object-contain" :src="item.poster_path" />
      </div>
    </list-view>
  </scroll-view>
</template>

<style scoped></style>
