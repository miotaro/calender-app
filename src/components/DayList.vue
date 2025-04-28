<script setup>
import { defineProps, defineEmits } from 'vue'
import EventForm from './EventForm.vue'

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

const selectDate = (month, day) => {
  const clickedDate = formatDate(props.todayYear, month, day)
  emit('select-date', { clickedDate, month })
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
      <div 
        v-for="day in getDaysInMonth(todayYear, month)"
        :key="todayMonth + '-' + day"
        class="day"
        @click="selectDate(month, day)"
      >{{ day }}
        <div v-if="getEventsForDate(todayYear, month, day).length > 0">
          <div
            v-for="event in getEventsForDate(todayYear, month, day)"
            :key="event.text"
            :class="[
              event.timeType ? `event-preview category-${event.category}` : `event-preview time-category-${event.category}`]"
          >{{ event.text }}</div>
        </div>
      </div>
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
.day:hover {
  background-color: rgb(180, 255, 255);
}
.event-preview {
  font-size: 12px;
  border-radius: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-left: 5px;
}
.day::-webkit-scrollbar {
  width: 0;
}
.empty {
  background-color: white;
  border: none;
}
.empty:hover {
  background-color: white;
}
.category {
  margin-top: 5px;
  border-radius: 50%;
  width: 12px;
  height: 12px;
}
.category-仕事 {
  background-color: blue;
  color: white;
}
.category-プライベート {
  background-color: rgb(245, 114, 249);
  color: white;
}
.category-健康 {
  background-color: orange;
}
.category-趣味 {
  background-color: green;
}
.time-category-仕事 {
  color: blue;
}
.time-category-プライベート {
  color: rgb(245, 114, 249);
}
.time-category-健康 {
  color: orange;
}
.time-category-趣味 {
  color: green;
}
</style>