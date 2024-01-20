<script setup lang="ts">
import { defineComponent, ref } from "vue";

import ListView from "@/components/ui/ListView.vue";
import ScrollView from "@/components/ui/ScrollView.vue";
import LazyImage from "@/components/ui/Image.vue";
import { ScrollViewCore } from "@/domains/ui/scroll-view";
import { fetchPlayingHistories, PlayHistoryItem } from "@/domains/media/services";
import { ListCore } from "@/domains/list";
import { RequestCore } from "@/domains/request";
import { ViewComponentProps } from "@/types";
import { moviePlayingPage, rootView, tvPlayingPage } from "@/store/views";
import { MediaTypes } from "@/constants";
import { ImageInListCore } from "@/domains/ui/image";
import AspectRatio from "@/components/ui/AspectRatio.vue";

const helper = new ListCore(new RequestCore(fetchPlayingHistories));
const scroll = new ScrollViewCore({
  onReachBottom() {
    helper.loadMore();
  },
});
const thumbnail = new ImageInListCore({
  scale: 1.38,
});

const { app, view, router } = defineProps<ViewComponentProps>();
defineComponent({
  ScrollView,
  ListView,
  Image,
  AspectRatio,
});
// const response = refDomain(helper.response);
const response = ref(helper.response);

function gotoPlyingPage(history: PlayHistoryItem) {
  const { type, media_id } = history;
  if (type === MediaTypes.Season) {
    tvPlayingPage.query = {
      id: media_id,
    };
    rootView.layerSubView(tvPlayingPage);
    return;
  }
  if (type === MediaTypes.Movie) {
    moviePlayingPage.query = {
      id: media_id,
    };
    rootView.layerSubView(moviePlayingPage);
    return;
  }
}
helper.onStateChange((nextState) => {
  response.value = nextState;
});
helper.init();
</script>

<template>
  <ScrollView :store="scroll" class="pt-4">
    <div class="">
      <ListView :store="helper" class="grid grid-cols-1 gap-2 p-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        <div v-for="history in response.dataSource" class="cursor-pointer" @click="gotoPlyingPage(history)">
          <div class="relative w-full h-full bg-w-bg-2 rounded-lg">
            <div class="relative w-full overflow-hidden rounded-t-md">
              <AspectRatio :ratio="16 / 9">
                <LazyImage
                  class="absolute inset-0"
                  :store="thumbnail.bind(history.thumbnail_path)"
                  :alt="history.name"
                />
              </AspectRatio>
              <div class="absolute w-full top-0 flex flex-row-reverse items-center">
                <div class="relative z-20 p-2 text-[12px] text-w-bg-0 dark:text-w-fg-0">
                  {{ history.episodeCountText }}
                </div>
              </div>
              <div class="absolute bottom-0 w-full">
                <div class="w-full h-[2px] rounded-md bg-w-brand" :style="{ width: history.percent + '%' }"></div>
              </div>
            </div>
            <template v-if="!!history.hasUpdate">
              <div class="absolute top-2 left-2">
                <div class="huizhang">更新</div>
              </div>
            </template>
            <div class="p-2 pb-4">
              <div class="text-w-fg-0">{{ history.name }}</div>
              <div class="flex items-center mt-2 text-[12px] text-w-fg-1">
                {{ history.updated }}
                <p class="mx-1">·</p>
                <template v-if="history.episodeText">
                  <p class="">{{ history.episodeText }}</p>
                  <p class="mx-1">·</p>
                </template>
                {{ history.percent }}%
              </div>
            </div>
          </div>
        </div>
      </ListView>
    </div>
  </ScrollView>
</template>
