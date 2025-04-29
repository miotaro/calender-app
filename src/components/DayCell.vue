<script setup>
import { defineProps, defineEmits } from 'vue';
import EventItem from './EventItem.vue'

const props = defineProps({
  year: Number,
  month: Number,
  day: Number,
  events: Object,
  selectedDate: String
})
const emit = defineEmits(['select-date'])

const formatDate = (year, month, day) => {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

const handleClick = () => {
  emit('select-date', { clickedDate: formatDate(props.year, props.month, props.day), month: props.month })
}
</script>

<template>
  <div class="day" @click="handleClick">
    {{ day }}
    <div v-if="events && Object.keys(events).length > 0">
      <EventItem v-for="event in events" :key="event.text" :event="event" />
    </div>
  </div>
</template>

<style>
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
</style>