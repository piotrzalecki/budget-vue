import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/styles'

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          /* core brand */
          primary: '#4D7041', // Olive-600  – buttons, links
          secondary: '#FF8B32', // Orange-500 – highlights, chips
          accent: '#1F6FFF', // Blue-500   – action icons, focus ring

          /* semantic */
          success: '#3F8E4D', // green-correct (income)
          error: '#E5484D', // red-error   (expenses)
          info: '#1F6FFF',
          warning: '#FFB100',

          /* surfaces */
          background: '#F5F7FA', // page canvas
          surface: '#FFFFFF', // cards / sheets

          /* text */
          onPrimary: '#FFFFFF',
          onSecondary: '#1C1C1C',
        },
        variables: {
          'border-radius-root': '8px',
          'overlay-opacity': 0.12,
        },
      },
      dark: {
        colors: {
          primary: '#6A9A55', // lighter olive for dark bg
          secondary: '#FFA556',
          accent: '#5392FF',

          background: '#1E1F23',
          surface: '#2A2B2F',

          success: '#4BB362',
          error: '#F1676C',
          info: '#5392FF',
          warning: '#FFC349',
        },
        variables: {
          'border-radius-root': '8px',
        },
      },
    },
  },
})
