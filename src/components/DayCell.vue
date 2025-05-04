<script setup>
import { defineProps, defineEmits, computed } from 'vue';
import { useEventsStore } from '@/stores/useEventsStore'
import { selectedDateStore } from '@/stores/selectedDateStore'
import { storeToRefs } from 'pinia'
import EventItem from './EventItem.vue'

const eventStore = useEventsStore()
const { events } = storeToRefs(eventStore)
const dateStore = selectedDateStore()
const { todayYear } = storeToRefs(dateStore)

const props = defineProps({
  month: Number,
  day: Number,
})
const emit = defineEmits(['click'])

const formatDate = (year, month, day) => {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

const handleClick = () => {
  const selected = formatDate(todayYear.value, props.month, props.day)
  dateStore.setSelectedDate(selected) // ← Storeに書き込む
  emit('click')
}

const activeEvents = computed(() => {
  const date = formatDate(todayYear.value, props.month, props.day)
  const allEvents =  Object.values(events.value).flat()
  if (!events.value) return []
  return allEvents.filter(event => {
    return date >= event.startDate && date <= event.endDate
  })
})
// event => event.status !== '完了'

</script>

<template>
  <div class="day" @click="handleClick" v-on="$attrs">
    {{ day }}
    <div v-if="activeEvents.length > 0">
      <EventItem v-for="event in activeEvents" :key="event.text" :event="event" />
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