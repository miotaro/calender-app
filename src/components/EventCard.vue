<script setup>
import { ref, defineProps, defineEmits, computed } from 'vue';

const props = defineProps({
  events: Object,
  selectedDate: String,
  selectedCategoryFilter: String,
  selectedStatusFilter: String
})

const editEvent = ref(null)
const editText = ref('')
const editStartTime = ref('')
const editEndTime = ref('')

const emit = defineEmits(['update-events'])

const startEdit = (index, event) => {
  editEvent.value = index
  editText.value = event.text
  editStartTime.value = event.startTime || ''
  editEndTime.value = event.endTime || ''
}

const saveEdit = (index) => {
  if (editText.value.trim()) {
    const event = props.events[props.selectedDate][index]
    event.text = editText.value.trim()
    if (event.timeType === false) {
      event.startTime = editStartTime.value
      event.endTime = editEndTime.value
    }
    emit('update-events', props.events)
    saveEventsToLocalStorage(props.events)
  }
  cancelEdit()
}

const deleteEvent = (index) => {
  const date = props.selectedDate
  if (props.events[date] && props.events[date].length > index) {
    props.events[date].splice(index, 1)
  }
  emit('update-events', props.events)
  saveEventsToLocalStorage(props.events)
}

const cancelEdit = () => {
  editEvent.value = null
  editText.value = ''
  editStartTime.value = ''
  editEndTime.value = ''
}

const filterEvents = computed(() => {
  if (!props.events[props.selectedDate]) return []
  if (props.selectedCategoryFilter === '全て' && props.selectedStatusFilter === '全て') {
    return props.events[props.selectedDate]
  }
  return props.events[props.selectedDate].filter(event => {
    const categoryMatch =
      props.selectedCategoryFilter === '全て' || event.category === props.selectedCategoryFilter
    const statusMatch =
      props.selectedStatusFilter === '全て' || event.status === props.selectedStatusFilter
    return categoryMatch && statusMatch
  })
})

const saveEventsToLocalStorage = (data) => {
  localStorage.setItem('calendar-events', JSON.stringify(data))
}
</script>

<template>
<ul>
  <li
    v-for="(event, index) in filterEvents"
    :key="event.text + index"
    @click="startEdit(index, event)"
    class="status"
  >
    <div v-if="editEvent === index">
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
</template>

<style>
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