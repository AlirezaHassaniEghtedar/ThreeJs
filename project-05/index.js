import * as THREE from "three";
import getLayer from "./getLayer.js";
import { getBody, getMouseBall } from "./getBodies.js";
import RAPIER from 'https://cdn.skypack.dev/@dimforge/rapier3d-compat@0.11.2';

const width = window.innerWidth;
const height = window.innerHeight;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);

camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(width, height);

renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;

document.body.appendChild(renderer.domElement);

let mousePos = new THREE.Vector2();
let mouseWorld = new THREE.Vector3();

await RAPIER.init();
const gravity = { x: 0.0, y: 0, z: 0.0 };
const world = new RAPIER.World(gravity);

const numBodies = 100;
const bodies = [];

for (let i = 0; i < numBodies; i++) {
    const body = getBody(RAPIER, world);
    bodies.push(body)
    scene.add(body.mesh)
}

const mouseBall = getMouseBall(RAPIER, world);
scene.add(mouseBall.mesh);

const hemiLight = new THREE.HemisphereLight(0x00bbff, 0xaa00ff);
scene.add(hemiLight);

const sprites = getLayer({
    hue: 0.0,
    numSprites: 8,
    opacity: 0.2,
    radius: 10,
    size: 24,
    z: -10.5
})
scene.add(sprites);

function animate() {
    requestAnimationFrame(animate)
    world.step()
    mouseBall.update(mouseWorld)
    bodies.forEach(b => b.update())
    renderer.render(scene, camera)
}

animate()

function handleWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    mouseBall.update(mouseWorld);
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight)
}

window.addEventListener("resize", handleWindowResize, false)


function handleMouseMove(evt) {
    mousePos.x = (evt.clientX / window.innerWidth) * 2 - 1;
    mousePos.y = - (evt.clientY / window.innerHeight) * 2 + 1;

    const ndc = new THREE.Vector3(mousePos.x, mousePos.y, 0.5);
    ndc.unproject(camera); 
    
    const ray = new THREE.Raycaster();
    ray.setFromCamera(mousePos, camera);

    const planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const target = new THREE.Vector3();
    ray.ray.intersectPlane(planeZ, target);

    mouseWorld.copy(target);
}

window.addEventListener("mousemove", handleMouseMove, false)