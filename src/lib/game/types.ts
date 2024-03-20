// TODO: make readonly?
export interface GameInterface {
  status: Status
  cube: Cube
  shift(direction: Direction): void
}

export type Status = {
  status: 'playing' | 'win' | 'lose'
  score: number
}

export interface HistoryInterface<T> {
  undo(): T | undefined
  redo(): T | undefined
}

export type _History<T> = {
  readonly values: T[]
  readonly index: number
}

export type Cube = readonly (readonly (readonly Cell[])[])[]

export interface Cell {
  readonly type: 'empty' | 'number'
  readonly value: number
}

export type Position = readonly [number, number, number]

export type Direction =
  | readonly [1, 0, 0]
  | readonly [-1, 0, 0]
  | readonly [0, 1, 0]
  | readonly [0, -1, 0]
  | readonly [0, 0, 1]
  | readonly [0, 0, -1]
