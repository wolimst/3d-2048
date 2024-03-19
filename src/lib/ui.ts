import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// TODO: make these to be configurable
const WIDTH = 500;
const HEIGHT = 500;
const COLOR = {
  BG: new THREE.Color("rgb(127, 127, 127)"),
  NORMAL: new THREE.Color("rgb(256, 256, 256)"),
  HOVER: new THREE.Color("rgb(256, 0, 0)"),
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
  _cubes: THREE.Mesh[];
  _lines: THREE.LineSegments[];

  constructor(container: HTMLElement) {

    this._container = container;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(WIDTH, HEIGHT);
    container.appendChild(renderer.domElement);
    this._renderer = renderer;

    const scene = new THREE.Scene();
    scene.background = COLOR.BG;
    this._scene = scene;

    const edgePoints = getEdgePoints(CAMERA_DISTANCE)

    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
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

    this._cubes = [];
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

    for (let i = 0; i < count; i++) {
      for (let j = 0; j < count; j++) {
        for (let k = 0; k < count; k++) {
          const boxGeometry = new THREE.BoxGeometry(SIZE, SIZE, SIZE);
          const material = new THREE.MeshBasicMaterial({
            color: COLOR.NORMAL,
            transparent: true,
            opacity: 0.1,
          });
          const cube = new THREE.Mesh(boxGeometry, material);

          cube.position.x = - TOTAL_LENGTH / 2 + (GAP + SIZE) * i + SIZE / 2;
          cube.position.y = - TOTAL_LENGTH / 2 + (GAP + SIZE) * j + SIZE / 2;
          cube.position.z = - TOTAL_LENGTH / 2 + (GAP + SIZE) * k + SIZE / 2;
          this._cubes.push(cube);

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

    this._cubes.forEach(cube => this._scene.add(cube));
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
    this._raycaster.setFromCamera(this._pointer, this._camera);

    const intersects = this._raycaster.intersectObjects(this._cubes, false);

    for (let i = 0; i < this._scene.children.length; i++) {
      const obj = this._scene.children[i];
      if (obj instanceof THREE.Mesh) {
        if (obj.material instanceof THREE.MeshBasicMaterial) {
          obj.material.color = COLOR.NORMAL;
        }
      }
    }
    if (intersects?.length > 0) {

      const obj = intersects[0].object;
      if (obj instanceof THREE.Mesh) {
        if (obj.material instanceof THREE.MeshBasicMaterial) {
          obj.material.color = COLOR.HOVER;
        }
      }
    }

    this._renderer.render(this._scene, this._camera);

    requestAnimationFrame(this.render.bind(this));
  }

  // TODO: import GameData Type
  update(gameData: any) {
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
