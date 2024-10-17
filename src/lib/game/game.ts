import { DIRECTIONS, EMPTY_CUBE } from './constants'
import * as core from './core'
import type {
  _History,
  CellEvent,
  Cube,
  Direction,
  _GameInterface,
  _HistoryInterface,
  State
} from './types'

export class Game
  implements _GameInterface, _HistoryInterface<readonly CellEvent[]>
{
  #cube: Cube
  #score: number
  #history: _History<readonly CellEvent[]>

  constructor() {
    this.#cube = EMPTY_CUBE
    this.#score = 0
    this.#history = {
      values: [],
      index: 0
    }
  }

  get cube(): Cube {
    return this.#cube
  }

  get state(): State {
    const shiftEvents = DIRECTIONS.flatMap((direction) =>
      core.shift(this.#cube, direction)
    )
    const playing = shiftEvents.length > 0

    return {
      playing,
      score: this.#score
    }
  }

  init(): readonly CellEvent[] {
    const events = core.createNewCells(this.#cube, 2)
    events.forEach((event) => {
      this.#cube = core.applyCellEvent(this.#cube, event)
    })
    return events
  }

  addNewCell(): readonly CellEvent[] {
    if (!this.state.playing) {
      return []
    }

    const events = core.createNewCells(this.#cube, 1)
    events.forEach((event) => {
      this.#cube = core.applyCellEvent(this.#cube, event)
    })

    this._updateHistory(events)

    return events
  }

  shift(direction: Direction): readonly CellEvent[] {
    if (!this.state.playing) {
      return []
    }

    let events: CellEvent[] = []

    const shiftEvents = core.shift(this.#cube, direction)
    if (shiftEvents.length === 0) {
      return []
    }

    shiftEvents.forEach((event) => {
      this.#cube = core.applyCellEvent(this.#cube, event)
    })
    events = events.concat(shiftEvents)

    const score = shiftEvents
      .filter((event) => event.type === 'create')
      .reduce((sum, event) => sum + event.cell.value, 0)
    this.#score += score

    if (this.state.playing) {
      const createEvents = core.createNewCells(this.#cube, 1)
      createEvents.forEach((event) => {
        this.#cube = core.applyCellEvent(this.#cube, event)
      })
      events = events.concat(createEvents)
    }

    this._updateHistory(events)

    return events
  }

  private _updateHistory(events: readonly CellEvent[]) {
    const { values, index } = this.#history
    const newValues = values.slice(0, index)
    newValues.push(events)
    this.#history = {
      values: newValues,
      index: index + 1
    }
  }

  undo(): readonly CellEvent[] | undefined {
    const { values, index } = this.#history
    if (index === 0) {
      return undefined
    }
    const events = values[index]
    const reversedEvents = events.map(core.reverseEvent).toReversed()
    events.forEach((event) => {
      this.#cube = core.applyCellEvent(this.#cube, event)
    })

    this.#history = {
      values: values,
      index: index - 1
    }
    return reversedEvents
  }

  redo(): readonly CellEvent[] | undefined {
    const { values, index } = this.#history
    if (index === values.length) {
      return undefined
    }
    const events = values[index]
    events.forEach((event) => {
      this.#cube = core.applyCellEvent(this.#cube, event)
    })

    this.#history = {
      values: values,
      index: index + 1
    }
    return events
  }
}
