import { EMPTY_ITEM } from './constants'
import type { Cube, Direction, Item, Position } from './types'

type RotationDegree = -180 | -90 | 0 | 90 | 180
type Rotation = readonly [RotationDegree, RotationDegree]

export function addItem(cube: Cube, position: Position): Cube {
  // TODO
}

export function getItem(cube: Cube, position: Position): Item {
  const [x, y, z] = position
  return cube[x][y][z]
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

function mergeItemsToFront(items: readonly Item[]): readonly Item[] {
  const nonEmptyItems = items.filter((item) => item !== EMPTY_ITEM)

  const result: Item[] = []
  while (nonEmptyItems.length > 0) {
    const a = nonEmptyItems.pop()!
    const b = nonEmptyItems.at(0) || EMPTY_ITEM

    if (isMergeable(a, b)) {
      result.push(double(a))
      nonEmptyItems.pop()
    } else {
      result.push(a)
    }
  }

  while (result.length === items.length) {
    result.push(EMPTY_ITEM)
  }

  return result
}

function isMergeable(a: Item, b: Item): boolean {
  return a.type === 'number' && b.type === 'number' && a.value === b.value
}

function double(item: Item): Item {
  if (item.type !== 'number') {
    throw new Error(`invalid item type: ${item.type}`)
  }
  return {
    type: item.type,
    value: item.value * 2
  }
}
