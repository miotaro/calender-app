import { defineStore, storeToRefs } from 'pinia'
import { ref } from 'vue'
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

  const API_URL = 'https://json-server-project-fvmc.onrender.com/events'
   
  //APIからデータの取得(GET)
  const fetchEvents = async () => {
    try {
      const res = await fetch(API_URL)
      const data = await res.json()

      const grouped = {}
      data.forEach(event => {
        const date = event.startDate
        if (!grouped[date]) grouped[date] = []
        grouped[date].push(event)
      })
      events.value = grouped
    } catch (error) {
      console.error('予定取得失敗', error)
    }
  }

  //APIにデータを保存(POST) 、state更新
  const addEvent = async () => {
    const text = newEvent.value.trim()
    const startD = selectedDate.value
    const endD = newEventEndDate.value || startD
    const type = newEventTimeType.value
    const category = newEventCategory.value
    const startT = newEventStartTime.value
    const endT = newEventEndTime.value
  
    if (!text || !startD) return
  
    const eventObj = {
      startDate: startD,
      endDate: endD,
      text,
      status: '未着手',
      category: category,
      timeType: type,
      ...(type === false && { startTime: startT, endTime: endT })
    }

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventObj)
      })
      const savedEvent = await res.json()

      if (!events.value[startD]) {
        events.value[startD] = []
      }
      events.value[startD].push(savedEvent)

      newEvent.value = ''
      newEventEndDate.value = ''
      newEventStartTime.value = ''
      newEventEndTime.value = ''
    } catch (error) {
      console.log.error('予定保存失敗', error)
    }
  }

  const deleteEvent = async (event) => {
    try {
      await fetch(`${API_URL}/${event.id}`, {method: 'DELETE'})
      const date = event.startDate
      events.value[date] = events.value[date].filter(e => e.id !== event.id)
    } catch (error) {
      console.error('削除失敗:', error)
    }
  }
  
  const updateEvent = async (event) => {
    try {
      const res = await fetch(`${API_URL}/${event.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      })
      const updated = await res.json()
      const date = updated.startDate
      const idx = events.value[date].findIndex(e => e.id === event.id)
      if (idx !== -1) {
        events.value[date][idx] = updated
      }
    } catch (error) {
      console.error('更新失敗:', error)
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
    addEvent,
    fetchEvents,
    deleteEvent,
    updateEvent
  }
})
