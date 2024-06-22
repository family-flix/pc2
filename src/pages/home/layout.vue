<script setup lang="ts">
import { ref, defineComponent } from "vue";
import { Home, Film, History, Bell, ChevronDown, User } from "lucide-vue-next";

import { messageList } from "@/store/index";
import { PageKeys } from "@/store/routes";
import { ViewComponentProps } from "@/store/types";
import { MediaItem, fetchMediaList, fetchMediaListProcess } from "@/services/media";
import ScrollView from "@/components/ui/ScrollView.vue";
import ListView from "@/components/ui/ListView.vue";
import Input from "@/components/ui/Input.vue";
import AspectRatio from "@/components/ui/AspectRatio.vue";
import LazyImage from "@/components/ui/Image.vue";
import Popover from "@/components/ui/Popover.vue";
import PageFooter from "@/components/footer/index.vue";
import HistoryPanel from "@/components/history-panel/index.vue";
import KeepAliveView from "@/components/ui/KeepAliveView.vue";
import { ListCore } from "@/domains/list/index";
import { RequestCore } from "@/domains/request/index";
import { ButtonCore, ImageInListCore, InputCore, PopoverCore, ScrollViewCore } from "@/domains/ui";
import { MovieGenresOptions, MovieOriginCountryOptions, RecentlyYearOptions, MediaTypes } from "@/constants/index";

const { app, view, client, pages, history } = defineProps<ViewComponentProps>();
defineComponent({
  components: {
    "keep-alive-view": KeepAliveView,
  },
});

const helper = new ListCore(
  new RequestCore(fetchMediaList, {
    process: fetchMediaListProcess,
    client,
  }),
  {
    pageSize: 14,
  }
);
const nameInput = new InputCore({
  defaultValue: "",
  placeholder: "请输入关键字搜索",
  onEnter(v) {
    helper.search({
      name: v,
    });
    scroll.scrollTo({ top: 0 });
  },
  onChange(v) {
    helper.searchDebounce({
      name: v,
    });
  },
  onBlur(v) {
    if (!v) {
      return;
    }
    if (v === helper.params.name) {
      return;
    }
    helper.search({
      name: v,
    });
  },
});
const searchBtn = new ButtonCore({
  onClick() {
    if (!nameInput.value) {
      return;
    }
    helper.search({ name: nameInput.value });
  },
});
const scroll = new ScrollViewCore({});
const poster = new ImageInListCore();
const messageDropdown = new PopoverCore({
  align: "start",
});
const historyDropdown = new PopoverCore({
  align: "start",
});

const curView = ref(view.curView);
const subViews = ref(view.subViews);
const messageResponse = ref(messageList.response);
const response = ref(helper.response);
const isSearching = ref(false);

function gotoPage(page: PageKeys) {
  // homeLayout.showSubView(view);
}
function logout() {
  // app.user.logout();
}
function handleClickMedia(media: MediaItem) {
  const { id, type } = media;
  if (type === MediaTypes.Season) {
    history.push("root.season_playing", { id });
    return;
  }
  if (type === MediaTypes.Movie) {
    history.push("root.movie_playing", { id });
    return;
  }
}
function handleClickMessage(msg: { media?: { id: string; type: MediaTypes } }) {
  const { media } = msg;
  messageDropdown.hide();
  if (media && media.type === MediaTypes.Season) {
    history.push("root.season_playing", { id: media.id });
    return;
  }
  if (media && media.type === MediaTypes.Movie) {
    history.push("root.movie_playing", { id: media.id });
  }
}
function prepareSearch() {
  isSearching.value = true;
  // helper.init();
}
function clearSearching() {
  console.log("[]isSearching.value", isSearching.value);
  if (isSearching.value) {
    isSearching.value = false;
    return;
  }
  history.push("root.home_layout.home_index");
}

helper.onStateChange((nextState) => {
  response.value = nextState;
});
messageList.onStateChange((nextState) => {
  messageResponse.value = nextState;
});
view.onSubViewsChange((nextSubViews) => {
  subViews.value = nextSubViews;
});
view.onCurViewChange((nextCurView) => {
  curView.value = nextCurView;
});
</script>

<template>
  <div class="layout flex flex-col w-full h-full bg-gray-100">
    <div class="w-[1080px] h-[130px] mx-auto 2xl:w-[1280px]">
      <div class="top-header-bar py-4 flex items-center justify-between">
        <div class="relative cursor-pointer" @click="clearSearching">
          <div class="z-10 absolute left-2 top-[18px] w-full h-[16px] rounded-md bg-green-500"></div>
          <div class="z-20 relative text-3xl italic">FamilyFlix</div>
        </div>
        <div class="flex items-center space-x-4">
          <div class="relative">
            <Popover :store="messageDropdown" class-name="relative">
              <template v-slot:trigger>
                <div class="flex items-center justify-between p-2 rounded-full bg-w-bg-2 cursor-pointer">
                  <Bell :size="48" class="w-6 h-6" />
                </div>
                <template v-if="messageResponse.total">
                  <div
                    className="absolute top-[-2px] right-[2px] px-[8px] h-[16px] rounded-xl break-all whitespace-nowrap text-[12px] border-w-bg-0 dark:border-w-fg-0 bg-w-red text-white dark:text-w-fg-0 translate-x-1/2"
                  >
                    {{ messageResponse.total }}
                  </div>
                </template>
              </template>
              <template v-slot:content>
                <div>
                  <div class="text-2xl">系统消息</div>
                </div>
                <div class="mt-4 min-h-[320px] min-w-[240px]">
                  <template v-for="(message, index) in messageResponse.dataSource">
                    <div class="py-2 text-lg cursor-pointer" @click="handleClickMessage(message)">
                      {{ message.msg }}
                    </div>
                  </template>
                </div>
              </template>
            </Popover>
          </div>
          <div>
            <Popover :store="historyDropdown" class-name="">
              <template v-slot:trigger>
                <div class="flex items-center justify-between p-2 rounded-full bg-w-bg-2 cursor-pointer">
                  <History :size="48" class="w-6 h-6" />
                </div>
              </template>
              <template v-slot:content>
                <HistoryPanel :app="app" :history="history" :client="client" :store="historyDropdown" />
              </template>
            </Popover>
          </div>
          <!-- <div class="">
            <div
              class="flex items-center justify-between p-2 rounded-full bg-w-bg-2 cursor-pointer"
              @click="gotoPage('root.notfound')"
            >
              <User :size="48" class="w-6 h-6" />
            </div>
          </div> -->
        </div>
      </div>
      <div class="h-[1px] bg-gray-200"></div>
      <div class="flex items-center justify-between w-full">
        <div class="nav flex items-center space-x-4">
          <div class="flex items-center py-4 space-x-2 cursor-pointer" @click="clearSearching">
            <div><Home class="w-4 h-4" /></div>
            <div>首页</div>
          </div>
          <!-- <div class="flex items-center p-4 space-x-2 cursor-pointer">
            <div><Film class="w-4 h-4" /></div>
            <div>电影</div>
          </div> -->
        </div>
        <div class="flex items-center" @click="prepareSearch">
          <Input :store="nameInput" />
          <!-- <Search :size="48" class="w-6 h-6" /> -->
        </div>
      </div>
    </div>
    <div class="layout__content flex-1 z-index-0 relative flex flex-col w-full h-full">
      <div class="flex-1 h-full">
        <div :style="isSearching ? 'display: none' : 'display: block'">
          <keep-alive-view
            v-for="(view, index) in subViews"
            key="id"
            class-name="absolute inset-0 w-full h-full"
            :store="view"
            :index="index"
          >
            <div class="w-full h-full scrollbar-hide overflow-y-auto bg-white opacity-100 dark:bg-black hide-scroll">
              <component
                :is="pages[view.name as Exclude<PageKeys, 'root'>]"
                :app="app"
                :history="history"
                :client="client"
                :storage="storage"
                :pages="pages"
                :view="view"
              ></component>
            </div>
          </keep-alive-view>
        </div>
        <div :style="isSearching ? 'display: block; height: 100%;' : 'display: none; height: 100%;'">
          <div class="absolute inset-0 w-full h-full">
            <div class="w-full h-full scrollbar-hide overflow-y-auto bg-white opacity-100 dark:bg-black hide-scroll">
              <ScrollView :store="scroll">
                <div class="w-[1080px] mx-auto mt-4 2xl:w-[1280px]">
                  <div class="relative p-4 space-y-2 bg-gray-100 rounded-md">
                    <div class="absolute -right-20 top-0">
                      <div
                        class="flex items-center justify-between p-4 rounded-full bg-gray-100 cursor-pointer"
                        @click="clearSearching"
                      >
                        <ChevronDown class="w-8 h-8" />
                      </div>
                    </div>
                    <div class="field flex items-center">
                      <div class="w-[120px]">视剧类型</div>
                      <div class="flex space-x-2">
                        <div class="py-1 px-2 rounded-md text-sm bg-gray-100 cursor-pointer">电视剧</div>
                        <div class="py-1 px-2 rounded-md text-sm bg-gray-100 cursor-pointer">电影</div>
                      </div>
                    </div>
                    <div class="field flex items-center">
                      <div class="w-[120px]">题材</div>
                      <div class="flex space-x-2">
                        <template v-for="opt in MovieGenresOptions">
                          <div class="py-1 px-2 rounded-md text-sm bg-gray-100 cursor-pointer">{{ opt.label }}</div>
                        </template>
                      </div>
                    </div>
                    <div class="field flex items-center">
                      <div class="w-[120px]">发行地区</div>
                      <div class="flex space-x-2">
                        <template v-for="opt in MovieOriginCountryOptions">
                          <div class="py-1 px-2 rounded-md text-sm bg-gray-100 cursor-pointer">{{ opt.label }}</div>
                        </template>
                      </div>
                    </div>
                    <div class="field flex items-center">
                      <div class="w-[120px]">上映时间</div>
                      <div class="flex space-x-2">
                        <template v-for="opt in RecentlyYearOptions">
                          <div class="py-1 px-2 rounded-md text-sm bg-gray-100 cursor-pointer">{{ opt.label }}</div>
                        </template>
                      </div>
                    </div>
                  </div>
                  <ListView :store="helper" class="grid grid-cols-7 gap-4 mt-4 min-h-[634px]">
                    <div
                      v-for="media in response.dataSource"
                      class="relative w-[166px] bg-w-bg-2 cursor-pointer"
                      @click="handleClickMedia(media)"
                    >
                      <AspectRatio :ratio="10 / 15">
                        <LazyImage
                          class="overflow-hidden absolute inset-0 rounded-md"
                          :store="poster.bind(media.poster_path)"
                          :key="media.poster_path"
                        />
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
                          <div
                            className="huizhang huizhang--blue relative z-20 p-2 text-[12px] text-w-bg-0 dark:text-w-fg-0"
                          >
                            {{ media.vote }}
                          </div>
                        </div>
                      </template>
                    </div>
                  </ListView>
                </div>
                <PageFooter />
              </ScrollView>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
