import * as game from '$lib/game'
import * as THREE from 'three'

export interface Cell extends game.Cell {
  readonly index: game.IndexedPosition
  readonly object: {
    cube: THREE.Object3D
    text: THREE.Object3D
  }
}
