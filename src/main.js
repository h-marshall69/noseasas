import { createApp } from 'vue'
import { createPinia } from 'pinia'     //  <- marshall truco
import App from './App.vue'
import PrimeVue from 'primevue/config';
import { setupRouter } from './index'
// import Aura from '@primeuix/themes/aura';
import ToastService from 'primevue/toastservice';
import DialogService from 'primevue/dialogservice'
import Noir from './plugins/Noir.js';
//import Ripple from 'primevue/ripple';
//import ConfirmationService from 'primevue/confirmationservice';
import Tooltip from 'primevue/tooltip';
import ConfirmationService from 'primevue/confirmationservice';
import Ripple from 'primevue/ripple';

import 'primeicons/primeicons.css'
import "./style.css"

const localeEs = {
    startsWith: 'Empieza con',
    contains: 'Contiene',
    notContains: 'No contiene',
    emptyMessage: "No hay opciones disponibles",
    emptySelectionMessage: "Seleccioanr",
    noFileChosenMessage: "Sin Archivo",
    endsWith: 'Termina con',
    equals: 'Igual',
    notEquals: 'Diferente',
    noFilter: 'Sin filtro',
    lt: 'Menor que',
    lte: 'Menor o igual que',
    gt: 'Mayor que',
    gte: 'Mayor o igual que',
    dateIs: 'Fecha es',
    dateIsNot: 'Fecha no es',
    dateBefore: 'Fecha es anterior',
    dateAfter: 'Fecha es posterior',
    clear: 'Limpiar',
    apply: 'Aplicar',
    matchAll: 'Coincidir con todo',
    matchAny: 'Coincidir con cualquiera',
    selectionMessage: "{0} Elementos seleccionados",
    emptySearchMessage: "Sin resultados",
    addRule: 'Agregar ',
    removeRule: 'Eliminar ',
    accept: 'Aceptar',
    reject: 'Rechazar',
    choose: 'Elegir',
    upload: 'Subir',
    cancel: 'Cancelar',
    dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
    dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
    dayNamesMin: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'],
    monthNames: [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ],
    monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    today: 'Hoy',
    weekHeader: 'Sm',
    firstDayOfWeek: 1, // Lunes como primer día
    dateFormat: 'dd/mm/yy',
    weak: 'Débil',
    medium: 'Medio',
    strong: 'Fuerte',
    passwordPrompt: 'Introduce una contraseña'
};

async function init() {
    const router = await setupRouter() // 🧠 esperamos a que se construya dinámicamente

    const pinia = createPinia()     //  <- marshall truco
    const app = createApp(App)

    app.use(router)
    app.use(pinia)      //  <- marshall truco
    //app.use(Ripple)
    app.directive('tooltip', Tooltip)
    app.use(ToastService)
    app.use(PrimeVue, {
        ripple: true,
        locale: localeEs,
        theme: {
            preset: Noir,
            options: {
                prefix: 'p',
                darkModeSelector: '.p-dark',
                cssLayer: {
                    // name: 'primevue',
                    order: 'theme, base, primevue'
                }
            }
        }
    })
    app.directive('ripple', Ripple)
    app.use(ConfirmationService)
    app.use(DialogService)
    app.mount('#app')
}
init()
