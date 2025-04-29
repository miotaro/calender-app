<script setup>
import { ref, watch, onMounted, computed, defineProps, defineEmits } from 'vue'
import EventCard from './EventCard.vue'

//propsとemitを受け取る
const props = defineProps({
  events: Object,
  selectedDate: String,
  selectedMonth: Number,
  month: Number,
  isModalOpen: Boolean
})
const emit = defineEmits(['update-events'])

const newEvent = ref('')
const newEventCategory = ref('仕事')
const newEventEndDate = ref('')
const newEventTimeType = ref(true) //終日はtrue、時間指定はfalse
const newEventStartTime = ref('')
const newEventEndTime = ref('')

const toggleTimeType = () => {
  newEventTimeType.value = !newEventTimeType.value
}

const toggleTimeTypeText = computed(() => {
  return newEventTimeType.value ? '時間指定' : '終日' 
})
 
const addEvent = () => {
  const text = newEvent.value.trim()
  const startD = props.selectedDate
  const endD = newEventEndDate.value || startD
  const type = newEventTimeType.value
  const startT = newEventStartTime.value
  const endT = newEventEndTime.value

  if (!text || !startD) return

  const updateEvents = { ...props.events }
  if (!updateEvents[startD]) {
    updateEvents[startD] = []
  }

  updateEvents[startD].push({
    startDate: startD,
    endDate: endD,
    text,
    status: '未着手',
    category: newEventCategory.value,
    timeType: type,
    ...(type === false && { startTime: startT, endTime: endT })
  })

  emit('update-events', updateEvents)

  newEvent.value = ''
  newEventEndDate.value = ''
  newEventStartTime.value = ''
  newEventEndTime.value = ''
  saveEventsToLocalStorage(updateEvents)
}

const saveEventsToLocalStorage = (data) => {
  localStorage.setItem('calendar-events', JSON.stringify(data))
}

watch(() => props.events, (newEvents) => {
  saveEventsToLocalStorage(newEvents)
}, {deep: true})

const loadEventsFromLocalStorage = () => {
  const stored = localStorage.getItem('calendar-events')
  if (stored) {
    emit('update-events', JSON.parse(stored))
  }
}
//ローカルストレージから呼び出す
onMounted(loadEventsFromLocalStorage)

// 日本語入力中は保存しない
const handleEnter = (e) => {
  // IME（日本語変換）中でなければ保存
  if (e.isComposing === false) {
    addEvent()
  }
}

const handleUpdateEvents = (updateEvents) => {
  emit('update-events', updateEvents)
}

const selectedCategoryFilter = ref('全て')
const selectedStatusFilter = ref('全て')
</script>

<template>
  <div v-if="selectedDate && selectedMonth === month && isModalOpen" class="modal-overlay">
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
        <div v-else>
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

      <div class="events">
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

        <EventCard
          :events="events"
          :selectedDate="selectedDate"
          :selectedCategoryFilter="selectedCategoryFilter"
          :selectedStatusFilter="selectedStatusFilter"
          @update-events="handleUpdateEvents"
        />

      </div>
    </div>
  </div>
</template>

<style>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.form {
  padding: 20px; 
  border: 1px solid cyan;
  background-color: white;
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
</style>