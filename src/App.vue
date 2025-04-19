<script setup>
import { ref, watch, onMounted } from 'vue'

const today = new Date()
const todayMonth = ref(today.getMonth())
const todayYear = ref(today.getFullYear())

const getDaysInMonth = (year, month) => {
  const days = new Date(year, month + 1, 0).getDate()
  return Array.from({ length: days }, (_, i) => i + 1)
}

const months = Array.from({ length: 12 }, (_, i) => i)
const weekDays = ['日', '月', '火', '水', '木', '金', '土']

const getFirstDayOfMonth = (year, month) => {
  return new Date(year, month, 1).getDay()
}

const events = ref({})
const selectedDate = ref('')
const selectedMonth = ref(null)
const newEvent = ref('')

const formatDate = (year, month, day) => {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

const selectDate = (month, day) => {
  selectedDate.value = formatDate(todayYear.value, month, day)
  selectedMonth.value = month
}

const addEvent = () => {
  const text = newEvent.value.trim()
  if (!text || !selectedDate.value) return
  if (!events.value[selectedDate.value]) {
    events.value[selectedDate.value] = []
  }
  events.value[selectedDate.value].push(text)
  newEvent.value = ''
  saveEventsToLocalStorage()
}

const saveEventsToLocalStorage = () => {
  localStorage.setItem('calendar-events', JSON.stringify(events.value))
}

watch(events, () => {
  saveEventsToLocalStorage()
}, {deep: true})

const loadEventsFromLocalStorage = () => {
  const stored = localStorage.getItem('calendar-events')
  if (stored) {
    events.value = JSON.parse(stored)
  }
}
//ローカルストレージから呼び出す
onMounted(loadEventsFromLocalStorage)

const deleteEvent = (index) => {
  const date = selectedDate.value
  if (events.value[date] && events.value[date].length > index) {
    events.value[date].splice(index, 1)
  }
  saveEventsToLocalStorage()
}

const editEvent = ref(null)
const editText = ref('')

const startEdit = (index, event) => {
  editEvent.value = index
  editText.value = event
}

const saveEdit = (index) => {
  if (editText.value.trim()) {
    events.value[selectedDate.value][index] = editText.value.trim()
    saveEventsToLocalStorage()
  }
  cancelEdit()
}

const cancelEdit = () => {
  editEvent.value = null
  editText.value = ''
}
</script>

<template>
  <div class="calendar-app">
    <h1>カレンダー予定管理</h1>
    <h2>{{ todayYear }}年</h2>
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
        >{{ day }}</div>
      </div>

      <div v-if="selectedDate && selectedMonth === month">
        <div class="form">
          <h3>{{ selectedDate }}の予定</h3>
          <input 
            v-model="newEvent"
            placeholder="予定を入力してね"
            @keyup.enter="addEvent"
          />
          <button @click="addEvent">追加</button>
          <ul>
            <li
              v-for="(event, index) in events[selectedDate] || []"
              :key="index"
              @click="startEdit(index, event)"
            >
              <div v-if="editEvent === index">
                <input
                  v-model="editText"
                  @keyup.enter="saveEdit(index)"
                  @blur="cancelEdit"
                  autofocus
                />
              </div>
              <div v-else>
                {{ event }}
                <button @click.stop="deleteEvent(index)">削除</button>
              </div>
            </li> 
          </ul>
        </div>
      </div>
    </div>
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
  padding: 5px 10px 50px 10px;
  cursor: pointer;
  background-color: lightcyan;
  border: 1px solid cyan;
}
.day:hover {
  background-color: rgb(180, 255, 255);
}
.empty {
  background-color: white;
  border: none;
}
.empty:hover {
  background-color: white;
}
.form {
  margin-top: 50px;
  padding: 10px 30px;
  background-color: white;
  border: 1px solid cyan;
}
button {
  margin-left: 20px;
  padding: 4px 7px;
  border-radius: 50%;
  background-color: rgb(180, 255, 255);
  border: none;
  box-shadow: 5px 5px 15px -10px;
}
button:active {
  position: relative;
  top: 2px;
  box-shadow: none;
}
input {
  padding: 10px;
  background-color: lightcyan;
  border: 1px solid cyan;
}
</style>