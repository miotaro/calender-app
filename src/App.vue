<script setup>
import { onMounted } from 'vue'
import { useEventsStore } from '@/stores/useEventsStore'
import { selectedDateStore } from '@/stores/selectedDateStore'
import { storeToRefs } from 'pinia'
import DayList from './components/DayList.vue'

const eventStore = useEventsStore()
const dateStore = selectedDateStore()
const { todayYear } = storeToRefs(dateStore)

onMounted(() => {
  eventStore.fetchEvents()
})
</script>

<template>
  <div class="calendar-app">
    <h1>カレンダー予定管理</h1>
    <h2>{{ todayYear }}年</h2>

    <DayList />

  </div>
</template>

<style>
body {
  background-color: lightcyan;
}
.calendar-app {
  max-width: 800px;
  margin: auto;
}
</style>