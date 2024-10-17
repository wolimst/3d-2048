import * as game from '$lib/game'
import * as THREE from 'three'

export interface Cell extends game.Cell {
  readonly index: game.IndexedPosition
  readonly object: {
    readonly cube: THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial>
    readonly text: THREE.Object3D
  }
}
