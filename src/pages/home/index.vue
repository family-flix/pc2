<script setup lang="ts">
import { defineComponent, ref } from "vue";
import { ListCore } from "@/domains/list";
import { getPageSizeByDeviceSize } from "@/domains/list/utils";
import { RequestCore } from "@/domains/request";
import { ScrollViewCore } from "@/domains/ui/scroll-view";
import ListView from "@/components/ui/ListView.vue";
import ScrollView from "@/components/ui/ScrollView.vue";
import { ViewComponentProps } from "@/types";
import LazyImage from "@/components/ui/Image.vue";
import { moviePlayingPage, rootView, tvPlayingPage } from "@/store/views";
import { fetchMediaList } from "@/services/media";
import { MediaTypes } from "@/constants";
import { ImageInListCore } from "@/domains/ui/image";
import AspectRatio from "@/components/ui/AspectRatio.vue";

const { app, router } = defineProps<ViewComponentProps>();
defineComponent({
  ScrollView,
  ListView,
  LazyImage,
  AspectRatio,
});

const seasonList = new ListCore(new RequestCore(fetchMediaList), {
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
const poster = new ImageInListCore();

const tvResponse = ref(seasonList.response);
function gotoPlayingPage(media: { id: string; type: MediaTypes }) {
  const { id, type } = media;
  if (type === MediaTypes.Season) {
    tvPlayingPage.query = {
      id,
    };
    rootView.layerSubView(tvPlayingPage);
    return;
  }
  if (type === MediaTypes.Movie) {
    moviePlayingPage.query = {
      id,
    };
    rootView.layerSubView(moviePlayingPage);
    return;
  }
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
  <ScrollView :store="scrollView">
    <ListView :store="seasonList" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
      <div v-for="item in tvResponse.dataSource" @click="gotoPlayingPage(item)">
        <AspectRatio :ratio="10 / 15">
          <LazyImage class="absolute inset-0" :store="poster.bind(item.poster_path)" />
        </AspectRatio>
      </div>
    </ListView>
  </ScrollView>
</template>

<style scoped></style>
