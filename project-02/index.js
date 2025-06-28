import * as THREE from "three";
import { OrbitControls } from "jsm/controls/OrbitControls.js"
import getStarfield from "./src/getStarfield.js";
import { getFresnelMat } from "./src/getFresnelMat.js";

const w = window.innerWidth;
const h = window.innerHeight;

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(w, h);
renderer.setPixelRatio(window.devicePixelRatio)

document.body.appendChild(renderer.domElement);


const earthGroup = new THREE.Group();
earthGroup.rotation.z = -23.4 * Math.PI / 180;
scene.add(earthGroup);

new OrbitControls(camera, renderer.domElement)

const loader = new THREE.TextureLoader()

const geometry = new THREE.IcosahedronGeometry(1, 100);


let globe;

loader.load("./textures/8k_earth_daymap.jpg", (texture) => {
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")
  const img = texture.image;

  canvas.width = img.width
  canvas.height = img.height
  ctx.drawImage(img, 0, 0)

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(data[i] * 1.1, 255);
    data[i + 1] = Math.min(data[i + 1] * 1.1, 255);
    data[i + 2] = Math.min(data[i + 2] * 1.1, 255);
  }

  ctx.putImageData(imageData, 0, 0)

  const newTexture = new THREE.CanvasTexture(canvas);
  const material = new THREE.MeshStandardMaterial({
    map: newTexture , 
    blending : THREE.AdditiveBlending
  })

  globe = new THREE.Mesh(geometry, material)
  earthGroup.add(globe)
})

const lightsMat = new THREE.MeshBasicMaterial({
  map: loader.load("./textures/03_earthlights1k.jpg"),
  blending: THREE.AdditiveBlending
})
const lightMesh = new THREE.Mesh(geometry, lightsMat)
earthGroup.add(lightMesh)

const cloudsMat = new THREE.MeshStandardMaterial({
  map: loader.load("./textures/04_earthcloudmap.jpg"),
  transparent: true,
  opacity: 0.5,
  blending: THREE.AdditiveBlending
})
const cloudsMesh = new THREE.Mesh(geometry, cloudsMat)
cloudsMesh.scale.setScalar(1.003)
earthGroup.add(cloudsMesh)

const fresnelMat = getFresnelMat()
const glowMesh = new THREE.Mesh(geometry, fresnelMat)
glowMesh.scale.setScalar(1.007)
earthGroup.add(glowMesh)

const stars = getStarfield({ numStars: 2000 });
scene.add(stars)

const sunLight = new THREE.DirectionalLight(0xffffff , 0.5);
sunLight.position.set(-2, 0.5, 1.5)
scene.add(sunLight)


function animate() {
  requestAnimationFrame(animate)
  if (globe) {
    globe.rotation.y += 0.001;
    lightMesh.rotation.y += 0.001;
    cloudsMesh.rotation.y += 0.0015;
    glowMesh.rotation.y += 0.001;
  }

  renderer.render(scene, camera)
}

animate()