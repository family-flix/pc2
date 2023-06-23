<script setup lang="ts">
import { ref } from "vue";
import { fetch_tv_list } from "@/domains/tv/services";
import { ListCore } from "@/domains/list";
import { RequestCore } from "@/domains/client";
import { NavigatorCore } from "@/domains/navigator";
import { ImageCore } from "@/domains/ui/image";
import { ViewComponent } from "@/types";

const tvList = new ListCore(new RequestCore(fetch_tv_list), { pageSize: 20 });

const tvResponse = ref(tvList.response);
const { router } = defineProps<{ router: NavigatorCore }>();

tvList.onStateChange((nextResponse) => {
  tvResponse.value = {
    ...nextResponse,
    dataSource: nextResponse.dataSource.map((tv) => {
      return {
        ...tv,
        poster_path: ImageCore.url(tv.poster_path),
      };
    }),
  };
});

tvList.init();

function gotoTVPlaying(tv: { id: string }) {
  const { id } = tv;
  router.push(`/tv/play/${id}`);
}
</script>

<template>
  <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
    <div v-for="item in tvResponse.dataSource" @click="gotoTVPlaying(item)">
      <img
        class="w-[360px] object-contain rounded-sm"
        :src="item.poster_path"
      />
    </div>
  </div>
</template>

<style scoped></style>
