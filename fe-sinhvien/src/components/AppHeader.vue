<script setup>
import { Phone, Mail } from 'lucide-vue-next';
import { ASSETS } from '../constants/assets';
</script>

<template>
  <header class="bg-white flex justify-between items-center py-4 px-10 border-b relative z-20">
    <div class="flex items-center gap-4">
      <img :src="ASSETS.images.logos.main" alt="HUCE Logo" class="h-20 w-auto" />
      <div>
        <h1 class="text-xl font-bold text-[#1e3a8a] uppercase leading-tight">
          Trường Đại học Xây dựng Hà Nội
        </h1>
        <h2 class="text-lg font-semibold text-[#1e3a8a]">
          Hanoi University of Civil Engineering
        </h2>
        <p class="text-xs text-red-600 italic font-bold">
          Cơ sở giáo dục đại học đạt chuẩn kiểm định quốc tế
        </p>
      </div>
    </div>
    <div class="flex gap-10">
      <div class="flex items-center gap-3">
        <Phone class="text-[#f59e0b]" :size="32" />
        <div>
          <p class="text-xs font-bold text-[#1e3a8a]">Hotline</p>
          <p class="text-sm font-semibold">02438697004</p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <Mail class="text-[#f59e0b]" :size="32" />
        <div>
          <p class="text-xs font-bold text-[#1e3a8a]">Email</p>
          <p class="text-sm font-semibold">ctsv@huce.edu.vn</p>
        </div>
      </div>
    </div>
  </header>
</template>
