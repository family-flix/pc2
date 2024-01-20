<script setup lang="ts">
/**
 * @file 提供 加载中、没有数据、加载更多等内容的组件
 */
import { defineComponent, ref } from "vue";
import { Loader2 } from "lucide-vue-next";

import { ListCore } from "@/domains/list";
import { cn } from "@/utils";

import Show from "./Show.vue";

defineComponent({
  show: Show,
});
const props = defineProps<{
  class?: string;
  store: ListCore<any, any>;
}>();
const { store } = props;
const response = ref(store.response);

store.onStateChange((nextState) => {
  console.log("[COMPONENT]ListView - store.onStateChange", nextState.empty, !nextState.noMore && !nextState.initial);
  response.value = nextState;
});
const className = cn("relative", props.class);
</script>

<template>
  <show :when="!response.error">
    <template v-slot:fallback>
      <div class="w-full h-[480px] center flex items-center justify-center">
        <div class="flex flex-col items-center justify-center text-slate-500">
          <div class="mt-4 flex items-center space-x-2">
            <div class="text-xl">{{ response.error?.message }}</div>
          </div>
        </div>
      </div>
    </template>
    <show :when="response.empty">
      <div class="w-full h-[480px] center flex items-center justify-center">
        <div class="flex flex-col items-center justify-center text-slate-500">
          <div>🌲</div>
          <div class="mt-4 flex items-center space-x-2">
            <show :when="response.loading"> ... </show>
            <div class="text-xl text-center">
              {{ response.loading ? "加载中" : "列表为空" }}
            </div>
          </div>
        </div>
      </div>
    </show>
    <show :when="response.initial">
      <slot name="skeleton"></slot>
    </show>
    <div :class="className">
      <slot></slot>
    </div>
    <show :when="!response.noMore && !response.initial" name="bottom">
      <div class="mt-4 flex justify-center py-4 text-slate-500">
        <div class="mt-4 flex flex-col items-center space-x-2 cursor-pointer">
          <show :when="response.loading">
            <Loader2 class="animate animate-spin" :size="32" />
          </show>
          <div class="text-center text-xl">
            {{ response.loading ? "加载中" : "加载更多" }}
          </div>
        </div>
      </div>
    </show>
  </show>
  <show :when="response.noMore && !response.empty">
    <div class="mt-4 flex justify-center py-4 text-slate-500">
      <div class="flex items-center space-x-2">
        <show :when="response.loading"> ... </show>
        <div class="text-center text-xl">没有数据了</div>
      </div>
    </div>
  </show>
</template>
