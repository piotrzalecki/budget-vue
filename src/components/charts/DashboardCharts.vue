<template>
  <div>
    <v-row dense>
      <v-col cols="12" sm="4">
        <v-card class="pa-4">
          <div class="d-flex align-center">
            <v-icon class="mr-2" color="error">mdi-cash-minus</v-icon>
            <div>
              <div class="text-caption text-muted">Total Spend</div>
              <div class="text-h6 text-error">
                {{ moneyFormat(parseFloat(currentMonth?.total_out || '0') * 100) }}
              </div>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card class="pa-4">
          <div class="d-flex align-center">
            <v-icon class="mr-2" color="success">mdi-cash-plus</v-icon>
            <div>
              <div class="text-caption text-muted">Total Income</div>
              <div class="text-h6 text-success">
                {{ moneyFormat(parseFloat(currentMonth?.total_in || '0') * 100) }}
              </div>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card class="pa-4" :class="{ 'bg-error': daysUntilPayday < 5 }">
          <div class="d-flex align-center">
            <v-icon class="mr-2" :color="daysUntilPayday < 5 ? 'white' : 'primary'"
              >mdi-calendar-clock</v-icon
            >
            <div>
              <div class="text-caption" :class="daysUntilPayday < 5 ? 'text-white' : 'text-muted'">
                Days until payday
              </div>
              <div class="text-h6" :class="daysUntilPayday < 5 ? 'text-white' : 'text-primary'">
                {{ daysUntilPayday }}
              </div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-row dense class="mt-4">
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Spend by Tag</v-card-title>
          <v-card-text>
            <vue-echarts :option="pieOption" style="height: 260px" :loading="loading" />
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Net Cash Flow (6 Months)</v-card-title>
          <v-card-text>
            <vue-echarts :option="barOption" style="height: 240px" :loading="loading" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
  import { useMoneyFormat } from '@/composables/useMoneyFormat'
  import { useReportsStore, type MonthlyReport } from '@/stores/reports'
  import { useSettingsStore } from '@/stores/settings'
  import { BarChart, PieChart } from 'echarts/charts'
  import {
    GridComponent,
    LegendComponent,
    TitleComponent,
    TooltipComponent,
  } from 'echarts/components'
  import { use } from 'echarts/core'
  import { CanvasRenderer } from 'echarts/renderers'
  import { computed, onMounted, ref, watch } from 'vue'
  import VueEcharts from 'vue-echarts'
  import { useTheme } from 'vuetify'

  // Register ECharts components
  use([
    CanvasRenderer,
    PieChart,
    BarChart,
    TitleComponent,
    TooltipComponent,
    LegendComponent,
    GridComponent,
  ])

  const theme = useTheme()
  const reportsStore = useReportsStore()
  const settingsStore = useSettingsStore()
  const moneyFormat = useMoneyFormat()

  const currentMonth = ref<MonthlyReport | null>(null)
  const lastSixMonths = ref<MonthlyReport[]>([])

  const loading = computed(() => reportsStore.loading)
  const daysUntilPayday = computed(() => settingsStore.getDaysUntilPayday())

  // Generate color palette based on theme
  const getColorPalette = () => {
    const isDark = theme.current.value.dark
    return isDark
      ? ['#6A9A55', '#FFA556', '#5392FF', '#4BB362', '#F1676C', '#FFC349', '#8B5CF6', '#06B6D4']
      : ['#4D7041', '#FF8B32', '#1F6FFF', '#3F8E4D', '#E5484D', '#FFB100', '#7C3AED', '#0891B2']
  }

  // Pie chart option for spend by tag
  const pieOption = computed(() => {
    if (!currentMonth.value?.by_tag) {
      return {
        tooltip: { trigger: 'item' },
        series: [
          {
            type: 'pie',
            radius: ['40%', '70%'],
            data: [],
            color: getColorPalette(),
          },
        ],
      }
    }

    // Convert by_tag object to array and filter expenses
    const data = Object.entries(currentMonth.value.by_tag)
      .filter(([tag, data]) => {
        // Check if total_out exists and is greater than 0
        const totalOut = parseFloat(data.total_out || '0')
        return totalOut > 0
      })
      .map(([tag, data]) => ({
        name: tag,
        value: parseFloat(data.total_out || '0') * 100, // Convert to pence
      }))

    return {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          return `${params.name}: ${moneyFormat(params.value)}`
        },
      },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          data,
          color: getColorPalette(),
        },
      ],
    }
  })

  // Bar chart option for net cash flow
  const barOption = computed(() => {
    if (!lastSixMonths.value.length) {
      return {
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: [] },
        yAxis: { type: 'value' },
        series: [],
      }
    }

    const months = lastSixMonths.value.map((report, index) => {
      // Generate month names for the last 6 months
      const today = new Date()
      const date = new Date(today.getFullYear(), today.getMonth() - (5 - index), 1)
      return date.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })
    })

    // Convert string amounts to pence
    const incomeData = lastSixMonths.value.map(report => parseFloat(report.total_in || '0') * 100)
    const expenseData = lastSixMonths.value.map(report => parseFloat(report.total_out || '0') * 100)

    return {
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const income = params[0]?.value || 0
          const expense = params[1]?.value || 0
          const net = income - expense
          return `${params[0]?.axisValue}<br/>
                Income: ${moneyFormat(income)}<br/>
                Expense: ${moneyFormat(expense)}<br/>
                Net: ${moneyFormat(net)}`
        },
      },
      legend: {
        data: ['Income', 'Expense'],
      },
      xAxis: {
        type: 'category',
        data: months,
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: (value: number) => moneyFormat(value),
        },
      },
      series: [
        {
          name: 'Income',
          type: 'bar',
          stack: 'total',
          data: incomeData,
          itemStyle: { color: theme.current.value.colors.success },
        },
        {
          name: 'Expense',
          type: 'bar',
          stack: 'total',
          data: expenseData,
          itemStyle: { color: theme.current.value.colors.error },
        },
      ],
    }
  })

  const fetchData = async () => {
    try {
      const today = new Date()
      const currentYM = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`

      // Fetch current month for pie chart and stat tiles
      const currentMonthResponse = await reportsStore.fetchMonth(currentYM)

      // Extract the actual data from the response
      currentMonth.value = currentMonthResponse.data || currentMonthResponse

      // Fetch last 6 months totals for bar chart
      const months = []
      for (let i = 5; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
        const ym = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        months.push(ym)
      }

      const promises = months.map(ym => reportsStore.fetchMonthTotals(ym))
      const results = await Promise.all(promises)

      // Extract data from each response
      lastSixMonths.value = results.map(response => response.data || response)
    } catch (error) {
      // Handle error silently or implement proper error handling
    }
  }

  onMounted(async () => {
    settingsStore.loadFromStorage()
    await fetchData()
  })

  // Watch for theme changes to update chart colors
  watch(
    () => theme.current.value.dark,
    () => {
      // Force chart re-render when theme changes
    },
    { immediate: true }
  )
</script>
