import * as game from '$lib/game'
import type { Cell } from '$lib/ui'
import { defaultConfig, type UIConfig } from './config'
import * as THREE from 'three'
import { ArcballControls } from 'three/addons/controls/ArcballControls.js'
import { Text } from 'troika-three-text'

const CELL_GEOMETRY = new THREE.BoxGeometry()

export class Canvas2 {
  config: UIConfig
  renderer: THREE.Renderer
  scene: THREE.Scene
  camera: THREE.Camera
  controls: ArcballControls
  cells: Cell[]

  constructor(domElement: HTMLElement, config = defaultConfig) {
    this.config = config

    // Create a scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(config.backgroundColor)

    // Create a camera
    const camera = new THREE.PerspectiveCamera(
      45,
      config.width / config.height,
      1,
      2000
    )
    camera.position.z = 10

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(config.width, config.height)
    domElement.appendChild(renderer.domElement)

    const controls = new ArcballControls(camera, renderer.domElement)

    this.renderer = renderer
    this.scene = scene
    this.camera = camera
    this.controls = controls
    this.cells = []

    // function onWindowResize() {
    //   camera.aspect = window.innerWidth / window.innerHeight
    //   camera.updateProjectionMatrix()
    //   renderer.setSize(window.innerWidth, window.innerHeight)
    // }

    function drawCellEdges() {
      const boxGeometry = new THREE.BoxGeometry(
        config.cellSize,
        config.cellSize,
        config.cellSize
      )
      const edgesGeometry = new THREE.EdgesGeometry(boxGeometry)
      const edgesMaterial = new THREE.LineBasicMaterial({
        color: config.edgeColor
      })
      for (let i = 0; i < config.cellCount; i++) {
        for (let j = 0; j < config.cellCount; j++) {
          for (let k = 0; k < config.cellCount; k++) {
            const line = new THREE.LineSegments(edgesGeometry, edgesMaterial)
            const position = calculatePosition([i, j, k], config)
            line.position.set(...position)
            scene.add(line)
          }
        }
      }
    }
    drawCellEdges()

    this.render()
  }

  render() {
    requestAnimationFrame(this.render.bind(this))
    this.cells.forEach((cell) => {
      cell.object.text.quaternion.copy(this.camera.quaternion)
    })
    this.renderer.render(this.scene, this.camera)
  }

  applyCube(cube: game.Cube) {
    this.cells.forEach((cell) => {
      this.scene.remove(cell.object.cube)
    })
    this.cells = []
    cube.forEach((yz, i) => {
      yz.forEach((z, j) => {
        z.forEach((cell, k) => {
          if (cell === game.EMPTY_CELL) {
            return
          }
          this.createCell({
            type: 'create',
            index: [i, j, k],
            cell
          })
        })
      })
    })
  }

  applyCellEvent(event: game.CellEvent) {
    switch (event.type) {
      case 'move':
        this.moveCell(event)
        break
      case 'create':
        this.createCell(event)
        break
      case 'destroy':
        this.destroyCell(event)
        break
      default:
        // eslint-disable-next-line no-case-declarations
        const _exhaustiveCheck: never = event
        return _exhaustiveCheck
    }
  }

  moveCell(event: game.CellMoveEvent) {
    const cell = this.findCell(event.index)
    if (!cell) {
      return
    }

    this.cells = this.cells.filter((c) => c !== cell)
    this.cells.push({
      ...cell,
      index: event.newIndex
    })

    const [x, y, z] = calculatePosition(event.newIndex, this.config)
    function animate(
      object: THREE.Object3D,
      position: THREE.Vector3Like,
      value: number,
      target: number,
      delta: number
    ) {
      if (value < target) {
        requestAnimationFrame(() =>
          animate(object, position, value + delta, target, delta)
        )
      }
      object.position.lerp(position, value)
    }
    animate(cell.object.cube, { x, y, z }, 0, 1, this.config.animationDelta)
  }

  createCell(event: game.CellCreateEvent) {
    const material = new THREE.MeshBasicMaterial({
      side: THREE.BackSide,
      color: 0x00ff00 // TODO set color
    })
    const cube = new THREE.Mesh(CELL_GEOMETRY, material)

    const position = calculatePosition(event.index, this.config)
    cube.position.set(...position)

    const text = new Text()
    text.text = event.cell.value.toString()
    text.anchorX = 'center'
    text.anchorY = 'middle'
    text.fontSize = 0.5
    cube.add(text)

    cube.scale.setScalar(0)
    this.scene.add(cube)

    this.cells.push({
      ...event.cell,
      index: event.index,
      object: {
        cube,
        text
      }
    })

    function animate(
      object: THREE.Object3D,
      value: number,
      target: number,
      delta: number
    ) {
      if (value < target) {
        requestAnimationFrame(() =>
          animate(object, value + delta, target, delta)
        )
      }
      object.scale.setScalar(value)
    }
    animate(cube, 0, 1, this.config.animationDelta)
  }

  destroyCell(event: game.CellDestroyEvent) {
    const cell = this.findCell(event.index)
    if (!cell) {
      return
    }

    this.cells = this.cells.filter((c) => c !== cell)

    function animate(
      scene: THREE.Scene,
      object: THREE.Object3D,
      value: number,
      target: number,
      delta: number
    ) {
      if (value < target) {
        scene.remove(object)
        return
      }
      requestAnimationFrame(() =>
        animate(scene, object, value - delta, target, delta)
      )
      object.scale.setScalar(value)
    }
    animate(this.scene, cell.object.cube, 1, 0.2, this.config.animationDelta)
  }

  findCell(index: game.IndexedPosition): Cell | undefined {
    return this.cells.find(
      (cell) =>
        cell.index.length === index.length &&
        cell.index.every((v, i) => v === index[i])
    )
  }
}

function calculatePosition(
  index: game.IndexedPosition,
  config: UIConfig
): [number, number, number] {
  const [i, j, k] = index
  const length = config.gap * (config.cellCount - 1) + config.cellCount
  const x = config.cellSize * ((config.gap + 1) * i + 0.5 - length / 2)
  const y = config.cellSize * ((config.gap + 1) * j + 0.5 - length / 2)
  const z = config.cellSize * ((config.gap + 1) * k + 0.5 - length / 2)
  return [x, y, z]
}
