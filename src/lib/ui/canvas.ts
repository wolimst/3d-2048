import * as game from '$lib/game'
import type { Cell } from '$lib/ui'
import { defaultConfig, type UIConfig } from './config'
import * as THREE from 'three'
import { ArcballControls } from 'three/addons/controls/ArcballControls.js'
import { Text } from 'troika-three-text'

const DIRECTIONS: game.Direction[] = [
  [1, 0, 0],
  [-1, 0, 0],
  [0, 1, 0],
  [0, -1, 0],
  [0, 0, 1],
  [0, 0, -1]
]

export class Canvas {
  config: UIConfig
  domContainer: HTMLElement
  renderer: THREE.Renderer
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  controls: ArcballControls
  raycaster: THREE.Raycaster
  cells: Cell[]
  arrows: THREE.ArrowHelper[]
  intersects: THREE.Intersection[]

  constructor(domContainer: HTMLElement, config = defaultConfig) {
    this.domContainer = domContainer
    this.config = config

    // Create a scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(config.backgroundColor)

    // Create a camera
    const camera = new THREE.PerspectiveCamera(
      45,
      domContainer.clientWidth / domContainer.clientHeight,
      1,
      2000
    )
    const distance =
      (config.gap * (config.cellCount - 1) + config.cellCount) *
      config.cellSize *
      Math.sqrt(3) *
      0.9
    camera.position.set(distance * 1.25, distance, distance * 0.5)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(domContainer.clientWidth, domContainer.clientHeight)
    domContainer.appendChild(renderer.domElement)

    const controls = new ArcballControls(camera, renderer.domElement)
    const raycaster = new THREE.Raycaster()
    const cells: Cell[] = []
    const arrows: THREE.ArrowHelper[] = []

    this.renderer = renderer
    this.scene = scene
    this.camera = camera
    this.controls = controls
    this.raycaster = raycaster
    this.cells = cells
    this.arrows = arrows
    this.intersects = []

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

    function drawArrows() {
      for (const dir of DIRECTIONS) {
        const direction = new THREE.Vector3(...dir)
        const originOffset =
          ((config.gap * config.cellCount + config.cellCount) *
            config.cellSize) /
          2
        const origin = direction.clone().multiplyScalar(originOffset)
        const arrow = new THREE.ArrowHelper(
          direction,
          origin,
          config.arrowSize * config.cellSize,
          config.arrowColor,
          0.5 * config.arrowSize * config.cellSize,
          0.4 * config.arrowSize * config.cellSize
        )
        arrow.userData = { dir }
        scene.add(arrow)
        arrows.push(arrow)
      }
    }
    drawArrows()

    renderer.domElement.addEventListener(
      'mousemove',
      this.onMouseMove.bind(this)
    )
    renderer.domElement.addEventListener('click', this.onClick.bind(this))
    window.addEventListener('resize', this.onResize.bind(this))

    this.render()
  }

  get domElement() {
    return this.renderer.domElement
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
    const geometry = new THREE.BoxGeometry(
      this.config.cellSize,
      this.config.cellSize,
      this.config.cellSize
    )
    const material = new THREE.MeshBasicMaterial({
      side: THREE.BackSide,
      color: this.config.cellColors[event.cell.value].cell
    })
    const cube = new THREE.Mesh(geometry, material)

    const position = calculatePosition(event.index, this.config)
    cube.position.set(...position)

    const text = new Text()
    text.text = event.cell.value.toString()
    text.anchorX = 'center'
    text.anchorY = 'middle'
    text.fontSize = 0.5 * this.config.cellSize
    text.color = this.config.cellColors[event.cell.value].text
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

  onMouseMove(event: MouseEvent) {
    const rect = this.renderer.domElement.getBoundingClientRect()
    const pointerX =
      ((event.clientX - rect.left) / this.renderer.domElement.clientWidth) * 2 -
      1
    const pointerY =
      (-(event.clientY - rect.top) / this.renderer.domElement.clientHeight) *
        2 +
      1

    this.raycaster.setFromCamera(
      new THREE.Vector2(pointerX, pointerY),
      this.camera
    )

    this.intersects = this.raycaster.intersectObjects(
      [
        ...this.cells.map((cell) => cell.object.cube),
        ...this.arrows.map((arrow) => arrow.cone)
      ],
      false
    )

    // Reset colors
    this.cells.forEach((cell) =>
      cell.object.cube.material.color.set(
        this.config.cellColors[cell.value].cell
      )
    )
    this.arrows.forEach((arrow) => arrow.setColor(this.config.arrowColor))

    if (this.intersects.length === 0) {
      return
    }

    const hoveredCellObject = this.cells.find(
      (cell) => cell.object.cube === this.intersects[0].object
    )?.object.cube
    if (hoveredCellObject) {
      hoveredCellObject.material.color.lerp(new THREE.Color('black'), 0.2)
      return
    }
    const hoveredArrow = this.arrows.find(
      (arrow) => arrow.cone === this.intersects[0].object
    )
    if (hoveredArrow) {
      const color = new THREE.Color(this.config.arrowColor)
      hoveredArrow.setColor(color.lerp(new THREE.Color('black'), 0.2))
    }
  }

  onClick(_event: MouseEvent) {
    if (this.intersects.length === 0) {
      return
    }

    const clickedArrow = this.arrows.find(
      (arrow) => arrow.cone === this.intersects[0].object
    )
    if (clickedArrow) {
      const event = new CustomEvent<game.Direction>('shift', {
        detail: clickedArrow.userData.dir
      })
      this.renderer.domElement.dispatchEvent(event)
    }
  }

  onResize(_event: Event) {
    this.camera.aspect =
      this.domContainer.clientWidth / this.domContainer.clientHeight
    this.camera.updateProjectionMatrix()

    this.renderer.setSize(
      this.domContainer.clientWidth,
      this.domContainer.clientHeight
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
