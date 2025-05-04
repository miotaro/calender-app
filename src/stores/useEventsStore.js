import { defineStore, storeToRefs } from 'pinia'
import { ref, computed, watch, onMounted } from 'vue'
import { selectedDateStore } from '@/stores/selectedDateStore'

export const useEventsStore = defineStore('event', () => {
  const dateStore = selectedDateStore()
  const { selectedDate } = storeToRefs(dateStore)

  const events = ref({})

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
    const startD = selectedDate.value
    const endD = newEventEndDate.value || startD
    const type = newEventTimeType.value
    const startT = newEventStartTime.value
    const endT = newEventEndTime.value
  
    if (!text || !startD) return
  
    const updateEvents = { ...events.value }
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
  
    newEvent.value = ''
    newEventEndDate.value = ''
    newEventStartTime.value = ''
    newEventEndTime.value = ''
    saveEventsToLocalStorage(updateEvents)
    events.value = updateEvents
  }
  
  const saveEventsToLocalStorage = (data) => {
    localStorage.setItem('calendar-events', JSON.stringify(data))
  }
  
  watch(() => events.value, (newEvents) => {
    saveEventsToLocalStorage(newEvents)
  }, {deep: true})
  
  const loadEventsFromLocalStorage = () => {
    const stored = localStorage.getItem('calendar-events')
    if (stored) {
      events.value = JSON.parse(stored)
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
  return {
    events,
    newEvent,
    newEventCategory,
    newEventEndDate,
    newEventTimeType,
    newEventStartTime,
    newEventEndTime,
    toggleTimeType,
    toggleTimeTypeText,
    addEvent,
    handleEnter,
  }
})
