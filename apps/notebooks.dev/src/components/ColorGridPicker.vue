<template>
  <v-card class="pa-2" elevation="6" min-width="260">
    <!-- Current selection preview -->
    <div class="d-flex align-center justify-space-between mb-2">
      <div class="d-flex align-center">
        <span class="mr-2 text-caption">Selected:</span>
        <div
          class="preview-chip"
          :style="{ background: selectedTemp || 'transparent' }"
        />
      </div>
      <code class="text-caption">{{ displayColor }}</code>
    </div>

    <!-- Grayscale row (black -> white) -->
    <div class="grid-row mb-2">
      <button
        v-for="(g, i) in grayscale"
        :key="'gray-'+i"
        class="swatch"
        :style="swatchStyle(g)"
        @mousedown.prevent="onPick(g)"
      />
    </div>

    <v-divider class="my-2" />

    <!-- Rainbow 10 x 10: 10 hue columns x 10 opacity rows -->
    <div class="rainbow-grid">
      <div
        v-for="(alpha, rowIdx) in alphaLevels"
        :key="'row-'+rowIdx"
        class="grid-row"
      >
        <button
          v-for="(h, i) in hues"
          :key="'h-'+i+'-a-'+rowIdx"
          class="swatch"
          :style="swatchStyle(hsla(h, 90, 50, alpha))"
          @mousedown.prevent="onPick(hsla(h, 90, 50, alpha))"
        />
      </div>
    </div>

    <v-divider class="my-2" />

    <div class="d-flex justify-space-between align-center">
      <v-btn color="muted" size="small" variant="text" @click="onCancel">Cancel</v-btn>
      <div class="d-flex align-center">
        <v-btn color="muted" size="small" variant="text" @click="clearColor">Clear</v-btn>
        <v-btn
          class="ml-2"
          color="primary"
          size="small"
          variant="flat"
          @click="apply"
        >
          Apply
        </v-btn>
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'

  const emit = defineEmits<{
    (e: 'update:modelValue', v: string | null): void
    (e: 'cancel'): void
  }>()

  // local (so we don't spam tiptap/undo until Apply)
  const selectedTemp = defineModel()

  // 10 grayscale samples (black -> white)
  const grayscale = computed(() => {
    const arr: string[] = []
    for (let i = 0; i < 10; i++) {
      const v = Math.round((i / 9) * 100) // 0..100
      arr.push(`hsl(0, 0%, ${v}%)`)
    }
    return arr
  })

  // 10 equally spaced hues
  const hues = computed(() => {
    const arr: number[] = []
    for (let i = 0; i < 10; i++) arr.push(Math.round((i * 360) / 10) % 360)
    return arr
  })

  // 10 opacity levels (1.0 -> 0.1)
  const alphaLevels = computed(() => {
    const arr: number[] = []
    for (let i = 0; i < 10; i++) arr.push(Number(((10 - i) / 10).toFixed(2)))
    return arr
  })

  function hsla (h: number, s: number, l: number, a: number) {
    return `hsla(${h}, ${s}%, ${l}%, ${a})`
  }

  function swatchStyle (color: string) {
    return {
      background: color,
      border:
        selectedTemp.value === color
          ? '2px solid var(--v-theme-primary)'
          : '1px solid rgba(0,0,0,0.2)',
    }
  }

  function onPick (color: string) {
    // Only update the local temp value; do not emit yet.
    selectedTemp.value = color
  }

  function apply () {
    emit('update:modelValue', selectedTemp.value ?? null)
  }

  function clearColor () {
    selectedTemp.value = null
  }

  function onCancel () {
    // Revert temp to external value and notify parent (optional close)
    selectedTemp.value = props.modelValue ?? null
    emit('cancel')
  }

  const displayColor = computed(() => selectedTemp.value ?? 'none')
</script>

<style scoped>
.preview-chip {
  width: 22px;
  height: 22px;
  border-radius: 4px;
  border: 1px solid rgba(0,0,0,0.2);
}

.grid-row {
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
}

.rainbow-grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.swatch {
  width: 22px;
  height: 22px;
  margin: 3px;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
  box-shadow: 0 0 0 0 rgba(0,0,0,0);
}
.swatch:hover {
  transform: scale(1.1);
  box-shadow: 0 0 0 2px rgba(0,0,0,0.08);
}
</style>
