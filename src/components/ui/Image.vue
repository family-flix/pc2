<script setup lang="ts">
import { onMounted, ref } from "vue";
import { ImageOff, Image } from "lucide-vue-next";

import { ImageStep } from "@/domains/ui/image";
import { ImageCore } from "@/domains/ui/image";
import { connect } from "@/domains/ui/image/connect.web";
import { cn } from "@/utils";

const props = defineProps<{ class?: string; store: ImageCore; alt?: string }>();
const { store: image } = props;

function handleError() {
  image.handleError();
}

const state = ref(image.state);
const imgRef = ref();

image.onStateChange((nextState) => {
  // console.log("[COMPONENT]LazyImage - image.onStateChange", nextState);
  state.value = nextState;
});
onMounted(() => {
  const $img = imgRef.value;
  if (!$img) {
    return;
  }
  connect($img, image);
});
const className = cn(props.class, "flex items-center justify-center text-w-fg-2 bg-w-bg-3");
</script>

<template>
  <div ref="imgRef" :class="className">
    <template v-if="state.step === ImageStep.Failed">
      <ImageOff className="w-16 h-16 text-w-bg-3" :size="64" />
    </template>
    <template v-else-if="state.step === ImageStep.Pending">
      <Image className="w-16 h-16 text-w-bg-3" :size="64" />
    </template>
    <template v-else-if="[ImageStep.Loading, ImageStep.Loaded].includes(state.step)">
      <img
        :style="{ width: '100%', height: '100%', 'object-fit': state.fit }"
        :src="state.src"
        :alt="state.alt"
        @error="handleError"
      />
    </template>
  </div>
</template>
