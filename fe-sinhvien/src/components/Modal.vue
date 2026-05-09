<script setup>
import { X } from 'lucide-vue-next';

defineProps({
  title: String
});

defineEmits(['close']);
</script>

<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
      <div class="flex justify-between items-center p-4 border-b bg-gray-50">
        <h3 class="font-bold text-lg text-[#1e3a8a]">{{ title }}</h3>
        <button @click="$emit('close')" class="text-gray-500 hover:text-red-500 transition">
          <X :size="24" />
        </button>
      </div>
      <div class="overflow-y-auto">
        <slot></slot>
      </div>
    </div>
  </div>
</template>
