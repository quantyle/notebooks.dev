// Utilities
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useTheme } from 'vuetify/framework'

export const useAppStore = defineStore('app', () => {
  const theme = useTheme()
  const editorTheme = ref(theme.global.current.value.dark ? 'theme-dark' : 'theme-light')

  function toggleTheme () {
    editorTheme.value = editorTheme.value === 'theme-dark' ? 'theme-light' : 'theme-dark'
    theme.change(theme.global.current.value.dark ? 'monoLight' : 'monoDark')
  }

  return {
    editorTheme,
    toggleTheme,
  }
})
