import { EMPTY_CELL } from './constants'
import type { Cube, Direction, Cell, Position } from './types'

type RotationDegree = -180 | -90 | 0 | 90 | 180
type Rotation = readonly [RotationDegree, RotationDegree]

export function getCell(cube: Cube, position: Position): Cell {
  const [x, y, z] = position
  return cube[x][y][z]
}

export function setCell(cube: Cube, cell: Cell, position: Position): Cube {
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

export function shift(cube: Cube, direction: Direction): Cube {
  const rotation = getRotation(direction)
  const rotated = rotate(cube, rotation)

  const shifted = rotated.map((yz) => yz.map((z) => mergeItemsToFront(z)))

  const reversedRotation = reverseRotation(rotation)
  const result = rotate(shifted, reversedRotation)

  return result
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

function rotate(cube: Cube, rotation: Rotation): Cube {
  // TODO
}

function mergeItemsToFront(items: readonly Cell[]): readonly Cell[] {
  const nonEmptyItems = items.filter((item) => item !== EMPTY_CELL)

  const result: Cell[] = []
  while (nonEmptyItems.length > 0) {
    const a = nonEmptyItems.pop()!
    const b = nonEmptyItems.at(0) || EMPTY_CELL

    if (isMergeable(a, b)) {
      result.push(double(a))
      nonEmptyItems.pop()
    } else {
      result.push(a)
    }
  }

  while (result.length === items.length) {
    result.push(EMPTY_CELL)
  }

  return result
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
