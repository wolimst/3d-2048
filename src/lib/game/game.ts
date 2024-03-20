import * as core from './core'
import type {
  _History,
  Cell,
  Cube,
  Direction,
  GameInterface,
  HistoryInterface,
  Position,
  Status
} from './types'

export class Game implements GameInterface, HistoryInterface<Cube> {
  #status: Status
  #cube: Cube
  #history: _History<Cube>

  constructor() {
    this.#status = {
      status: 'playing',
      score: 0
    }
    this.#cube = [[[]]]
    // TODO: add initial cells
    this.#history = {
      values: [this.#cube],
      index: 0
    }
  }

  get cube(): Cube {
    return this.#cube
  }

  get status(): Status {
    return this.#status
  }

  // TODO: make private
  set cube(cube: Cube) {
    this.#cube = cube
  }

  // TODO: make private
  setCell(cell: Cell, position: Position) {
    this.#cube = core.setCell(this.#cube, cell, position)
  }

  shift(direction: Direction) {
    // TODO: check game status

    const shifted = core.shift(this.#cube, direction)
    this.#cube = shifted

    // TODO: add new cell

    this._updateHistory(shifted)

    // TODO: check cube and update game status
  }

  private _updateHistory(cube: Cube) {
    const { values, index } = this.#history
    const newValues = values.slice(0, index)
    newValues.push(cube)
    this.#history = {
      values: newValues,
      index: index + 1
    }
  }

  undo(): Cube | undefined {
    const { values, index } = this.#history
    if (index === 0) {
      return undefined
    }
    this.#cube = values[index - 1]
    this.#history = {
      values: values,
      index: index - 1
    }
    return this.#cube
  }

  redo(): Cube | undefined {
    const { values, index } = this.#history
    if (index === values.length) {
      return undefined
    }
    this.#cube = values[index]
    this.#history = {
      values: values,
      index: index + 1
    }
    return this.#cube
  }
}
