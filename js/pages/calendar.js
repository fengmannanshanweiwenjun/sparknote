// 星火笔记 - Calendar Page
import { useContentStore } from '../stores/content.js';
import { useUiStore } from '../stores/ui.js';
import { icons } from '../components/layout.js';

export const CalendarPage = {
  name: 'CalendarPage',
  setup() {
    const { ref, computed } = Vue;
    const content = useContentStore();
    const ui = useUiStore();
    const today = new Date();
    const currentYear = ref(today.getFullYear());
    const currentMonth = ref(today.getMonth());
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];

    const monthName = computed(() => `${currentYear.value}年 ${currentMonth.value + 1}月`);

    const calendarDays = computed(() => {
      const firstDay = new Date(currentYear.value, currentMonth.value, 1);
      const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0);
      const startPad = firstDay.getDay();
      const days = [];
      // Previous month padding
      const prevLast = new Date(currentYear.value, currentMonth.value, 0);
      for (let i = startPad - 1; i >= 0; i--) {
        days.push({ day: prevLast.getDate() - i, current: false, date: new Date(currentYear.value, currentMonth.value - 1, prevLast.getDate() - i) });
      }
      // Current month
      for (let d = 1; d <= lastDay.getDate(); d++) {
        const date = new Date(currentYear.value, currentMonth.value, d);
        const isToday = d === today.getDate() && currentMonth.value === today.getMonth() && currentYear.value === today.getFullYear();
        days.push({ day: d, current: true, isToday, date });
      }
      // Next month padding
      const remaining = 42 - days.length;
      for (let d = 1; d <= remaining; d++) {
        days.push({ day: d, current: false, date: new Date(currentYear.value, currentMonth.value + 1, d) });
      }
      return days;
    });

    function getEventsForDay(date) {
      return content.items.filter(item => {
        if (!item.scheduledAt && !item.createdAt) return false;
        const d = new Date(item.scheduledAt || item.createdAt);
        return d.getDate() === date.getDate() && d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
      });
    }

    function prevMonth() {
      if (currentMonth.value === 0) { currentMonth.value = 11; currentYear.value--; }
      else currentMonth.value--;
    }
    function nextMonth() {
      if (currentMonth.value === 11) { currentMonth.value = 0; currentYear.value++; }
      else currentMonth.value++;
    }
    function goToToday() {
      currentYear.value = today.getFullYear();
      currentMonth.value = today.getMonth();
    }
    function createOnDate(date) {
      content.newDraft();
      ui.navigate('editor');
    }

    return { content, ui, weekdays, monthName, calendarDays, prevMonth, nextMonth, goToToday, createOnDate, getEventsForDay, icons };
  },
  template: `
    <div class="fade-in">
      <div class="calendar-header">
        <div class="calendar-nav">
          <button class="calendar-nav-btn" @click="prevMonth"><span v-html="icons.chevronLeft" style="width:16px;height:16px"></span></button>
          <span class="calendar-month">{{ monthName }}</span>
          <button class="calendar-nav-btn" @click="nextMonth"><span v-html="icons.chevronRight" style="width:16px;height:16px"></span></button>
          <button class="btn btn-sm btn-secondary" @click="goToToday" style="margin-left:8px">今天</button>
        </div>
        <button class="btn btn-primary" @click="content.newDraft(); ui.navigate('editor')">
          <span v-html="icons.plus" style="width:16px;height:16px"></span> 新建笔记
        </button>
      </div>

      <div class="calendar-grid">
        <div v-for="w in weekdays" :key="w" class="calendar-weekday">{{ w }}</div>
        <div v-for="(d, i) in calendarDays" :key="i" class="calendar-day"
          :class="{ 'other-month': !d.current, 'today': d.isToday }"
          @click="createOnDate(d.date)">
          <div class="calendar-day-num">{{ d.day }}</div>
          <div v-for="ev in getEventsForDay(d.date).slice(0, 3)" :key="ev.id" class="calendar-event" :class="ev.platform">
            {{ ev.title || '无标题' }}
          </div>
          <div v-if="getEventsForDay(d.date).length > 3" style="font-size:10px;color:var(--text-tertiary);padding:2px 6px">
            +{{ getEventsForDay(d.date).length - 3 }} 更多
          </div>
        </div>
      </div>
    </div>
  `
};
