// TODO: make readonly?
export interface _GameInterface {
  state: State
  cube: Cube
  addNewCell(): readonly CellEvent[]
  shift(direction: Direction): readonly CellEvent[]
}

export type State = {
  playing: boolean
  score: number
}

export interface _HistoryInterface<T> {
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

export type CellEvent = CellMoveEvent | CellCreateEvent | CellDestroyEvent

export interface CellMoveEvent {
  readonly type: 'move'
  readonly cell: Cell
  readonly index: IndexedPosition
  readonly newIndex: IndexedPosition
}

export interface CellCreateEvent {
  readonly type: 'create'
  readonly cell: Cell
  readonly index: IndexedPosition
}

export interface CellDestroyEvent {
  readonly type: 'destroy'
  readonly cell: Cell
  readonly index: IndexedPosition
}

export type IndexedPosition = readonly [number, number, number]

export type Direction =
  | readonly [1, 0, 0]
  | readonly [-1, 0, 0]
  | readonly [0, 1, 0]
  | readonly [0, -1, 0]
  | readonly [0, 0, 1]
  | readonly [0, 0, -1]
