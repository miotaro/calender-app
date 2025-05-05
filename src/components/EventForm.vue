<script setup>
import { ref, onMounted, computed } from 'vue'
import { useEventsStore } from '@/stores/useEventsStore'
import { selectedDateStore } from '@/stores/selectedDateStore'
import { storeToRefs } from 'pinia'
import EventCard from './EventCard.vue'

const eventStore = useEventsStore()
const { newEventTimeType } = storeToRefs(eventStore)
const dateStore = selectedDateStore()
const { selectedDate } = storeToRefs(dateStore)

const selectedCategoryFilter = ref('全て')
const selectedStatusFilter = ref('全て')

const inputRef = ref(null)
onMounted(() => {
  if (inputRef.value) {
    inputRef.value.focus()
  }
})

const toggleTimeType = () => {
    newEventTimeType.value = !newEventTimeType.value
  }
  const toggleTimeTypeText = computed(() => {
    return newEventTimeType.value ? '時間指定' : '終日' 
  })

  const handleEnter = (e) => {
    // IME（日本語変換）中でなければ保存
    if (e.isComposing === false) {
      eventStore.addEvent()
    }
  }

</script>

<template>
  <div class="modal">
    <div class="form">
      <h3>{{ selectedDate }}の予定</h3>
      <div class="text-form">
        <input 
          v-model="eventStore.newEvent"
          ref="inputRef"
          placeholder="予定を入力してね"
          @keydown.enter.exact.prevent="handleEnter"
        />
        <button @click="toggleTimeType()">{{ toggleTimeTypeText }}</button>
        <div v-if="eventStore.newEventTimeType">
          <div class="event-date-time">
            終了日
            <input type="date" v-model="eventStore.newEventEndDate" placeholder="終了日"/>
          </div>
        </div>
        <div v-else>
          <div class="event-date-time">
            開始時間
            <input type="time" v-model="eventStore.newEventStartTime" placeholder="開始時間" />
            終了時間
            <input type="time" v-model="eventStore.newEventEndTime" placeholder="終了時間" />
          </div>
        </div>
        <select v-model="eventStore.newEventCategory">
          <option value="仕事">仕事</option>
          <option value="プライベート">プライベート</option>
          <option value="健康">健康</option>
          <option value="趣味">趣味</option>
        </select>
        <button @click="eventStore.addEvent()">追加</button>
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
          :selectedCategoryFilter="selectedCategoryFilter"
          :selectedStatusFilter="selectedStatusFilter"
        />

      </div>
    </div>
  </div>
</template>

<style>
.modal {
  display: flex;
  align-items: center;
  justify-content: center;
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