/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */

// Types
import type { App } from 'vue'
// Plugins
import VueKonva from 'vue-konva'
import VueTippy from 'vue-tippy'

import router from '../router'

import pinia from '../stores'
import vuetify from './vuetify'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/dist/border.css'
import 'tippy.js/animations/shift-away.css'

export function registerPlugins (app: App) {
  app
    .use(VueTippy)
    .use(VueKonva)
    .use(vuetify)
    .use(router)
    .use(pinia)
}
