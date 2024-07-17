<script setup lang="ts">
import { __VERSION__ } from '@/constants/index';
</script>

<template>
  <div class="bg-gray-100">
    <div class="w-[1080px] mx-auto py-8 2xl:w-[1280px]">
      <div class="text-gray-600">
        v{{ __VERSION__ }}
      </div>
    </div>
  </div>
</template>
