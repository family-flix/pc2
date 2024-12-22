<script setup lang="ts">
import { defineComponent, ref } from "vue";

import { ViewComponentProps } from "@/store/types";
import { fetchMediaList } from "@/services/media";
import AspectRatio from "@/components/ui/AspectRatio.vue";
import ListView from "@/components/ui/ListView.vue";
import ScrollView from "@/components/ui/ScrollView.vue";
import LazyImage from "@/components/ui/Image.vue";
import MediaSection from "@/components/media-section/index.vue";
import PageFooter from "@/components/footer/index.vue";
import { ListCore } from "@/domains/list";
import { getPageSizeByDeviceSize } from "@/domains/list/utils";
import { RequestCore } from "@/domains/request";
import { ScrollViewCore } from "@/domains/ui/scroll-view";
import { ImageInListCore } from "@/domains/ui/image";
import { MediaTypes, MediaOriginCountry } from "@/constants/index";

const { app, storage } = defineProps<ViewComponentProps>();
defineComponent({
  ScrollView,
  ListView,
  LazyImage,
  AspectRatio,
  MediaSection,
});

const scrollView = new ScrollViewCore({});
// const poster = new ImageInListCore();

// const tvResponse = ref(seasonList.response);
function gotoPlayingPage(media: { id: string; type: MediaTypes }) {
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

// seasonList.onStateChange((nextResponse) => {
//   tvResponse.value = nextResponse;
// });
// scrollView.onReachBottom(() => {
//   seasonList.loadMore();
// });

// seasonList.init();
</script>

<template>
  <ScrollView :store="scrollView">
    <div class="w-[1080px] mx-auto mt-8 pb-8 2xl:w-[1280px]">
      <div class="space-y-8">
        <MediaSection
          title="最新影视剧"
          :params="{}"
          :app="app"
          :client="client"
          :storage="storage"
          :history="history"
        />
        <div class="h-[1px] my-4 bg-w-fg-1"></div>
        <MediaSection
          title="电视剧"
          :type="MediaTypes.Season"
          :show-extra="true"
          :params="{ type: MediaTypes.Season, language: MediaOriginCountry.CN }"
          :app="app"
          :client="client"
          :storage="storage"
          :history="history"
        />
        <div class="h-[1px] my-4 bg-w-fg-1"></div>
        <MediaSection
          title="电影"
          :type="MediaTypes.Movie"
          :show-extra="true"
          :params="{ type: MediaTypes.Movie, language: MediaOriginCountry.CN }"
          :app="app"
          :client="client"
          :storage="storage"
          :history="history"
        />
        <!-- <div class="h-[1px] my-4 bg-gray-200"></div>
        <MediaSection
          title="电影"
          :params="{ type: MediaTypes.Movie, language: MediaOriginCountry.CN }"
          :app="app"
          :client="client"
          :storage="storage"
        />
        <div class="h-[1px] my-4 bg-gray-200"></div>
        <MediaSection
          title="动漫"
          :params="{ language: MediaOriginCountry.CN }"
          :app="app"
          :client="client"
          :storage="storage"
        />
        <MediaSection
          title="综艺"
          :params="{ type: MediaTypes.Season, language: MediaOriginCountry.CN }"
          :app="app"
          :client="client"
          :storage="storage"
        />
        <MediaSection
          title="纪录片"
          :params="{ type: MediaTypes.Season, language: MediaOriginCountry.CN }"
          :app="app"
          :client="client"
          :storage="storage"
        /> -->
      </div>
    </div>
    <PageFooter />
  </ScrollView>
</template>

<style scoped></style>
