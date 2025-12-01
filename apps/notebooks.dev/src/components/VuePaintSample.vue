<template>
  <div class="konva-canvas-container">
    <v-toolbar density="comfortable" flat>
      <v-btn :disabled="historyStep === 0" icon size="small" @click="handleUndo">
        <v-icon>mdi-undo</v-icon>
        <v-tooltip activator="parent" location="bottom">Undo</v-tooltip>
      </v-btn>

      <v-btn :disabled="historyStep === history.length - 1" icon size="small" @click="handleRedo">
        <v-icon>mdi-redo</v-icon>
        <v-tooltip activator="parent" location="bottom">Redo</v-tooltip>
      </v-btn>

      <v-divider class="mx-2" vertical />

      <v-btn :disabled="isDrawing || isErasing" icon size="small" @click="addRect">
        <v-icon>mdi-rectangle-outline</v-icon>
        <v-tooltip activator="parent" location="bottom">Add Rectangle</v-tooltip>
      </v-btn>

      <v-btn :disabled="isDrawing || isErasing" icon size="small" @click="addEllipse">
        <v-icon>mdi-circle-outline</v-icon>
        <v-tooltip activator="parent" location="bottom">Add Ellipse</v-tooltip>
      </v-btn>

      <v-btn :disabled="isDrawing || isErasing" icon size="small" @click="addLine">
        <v-icon>mdi-minus</v-icon>
        <v-tooltip activator="parent" location="bottom">Add Line</v-tooltip>
      </v-btn>

      <v-divider class="mx-2" vertical />

      <v-btn
        :color="isDrawing ? 'primary' : undefined"
        icon
        size="small"
        :variant="isDrawing ? 'elevated' : 'flat'"
        @click="toggleDrawingMode"
      >
        <v-icon>mdi-pencil</v-icon>
        <v-tooltip activator="parent" location="bottom">Draw Freeform</v-tooltip>
      </v-btn>

      <v-btn
        :color="isErasing ? 'warning' : undefined"
        icon
        size="small"
        :variant="isErasing ? 'elevated' : 'flat'"
        @click="toggleEraserMode"
      >
        <v-icon>mdi-eraser</v-icon>
        <v-tooltip activator="parent" location="bottom">Eraser</v-tooltip>
      </v-btn>

      <v-divider class="mx-2" vertical />

      <v-btn icon size="small" @click="layersDialogOpen = true">
        <v-icon>mdi-layers</v-icon>
        <v-tooltip activator="parent" location="bottom">Layers</v-tooltip>
      </v-btn>

      <v-divider class="mx-2" vertical />

      <v-btn
        color="error"
        :disabled="!selectedShapeId"
        icon
        size="small"
        @click="deleteSelected"
      >
        <v-icon>mdi-delete</v-icon>
        <v-tooltip activator="parent" location="bottom">Delete</v-tooltip>
      </v-btn>

      <v-divider class="mx-2" vertical />

      <v-btn :disabled="!selectedShapeId" icon size="small" @click="bringToFront">
        <v-icon>mdi-arrange-bring-to-front</v-icon>
        <v-tooltip activator="parent" location="bottom">Bring to Front</v-tooltip>
      </v-btn>

      <v-btn :disabled="!selectedShapeId" icon size="small" @click="bringForward">
        <v-icon>mdi-arrange-bring-forward</v-icon>
        <v-tooltip activator="parent" location="bottom">Bring Forward</v-tooltip>
      </v-btn>

      <v-btn :disabled="!selectedShapeId" icon size="small" @click="sendBackward">
        <v-icon>mdi-arrange-send-backward</v-icon>
        <v-tooltip activator="parent" location="bottom">Send Backward</v-tooltip>
      </v-btn>

      <v-btn :disabled="!selectedShapeId" icon size="small" @click="sendToBack">
        <v-icon>mdi-arrange-send-to-back</v-icon>
        <v-tooltip activator="parent" location="bottom">Send to Back</v-tooltip>
      </v-btn>
    </v-toolbar>

    <!-- Style Controls -->
    <v-sheet class="pa-4 bg-grey-lighten-4">
      <div v-if="isErasing" class="d-flex gap-4 align-center flex-wrap">
        <div class="input-group">
          <label class="input-label">Eraser Size</label>
          <v-text-field
            v-model.number="eraserStyle.strokeWidth"
            density="compact"
            hide-details
            :max="100"
            :min="5"
            :step="1"
            style="max-width: 150px"
            type="number"
            variant="outlined"
          />
        </div>
      </div>

      <div v-else-if="isDrawing" class="d-flex gap-4 align-center flex-wrap">
        <div class="input-group">
          <label class="input-label">Brush Color</label>
          <v-text-field
            v-model="drawingStyle.stroke"
            density="compact"
            hide-details
            style="max-width: 150px"
            type="color"
            variant="outlined"
          />
        </div>

        <div class="input-group">
          <label class="input-label">Brush Size</label>
          <v-text-field
            v-model.number="drawingStyle.strokeWidth"
            density="compact"
            hide-details
            :max="50"
            :min="1"
            :step="1"
            style="max-width: 150px"
            type="number"
            variant="outlined"
          />
        </div>

        <div class="input-group">
          <label class="input-label">Opacity</label>
          <v-text-field
            v-model.number="drawingStyle.opacity"
            density="compact"
            hide-details
            :max="1"
            :min="0.1"
            :step="0.05"
            style="max-width: 150px"
            type="number"
            variant="outlined"
          />
        </div>
      </div>

      <div v-else class="d-flex gap-4 align-center flex-wrap">
        <div class="input-group">
          <label class="input-label">Fill Color</label>
          <v-text-field
            v-model="stylePanel.fill"
            density="compact"
            :disabled="!selectedShapeId"
            hide-details
            style="max-width: 150px"
            type="color"
            variant="outlined"
            @update:model-value="applyStyles"
          />
        </div>

        <div class="input-group">
          <label class="input-label">Stroke Color</label>
          <v-text-field
            v-model="stylePanel.stroke"
            density="compact"
            :disabled="!selectedShapeId"
            hide-details
            style="max-width: 150px"
            type="color"
            variant="outlined"
            @update:model-value="applyStyles"
          />
        </div>

        <div class="input-group">
          <label class="input-label">Stroke Width</label>
          <v-text-field
            v-model.number="stylePanel.strokeWidth"
            density="compact"
            :disabled="!selectedShapeId"
            hide-details
            :max="20"
            :min="0"
            :step="1"
            style="max-width: 150px"
            type="number"
            variant="outlined"
            @update:model-value="applyStyles"
          />
        </div>

        <div class="input-group">
          <label class="input-label">Opacity</label>
          <v-text-field
            v-model.number="stylePanel.opacity"
            density="compact"
            :disabled="!selectedShapeId"
            hide-details
            :max="1"
            :min="0.1"
            :step="0.05"
            style="max-width: 150px"
            type="number"
            variant="outlined"
            @update:model-value="applyStyles"
          />
        </div>

        <div v-if="isRectSelected || isEllipseSelected" class="input-group">
          <label class="input-label">Corner Radius</label>
          <v-text-field
            v-model.number="stylePanel.cornerRadius"
            density="compact"
            :disabled="!selectedShapeId"
            hide-details
            :max="100"
            :min="0"
            :step="1"
            style="max-width: 150px"
            type="number"
            variant="outlined"
            @update:model-value="applyStyles"
          />
        </div>

        <div v-if="isRectSelected || isEllipseSelected" class="input-group">
          <label class="input-label">Text</label>
          <v-text-field
            v-model="stylePanel.text"
            density="compact"
            :disabled="!selectedShapeId"
            hide-details
            style="max-width: 200px"
            variant="outlined"
            @update:model-value="applyStyles"
          />
        </div>

        <div v-if="isRectSelected || isEllipseSelected" class="input-group">
          <label class="input-label">Font Size</label>
          <v-text-field
            v-model.number="stylePanel.fontSize"
            density="compact"
            :disabled="!selectedShapeId"
            hide-details
            :max="72"
            :min="8"
            :step="1"
            style="max-width: 150px"
            type="number"
            variant="outlined"
            @update:model-value="applyStyles"
          />
        </div>

        <div v-if="isRectSelected || isEllipseSelected" class="input-group">
          <label class="input-label">Text Color</label>
          <v-text-field
            v-model="stylePanel.textColor"
            density="compact"
            :disabled="!selectedShapeId"
            hide-details
            style="max-width: 150px"
            type="color"
            variant="outlined"
            @update:model-value="applyStyles"
          />
        </div>
      </div>
    </v-sheet>

    <v-stage
      ref="stageRef"
      :config="stageConfig"
      :data-drawing="isDrawing"
      :data-erasing="isErasing"
      @mousedown="handleStageMouseDown"
      @mouseleave="handleMouseLeave"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @touchend="handleMouseUp"
      @touchmove="handleMouseMove"
      @touchstart="handleStageMouseDown"
    >
      <v-layer ref="layerRef">
        <!-- Render all shapes sorted by zIndex -->
        <template v-for="shape in allShapesSorted" :key="shape.id">
          <!-- Freeform Line -->
          <v-line
            v-if="shape.type === 'line'"
            :config="{
              name: shape.id,
              points: shape.points,
              stroke: shape.stroke,
              strokeWidth: shape.strokeWidth,
              opacity: shape.opacity,
              tension: 0.5,
              lineCap: 'round',
              lineJoin: 'round',
              globalCompositeOperation: shape.tool === 'eraser' ? 'destination-out' : 'source-over',
              x: shape.x,
              y: shape.y,
              draggable: !isDrawing && !isErasing,
            }"
            @click="handleShapeClick"
            @dragend="(e) => handleLineDragEnd(e, shape.id)"
            @tap="handleShapeClick"
            @transformend="handleLineTransformEnd"
          />

          <!-- Rectangle Group (shape + text) -->
          <v-group
            v-else-if="shape.type === 'rect'"
            :config="{
              name: shape.id,
              x: shape.x,
              y: shape.y,
              rotation: shape.rotation,
              scaleX: shape.scaleX,
              scaleY: shape.scaleY,
              draggable: !isDrawing && !isErasing,
            }"
            @click="handleShapeClick"
            @dragend="handleDragEnd"
            @tap="handleShapeClick"
            @transformend="handleTransformEnd"
          >
            <v-rect
              :config="{
                width: shape.width,
                height: shape.height,
                fill: shape.fill,
                stroke: shape.stroke,
                strokeWidth: shape.strokeWidth,
                opacity: shape.opacity,
                cornerRadius: shape.cornerRadius,
              }"
            />
            <v-text
              v-if="shape.text"
              :config="{
                text: shape.text,
                width: shape.width,
                height: shape.height,
                fontSize: shape.fontSize,
                fill: shape.textColor,
                align: 'center',
                verticalAlign: 'middle',
                listening: false,
              }"
            />
          </v-group>

          <!-- Ellipse Group (shape + text) -->
          <v-group
            v-else-if="shape.type === 'ellipse'"
            :config="{
              name: shape.id,
              x: shape.x,
              y: shape.y,
              rotation: shape.rotation,
              scaleX: shape.scaleX,
              scaleY: shape.scaleY,
              draggable: !isDrawing && !isErasing,
            }"
            @click="handleShapeClick"
            @dragend="handleEllipseDragEnd"
            @tap="handleShapeClick"
            @transformend="handleEllipseTransformEnd"
          >
            <v-ellipse
              :config="{
                radiusX: shape.radiusX,
                radiusY: shape.radiusY,
                fill: shape.fill,
                stroke: shape.stroke,
                strokeWidth: shape.strokeWidth,
                opacity: shape.opacity,
              }"
            />
            <v-text
              v-if="shape.text"
              :config="{
                text: shape.text,
                x: -shape.radiusX,
                y: -shape.fontSize / 2,
                width: shape.radiusX * 2,
                fontSize: shape.fontSize,
                fill: shape.textColor,
                align: 'center',
                verticalAlign: 'middle',
                listening: false,
              }"
            />
          </v-group>

          <!-- Simple Line with draggable circles -->
          <v-group
            v-else-if="shape.type === 'straightLine'"
            :config="{
              name: shape.id,
            }"
          >
            <!-- Invisible wider line for easier selection (render first, bottom layer) -->
            <v-line
              :config="{
                points: [shape.startX, shape.startY, shape.endX, shape.endY],
                stroke: 'transparent',
                strokeWidth: Math.max(shape.strokeWidth + 15, 20),
                lineCap: 'round',
              }"
              @click="handleShapeClick"
              @tap="handleShapeClick"
            />

            <!-- The visible connecting line -->
            <v-line
              :config="{
                points: [shape.startX, shape.startY, shape.endX, shape.endY],
                stroke: shape.stroke,
                strokeWidth: shape.strokeWidth,
                opacity: shape.opacity,
                lineCap: 'round',
                listening: false,
              }"
            />

            <!-- Start circle (endpoint) - render on top -->
            <v-circle
              :config="{
                name: `${shape.id}-circle-start`,
                x: shape.startX,
                y: shape.startY,
                radius: 10,
                fill: selectedShapeId === shape.id ? '#3b82f6' : '#ffffff',
                stroke: selectedShapeId === shape.id ? '#1e40af' : shape.stroke,
                strokeWidth: 3,
                draggable: true,
                visible: selectedShapeId === shape.id,
              }"
              @click="(e) => handleCircleClick(e, shape.id)"
              @dragend="saveHistory"
              @dragmove="(e) => handleCircleDrag(e, shape.id, 'start')"
              @tap="(e) => handleCircleClick(e, shape.id)"
            />

            <!-- End circle (endpoint) - render on top -->
            <v-circle
              :config="{
                name: `${shape.id}-circle-end`,
                x: shape.endX,
                y: shape.endY,
                radius: 10,
                fill: selectedShapeId === shape.id ? '#3b82f6' : '#ffffff',
                stroke: selectedShapeId === shape.id ? '#1e40af' : shape.stroke,
                strokeWidth: 3,
                draggable: true,
                visible: selectedShapeId === shape.id,
              }"
              @click="(e) => handleCircleClick(e, shape.id)"
              @dragend="saveHistory"
              @dragmove="(e) => handleCircleDrag(e, shape.id, 'end')"
              @tap="(e) => handleCircleClick(e, shape.id)"
            />
          </v-group>
        </template>

        <!-- Transformer -->
        <v-transformer ref="transformerRef" />

        <!-- Cursor circle for brush/eraser size preview -->
        <v-circle
          v-if="cursorCircle.visible"
          :config="{
            x: cursorCircle.x,
            y: cursorCircle.y,
            radius: (isDrawing ? drawingStyle.strokeWidth : eraserStyle.strokeWidth) / 2,
            stroke: isDrawing ? drawingStyle.stroke : '#ff9800',
            strokeWidth: 2,
            listening: false,
            opacity: 0.7,
          }"
        />
      </v-layer>
    </v-stage>

    <!-- Layers Dialog -->
    <v-dialog v-model="layersDialogOpen" max-width="600px">
      <v-card>
        <v-card-title class="d-flex align-center justify-space-between">
          <span>Layers</span>
          <v-btn icon size="small" variant="text" @click="layersDialogOpen = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pa-0">
          <draggable
            v-model="draggableLayersList"
            ghost-class="ghost-layer"
            handle=".drag-handle"
            item-key="id"
            tag="div"
          >
            <template #item="{ element: shape }">
              <v-list-item
                class="layer-item"
                :class="{ 'bg-blue-lighten-5': selectedShapeId === shape.id }"
                @click="selectLayer(shape.id)"
              >
                <template #prepend>
                  <v-icon class="drag-handle mr-2" style="cursor: grab;">mdi-drag-vertical</v-icon>
                  <v-icon v-if="shape.type === 'rect'">mdi-rectangle-outline</v-icon>
                  <v-icon v-else-if="shape.type === 'ellipse'">mdi-circle-outline</v-icon>
                  <v-icon v-else-if="shape.type === 'straightLine'">mdi-minus</v-icon>
                  <v-icon v-else>mdi-pencil</v-icon>
                </template>

                <v-list-item-title>
                  <span v-if="shape.type === 'rect'">Rectangle</span>
                  <span v-else-if="shape.type === 'ellipse'">Ellipse</span>
                  <span v-else-if="shape.type === 'straightLine'">Line</span>
                  <span v-else-if="shape.type === 'line' && shape.tool === 'brush'">Drawing</span>
                  <span v-else-if="shape.type === 'line' && shape.tool === 'eraser'">Eraser Stroke</span>
                  <span v-if="shape.text" class="text-grey ml-2">"{{ shape.text }}"</span>
                </v-list-item-title>

                <v-list-item-subtitle>
                  z-index: {{ shape.zIndex }}
                </v-list-item-subtitle>

                <template #append>
                  <v-btn
                    color="error"
                    icon
                    size="small"
                    variant="text"
                    @click.stop="deleteLayer(shape.id)"
                  >
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </template>
              </v-list-item>
            </template>
          </draggable>

          <v-card-text v-if="allShapesSorted.length === 0" class="text-center text-grey py-8">
            No layers yet. Add shapes to see them here.
          </v-card-text>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
  import Konva from 'konva'
  import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
  import draggable from 'vuedraggable'

  // Types
  interface Rectangle {
    id: string
    x: number
    y: number
    width: number
    height: number
    fill: string
    stroke: string
    strokeWidth: number
    opacity: number
    rotation: number
    scaleX: number
    scaleY: number
    cornerRadius: number
    zIndex: number
    text: string
    fontSize: number
    textColor: string
  }

  interface Ellipse {
    id: string
    x: number
    y: number
    radiusX: number
    radiusY: number
    fill: string
    stroke: string
    strokeWidth: number
    opacity: number
    rotation: number
    scaleX: number
    scaleY: number
    zIndex: number
    text: string
    fontSize: number
    textColor: string
  }

  interface StraightLine {
    id: string
    startX: number
    startY: number
    endX: number
    endY: number
    stroke: string
    strokeWidth: number
    opacity: number
    zIndex: number
  }

  interface Line {
    id: string
    tool: 'brush' | 'eraser'
    points: number[]
    stroke: string
    strokeWidth: number
    opacity: number
    x: number
    y: number
    draggable: boolean
    zIndex: number
  }

  interface StylePanel {
    fill: string
    stroke: string
    strokeWidth: number
    opacity: number
    cornerRadius: number
    text: string
    fontSize: number
    textColor: string
  }

  interface DrawingStyle {
    stroke: string
    strokeWidth: number
    opacity: number
  }

  interface EraserStyle {
    strokeWidth: number
  }

  // Refs
  const stageRef = ref<any>(null)
  const layerRef = ref<any>(null)
  const transformerRef = ref<any>(null)

  // Stage configuration
  const stageConfig = reactive({
    width: window.innerWidth,
    height: window.innerHeight - 200,
  })

  // Rectangles
  const rectangles = ref<Rectangle[]>([
    {
      id: 'rect-1',
      x: 100,
      y: 100,
      width: 150,
      height: 100,
      fill: '#3b82f6',
      stroke: '#1e40af',
      strokeWidth: 2,
      opacity: 1,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      cornerRadius: 0,
      zIndex: 0,
      text: '',
      fontSize: 16,
      textColor: '#000000',
    },
    {
      id: 'rect-2',
      x: 300,
      y: 150,
      width: 120,
      height: 120,
      fill: '#10b981',
      stroke: '#059669',
      strokeWidth: 2,
      opacity: 1,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      cornerRadius: 0,
      zIndex: 1,
      text: '',
      fontSize: 16,
      textColor: '#000000',
    },
  ])

  // Ellipses
  const ellipses = ref<Ellipse[]>([])

  // Straight Lines
  const straightLines = ref<StraightLine[]>([])

  // Lines (freeform drawings)
  const lines = ref<Line[]>([])

  // Drawing mode state
  const isDrawing = ref(false)
  const isPaint = ref(false)
  const currentLine = ref<Line | null>(null)

  // Eraser mode state
  const isErasing = ref(false)
  const eraserStyle = reactive<EraserStyle>({
    strokeWidth: 20,
  })

  // Cursor circle for brush/eraser preview
  const cursorCircle = reactive({
    x: 0,
    y: 0,
    visible: false,
  })

  // Drawing style
  const drawingStyle = reactive<DrawingStyle>({
    stroke: '#000000',
    strokeWidth: 3,
    opacity: 1,
  })

  // Selection
  const selectedShapeId = ref<string>('')

  // Layers dialog
  const layersDialogOpen = ref(false)

  // Draggable layers list (reversed for display, top to bottom)
  const draggableLayersList = computed({
    get: () => allShapesSorted.value.slice().reverse(),
    set: newOrder => {
      // Update z-index based on new order (reversed back)
      const reversedOrder = newOrder.slice().reverse()
      for (const [index, shape] of reversedOrder.entries()) {
        const actualShape = findShapeById(shape.id)
        if (actualShape) {
          actualShape.zIndex = index
        }
      }
      saveHistory()
    },
  })

  function findShapeById (id: string) {
    return rectangles.value.find(r => r.id === id)
      || ellipses.value.find(e => e.id === id)
      || straightLines.value.find(l => l.id === id)
      || lines.value.find(l => l.id === id)
  }

  // Check selected shape type
  const isRectSelected = computed(() => {
    return rectangles.value.some(r => r.id === selectedShapeId.value)
  })

  const isEllipseSelected = computed(() => {
    return ellipses.value.some(e => e.id === selectedShapeId.value)
  })

  const isStraightLineSelected = computed(() => {
    return straightLines.value.some(l => l.id === selectedShapeId.value)
  })

  // Combined sorted shapes for rendering in proper z-order
  const allShapesSorted = computed(() => {
    const combined = [
      ...lines.value.map(l => ({ ...l, type: 'line' as const })),
      ...rectangles.value.map(r => ({ ...r, type: 'rect' as const })),
      ...ellipses.value.map(e => ({ ...e, type: 'ellipse' as const })),
      ...straightLines.value.map(l => ({ ...l, type: 'straightLine' as const })),
    ]
    return combined.sort((a, b) => a.zIndex - b.zIndex)
  })

  // Style Panel
  const stylePanel = reactive<StylePanel>({
    fill: '#3b82f6',
    stroke: '#1e40af',
    strokeWidth: 2,
    opacity: 1,
    cornerRadius: 0,
    text: '',
    fontSize: 16,
    textColor: '#000000',
  })

  // History
  const history = ref<any[]>([{
    rectangles: JSON.parse(JSON.stringify(rectangles.value)),
    ellipses: [],
    straightLines: [],
    lines: [],
  }])
  const historyStep = ref(0)

  // Functions
  function generateId (): string {
    return `shape-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
  }

  function generateLineId (): string {
    return `line-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
  }

  function getNextZIndex (): number {
    const allZIndices = [
      ...rectangles.value.map(r => r.zIndex),
      ...ellipses.value.map(e => e.zIndex),
      ...straightLines.value.map(l => l.zIndex),
      ...lines.value.map(l => l.zIndex),
    ]
    return allZIndices.length > 0 ? Math.max(...allZIndices) + 1 : 0
  }

  function bringToFront (): void {
    if (!selectedShapeId.value) return

    const rect = rectangles.value.find(r => r.id === selectedShapeId.value)
    const ellipse = ellipses.value.find(e => e.id === selectedShapeId.value)
    const straightLine = straightLines.value.find(l => l.id === selectedShapeId.value)
    const line = lines.value.find(l => l.id === selectedShapeId.value)

    const maxZIndex = Math.max(
      ...rectangles.value.map(r => r.zIndex),
      ...ellipses.value.map(e => e.zIndex),
      ...straightLines.value.map(l => l.zIndex),
      ...lines.value.map(l => l.zIndex),
    )

    if (rect) rect.zIndex = maxZIndex + 1
    if (ellipse) ellipse.zIndex = maxZIndex + 1
    if (straightLine) straightLine.zIndex = maxZIndex + 1
    if (line) line.zIndex = maxZIndex + 1

    saveHistory()
  }

  function bringForward (): void {
    if (!selectedShapeId.value) return

    const rect = rectangles.value.find(r => r.id === selectedShapeId.value)
    const ellipse = ellipses.value.find(e => e.id === selectedShapeId.value)
    const straightLine = straightLines.value.find(l => l.id === selectedShapeId.value)
    const line = lines.value.find(l => l.id === selectedShapeId.value)

    const currentZIndex = rect?.zIndex ?? ellipse?.zIndex ?? straightLine?.zIndex ?? line?.zIndex
    if (currentZIndex === undefined) return

    const allZIndices = [
      ...rectangles.value.map(r => r.zIndex),
      ...ellipses.value.map(e => e.zIndex),
      ...straightLines.value.map(l => l.zIndex),
      ...lines.value.map(l => l.zIndex),
    ].sort((a, b) => a - b)

    const nextZIndex = allZIndices.find(z => z > currentZIndex)
    if (nextZIndex !== undefined) {
      if (rect) rect.zIndex = nextZIndex + 0.5
      if (ellipse) ellipse.zIndex = nextZIndex + 0.5
      if (straightLine) straightLine.zIndex = nextZIndex + 0.5
      if (line) line.zIndex = nextZIndex + 0.5
      saveHistory()
    }
  }

  function sendBackward (): void {
    if (!selectedShapeId.value) return

    const rect = rectangles.value.find(r => r.id === selectedShapeId.value)
    const ellipse = ellipses.value.find(e => e.id === selectedShapeId.value)
    const straightLine = straightLines.value.find(l => l.id === selectedShapeId.value)
    const line = lines.value.find(l => l.id === selectedShapeId.value)

    const currentZIndex = rect?.zIndex ?? ellipse?.zIndex ?? straightLine?.zIndex ?? line?.zIndex
    if (currentZIndex === undefined) return

    const allZIndices = [
      ...rectangles.value.map(r => r.zIndex),
      ...ellipses.value.map(e => e.zIndex),
      ...straightLines.value.map(l => l.zIndex),
      ...lines.value.map(l => l.zIndex),
    ].sort((a, b) => b - a)

    const prevZIndex = allZIndices.find(z => z < currentZIndex)
    if (prevZIndex !== undefined) {
      if (rect) rect.zIndex = prevZIndex - 0.5
      if (ellipse) ellipse.zIndex = prevZIndex - 0.5
      if (straightLine) straightLine.zIndex = prevZIndex - 0.5
      if (line) line.zIndex = prevZIndex - 0.5
      saveHistory()
    }
  }

  function sendToBack (): void {
    if (!selectedShapeId.value) return

    const rect = rectangles.value.find(r => r.id === selectedShapeId.value)
    const ellipse = ellipses.value.find(e => e.id === selectedShapeId.value)
    const straightLine = straightLines.value.find(l => l.id === selectedShapeId.value)
    const line = lines.value.find(l => l.id === selectedShapeId.value)

    const minZIndex = Math.min(
      ...rectangles.value.map(r => r.zIndex),
      ...ellipses.value.map(e => e.zIndex),
      ...straightLines.value.map(l => l.zIndex),
      ...lines.value.map(l => l.zIndex),
    )

    if (rect) rect.zIndex = minZIndex - 1
    if (ellipse) ellipse.zIndex = minZIndex - 1
    if (straightLine) straightLine.zIndex = minZIndex - 1
    if (line) line.zIndex = minZIndex - 1

    saveHistory()
  }

  function toggleDrawingMode (): void {
    isDrawing.value = !isDrawing.value

    if (isDrawing.value) {
      selectedShapeId.value = ''
      updateTransformer()
      isErasing.value = false // Turn off eraser when drawing is activated
    } else {
      cursorCircle.visible = false // Hide cursor circle when turning off
    }

    isPaint.value = false
    currentLine.value = null
  }

  function toggleEraserMode (): void {
    isErasing.value = !isErasing.value

    if (isErasing.value) {
      selectedShapeId.value = ''
      updateTransformer()
      isDrawing.value = false // Turn off drawing when eraser is activated
      isPaint.value = false
      currentLine.value = null
    } else {
      cursorCircle.visible = false // Hide cursor circle when turning off
    }
  }

  function addRect (): void {
    const newRect: Rectangle = {
      id: generateId(),
      x: Math.random() * 400 + 50,
      y: Math.random() * 300 + 50,
      width: 150,
      height: 100,
      fill: '#6366f1',
      stroke: '#4f46e5',
      strokeWidth: 2,
      opacity: 1,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      cornerRadius: 0,
      zIndex: getNextZIndex(),
      text: '',
      fontSize: 16,
      textColor: '#000000',
    }

    rectangles.value.push(newRect)
    selectedShapeId.value = newRect.id

    nextTick(() => {
      updateTransformer()
      updateStylePanel()
      saveHistory()
    })
  }

  function addEllipse (): void {
    const newEllipse: Ellipse = {
      id: generateId(),
      x: Math.random() * 400 + 150,
      y: Math.random() * 300 + 100,
      radiusX: 75,
      radiusY: 50,
      fill: '#ec4899',
      stroke: '#be185d',
      strokeWidth: 2,
      opacity: 1,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      zIndex: getNextZIndex(),
      text: '',
      fontSize: 16,
      textColor: '#000000',
    }

    ellipses.value.push(newEllipse)
    selectedShapeId.value = newEllipse.id

    nextTick(() => {
      updateTransformer()
      updateStylePanel()
      saveHistory()
    })
  }

  function addLine (): void {
    const startX = Math.random() * 400 + 100
    const startY = Math.random() * 300 + 100

    const newLine: StraightLine = {
      id: generateId(),
      startX: startX,
      startY: startY,
      endX: startX + 150,
      endY: startY,
      stroke: '#f59e0b',
      strokeWidth: 3,
      opacity: 1,
      zIndex: getNextZIndex(),
    }

    straightLines.value.push(newLine)
    selectedShapeId.value = newLine.id

    nextTick(() => {
      updateStylePanel()
      saveHistory()
    })
  }

  function deleteSelected (): void {
    if (!selectedShapeId.value) return

    const rectIndex = rectangles.value.findIndex(r => r.id === selectedShapeId.value)
    if (rectIndex !== -1) {
      rectangles.value.splice(rectIndex, 1)
      selectedShapeId.value = ''
      updateTransformer()
      saveHistory()
      return
    }

    const ellipseIndex = ellipses.value.findIndex(e => e.id === selectedShapeId.value)
    if (ellipseIndex !== -1) {
      ellipses.value.splice(ellipseIndex, 1)
      selectedShapeId.value = ''
      updateTransformer()
      saveHistory()
      return
    }

    const straightLineIndex = straightLines.value.findIndex(l => l.id === selectedShapeId.value)
    if (straightLineIndex !== -1) {
      straightLines.value.splice(straightLineIndex, 1)
      selectedShapeId.value = ''
      updateTransformer()
      saveHistory()
      return
    }

    const lineIndex = lines.value.findIndex(l => l.id === selectedShapeId.value)
    if (lineIndex !== -1) {
      lines.value.splice(lineIndex, 1)
      selectedShapeId.value = ''
      updateTransformer()
      saveHistory()
    }
  }

  function selectLayer (layerId: string): void {
    selectedShapeId.value = layerId

    const rect = rectangles.value.find(r => r.id === layerId)
    const ellipse = ellipses.value.find(e => e.id === layerId)
    const straightLine = straightLines.value.find(l => l.id === layerId)

    if (rect || ellipse || straightLine) {
      updateStylePanel()
    }

    updateTransformer()
  }

  function deleteLayer (layerId: string): void {
    const rectIndex = rectangles.value.findIndex(r => r.id === layerId)
    if (rectIndex !== -1) {
      rectangles.value.splice(rectIndex, 1)
      if (selectedShapeId.value === layerId) {
        selectedShapeId.value = ''
        updateTransformer()
      }
      saveHistory()
      return
    }

    const ellipseIndex = ellipses.value.findIndex(e => e.id === layerId)
    if (ellipseIndex !== -1) {
      ellipses.value.splice(ellipseIndex, 1)
      if (selectedShapeId.value === layerId) {
        selectedShapeId.value = ''
        updateTransformer()
      }
      saveHistory()
      return
    }

    const straightLineIndex = straightLines.value.findIndex(l => l.id === layerId)
    if (straightLineIndex !== -1) {
      straightLines.value.splice(straightLineIndex, 1)
      if (selectedShapeId.value === layerId) {
        selectedShapeId.value = ''
        updateTransformer()
      }
      saveHistory()
      return
    }

    const lineIndex = lines.value.findIndex(l => l.id === layerId)
    if (lineIndex !== -1) {
      lines.value.splice(lineIndex, 1)
      if (selectedShapeId.value === layerId) {
        selectedShapeId.value = ''
        updateTransformer()
      }
      saveHistory()
    }
  }

  function applyStyles (): void {
    if (!selectedShapeId.value) return

    const rect = rectangles.value.find(r => r.id === selectedShapeId.value)
    if (rect) {
      rect.fill = stylePanel.fill
      rect.stroke = stylePanel.stroke
      rect.strokeWidth = stylePanel.strokeWidth
      rect.opacity = stylePanel.opacity
      rect.cornerRadius = stylePanel.cornerRadius
      rect.text = stylePanel.text
      rect.fontSize = stylePanel.fontSize
      rect.textColor = stylePanel.textColor
      saveHistory()
      return
    }

    const ellipse = ellipses.value.find(e => e.id === selectedShapeId.value)
    if (ellipse) {
      ellipse.fill = stylePanel.fill
      ellipse.stroke = stylePanel.stroke
      ellipse.strokeWidth = stylePanel.strokeWidth
      ellipse.opacity = stylePanel.opacity
      ellipse.text = stylePanel.text
      ellipse.fontSize = stylePanel.fontSize
      ellipse.textColor = stylePanel.textColor
      saveHistory()
      return
    }

    const straightLine = straightLines.value.find(l => l.id === selectedShapeId.value)
    if (straightLine) {
      straightLine.stroke = stylePanel.stroke
      straightLine.strokeWidth = stylePanel.strokeWidth
      straightLine.opacity = stylePanel.opacity
      saveHistory()
      return
    }
  }

  function updateStylePanel (): void {
    if (!selectedShapeId.value) return

    const rect = rectangles.value.find(r => r.id === selectedShapeId.value)
    if (rect) {
      stylePanel.fill = rect.fill
      stylePanel.stroke = rect.stroke
      stylePanel.strokeWidth = rect.strokeWidth
      stylePanel.opacity = rect.opacity
      stylePanel.cornerRadius = rect.cornerRadius
      stylePanel.text = rect.text
      stylePanel.fontSize = rect.fontSize
      stylePanel.textColor = rect.textColor
      return
    }

    const ellipse = ellipses.value.find(e => e.id === selectedShapeId.value)
    if (ellipse) {
      stylePanel.fill = ellipse.fill
      stylePanel.stroke = ellipse.stroke
      stylePanel.strokeWidth = ellipse.strokeWidth
      stylePanel.opacity = ellipse.opacity
      stylePanel.cornerRadius = 0
      stylePanel.text = ellipse.text
      stylePanel.fontSize = ellipse.fontSize
      stylePanel.textColor = ellipse.textColor
      return
    }

    const straightLine = straightLines.value.find(l => l.id === selectedShapeId.value)
    if (straightLine) {
      stylePanel.stroke = straightLine.stroke
      stylePanel.strokeWidth = straightLine.strokeWidth
      stylePanel.opacity = straightLine.opacity
      return
    }
  }

  function saveHistory (): void {
    history.value = history.value.slice(0, historyStep.value + 1)

    const state = {
      rectangles: JSON.parse(JSON.stringify(rectangles.value)),
      ellipses: JSON.parse(JSON.stringify(ellipses.value)),
      straightLines: JSON.parse(JSON.stringify(straightLines.value)),
      lines: JSON.parse(JSON.stringify(lines.value)),
    }
    history.value.push(state as any)
    historyStep.value++

    if (history.value.length > 50) {
      history.value.shift()
      historyStep.value--
    }
  }

  function handleUndo (): void {
    if (historyStep.value === 0) return

    historyStep.value--
    const snapshot = history.value[historyStep.value] as any

    rectangles.value = JSON.parse(JSON.stringify(snapshot.rectangles || snapshot))
    ellipses.value = JSON.parse(JSON.stringify(snapshot.ellipses || []))
    straightLines.value = JSON.parse(JSON.stringify(snapshot.straightLines || []))
    lines.value = JSON.parse(JSON.stringify(snapshot.lines || []))

    selectedShapeId.value = ''
    updateTransformer()
  }

  function handleRedo (): void {
    if (historyStep.value === history.value.length - 1) return

    historyStep.value++
    const snapshot = history.value[historyStep.value] as any

    rectangles.value = JSON.parse(JSON.stringify(snapshot.rectangles || snapshot))
    ellipses.value = JSON.parse(JSON.stringify(snapshot.ellipses || []))
    straightLines.value = JSON.parse(JSON.stringify(snapshot.straightLines || []))
    lines.value = JSON.parse(JSON.stringify(snapshot.lines || []))

    selectedShapeId.value = ''
    updateTransformer()
  }

  function updateTransformer (): void {
    if (!transformerRef.value) return

    const transformerNode = transformerRef.value.getNode()
    const stage = transformerNode.getStage()

    if (!selectedShapeId.value) {
      transformerNode.nodes([])
      return
    }

    // Check if selected shape is a straight line
    const isStraightLine = straightLines.value.some(l => l.id === selectedShapeId.value)
    if (isStraightLine) {
      // Don't use transformer for straight lines - they use draggable circles
      transformerNode.nodes([])
      return
    }

    const selectedNode = stage.findOne(`.${selectedShapeId.value}`)

    if (selectedNode) {
      transformerNode.nodes([selectedNode])
    } else {
      transformerNode.nodes([])
    }
  }

  function handleStageMouseDown (e: any): void {
    if (isDrawing.value || isErasing.value) {
      isPaint.value = true
      const pos = e.target.getStage().getPointerPosition()

      const tool = isErasing.value ? 'eraser' : 'brush'

      currentLine.value = {
        id: generateLineId(),
        tool: tool,
        points: [pos.x, pos.y],
        stroke: isErasing.value ? '#000000' : drawingStyle.stroke,
        strokeWidth: isErasing.value ? eraserStyle.strokeWidth : drawingStyle.strokeWidth,
        opacity: isErasing.value ? 1 : drawingStyle.opacity,
        x: 0,
        y: 0,
        draggable: true,
        zIndex: getNextZIndex(),
      }

      lines.value.push(currentLine.value)
      return
    }

    if (e.target === e.target.getStage()) {
      selectedShapeId.value = ''
      updateTransformer()
      return
    }

    const clickedOnTransformer = e.target.getParent()?.className === 'Transformer'
    if (clickedOnTransformer) return

    const target = e.target
    let name = target.name()

    // Check if clicked on a circle endpoint
    if (name && name.includes('-circle-')) {
      name = name.split('-circle-')[0]
    }

    if (!name || target.getParent()?.className === 'Group') {
      const parent = target.getParent()
      if (parent && parent.name) {
        name = parent.name()
      }
    }

    if (!name) return

    const rect = rectangles.value.find(r => r.id === name)
    const ellipse = ellipses.value.find(e => e.id === name)
    const straightLine = straightLines.value.find(l => l.id === name)
    const line = lines.value.find(l => l.id === name)

    if (rect || ellipse || straightLine || line) {
      selectedShapeId.value = name
      if (rect || ellipse || straightLine) {
        updateStylePanel()
      }
      updateTransformer()
    }
  }

  function handleShapeClick (e: any): void {
    if (isDrawing.value) return

    const target = e.target
    let name = target.name()

    if (name && name.includes('-circle-')) {
      name = name.split('-circle-')[0]
    }

    if (!name || target.getParent()?.className === 'Group') {
      const parent = target.getParent()
      if (parent && parent.name) {
        name = parent.name()
      }
    }

    if (!name) return

    selectedShapeId.value = name

    const rect = rectangles.value.find(r => r.id === name)
    const ellipse = ellipses.value.find(e => e.id === name)
    const straightLine = straightLines.value.find(l => l.id === name)

    if (rect || ellipse || straightLine) {
      updateStylePanel()
    }

    updateTransformer()
  }

  function handleCircleClick (e: any, lineId: string): void {
    e.cancelBubble = true
    selectedShapeId.value = lineId
    updateStylePanel()
  }

  function handleCircleDrag (e: any, lineId: string, endpoint: 'start' | 'end'): void {
    const line = straightLines.value.find(l => l.id === lineId)
    if (!line) return

    const pos = e.target.position()

    if (endpoint === 'start') {
      line.startX = pos.x
      line.startY = pos.y
    } else {
      line.endX = pos.x
      line.endY = pos.y
    }
  }

  function handleMouseMove (e: any): void {
    const stage = e.target.getStage()
    const pos = stage.getPointerPosition()

    // Update cursor circle position when in drawing or eraser mode
    if (isDrawing.value || isErasing.value) {
      cursorCircle.x = pos.x
      cursorCircle.y = pos.y
      cursorCircle.visible = true
    }

    // Continue with brush/eraser drawing
    if (!isPaint.value || !currentLine.value) return

    currentLine.value.points = [...currentLine.value.points, pos.x, pos.y]
  }

  function handleMouseUp (): void {
    if (!isPaint.value) return

    isPaint.value = false

    if (currentLine.value) {
      saveHistory()
      currentLine.value = null
    }
  }

  function handleMouseLeave (): void {
    // Hide cursor circle
    cursorCircle.visible = false

    // Stop painting if mouse leaves while drawing
    if (isPaint.value) {
      isPaint.value = false
      if (currentLine.value) {
        saveHistory()
        currentLine.value = null
      }
    }
  }

  function handleLineDragEnd (e: any, lineId: string): void {
    const line = lines.value.find(l => l.id === lineId)
    if (!line) return

    line.x = e.target.x()
    line.y = e.target.y()

    saveHistory()
  }

  function handleLineTransformEnd (e: any): void {
    const name = e.target.name()
    const line = lines.value.find(l => l.id === name)
    if (!line) return

    line.x = e.target.x()
    line.y = e.target.y()

    saveHistory()
  }

  function handleTransformEnd (e: any): void {
    const name = e.target.name()
    const rect = rectangles.value.find(r => r.id === name)
    if (!rect) return

    const node = e.target

    rect.x = node.x()
    rect.y = node.y()
    rect.rotation = node.rotation()
    rect.scaleX = node.scaleX()
    rect.scaleY = node.scaleY()

    saveHistory()
  }

  function handleDragEnd (e: any): void {
    const name = e.target.name()
    const rect = rectangles.value.find(r => r.id === name)
    if (!rect) return

    const node = e.target
    rect.x = node.x()
    rect.y = node.y()

    saveHistory()
  }

  function handleEllipseDragEnd (e: any): void {
    const name = e.target.name()
    const ellipse = ellipses.value.find(e => e.id === name)
    if (!ellipse) return

    const node = e.target
    ellipse.x = node.x()
    ellipse.y = node.y()

    saveHistory()
  }

  function handleEllipseTransformEnd (e: any): void {
    const name = e.target.name()
    const ellipse = ellipses.value.find(e => e.id === name)
    if (!ellipse) return

    const node = e.target

    ellipse.x = node.x()
    ellipse.y = node.y()
    ellipse.rotation = node.rotation()
    ellipse.scaleX = node.scaleX()
    ellipse.scaleY = node.scaleY()

    saveHistory()
  }

  function handleResize (): void {
    stageConfig.width = window.innerWidth
    stageConfig.height = window.innerHeight - 200
  }

  onMounted(() => {
    window.addEventListener('resize', handleResize)
    window.addEventListener('keydown', handleKeyDown)

    nextTick(() => {
      updateTransformer()
    })
  })

  function handleKeyDown (e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      if (isDrawing.value) {
        isDrawing.value = false
        isPaint.value = false
        currentLine.value = null
        cursorCircle.visible = false
      }
      if (isErasing.value) {
        isErasing.value = false
        isPaint.value = false
        cursorCircle.visible = false
      }
    }

    if (e.key === 'Delete' && selectedShapeId.value) {
      deleteSelected()
    }
  }

  watch(selectedShapeId, () => {
    nextTick(() => {
      updateTransformer()
    })
  })
</script>

<style scoped>
.konva-canvas-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.v-stage {
  cursor: default;
  background-color: #f5f5f5;
}

.v-stage[data-drawing="true"],
.v-stage[data-erasing="true"] {
  cursor: crosshair;
}

.gap-4 {
  gap: 1rem;
}

/* Input group with label above (Bootstrap style) */
.input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0;
  text-align: left;
}

/* Clean button styling similar to Claude/ChatGPT */
:deep(.v-btn) {
  text-transform: none;
  letter-spacing: normal;
  font-weight: 500;
  border-radius: 8px;
  box-shadow: none !important;
}

:deep(.v-btn:hover) {
  background-color: rgba(0, 0, 0, 0.05);
}

:deep(.v-btn--elevated) {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
}

:deep(.v-btn--icon) {
  border-radius: 8px;
}

/* Clean input styling */
:deep(.v-text-field) {
  border-radius: 8px;
}

:deep(.v-field) {
  border-radius: 8px;
  box-shadow: none;
  border: 1px solid #e0e0e0;
  background-color: #ffffff;
}

:deep(.v-field--focused) {
  border-color: #2196f3;
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.1);
}

:deep(.v-field__input) {
  padding: 8px 12px;
  min-height: 36px;
}

:deep(.v-field__outline) {
  display: none;
}

:deep(.v-input__details) {
  padding-top: 4px;
  min-height: 0;
}

:deep(.v-field--disabled) {
  opacity: 0.5;
}

/* Clean toolbar styling */
:deep(.v-toolbar) {
  background-color: #ffffff;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: none !important;
}

/* Style panel with cleaner look */
:deep(.v-sheet) {
  border-bottom: 1px solid #e0e0e0;
  background-color: #fafafa;
}

/* Cleaner divider */
:deep(.v-divider) {
  border-color: #e0e0e0;
}

/* Tooltip styling */
:deep(.v-tooltip .v-overlay__content) {
  background-color: rgba(0, 0, 0, 0.85);
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 500;
}

/* Layers dialog styling */
:deep(.v-dialog .v-card) {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

:deep(.v-card-title) {
  font-size: 18px;
  font-weight: 600;
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
}

:deep(.v-list-item) {
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s;
}

:deep(.v-list-item:hover) {
  background-color: rgba(0, 0, 0, 0.02);
}

:deep(.v-list-item-title) {
  font-size: 14px;
  font-weight: 500;
}

:deep(.v-list-item-subtitle) {
  font-size: 12px;
  color: #666;
}

/* Draggable layers styling */
.layer-item {
  cursor: pointer;
  transition: all 0.2s;
}

.drag-handle {
  cursor: grab !important;
  opacity: 0.5;
  transition: opacity 0.2s;
}

.drag-handle:hover {
  opacity: 1;
}

.drag-handle:active {
  cursor: grabbing !important;
}

.ghost-layer {
  opacity: 0.5;
  background-color: #e3f2fd;
}

.sortable-chosen {
  opacity: 0.8;
}

.sortable-drag {
  opacity: 0;
}
</style>
