<template>
  <v-container class="home-container" fluid />
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue'

  const title = ref('')

  async function addNotebook () {}

</script>

<style scoped lang="scss">
.home-container {
  padding: 0;
  margin: 0;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
}
</style>
