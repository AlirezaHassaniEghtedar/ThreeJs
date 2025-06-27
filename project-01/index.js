import * as THREE from "three";
import { OrbitControls } from "jsm/controls/OrbitControls.js"

const moveBtn = document.querySelector(".move")

const width = window.innerWidth;
const height = window.innerHeight;

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(width, height)
renderer.setPixelRatio(window.devicePixelRatio)

document.body.appendChild(renderer.domElement)

const fov = 75;
const aspect = width / height;
const near = 0.1;
const far = 10;

const camera = new THREE.PerspectiveCamera(fov, aspect, near, far)

camera.position.z = 2;

const scene = new THREE.Scene();

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.dampingFactors = 0.03

const geometry = new THREE.IcosahedronGeometry(1.0, 2)

const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    flatShading: true
})

const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

const wireMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: true
})

const wireMesh = new THREE.Mesh(geometry, wireMaterial)
mesh.add(wireMesh)

const hemiLight = new THREE.HemisphereLight(0x55ccaa, 0x000000)
scene.add(hemiLight)

let targetSkyColor = new THREE.Color(0x00ccff);
let targetGroundColor = new THREE.Color(0x000ccc);

function animate(t = 0) {
    requestAnimationFrame(animate)

    mesh.rotation.x += 0.001;
    mesh.rotation.y -= 0.001;

    hemiLight.color.lerp(targetSkyColor, 0.001);
    hemiLight.groundColor.lerp(targetGroundColor, 0.001);

    renderer.render(scene, camera)
    controls.update()
}

function handleMoveBtn(t = 0) {
    requestAnimationFrame(handleMoveBtn)

    t *= 0.002
    const wireMeshScalarValue = (1 / 8) * Math.cos(t) + (1.125 + 0.001)
    wireMesh.scale.setScalar(wireMeshScalarValue)

    renderer.render(scene, camera)
    controls.update()
}

moveBtn.addEventListener("click", handleMoveBtn)

animate()