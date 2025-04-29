<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  event: Object
})
</script>

<template>
<div
  :class="[
    event.timeType ? `event-preview category-${event.category}` : `event-preview time-category-${event.category}`]"
>{{ event.text }}</div>
</template>

<style>
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