<script setup>
import { ref } from 'vue'
import { selectedDateStore } from '@/stores/selectedDateStore'
import { storeToRefs } from 'pinia'
import DayList from './components/DayList.vue'

const dateStore = selectedDateStore()
const { todayYear } = storeToRefs(dateStore)

// const handleSelectDate = ({ clickedDate, month }) => {
//   if (selectedDate.value === clickedDate) {
//     selectedDate.value = ''
//     selectedMonth.value = null
//   } else {
//     selectedDate.value = clickedDate
//     selectedMonth.value = month
//   }  
// }

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