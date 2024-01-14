import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls'
import Grass from './Grass.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

// Créer une scène
const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.sortObjects = false;
document.body.appendChild(renderer.domElement)
renderer.xr.enabled = true;

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  10,
  500,
)

camera.position.set(0, 10, 30);
scene.position.set(0,-5,0)

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.dampingFactor = 0.05;
controls.enablePan = false
controls.maxPolarAngle = Math.PI / 2.2
controls.enableZoom = true;

// Handle the window resize event
window.addEventListener('resize', () => {
  // Update the camera
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  // Update the renderer
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
});

// Load background texture
const Backloader = new THREE.TextureLoader();
let textureEquirec = Backloader.load('./rural_asphalt_road.jpg');
textureEquirec.mapping = THREE.EquirectangularReflectionMapping;
textureEquirec.colorSpace = THREE.SRGBColorSpace;

scene.background = textureEquirec;

// Charger le modèle glTF
const loader = new GLTFLoader();
let solarOven;
loader.load('sans_nom.gltf', (gltf) => {
    console.log(gltf);
    var model = gltf.scene;
    model.traverse((node) => {
        if (node.isMesh) {
            if (node.name == "Body95_3" || node.name == "Body95_5") {
                node.material = new THREE.MeshPhysicalMaterial({
                    color: 0xdddddd,
                    metalness: 1,
                    roughness: 0,
                    clearcoat: 1.0,
                    clearcoatRoughness: 0.5,
                    reflectivity: 1.0,
                    envMap: textureEquirec,
                    envMapIntensity: 1.0,
                    premultipliedAlpha: true,
                });
            } else {
                node.material = new THREE.MeshPhysicalMaterial({
                    color: node.material.color,
                    metalness: 0.8,
                    roughness: 0.5,
                    clearcoat: 1.0,
                    clearcoatRoughness: 0.5,
                    reflectivity: 0.5,
                    envMap: textureEquirec,
                    envMapIntensity: 0.1,
                    premultipliedAlpha: true,
                });
            }

        }

    })
    scene.add(model);
    model.scale.set(5, 5, 5);

    // Créer un helper pour les axes
    const axesHelper = new THREE.AxesHelper();
    model.position.set(2, 1, -1); // Position d'origine
    model.rotation.set(0, -Math.PI / 2, 0); // Rotation d'origine
    axesHelper.scale.set(10, 10, 10);
    solarOven = model;

    // scene.add(axesHelper);

    console.log('Model loaded successfully:', gltf);
}, undefined, (error) => {
    console.error('Error loading model:', error);
});

const Alight = new THREE.AmbientLight(0xffffff, 1); // Lumière ambiante blanche
scene.add(Alight);

const light = new THREE.SpotLight(0xffffff, 10, 0, Math.PI / 3, 1, 0.1);
light.position.set(-30, 20, 0);
scene.add(light);

const textureLoader = new THREE.TextureLoader();
const textureSun = textureLoader.load('./preview_sun.jpg');

const Sungeometry = new THREE.SphereGeometry(3, 15, 32);
const Sunmaterial = new THREE.MeshBasicMaterial({ map: textureSun });
const sun = new THREE.Mesh(Sungeometry, Sunmaterial);
scene.add(sun);
sun.position.set(light.position.x, light.position.y, light.position.z);

console.log("sun : ", sun.position);
console.log("light : ", light.position);

const grass = new Grass(30, 100000)
scene.add(grass)

let pointerPosition = { x: 0, y: 0 };

window.addEventListener('pointermove', (event) => {
    pointerPosition.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    pointerPosition.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
});

const raycaster = new THREE.Raycaster();

// Step 1: Add an HTML element for displaying text
const infoText = document.createElement('div');
infoText.style.position = 'absolute';
infoText.style.bottom = '10px';
infoText.style.left = '10px';
infoText.style.color = 'white';
infoText.style.fontFamily = 'Arial';
infoText.style.fontSize = '16px';
document.body.appendChild(infoText);

// Step 2: Create a function to update the displayed text
function updateInfoText(message) {
  infoText.innerText = message;
}


// Step 3: Modify your click event listener to update and display different text
window.addEventListener('pointerdown', () => {
  raycaster.setFromCamera(pointerPosition, camera);

  let intersects = raycaster.intersectObject(sun, false);

  if (intersects.length > 0) {
    updateInfoText('The sun emits solar radiation, an rewable energy available almost everywhere on earth');
    console.log('The ray intersects the object sun', intersects[0]);
  }

  if (solarOven != undefined) {
    intersects = raycaster.intersectObject(solarOven, true);

    if (intersects.length > 0) {
      const clickedObjectName = intersects[0].object.name;

      if (clickedObjectName === 'Body95_3' || clickedObjectName === 'Body95_5') {
        updateInfoText('The mirror matrix is oriented to reflect the sun radiation towards a same point');
      } else if (clickedObjectName === 'Body95_1') {
        updateInfoText('The oven is the object that receives concentrated solar radiation from the mirror matrix. Its objective is to have an isolation and a thermical inertia as high as possible.');
      } else {
        // Add more conditions for other object names if needed
        updateInfoText(`Clicked on ${clickedObjectName}, now you name of the element but nothing special about this piece. Try the sun, or the mirrors, or the oven :)`);
      }

      console.log('The ray intersects the object solarOven', intersects[0]);
    }
  }
});



// ... Code existant ...


// Créer une nouvelle sphère pour l'effet lueur (sans texture)
const glowGeometry = new THREE.SphereGeometry(3.2, 15, 32); // Ajustez la taille selon vos besoins
const glowMaterial = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: 1.0 },
        resolution: { value: new THREE.Vector2() },
    },
    vertexShader: `
        varying vec2 vUv;

        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        varying vec2 vUv;
        uniform float time;

        void main() {
            // Coordonnées de l'effet lueur centrées autour du centre (0.5, 0.5)
            vec2 centeredUV = vUv - vec2(0.5);
            // Distance au centre
            float distance = length(centeredUV);
            // intensité basé sur la distance avec une transition douce
            float intensity = smoothstep(1.0, 0.8, 1.0 - distance);
            // Couleur orange pour l'effet lueur
            vec3 color = vec3(1.0, 0.5, 0.0);
            // Ajustez la couleur en fonction de la distance pour l'effet de lueur
            vec3 adjustedColor = color * intensity * (1.0 - distance);
            // Résultat final avec une intensité qui s'estompe progressivement
            vec3 result = mix(color, adjustedColor, intensity);
            gl_FragColor = vec4(result, 1.0); // Fixez l'alpha à 1.0 pour éviter la transparence
        }
    `,
    side: THREE.BackSide, // Rendu sur le côté arrière de la sphère
    transparent: true,
    blending: THREE.AdditiveBlending, // Mélange additif pour l'effet de lueur
    depthWrite: false,
    depthTest: false, // Ne pas écrire dans le tampon de profondeur pour éviter les problèmes de z-fighting
});

const glowSphere = new THREE.Mesh(glowGeometry, glowMaterial);
sun.add(glowSphere);

const composer = new EffectComposer(renderer);
composer.setSize(window.innerWidth, window.innerHeight);

const renderPass = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.0, // strength
    0.85, // radius
    0.9 // threshold
);
const outputPass = new OutputPass();

composer.addPass(renderPass);
composer.addPass(bloomPass);
composer.addPass(outputPass);

// camera.lookAt(new THREE.Vector3(0, 10, 0))

renderer.setAnimationLoop((time) => {
    glowMaterial.uniforms.time.value = time; // Mettez à jour le temps dans le shader
    grass.update(time)
    // Faire tourner la sphère "Sun" sur elle-même autour de l'axe Y
    sun.rotation.y += 0.002;
    controls.update()
    renderer.render(scene, camera)
    composer.render();
    renderer.autoClear = false;

    // renderer.render(scene,camera)

});



// ... Code existant ...
// Ajoutez la sphère de lueur en tant qu'enfant de votre soleil


// renderer.setAnimationLoop((time) => {
  

//   // Faire tourner la sphère "Sun" sur elle-même autour de l'axe Y
//   sun.rotation.y += 0.002;

//   controls.update()
//   camera.lookAt(new THREE.Vector3(0, 10, 0))//MARCHE PAAAAAAS
//   renderer.render(scene, camera)
// });

// // Animation
// // const animate = () => {
//   requestAnimationFrame(animate);
  
//   renderer.render(scene, camera);
// };

// Redimensionner la fenêtre
window.addEventListener('resize', () => {
  composer.setSize(window.innerWidth, window.innerHeight);
  const newWidth = window.innerWidth;
  const newHeight = window.innerHeight;

  camera.aspect = newWidth / newHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(newWidth, newHeight);
});

// Lancer l'animation
// animate();
