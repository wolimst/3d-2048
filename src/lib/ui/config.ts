export interface UIConfig {
  readonly backgroundColor: string
  readonly cellColors: CellColor
  readonly edgeColor: string
  readonly cellCount: number
  readonly cellSize: number
  readonly gap: number
  readonly arrowSize: number
  readonly arrowColor: string
  readonly animationDelta: number
}

interface CellColor {
  readonly [key: string | number]: {
    readonly cell: string
    readonly text: string
  }
}

export const defaultConfig: UIConfig = {
  backgroundColor: '#bbada0',
  cellColors: {
    2: {
      cell: '#eee4da',
      text: '#776e65'
    },
    4: {
      cell: '#ede0c8',
      text: '#776e65'
    },
    8: {
      cell: '#f2b179',
      text: '#f9f6f2'
    },
    16: {
      cell: '#f59563',
      text: '#f9f6f2'
    },
    32: {
      cell: '#f67c5f',
      text: '#f9f6f2'
    },
    64: {
      cell: '#f65e3b',
      text: '#f9f6f2'
    },
    128: {
      cell: '#edcf72',
      text: '#f9f6f2'
    },
    256: {
      cell: '#edcc61',
      text: '#f9f6f2'
    },
    512: {
      cell: '#edc850',
      text: '#f9f6f2'
    },
    1024: {
      cell: '#edc53f',
      text: '#f9f6f2'
    },
    2048: {
      cell: '#edc22e',
      text: '#f9f6f2'
    },
    4096: {
      cell: '#ef656d',
      text: '#f9f6f2'
    },
    8192: {
      cell: '#ed4d58',
      text: '#f9f6f2'
    },
    16384: {
      cell: '#e14338',
      text: '#f9f6f2'
    },
    32768: {
      cell: '#72b4d6',
      text: '#f9f6f2'
    },
    65536: {
      cell: '#5ba0de',
      text: '#f9f6f2'
    },
    131072: {
      cell: '#0079bc',
      text: '#f9f6f2'
    }
  },
  edgeColor: '#f9f6f2',
  cellCount: 3,
  cellSize: 1,
  gap: 0.6,
  arrowSize: 1.25,
  arrowColor: '#776e65',
  animationDelta: 0.05
} as const
