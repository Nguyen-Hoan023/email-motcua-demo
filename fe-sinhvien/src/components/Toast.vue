<script setup>
import { CheckCircle } from 'lucide-vue-next';

defineProps({
  message: String
});
</script>

<template>
  <div v-if="message" class="fixed top-4 right-4 z-50 animate-fade-in-down">
    <div class="bg-green-100 border border-green-400 text-green-700 px-6 py-3 rounded flex items-center gap-2 shadow-lg">
      <CheckCircle :size="20" />
      <span class="font-bold">{{ message }}</span>
    </div>
  </div>
</template>
