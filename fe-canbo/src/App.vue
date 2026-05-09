<script setup>
import { onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useOfficerStore } from './stores/officerStore';
import OfficerApp from './pages/OfficerApp.vue';

const sysAPI = useOfficerStore();
const { db, auth } = storeToRefs(sysAPI);

onMounted(() => {
  sysAPI.setupSignalR();
});

onUnmounted(() => {
  sysAPI.cleanupSignalR();
});
</script>

<template>
  <OfficerApp
    :db="db"
    :sysAPI="sysAPI"
  />
</template>
