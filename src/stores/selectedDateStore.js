import { defineStore } from 'pinia'
import { ref } from 'vue'

export const selectedDateStore = defineStore('selectedDate', () => {
  const today = new Date()
  const todayMonth = ref(today.getMonth())
  const todayYear = ref(today.getFullYear())

  const selectedDate = ref('')
  const selectedMonth = ref(null)

  const setSelectedDate = (date) => {
    selectedDate.value = date
  }

  return {
    today,
    todayMonth,
    todayYear,
    selectedDate,
    selectedMonth,
    setSelectedDate
  }
})