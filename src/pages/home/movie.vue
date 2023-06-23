<script setup lang="ts">
import { ref } from "vue";
import { fetch_movie_list } from "@/domains/tv/services";
import { ListCore } from "@/domains/list";
import { RequestCore } from "@/domains/client";
import { NavigatorCore } from "@/domains/navigator";
import { ImageCore } from "@/domains/ui/image";
import { ViewComponent } from "@/types";

const movieList = new ListCore(new RequestCore(fetch_movie_list), {
  pageSize: 20,
});

const movieResponse = ref(movieList.response);
const { router } = defineProps<{ router: NavigatorCore }>();

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

movieList.init();

function gotoMoviePlaying(movie) {
  const { id } = movie;
  router.push(`/movie/play/${id}`);
}
</script>

<template>
  <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
    <div
      v-for="item in movieResponse.dataSource"
      @click="gotoMoviePlaying(item)"
    >
      <img
        class="w-[360px] object-contain rounded-sm"
        :src="item.poster_path"
      />
    </div>
  </div>
</template>

<style scoped></style>
