<script setup>
import { ref, watch, onMounted } from 'vue'

// 今日の日付
const today = new Date()

// 現在の年・月
const currentYear = ref(today.getFullYear())
const currentMonth = ref(today.getMonth())

// 月の日数を取得
const getDaysInMonth = (year, month) => {
  const days = new Date(year, month + 1, 0).getDate()
  return Array.from({ length: days }, (_, i) => i + 1)
}

// 予定管理用
const events = ref({})
const selectedDate = ref('')
const selectedMonth = ref(null)
const newEvent = ref('')

//モーダル
const isModalVisible = ref(false)

// 日付フォーマット
const formatDate = (year, month, day) => {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

// 日付クリック時
const selectDate = (month, day) => {
  selectedDate.value = formatDate(currentYear.value, month, day)
  selectedMonth.value = month
  isModalVisible.value = true
}

// 予定追加
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

// 月リスト
const months = Array.from({ length: 12 }, (_, i) => i)

// 曜日表示
const weekDays = ['日', '月', '火', '水', '木', '金', '土']

//月の初めの曜日を取得
const getFirstDayOfMonth = (year, month) => {
  return new Date(year, month, 1).getDay()
}

//ローカルストレージに保存
const saveEventsToLocalStorage = () => {
  localStorage.setItem('calendar-events', JSON.stringify(events.value))
}

//読み込み
const loadEventsFromLocalStorage = () => {
  const stored = localStorage.getItem('calendar-events')
  if (stored) {
    events.value = JSON.parse(stored)
  }
}
onMounted(loadEventsFromLocalStorage)

//変更を監視して保存する
watch(events, () => {
  saveEventsToLocalStorage()
}, {deep: true})

//予定を削除
const deleteEvent = (index) => {
  const date = selectedDate.value
  if (events.value[date] && events.value[date].length > index) {
    events.value[date].splice(index, 1)
  }
  saveEventsToLocalStorage()
}

//ここから編集機能--------------------------------------------------
const editingEvent = ref(null)
const editingText = ref('')

const startEdit = (index, event) => {
  editingEvent.value = index
  editingText.value = event
}

const saveEdit = (index) => {
  if (editingText.value.trim()) {
    events.value[selectedDate.value][index] = editingText.value.trim()
    saveEventsToLocalStorage()
  }
  cancelEdit()
}

const cancelEdit = () => {
  editingEvent.value = null
  editingText.value = ''
}

</script>


<template>
  <div class="calendar-app">
    <h1>カレンダー予定管理</h1>

    <div v-for="month in months" :key="month" class="month-block">
      <h2>{{ month + 1 }}月</h2>

      <div class="weekdays">
        <div v-for="(day, index) in weekDays" :key="index" class="weekday">
          {{ day }}
        </div>
      </div>

      <div class="calendar">
        <div
        v-for="n in getFirstDayOfMonth(currentYear, month)"
        :key="'blank-' + month + '-' + n"
        class="day empty"
        ></div>

        <div
          class="day"
          v-for="day in getDaysInMonth(currentYear, month)"
          :key="month + '-' + day"
          @click="selectDate(month, day)"
        >
          <strong>{{ day }}</strong>
          <span v-if="events[formatDate(currentYear, month, day)]">♡</span>
          <ul>
            <li v-for="event in events[formatDate(currentYear.value, month, day)] || []" :key="event">
              {{ event }}
            </li>
          </ul>
        </div>
      </div>

      <div v-if="isModalVisible" class="modal-overlay" @click.self="isModalVisible = false">
        <div class="modal-content">
          <h3>{{ selectedDate }} の予定</h3>
          <input v-model="newEvent" placeholder="予定を入力" @keyup.enter="addEvent" />
          <button @click="addEvent">追加</button>
          <ul>
            <li 
              v-for="(event, index) in events[selectedDate] || []" 
              :key="index"
              @click.stop="startEdit(index, event)"
            >
              <template v-if="editingEvent === index">
                <input 
                  v-model="editingText" 
                  @keyup.enter="saveEdit(index)"
                  @blur="cancelEdit"
                  autofocus
                />
              </template>
              <template v-else>
                {{ event }}
                <button @click.stop="deleteEvent(index)">×</button>
              </template>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.calendar-app {
  max-width: 600px;
  margin: 0 auto;
  font-family: sans-serif;
}
.calendar {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  margin-bottom: 20px;
}
.day {
  background: #FFD5EC;
  border: 1px solid #FF97C2;
  padding: 8px;
  cursor: pointer;
}
.day:hover {
  background: #FF97C2;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}
.modal-content {
  background: linear-gradient(to left, #FF97C2, #FFD5EC);
  border-radius: 10px;
  padding: 20px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}
input {
  padding: 6px;
  margin-right: 6px;
}
button {
  margin-left: 10px;
  padding: 6px 10px;
  border-radius: 50%;
  border: none;
  background-color: #FFD5EC;
  box-shadow: 10px 10px 15px -10px;
}
button:hover {
  background-color: #FF97C2;
}
button:active {
  position: relative;
  top: 3px;
  box-shadow: none;
}
.event {
  font-size: 12px;
  margin-top: 4px;
}
.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-weight: bold;
  background-color: #f2f2f2;
  padding: 5px 0;
  margin-bottom: 8px;
}
.weekday {
  padding: 4px;
}
.empty {
  background: transparent;
  border: none;
  cursor: default;
}
.empty:hover {
  background-color: white;
}
</style>