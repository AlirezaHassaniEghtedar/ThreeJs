import * as THREE from "three";
import {OrbitControls} from "jsm/controls/OrbitControls.js";
import spline from "./spline.js";
import {EffectComposer} from "jsm/postprocessing/EffectComposer.js";
import {RenderPass} from "jsm/postprocessing/RenderPass.js";
import {UnrealBloomPass} from "jsm/postprocessing/UnrealBloomPass.js";

const width = window.innerWidth;
const height = window.innerHeight;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000 , 0.3);
const camera = new THREE.PerspectiveCamera(75 , width / height , 0.1 , 1000);

camera.position.z = 5;

const renderer = new THREE.WebGLRenderer();

renderer.setSize(width , height);
renderer.setPixelRatio(window.devicePixelRatio)

renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera , renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.3;

const renderScene = new RenderPass(scene , camera);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(width , height) , 1.5 , 0.4 , 100);
bloomPass.threshold = 0.002;
bloomPass.strength = 3.5;
bloomPass.radius = 0;
const composer = new EffectComposer(renderer);
composer.addPass(renderScene)
composer.addPass(bloomPass)

const points = spline.getPoints(100);
const geometry = new THREE.BufferGeometry().setFromPoints(points);
const material = new THREE.LineBasicMaterial({
    color : 0xff0000
})
const line = new THREE.Line(geometry , material);
// scene.add(line)

const tubeGeometry = new THREE.TubeGeometry(spline , 222 , 0.65 , 16 , true)
// const tubeMaterial = new THREE.MeshBasicMaterial({
//     color : 0x0099ff , 
//     side : THREE.DoubleSide , 
//     wireframe : true
// })
// const tube = new THREE.Mesh(tubeGeometry , tubeMaterial);
// scene.add(tube);

const edges = new THREE.EdgesGeometry(tubeGeometry , 0.2);
const lineMaterial = new THREE.LineBasicMaterial({
    color : 0x03d7fc
})
const tubeLines = new THREE.LineSegments(edges , lineMaterial)
scene.add(tubeLines)

const numBoxes = 55;
const size = 0.075;
const boxGeometry = new THREE.BoxGeometry(size , size , size);
for (let i = 0; i < numBoxes; i++) {
    const boxMaterial = new THREE.MeshBasicMaterial({
        color : 0xffffff , 
        wireframe : true
    })
    const box = new THREE.Mesh(boxGeometry ,  boxMaterial);
    const p = (i / numBoxes + Math.random() * 0.1) % 1;
    const pos = tubeGeometry.parameters.path.getPointAt(p);
    pos.x += Math.random() - 0.4; 
    pos.z += Math.random() - 0.4;
    box.position.copy(pos);
    const rote = new THREE.Vector3(
        Math.random() * Math.PI , 
        Math.random() * Math.PI , 
        Math.random() * Math.PI
    );
    box.rotation.set(rote.x , rote.y , rote.z);
    const edges = new THREE.EdgesGeometry(boxGeometry , 0.2);
    const color = new THREE.Color().setHSL(1.0 - p , 1 , 0.5)
    const lineMaterial = new THREE.LineBasicMaterial({
        color : color
    })
    const boxLines = new THREE.LineSegments(edges , lineMaterial);
    boxLines.position.copy(pos);
    boxLines.rotation.set(rote.x , rote.y , rote.z)
    
    // scene.add(box);
    scene.add(boxLines);
}

function updateCamera(t) {
    const time = t * 0.1;
    const looptime = 8 * 1000;
    const p = (time % looptime) / looptime;
    const pos = tubeGeometry.parameters.path.getPointAt(p);
    const lookAt = tubeGeometry.parameters.path.getPointAt((p + 0.03) % 1);
    camera.position.copy(pos)
    camera.lookAt(lookAt)
}

function animate (t = 0) {
    requestAnimationFrame(animate);

    updateCamera(t)

    composer.render(scene , camera);
 
    controls.update();
}

animate();

function handleWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth , window.innerHeight)
}

window.addEventListener("resize" , handleWindowResize , false)