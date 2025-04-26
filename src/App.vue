<script setup>
import { ref, watch, onMounted, computed } from 'vue'

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

const events = ref({
  startDate: '',
  endDate: '',
  text: '',
  status: '',
  category: ''
})
const selectedDate = ref('')
const selectedMonth = ref(null)
const newEvent = ref('')
const newEventCategory = ref('仕事')
const newEventEndDate = ref('')

const formatDate = (year, month, day) => {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

const selectDate = (month, day) => {
  const clickedDate = formatDate(todayYear.value, month, day)

  if (selectedDate.value === clickedDate) {
    selectedDate.value = ''
    selectedMonth.value = null
  } else {
    selectedDate.value = clickedDate
    selectedMonth.value = month
  }
}

const addEvent = () => {
  const text = newEvent.value.trim()
  const start =selectedDate.value
  const end = newEventEndDate.value || start

  if (!text || !start || !selectedDate.value) return
  if (!events.value[selectedDate.value]) {
    events.value[selectedDate.value] = []
  }
  events.value[selectedDate.value].push({
    startDate: start,
    endDate: end,
    text: text,
    status: "未着手",
    category: newEventCategory.value
  })
  newEvent.value = ''
  newEventEndDate.value = ''
  saveEventsToLocalStorage()
}

const getEventsForDate = (year, month, day) => {
  const date = formatDate(year, month, day)
  const allEvents = Object.values(events.value).flat()
  return allEvents.filter(event => {
    return date >= event.startDate && date <= event.endDate
  })
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
  editText.value = event.text
}

const saveEdit = (index) => {
  if (editText.value.trim()) {
    events.value[selectedDate.value][index].text = editText.value.trim()
    saveEventsToLocalStorage()
  }
  cancelEdit()
}

const cancelEdit = () => {
  editEvent.value = null
  editText.value = ''
}

const selectedCategoryFilter = ref('全て')
const selectedStatusFilter = ref('全て')

const filterEvents = computed(() => {
  if (!events.value[selectedDate.value]) return []
  if (selectedCategoryFilter.value === '全て' && selectedStatusFilter.value === '全て') {
    return events.value[selectedDate.value]
  }
  return events.value[selectedDate.value].filter(event => {
    const categoryMatch =
      selectedCategoryFilter.value === '全て' || event.category === selectedCategoryFilter.value
    const statusMatch =
      selectedStatusFilter.value === '全て' || event.status === selectedStatusFilter.value
    return categoryMatch && statusMatch
  })
})

// スクリプトに追加
const handleEnter = (e) => {
  // IME（日本語変換）中でなければ保存
  if (e.isComposing === false) {
    addEvent()
  }
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
        >{{ day }}
          <div v-if="getEventsForDate(todayYear, month, day).length > 0">
            <div
              v-for="event in getEventsForDate(todayYear, month, day)"
              :key="event.text"
              :class="`event-preview category-${getEventsForDate(todayYear, month, day)[0].category}`"
            >{{ event.text }}</div>
          </div>
        </div>
      </div>

      <div v-if="selectedDate && selectedMonth === month">
        <div class="form">
          <h3>{{ selectedDate }}の予定</h3>
          <input 
            v-model="newEvent"
            placeholder="予定を入力してね"
            @keydown.enter.exact.prevent="handleEnter"
          />
          <input
            type="date" v-model="newEventEndDate" placeholder="終了日"
            class="end-date"
          />
          <select v-model="newEventCategory">
            <option value="仕事">仕事</option>
            <option value="プライベート">プライベート</option>
            <option value="健康">健康</option>
            <option value="趣味">趣味</option>
          </select>
          <button @click="addEvent">追加</button>

          <ul v-if="filterEvents.length > 0" class="events">
            <label>カテゴリで絞り込み</label>
            <select v-model="selectedCategoryFilter">
              <option value="全て">全て</option>
              <option value="仕事">仕事</option>
              <option value="プライベート">プライベート</option>
              <option value="健康">健康</option>
              <option value="趣味">趣味</option>
            </select>
            <label>ステータスで絞り込み</label>
            <select v-model="selectedStatusFilter">
              <option value="全て">全て</option>
              <option value="未着手">未着手</option>
              <option value="進行中">進行中</option>
              <option value="完了">完了</option>
            </select>
            <li
              v-for="(event, index) in filterEvents"
              :key="index"
              @click="startEdit(index, event)"
              :class="`status status-${event.status}`"
            >
              <div v-if="editEvent === index">
                <input
                  v-model="editText"
                  @keyup.enter="saveEdit(index)"
                  @blur="cancelEdit"
                  autofocus
                />
              </div>
              <div v-else class="event">
                <div :class="`category category-${event.category}`"></div>
                <div class="text">{{ event.text }}</div>
                <select v-model="event.status" @change="saveEventsToLocalStorage" @click.stop>
                  <option value="未着手">未着手</option>
                  <option value="進行中">進行中</option>
                  <option value="完了">完了</option>
                </select>
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
  height: 100px;
  padding: 5px 10px;
  cursor: pointer;
  background-color: lightcyan;
  border: 1px solid cyan;
}
.day:hover {
  background-color: rgb(180, 255, 255);
}
.event-preview {
  border-radius: 5px;
  padding: 5px;
  line-height: 15px;
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
  padding: 30px 30px;
  background-color: white;
  border: 1px solid cyan;
}
.event {
  display: flex;
}
button {
  margin-left: 20px;
  padding: 4px 7px;
  border-radius: 50%;
  background-color: rgb(180, 255, 255);
  border: none;
  box-shadow: 5px 5px 15px -10px;
}
button:hover {
  background-color: lightcyan;
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
.text {
  flex: 1;
  margin-left: 10px;
}
select {
  background-color: lightcyan;
  border: 1px solid cyan;
  margin-left: 20px;
  padding: 2px 7px;
}
select:hover {
  background-color: rgb(180, 255, 255);
}
.status {
  list-style: none;
}
.status-進行中 {
  font-weight: bold;
  color: red;
}
.status-完了 {
  color: rgb(190, 188, 188);
  text-decoration: line-through;
}
.events {
  background-color: lightcyan;
  margin-top: 50px;
  padding: 30px 50px;
  border: 1px solid cyan;
}
.events label {
  display: inline-block;
  margin: 0 0 30px 10px;
  border-bottom: 1px solid cyan;
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
  background-color: lightgreen;
}

</style>