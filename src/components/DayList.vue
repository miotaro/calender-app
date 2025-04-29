<script setup>
import { defineProps, defineEmits } from 'vue'
import EventForm from './EventForm.vue'
import DayCell from './DayCell.vue'

const props = defineProps({
  events: Object,
  selectedDate: String,
  selectedMonth: Number,
  month: Number,
  todayYear: Number,
  todayMonth: Number
})
const emit = defineEmits(['select-date', 'update-events'])

const getDaysInMonth = (year, month) => {
  const days = new Date(year, month + 1, 0).getDate()
  return Array.from({ length: days }, (_, i) => i + 1)
}

const months = Array.from({ length: 12 }, (_, i) => i)
const weekDays = ['日', '月', '火', '水', '木', '金', '土']

const getFirstDayOfMonth = (year, month) => {
  return new Date(year, month, 1).getDay()
}

const formatDate = (year, month, day) => {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

const getEventsForDate = (year, month, day) => {
  const date = formatDate(year, month, day)
  const allEvents = Object.values(props.events).flat()
  return allEvents.filter(event => {
    return date >= event.startDate && date <= event.endDate
  })
}

const handleUpdateEvents = (newEvents) => {
  emit('update-events', newEvents)
}
</script>

<template>
  <div v-for="month in months" :key="month" class="month-block">
    <h2>{{ month + 1 }}月</h2>
    <div class="weekdays">
      <div v-for="(day, index) in weekDays" :key="index" class="weekday">
        {{ day }}
      </div>
    </div>
    <div class="calendar">
      <div
        v-for="n in getFirstDayOfMonth(todayYear, month)"
        :key="'blank-' + month + '-' + n"
        class="day empty"
      ></div>
      <DayCell
        v-for="day in getDaysInMonth(todayYear, month)"
        :key="month + '-' + day"
        :year="todayYear"
        :month="month"
        :day="day"
        :events="getEventsForDate(todayYear, month, day)"
        :selectedDate="selectedDate"
        @select-date="emit('select-date', $event)"
      />
    </div>
    <EventForm
      :events="events"
      :selectedDate="selectedDate"
      :selectedMonth="selectedMonth"
      :month="month"
      @update-events="handleUpdateEvents"
    />
  </div>

</template>

<style>
.calendar {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  background-color: white;
  margin: 10px;
  padding: 8px;
}
.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  text-align: center;
  color: darkcyan;
  margin: 10px;
}
.day {
  overflow-y: auto;
  height: 100px;
  padding: 5px 4px 5px 10px;
  cursor: pointer;
  background-color: lightcyan;
  border: 1px solid cyan;
}
.empty {
  background-color: white;
  border: none;
}
.empty:hover {
  background-color: white;
}
</style>