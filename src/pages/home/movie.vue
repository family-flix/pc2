<script setup lang="ts">
import { defineComponent, ref } from "vue";

import { fetch_movie_list } from "@/domains/movie/services";
import { ListCore } from "@/domains/list";
import { getPageSizeByDeviceSize } from "@/domains/list/utils";
import { RequestCore } from "@/domains/request";
import { ImageCore } from "@/domains/ui/image";
import ListView from "@/components/ui/ListView.vue";
import ScrollView from "@/components/ui/ScrollView.vue";
import { ScrollViewCore } from "@/domains/ui/scroll-view";
import { ViewComponentProps } from "@/types";
import LazyImage from "@/components/ui/Image.vue";

const { app, router } = defineProps<ViewComponentProps>();

const movieList = new ListCore(new RequestCore(fetch_movie_list), {
  pageSize: getPageSizeByDeviceSize(app.curDeviceSize).pageSize,
});
const scroll = new ScrollViewCore();

defineComponent({
  "lazy-image": LazyImage,
  "scroll-view": ScrollView,
  "list-view": ListView,
});
const movieResponse = ref(movieList.response);

movieList.onStateChange((nextResponse) => {
  movieResponse.value = {
    ...nextResponse,
    dataSource: nextResponse.dataSource.map((movie) => {
      return {
        ...movie,
        poster_path: ImageCore.url(movie.poster_path),
      };
    }),
  };
});
scroll.onReachBottom(() => {
  movieList.loadMore();
});
movieList.init();

function gotoMoviePlaying(movie: { id: string }) {
  const { id } = movie;
  router.push(`/movie/play/${id}`);
}
</script>

<template>
  <scroll-view :store="scroll">
    <list-view
      :store="movieList"
      class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
    >
      <div
        v-for="item in movieResponse.dataSource"
        @click="gotoMoviePlaying(item)"
      >
        <lazy-image class="w-[360px] object-contain" :src="item.poster_path" />
      </div>
    </list-view>
  </scroll-view>
</template>

<style scoped></style>
