import type { Cell } from '$lib/game'

const COLOR: Record<number, string> = {
  0: 'rgb(238, 228, 218)',
  2: '#eee4da',
  4: '#ede0c8',
  8: '#f2b179',
  16: '#f59563',
  32: '#f67c5f',
  64: '#f65e3b',
  128: '#edcf72',
  256: '#edcc61',
  512: '#edc850',
  1024: '#edc53f',
  2048: '#edc22e'
}

export function getColor(cell: Cell): string {
  return COLOR[cell.value] || COLOR[0]
}
