<script setup lang="ts">
import { cn } from "@/utils";
import { ImageStep } from "@/domains/ui/image";
import { ImageCore } from "@/domains/ui/image";
import { onMounted, ref } from "vue";
import { connect } from "@/domains/ui/image/connect.web";

const props = defineProps<{ class?: string; src: string; alt?: string }>();

function handleError() {
  image.handleError();
}

const image = new ImageCore({
  width: 200,
  height: 100,
  src: props.src,
  alt: props.alt,
});

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
// useEffect(() => {
//   if (!props.src) {
//     return;
//   }
//   image.updateSrc(props.src);
// }, [props.src]);

const cn1 = cn(props.class, "flex items-center justify-center bg-slate-200");
const cn2 = cn(props.class, "flex items-center justify-center bg-slate-200");
const cn3 = props.class;
</script>

<template>
  <template v-if="state.step === ImageStep.Failed">
    <div :class="cn1">
      <div>Error</div>
      <!-- <ImageOff className="w-8 h-8 text-slate-500" /> -->
    </div>
  </template>
  <template v-else-if="state.step === ImageStep.Pending">
    <div ref="imgRef" :class="cn2">
      <div>Loading</div>
      <!-- <Image className="w-8 h-8 text-slate-500" /> -->
    </div>
  </template>
  <template
    v-else-if="[ImageStep.Loading, ImageStep.Loaded].includes(state.step)"
  >
    <img
      :className="cn3"
      style="{{ 'object-fit': state.fit }}"
      :src="state.src"
      :alt="state.alt"
      @error="handleError"
    />
  </template>
</template>
