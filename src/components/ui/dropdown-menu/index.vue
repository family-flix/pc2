<script setup lang="ts">
import { defineProps, ref } from "vue";

import { ChevronRight } from "lucide-vue-next";

import DropdownMenuPrimitiveRoot from "@/packages/ui/dropdown-menu/root.vue";
import DropdownMenuPrimitiveTrigger from "@/packages/ui/dropdown-menu/trigger.vue";
import DropdownMenuPrimitivePortal from "@/packages/ui/dropdown-menu/portal.vue";
import DropdownMenuPrimitiveContent from "@/packages/ui/dropdown-menu/content.vue";
import DropdownMenuPrimitiveItem from "@/packages/ui/dropdown-menu/item.vue";
import { DropdownMenuCore } from "@/domains/ui/dropdown-menu";

import ItemWithSubMenu from "./item.vue";

const { store } = defineProps<{ store: DropdownMenuCore }>();
const state = ref(store.state);

store.onStateChange((v) => {
  state.value = v;
});
</script>

<template>
  <DropdownMenuPrimitiveRoot :store="store" class-name="">
    <DropdownMenuPrimitiveTrigger class-name="inline-block" :store="store">
      <slot></slot>
    </DropdownMenuPrimitiveTrigger>
    <DropdownMenuPrimitivePortal :store="store.menu" class-name="rc-dropdown__portal">
      <DropdownMenuPrimitiveContent
        class-name="z-50 min-w-[8rem] w-56 overflow-hidden rounded-md border-2 border-slate-100 bg-white p-1 text-slate-700 shadow-md dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400"
        :store="store"
      >
        <template v-for="item in state.items">
          <template v-if="!!item.menu">
            <ItemWithSubMenu :subMenu="item.menu!" :store="item" />
          </template>
          <template v-else>
            <DropdownMenuPrimitiveItem
              class-name="relative flex cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm font-medium outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:focus:bg-slate-700 focus:bg-slate-100"
              :store="item"
            >
              <!-- <template v-if="!!item.icon">
                <div class="mr-2">{{ item.icon }}</div>
              </template> -->
              {{ item.label }}
              <!-- <template v-if="item.shortcut">{{ item.shortcut }}</template> -->
            </DropdownMenuPrimitiveItem>
          </template>
        </template>
      </DropdownMenuPrimitiveContent>
    </DropdownMenuPrimitivePortal>
  </DropdownMenuPrimitiveRoot>
</template>
