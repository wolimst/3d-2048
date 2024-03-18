// TODO: make readonly?
// export interface Game {
//   state: GameState
//   history: GameHistory
//   cube: Cube
// }

export type Cube = readonly (readonly (readonly Item[])[])[]

export type Position = readonly [number, number, number]

export type Direction =
  | readonly [1, 0, 0]
  | readonly [-1, 0, 0]
  | readonly [0, 1, 0]
  | readonly [0, -1, 0]
  | readonly [0, 0, 1]
  | readonly [0, 0, -1]

export interface Item {
  readonly type: 'empty' | 'number'
  readonly value: number
}
