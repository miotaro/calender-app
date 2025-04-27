<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import draggable from 'vuedraggable'

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
  category: '',
  timeType: '',
  startTime: '',
  endTime: '',
})
const selectedDate = ref('')
const selectedMonth = ref(null)
const newEvent = ref('')
const newEventCategory = ref('仕事')
const newEventEndDate = ref('')
const newEventTimeType = ref(true) //終日はtrue、時間指定はfalse
const newEventStartTime = ref('')
const newEventEndTime = ref('')

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

const toggleTimeType = () => {
  newEventTimeType.value = !newEventTimeType.value
}

const toggleTimeTypeText = computed(() => {
  return newEventTimeType.value ? '時間指定' : '終日' 
})
 
const addEvent = () => {
  const text = newEvent.value.trim()
  const startD =selectedDate.value
  const endD = newEventEndDate.value || startD
  const type = newEventTimeType
  const startT = newEventStartTime
  const endT = newEventEndTime

  if (!text || !startD || !selectedDate.value) return
  if (!events.value[selectedDate.value]) {
    events.value[selectedDate.value] = []
  }
  if (type.value === true) {
    events.value[selectedDate.value].push({
    startDate: startD,
    endDate: endD,
    text: text,
    status: "未着手",
    category: newEventCategory.value,
    timeType: type
    })
  } else if (type.value === false) {
    events.value[selectedDate.value].push({
    startDate: startD,
    endDate: endD,
    text: text,
    status: "未着手",
    category: newEventCategory.value,
    timeType: type,
    startTime: startT,
    endTime: endT
    })
  }
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
const editStartTime = ref('')
const editEndTime = ref('')

const startEdit = (index, event) => {
  editEvent.value = index
  editText.value = event.text
  editStartTime.value = event.startTime || ''
  editEndTime.value = event.endTime || ''
}

const saveEdit = (index) => {
  if (editText.value.trim()) {
    const event = events.value[selectedDate.value][index]
    event.text = editText.value.trim()
    if (event.timeType === false) {
      event.startTime = editStartTime.value
      event.endTime = editEndTime.value
    }
    saveEventsToLocalStorage()
  }
  cancelEdit()
}

const cancelEdit = () => {
  editEvent.value = null
  editText.value = ''
  editStartTime.value = ''
  editEndTime.value = ''
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

// 日本語入力中は保存しない
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
              :class="[
                event.timeType ? `event-preview category-${event.category}` : `event-preview time-category-${event.category}`]"
            >{{ event.text }}</div>
          </div>
        </div>
      </div>

      <div v-if="selectedDate && selectedMonth === month">
        <div class="form">
          <h3>{{ selectedDate }}の予定</h3>
          <div class="text-form">
            <input 
              v-model="newEvent"
              placeholder="予定を入力してね"
              @keydown.enter.exact.prevent="handleEnter"
            />
            <button @click="toggleTimeType()">{{ toggleTimeTypeText }}</button>
            <div v-if="newEventTimeType">
              <div class="event-date-time">
                終了日
                <input type="date" v-model="newEventEndDate" placeholder="終了日"/>
              </div>
            </div>
            <div v-else="!newEventTimeType">
              <div class="event-date-time">
                開始時間
                <input type="time" v-model="newEventStartTime" placeholder="開始時間" />
                終了時間
                <input type="time" v-model="newEventEndTime" placeholder="終了時間" />
              </div>
            </div>
            <select v-model="newEventCategory">
              <option value="仕事">仕事</option>
              <option value="プライベート">プライベート</option>
              <option value="健康">健康</option>
              <option value="趣味">趣味</option>
            </select>
            <button @click="addEvent">追加</button>
          </div>

          <ul class="events">
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
              :key="event.text + index"
              @click="startEdit(index, event)"
              :class="status"
            >
              <div 
                v-if="editEvent === index">
                <input v-model="editText" @keyup.enter="saveEdit(index)" />
                <span v-if="!event.timeType">
                  <input type="time" v-model="editStartTime" @keyup.enter="saveEdit(index)" />
                  〜
                  <input type="time" v-model="editEndTime" @keyup.enter="saveEdit(index)" />
                </span>
              </div>
              <div v-else class="text-form">
                <div :class="`category category-${event.category}`"></div>
                <div class="text">
                  <span :class="`status-${event.status}`">{{ event.text }}</span>
                  <span v-if="!event.timeType" class="event-date-time">
                    {{ event.startTime }} 〜 {{ event.endTime }}
                  </span>
                </div>
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
.form {
  margin-top: 50px;
  padding: 30px 30px;
  background-color: white;
  border: 1px solid cyan;
}
.text-form {
  display: flex;
  margin-bottom: 5px;
}
.event-date-time {
  color: gray;
  font-size: 13px;
  margin-left: 20px;
}
button {
  margin-left: 10px;
  padding: 4px 7px;
  border-radius: 5px;
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
input:hover {
  background-color: rgb(180, 255, 255);
}
.text-form {
  display: flex;
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