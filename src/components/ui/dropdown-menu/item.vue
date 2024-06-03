<script setup lang="ts">
import {  ref } from "vue";

import { ChevronRight } from "lucide-vue-next";

import { DropdownMenuCore } from "@/domains/ui/dropdown-menu";
import { MenuItemCore } from "@/domains/ui/menu/item";
import { MenuCore } from "@/domains/ui/menu";
import DropdownMenuPrimitiveItem from "@/packages/ui/dropdown-menu/item.vue";
import DropdownMenuPrimitiveSub from "@/packages/ui/dropdown-menu/sub.vue";
import DropdownMenuPrimitiveSubTrigger from "@/packages/ui/dropdown-menu/sub-trigger.vue";
import DropdownMenuPrimitivePortal from "@/packages/ui/dropdown-menu/portal.vue";
import DropdownMenuPrimitiveSubContent from "@/packages/ui/dropdown-menu/sub-content.vue";
import { cn } from "@/utils/index";

const { store: menuItem, subMenu } = defineProps<{ store: MenuItemCore; subMenu: MenuCore }>();

const itemState = ref(menuItem.state);
const state = ref(subMenu.state);

menuItem.onStateChange((nextState) => {
  itemState.value = nextState;
});
subMenu.onStateChange((nextState) => {
  state.value = nextState;
});

const { items } = state.value as { items: MenuItemCore[] };
const { label } = itemState.value;
</script>

<template>
  <DropdownMenuPrimitiveSub :store="subMenu" class-name="dropdown-menu__sub">
    <DropdownMenuPrimitiveSubTrigger
      class-name="flex cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm font-medium outline-none focus:bg-slate-100 data-[highlighted]:bg-slate-100 data-[state=open]:bg-slate-100 dark:focus:bg-slate-700 dark:data-[state=open]:bg-slate-700"
      :store="menuItem"
    >
      {{ label }}
      <div class="ml-auto h-4 w-4">
        <ChevronRight class="w-4 h-4" />
      </div>
    </DropdownMenuPrimitiveSubTrigger>
    <DropdownMenuPrimitivePortal :store="subMenu" class-name="dropdown-menu__portal">
      <DropdownMenuPrimitiveSubContent
        class-name="z-50 min-w-[8rem] overflow-hidden rounded-md border-2 border-slate-100 bg-white p-1 text-slate-700 shadow-md dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400"
        :store="subMenu"
      >
        <template v-for="(subMenuItem, index) in items">
          <template v-if="subMenuItem.menu">
            <item :subMenu="subMenuItem.menu" :store="subMenuItem"></item>
          </template>
          <template v-else>
            <DropdownMenuPrimitiveItem
              class-name="relative flex cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm font-medium outline-none focus:bg-slate-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:focus:bg-slate-700"
              :store="subMenuItem"
            >
              {{ label }}
            </DropdownMenuPrimitiveItem>
          </template>
        </template>
      </DropdownMenuPrimitiveSubContent>
    </DropdownMenuPrimitivePortal>
  </DropdownMenuPrimitiveSub>
</template>
