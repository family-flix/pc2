<script setup lang="ts">
import { onMounted, watchEffect, ref } from "vue";
import { ImageOff, Image } from "lucide-vue-next";

import { ImageCore, ImageStep } from "@/domains/ui/image";
import { connect } from "@/domains/ui/image/connect.web";
import { cn } from "@/utils/index";

const props = defineProps<{ class?: string; store: ImageCore; src?: string; alt?: string }>();
const { store, src } = props;

function handleError() {
  store.handleError();
}

const state = ref(store.state);
const imgRef = ref();
store.onStateChange((nextState) => {
  state.value = nextState;
});
onMounted(() => {
  const $img = imgRef.value;
  if (!$img) {
    return;
  }
  connect($img, store);
});
const className = cn(props.class, "flex items-center justify-center text-w-fg-2 bg-w-bg-3");
</script>

<template>
  <div ref="imgRef" :class="className">
    <template v-if="state.step === ImageStep.Failed">
      <ImageOff :size="64" />
    </template>
    <template v-else-if="state.step === ImageStep.Pending">
      <Image :size="64" />
    </template>
    <template v-else-if="[ImageStep.Loading, ImageStep.Loaded].includes(state.step)">
      <img
        :style="{ width: '100%', height: '100%', 'object-fit': state.fit, transform: `scale(${state.scale})` }"
        :src="state.src"
        :alt="state.alt"
        @error="handleError"
      />
    </template>
  </div>
</template>
