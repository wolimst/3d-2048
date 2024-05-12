export interface UIConfig {
  backgroundColor: string
  edgeColor: string
  width: number
  height: number
  cellCount: number
  cellSize: number
  gap: number
  animationDelta: number
}

export const defaultConfig: UIConfig = {
  backgroundColor: 'rgb(127, 127, 127)',
  edgeColor: '#ffffff',
  width: 700,
  height: 700,
  cellCount: 3,
  cellSize: 1,
  gap: 0.6,
  animationDelta: 0.05
}
