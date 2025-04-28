<script setup>
import { ref } from 'vue'
import DayList from './components/DayList.vue'

//日付管理
const today = new Date()
const todayMonth = ref(today.getMonth())
const todayYear = ref(today.getFullYear())

//イベント管理
const events = ref({
  startDate: '',
  endDate: '',
  text: '',
  status: '',
  category: '',
  timeType: '',
  startTime: '',
  endTime: '',
})
const selectedDate = ref('')
const selectedMonth = ref(null)

const handleSelectDate = ({ clickedDate, month }) => {
  if (selectedDate.value === clickedDate) {
    selectedDate.value = ''
    selectedMonth.value = null
  } else {
    selectedDate.value = clickedDate
    selectedMonth.value = month
  }  
}

const handleUpdateEvents = (newEvents) => {
  events.value = newEvents
}

</script>

<template>
  <div class="calendar-app">
    <h1>カレンダー予定管理</h1>
    <h2>{{ todayYear }}年</h2>

    <DayList
      :events="events"
      :selectedDate="selectedDate"
      :selectedMonth="selectedMonth"
      :todayYear="todayYear"
      :todayMonth="todayMonth"
      @select-date="handleSelectDate"
      @update-events="handleUpdateEvents"
    />

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