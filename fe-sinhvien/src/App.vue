<script setup>
import { onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useStudentStore } from './stores/studentStore';
import StudentApp from './pages/StudentApp.vue';

const sysAPI = useStudentStore();
const { db, auth } = storeToRefs(sysAPI);

onMounted(() => {
  sysAPI.setupSignalR();
});

onUnmounted(() => {
  sysAPI.cleanupSignalR();
});
</script>

<template>
  <StudentApp
    :db="db"
    :user="auth.student.user"
    :sysAPI="sysAPI"
  />
</template>
