import { EMPTY_CELL } from './constants'
import type {
  Cell,
  CellCreateEvent,
  CellEvent,
  CellMoveEvent,
  Cube,
  Direction,
  IndexedPosition
} from './types'

type RotationDegree = -180 | -90 | 0 | 90 | 180
type Rotation = readonly [RotationDegree, RotationDegree]

export function getCell(cube: Cube, position: IndexedPosition): Cell {
  const [x, y, z] = position
  return cube[x][y][z]
}

export function setCell(
  cube: Cube,
  cell: Cell,
  position: IndexedPosition
): Cube {
  const [ix, iy, iz] = position
  const newCube = cube.map((yz, jx) =>
    yz.map((z, jy) => {
      if (ix === jx && iy === jy) {
        return z.toSpliced(iz, 1, cell)
      } else {
        return z
      }
    })
  )
  return newCube
}

export function createNewCells(
  cube: Cube,
  count: number
): readonly CellEvent[] {
  let _cube = cube
  const events: CellEvent[] = []
  for (let i = 0; i < count; i++) {
    const emptyPositions: IndexedPosition[] = []
    _cube.forEach((yz, ix) => {
      yz.forEach((z, iy) => {
        z.forEach((cell, iz) => {
          if (cell === EMPTY_CELL) {
            emptyPositions.push([ix, iy, iz])
          }
        })
      })
    })

    if (emptyPositions.length === 0) {
      break
    }

    const position =
      emptyPositions[Math.floor(Math.random() * emptyPositions.length)]
    const cell: Cell = {
      type: 'number',
      // TODO: check new cell value and probability
      value: Math.random() < 0.6 ? 2 : 4
    }
    const event: CellCreateEvent = {
      type: 'create',
      cell,
      index: position
    }
    events.push(event)
    _cube = applyCellEvent(_cube, event)
  }
  return events
}

export function shift(cube: Cube, direction: Direction): readonly CellEvent[] {
  const rotation = getRotation(direction)
  const rotated = rotateCube(cube, rotation)

  const cellEvents = rotated.flatMap((yz, i) =>
    yz.flatMap((z, j) => shiftToZ(z, [i, j, NaN]))
  )

  const reversedRotation = reverseRotation(rotation)
  const result = cellEvents.map((cellEvent) =>
    rotateCellEvent(cellEvent, reversedRotation)
  )

  return result
}

export function applyCellEvent(cube: Cube, event: CellEvent): Cube {
  let newCube = cube
  switch (event.type) {
    case 'move':
      newCube = setCell(newCube, EMPTY_CELL, event.index)
      newCube = setCell(newCube, event.cell, event.newIndex)
      break
    case 'create':
      newCube = setCell(newCube, event.cell, event.index)
      break
    case 'destroy':
      newCube = setCell(newCube, EMPTY_CELL, event.index)
      break
    default:
      // eslint-disable-next-line no-case-declarations
      const _exhaustiveCheck: never = event
      return _exhaustiveCheck
  }
  return newCube
}

export function rotate(cube: Cube, direction: Direction): Cube {
  const rotation = getRotation(direction)
  return rotateCube(cube, rotation)
}

function getRotation(shiftDirection: Direction): Rotation {
  if (shiftDirection[0] === 1) {
    return [0, 90]
  } else if (shiftDirection[0] === -1) {
    return [0, -90]
  } else if (shiftDirection[1] === 1) {
    return [-90, 0]
  } else if (shiftDirection[1] === -1) {
    return [90, 0]
  } else if (shiftDirection[2] === 1) {
    return [180, 0]
  } else if (shiftDirection[2] === -1) {
    return [0, 0]
  } else {
    throw new Error('should not reach here')
  }
}

function reverseRotation(rotation: Rotation): Rotation {
  const reversed = rotation.map((deg) => -deg) as [number, number] as Rotation
  return reversed
}

function rotatePosition(
  position: IndexedPosition,
  rotation: Rotation
): IndexedPosition {
  const [i, j, k] = position.map((items) => items - 1)
  const [a, b] = rotation.map((deg) => (deg / 180) * Math.PI)

  const ii =
    Math.cos(b) * i +
    Math.sin(b) * Math.sin(a) * j +
    Math.sin(b) * Math.cos(a) * k
  const jj = 0 * i + Math.cos(a) * j - Math.sin(a) * k
  const kk =
    -Math.sin(b) * i +
    Math.cos(b) * Math.sin(a) * j +
    Math.cos(b) * Math.cos(a) * k

  const result = [ii, jj, kk].map((number) => +number.toFixed(2) + 1)
  return result as [number, number, number] as IndexedPosition
}

function rotateCube(cube: Cube, rotation: Rotation): Cube {
  const result = structuredClone(cube) as Cell[][][]
  cube.forEach((yz, ix) => {
    yz.forEach((z, iy) => {
      z.forEach((cell, iz) => {
        const [jx, jy, jz] = rotatePosition([ix, iy, iz], rotation)
        result[jx][jy][jz] = cell
      })
    })
  })
  return result as Cube
}

function rotateCellEvent(cellEvent: CellEvent, rotation: Rotation): CellEvent {
  let rotated: CellEvent = {
    ...cellEvent,
    index: rotatePosition(cellEvent.index, rotation)
  }

  function isCellMoveEvent(cellEvent: CellEvent): cellEvent is CellMoveEvent {
    return cellEvent.type === 'move'
  }

  if (isCellMoveEvent(rotated)) {
    rotated = {
      ...rotated,
      newIndex: rotatePosition(rotated.newIndex, rotation)
    }
  }
  return rotated
}

function shiftToZ(
  cells: readonly Cell[],
  position: IndexedPosition
): readonly CellEvent[] {
  const [i, j, _] = position
  let events: CellEvent[] = []
  const resultCells: Cell[] = []
  let targetIndex = 0
  for (const [k, cell] of cells.entries()) {
    if (cell === EMPTY_CELL) {
      continue
    }

    const targetCell = resultCells.at(targetIndex)
    if (!targetCell) {
      resultCells.push(cell)
      if (k !== targetIndex) {
        events.push({
          type: 'move',
          cell,
          index: [i, j, k],
          newIndex: [i, j, targetIndex]
        })
      }
    } else if (isMergeable(targetCell, cell)) {
      resultCells[targetIndex] = double(targetCell)
      events = events.concat([
        {
          type: 'move',
          cell,
          index: [i, j, k],
          newIndex: [i, j, targetIndex]
        },
        {
          type: 'destroy',
          cell: targetCell,
          index: [i, j, targetIndex]
        },
        {
          type: 'destroy',
          cell,
          index: [i, j, targetIndex]
        },
        {
          type: 'create',
          cell: double(targetCell),
          index: [i, j, targetIndex]
        }
      ])
      targetIndex += 1
    } else {
      targetIndex += 1
      resultCells[targetIndex] = cell
      if (k !== targetIndex) {
        events.push({
          type: 'move',
          cell,
          index: [i, j, k],
          newIndex: [i, j, targetIndex]
        })
      }
    }
  }
  return events
}

function isMergeable(a: Cell, b: Cell): boolean {
  return a.type === 'number' && b.type === 'number' && a.value === b.value
}

function double(item: Cell): Cell {
  if (item.type !== 'number') {
    throw new Error(`invalid item type: ${item.type}`)
  }
  return {
    type: item.type,
    value: item.value * 2
  }
}

export function reverseEvent(event: CellEvent): CellEvent {
  switch (event.type) {
    case 'move':
      return {
        type: 'move',
        cell: event.cell,
        index: event.newIndex,
        newIndex: event.index
      }
    case 'create':
      return {
        type: 'destroy',
        cell: event.cell,
        index: event.index
      }
    case 'destroy':
      return {
        type: 'create',
        cell: event.cell,
        index: event.index
      }
    default:
      // eslint-disable-next-line no-case-declarations
      const _exhaustiveCheck: never = event
      return _exhaustiveCheck
  }
}

export function getScore(cell: Cell): number {
  if (cell.type !== 'number') {
    return 0
  }

  function _getScore(value: number): number {
    if (Math.log2(value) % 1 !== 0) {
      throw new Error('value should be power of 2')
    }

    if (value < 4) {
      return 0
    } else if (value === 4) {
      return 4
    } else {
      return value + _getScore(value / 2)
    }
  }

  return _getScore(cell.value)
}
