import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { Cube } from '$lib/game/types.ts'

// TODO: make these to be configurable
const WIDTH = 500;
const HEIGHT = 500;
const COLOR = {
  BG: new THREE.Color("rgb(127, 127, 127)"),
  NORMAL: new THREE.Color("rgb(256, 256, 256)"),
  HOVER: new THREE.Color("rgb(256, 0, 0)"),
}

const CubeColor: Record<number, THREE.Color> = {
  0: new THREE.Color("rgb(238, 228, 218)"),
  2: new THREE.Color(0xeee4da),
  4: new THREE.Color(0xede0c8),
  8: new THREE.Color(0xf2b179),
  16: new THREE.Color(0xf59563),
  32: new THREE.Color(0xf67c5f),
  64: new THREE.Color(0xf65e3b),
  128: new THREE.Color(0xedcf72),
  256: new THREE.Color(0xedcc61),
  512: new THREE.Color(0xedc850),
  1024: new THREE.Color(0xedc53f),
  2048: new THREE.Color(0xedc22e),
}
const CAMERA_DISTANCE = 5;

export class GameUI {
  _container;
  _renderer;
  _scene;
  _camera;
  _raycaster;
  _pointer;
  _controls;
  _edgePoints;
  _cube: Cube;
  _cubeMeshs: THREE.Mesh[];
  _lines: THREE.LineSegments[];

  constructor(container: HTMLElement, cube?: Cube) {

    this._container = container;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(WIDTH, HEIGHT);
    container.appendChild(renderer.domElement);
    this._renderer = renderer;

    const scene = new THREE.Scene();
    scene.background = COLOR.BG;
    this._scene = scene;

    const edgePoints = getEdgePoints(CAMERA_DISTANCE)

    const camera = new THREE.OrthographicCamera(-3, 3, 3, -3);
    camera.position.x = edgePoints[0].x;
    camera.position.y = edgePoints[0].y;
    camera.position.z = edgePoints[0].z;
    this._camera = camera;

    this._raycaster = new THREE.Raycaster();

    this._pointer = new THREE.Vector2();

    const controls = new OrbitControls(this._camera, this._renderer.domElement);
    controls.update();
    this._controls = controls

    this._edgePoints = edgePoints;

    const getEmptyPart = () => {
      return { type: 'empty', value: 0 }
    }
    if (cube) {
      this._cube = cube;
    } else {
      const cube = [];
      for (let i = 0; i < 3; i++) {
        const layer1 = [];
        for (let j = 0; j < 3; j++) {
          const layer2 = [];
          for (let z = 0; z < 3; z++) {
            layer2.push(getEmptyPart());
          }
          layer1.push(layer2);
        }
        cube.push(layer1);
      }
      this._cube = cube as Cube;
    }

    this._cubeMeshs = [];
    this._lines = [];
    this._setupModels();

    container.addEventListener('mousemove', this._onMouseMove.bind(this));
    container.addEventListener('mouseup', this._onMouseUp.bind(this));
    requestAnimationFrame(this.render.bind(this));
  }

  private _setupModels() {
    const GAP = 0.1;
    const SIZE = 1;
    const count = 3;
    const TOTAL_LENGTH = GAP * (count - 1) + SIZE * count;

    if (this._cube.length < 1
      || this._cube[0].length < 1
      || this._cube[0][0].length < 1) {
      return;
    }

    for (let i = 0; i < this._cube.length; i++) {
      for (let j = 0; j < this._cube[0].length; j++) {
        for (let k = 0; k < this._cube[0][0].length; k++) {
          const cubePart = this._cube[i][j][k];
          const boxGeometry = new THREE.BoxGeometry(SIZE, SIZE, SIZE);
          const material = new THREE.MeshBasicMaterial({
            color: CubeColor[cubePart.value] ?? CubeColor[0],
            transparent: true,
            opacity: 0.8,
          });
          const cube = new THREE.Mesh(boxGeometry, material);

          cube.position.x = - TOTAL_LENGTH / 2 + (GAP + SIZE) * i + SIZE / 2;
          cube.position.y = - TOTAL_LENGTH / 2 + (GAP + SIZE) * j + SIZE / 2;
          cube.position.z = - TOTAL_LENGTH / 2 + (GAP + SIZE) * k + SIZE / 2;
          this._cubeMeshs.push(cube);

          const edgesGeometry = new THREE.EdgesGeometry(boxGeometry);
          const edgesMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
          const line = new THREE.LineSegments(edgesGeometry, edgesMaterial);
          line.position.x = - TOTAL_LENGTH / 2 + (GAP + SIZE) * i + SIZE / 2;
          line.position.y = - TOTAL_LENGTH / 2 + (GAP + SIZE) * j + SIZE / 2;
          line.position.z = - TOTAL_LENGTH / 2 + (GAP + SIZE) * k + SIZE / 2;
          this._lines.push(line);
        }
      }
    }

    this._cubeMeshs.forEach(cube => this._scene.add(cube));
    this._lines.forEach(line => this._scene.add(line));
  }

  private _onMouseMove(e: MouseEvent) {
    this._updatePointer(e);
  }

  private _onMouseUp() {
    this._snapCamera();
  }

  private _updatePointer(e: MouseEvent) {
    const rect = this._renderer.domElement.getBoundingClientRect();
    this._pointer.y = - (e.clientY - rect.top) / HEIGHT * 2 + 1;
    this._pointer.x = (e.clientX - rect.left) / WIDTH * 2 - 1;
  }

  private _snapCamera() {
    const edgePointsDist2Cam = this._edgePoints.map(p => {
      return { position: p, distance: p.distanceTo(this._camera.position) }
    });
    const closestDistance = Math.min(...edgePointsDist2Cam.map(pd => pd.distance));
    const closestEdgePoints = edgePointsDist2Cam
      .filter(pd => pd.distance === closestDistance)
      .map(pd => pd.position);

    this._camera.position.x = closestEdgePoints[0].x;
    this._camera.position.y = closestEdgePoints[0].y;
    this._camera.position.z = closestEdgePoints[0].z;

    this._controls.update();
  }

  render() {
    this._renderer.render(this._scene, this._camera);

    requestAnimationFrame(this.render.bind(this));
  }

  update(gameData: Cube) {
    // TODO: implement
  }
}

function getEdgePoints(distance: number) {
  const edgePoints: THREE.Vector3[] = [];
  const cameraDistance = distance / Math.sqrt(3);
  const unitDirection = [1, -1];
  for (let x = 0; x < unitDirection.length; x++) {
    for (let y = 0; y < unitDirection.length; y++) {
      for (let z = 0; z < unitDirection.length; z++) {
        const posX = unitDirection[x] * cameraDistance;
        const posY = unitDirection[y] * cameraDistance;
        const posZ = unitDirection[z] * cameraDistance;
        edgePoints.push(new THREE.Vector3(posX, posY, posZ));
      }
    }
  }

  return edgePoints;
}
