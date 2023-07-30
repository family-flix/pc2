<script setup lang="ts">
import { ref } from "vue";
import { fetch_tv_list } from "@/domains/tv/services";
import { ListCore } from "@/domains/list";
import { getPageSizeByDeviceSize } from "@/domains/list/utils";
import { RequestCore } from "@/domains/client";
import { NavigatorCore } from "@/domains/navigator";
import { ImageCore } from "@/domains/ui/image";
import { ScrollViewCore } from "@/domains/ui/scroll-view";
import ListView from "@/components/ui/ListView.vue";
import ScrollView from "@/components/ui/ScrollView.vue";
import { app } from "@/store/app";

const tvList = new ListCore(new RequestCore(fetch_tv_list), {
  pageSize: getPageSizeByDeviceSize(app.curDeviceSize).pageSize,
});
const scroll = new ScrollViewCore();

const tvResponse = ref(tvList.response);
const { router } = defineProps<{ router: NavigatorCore }>();
function gotoTVPlaying(tv: { id: string }) {
  const { id } = tv;
  router.push(`/tv/play/${id}`);
}

tvList.onStateChange((nextResponse) => {
  tvResponse.value = nextResponse;
});
scroll.onReachBottom(() => {
  tvList.loadMore();
});

tvList.init();
</script>

<template>
  <scroll-view :store="scroll">
    <list-view
      :store="tvList"
      class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
    >
      <div v-for="item in tvResponse.dataSource" @click="gotoTVPlaying(item)">
        <img
          class="w-[360px] object-contain rounded-sm"
          :src="item.poster_path"
        />
      </div>
    </list-view>
  </scroll-view>
</template>

<style scoped></style>
