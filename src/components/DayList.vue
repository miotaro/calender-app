<script setup>
import { ref, watch } from 'vue'
import { selectedDateStore } from '@/stores/selectedDateStore'
import { storeToRefs } from 'pinia'
import EventForm from './EventForm.vue'
import DayCell from './DayCell.vue'

const dateStore = selectedDateStore()
const { todayYear } = storeToRefs(dateStore)
const { selectedDate } = storeToRefs(dateStore)

const getDaysInMonth = (year, month) => {
  const days = new Date(year, month + 1, 0).getDate()
  return Array.from({ length: days }, (_, i) => i + 1)
}

const months = Array.from({ length: 12 }, (_, i) => i)
const weekDays = ['日', '月', '火', '水', '木', '金', '土']

const getFirstDayOfMonth = (year, month) => {
  return new Date(year, month, 1).getDay()
}

const isModalOpen = ref(false)
const openModal = () => {
  isModalOpen.value = true
}
const closeModal = () => {
  isModalOpen.value = false
}

watch(selectedDate, (newVal) => {
  if (newVal) isModalOpen.value = true
})

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
        :month="month"
        :day="day"
        @click="openModal"
      />
    </div>
    <EventForm
      v-if="selectedDate && isModalOpen"
      class="modal-overlay"
      @click.self="closeModal"
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
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backdrop-filter: blur(1px);
  z-index: 1000;
  -webkit-backdrop-filter: blur(6px);
}
</style>