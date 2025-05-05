<script setup>
import { ref, defineProps, computed } from 'vue';
import { useEventsStore } from '@/stores/useEventsStore'
import { selectedDateStore } from '@/stores/selectedDateStore'
import { storeToRefs } from 'pinia'

const eventStore = useEventsStore()
const { events } = storeToRefs(eventStore)
const dateStore = selectedDateStore()
const { selectedDate } = storeToRefs(dateStore)

const props = defineProps({
  selectedCategoryFilter: String,
  selectedStatusFilter: String,
})

const saveEdit = (event) => {
  event.text = editText.value.trim()
  if (event.timeType === false) {
    event.startTime = editStartTime.value
    event.endTime = editEndTime.value
  }
  eventStore.updateEvent(event)
  cancelEdit()
}

const deleteEvent = (event) => {
  eventStore.deleteEvent(event)
}

const cancelEdit = () => {
  editEvent.value = null
  editText.value = ''
  editStartTime.value = ''
  editEndTime.value = ''
}

const editEvent = ref(null)
const editText = ref('')
const editStartTime = ref('')
const editEndTime = ref('')

const filterEvents = computed(() => {
  if (!events.value[selectedDate.value]) return []
  if (props.selectedCategoryFilter === '全て' && props.selectedStatusFilter === '全て') {
    return events.value[selectedDate.value]
  }
  return events.value[selectedDate.value].filter(event => {
    const categoryMatch =
      props.selectedCategoryFilter === '全て' || event.category === props.selectedCategoryFilter
    const statusMatch =
      props.selectedStatusFilter === '全て' || event.status === props.selectedStatusFilter
    return categoryMatch && statusMatch
  })
})

const startEdit = (event) => {
  editEvent.value = event
  editText.value = event.text
  editStartTime.value = event.startTime || ''
  editEndTime.value = event.endTime || ''
}

</script>

<template>
<ul>
  <li
    v-for="(event, index) in filterEvents"
    :key="event.text + index"
    @click="startEdit(event)"
  >
    <div v-if="editEvent === event">
      <input v-model="editText" @keyup.enter="saveEdit(event)" />
      <span v-if="!event.timeType">
        <input type="time" v-model="editStartTime" @keyup.enter="saveEdit(event)" />
        〜
        <input type="time" v-model="editEndTime" @keyup.enter="saveEdit(event)" />
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
      <button @click.stop="deleteEvent(event)">削除</button>
    </div>
  </li> 
</ul>
</template>

<style>
li {
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
  color: white;
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