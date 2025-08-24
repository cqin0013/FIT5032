import { createApp } from 'vue'
import App from './App.vue'

// Bootstrap（如果你在用）
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

// PrimeVue 主题与组件（注意 @primeuix/themes）
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import 'primeicons/primeicons.css'

// DataTable 组件
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

const app = createApp(App)

app.use(PrimeVue, {
  theme: {
    preset: Aura,
  },
})

app.component('DataTable', DataTable)
app.component('Column', Column)

app.mount('#app')
