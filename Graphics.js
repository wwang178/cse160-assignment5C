import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
// import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { FBXLoader } from "https://cdn.jsdelivr.net/npm/three@v0.163.0/examples/jsm/loaders/FBXLoader.js"

let g_canvas;
let g_renderer;
let g_camera;
let g_scene;
let g_raycaster;

let g_map;
let g_grassMap;

let g_lobster;

let g_fishMixer;
let g_fish;

let g_mantarayMixer;
let g_mantaray;

let g_blowfishMap;

let g_anglerfish;
let g_anglerfishFollow = true;

let g_clock;

function main() {
    // lights
    {
        // light
        const color = 0xFFFFFF;
        const light = new THREE.DirectionalLight(color, 3);
        light.position.set(0, 5, 5);
        light.castShadow = true;
        g_scene.add(light);

        // // light
        // const redColor = 0xFF0000;
        // const light2 = new THREE.HemisphereLight(redColor, 1);
        // light2.position.set(0, -10, 0);
        // g_scene.add(light2);

        // // ambient light
        // const blackColor = 0x000000;
        // const light3 = new THREE.AmbientLight(blackColor, 0.5);
        // g_scene.add(light3);
    }

    // skybox
    {
        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load(
            'resources/images/oceanWall.jpg',
            () => {
                texture.mapping = THREE.EquirectangularReflectionMapping;
                texture.colorSpace = THREE.SRGBColorSpace;
                g_scene.background = texture;
            });
    }


    requestAnimationFrame(render);
}

function raycast(event) {
    const coords = new THREE.Vector2(
        (event.clientX / g_renderer.domElement.clientWidth) * 2 - 1,
        -((event.clientY / g_renderer.domElement.clientHeight) * 2 - 1)
    );

    g_raycaster.setFromCamera(coords, g_camera);

    const intersections = g_raycaster.intersectObjects(g_scene.children, true);
    if (intersections.length > 0) {
        let hitObject = intersections[0].object;
        for (let x = 0; x < g_map.length; x++) {
            for (let z = 0; z < g_map[0].length; z++) {
                if (g_map[x][z] == hitObject)
                    return [x, z];
            }
        }
        return null;
    }
    return null;
}

function createText(posX, posZ, text, color) {
    const textY = 0;
    const fontLoader = new FontLoader();

    fontLoader.load("resources/fonts/Roboto_Regular.json", function (font) {
        const geometry = new TextGeometry(text, {
            font: font,
            size: 0.8,
            depth: 1
        });

        const textMesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({ color: color }));
        textMesh.castShadow = true;
        textMesh.position.set(posX - 0.2, textY, posZ + 0.2);
        textMesh.lookAt(new THREE.Vector3(posX - 0.2, textY + 1, posZ + 0.2));
        g_scene.add(textMesh);
    })
}

function createStatusText(posX, posZ, text){
    const textY = 3;
    const fontLoader = new FontLoader();

    fontLoader.load("resources/fonts/Roboto_Regular.json", function (font) {
        const geometry = new TextGeometry(text, {
            font: font,
            size: 0.8,
            depth: 1
        });

        const textMesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({ color: 0xFFFFFF }));
        textMesh.castShadow = true;
        textMesh.position.set(posX - 0.2, textY, posZ + 0.2);
        textMesh.lookAt(new THREE.Vector3(posX - 0.2, textY + 1, posZ + 0.2));
        g_scene.add(textMesh);
    })
}

function getTextColor(text) {
    switch (text) {
        case "1":
            return 0x0001f7;
        case "2":
            return 0x047c02;
        case "3":
            return 0xfd0000;
        case "4":
            return 0x00027e;
        case "5":
            return 0x840200;
        case "6":
            return 0x038279;
        case "7":
            return 0x000000;
        case "8":
            return 0x808080;
    }
    return null;
}

function initializeMap(mapX, mapZ) {
    // floor
    {
        let floorGeometry = new THREE.BoxGeometry(1, 1, 1);
        const textureLoader = new THREE.TextureLoader();
        const waterFloorTexture = textureLoader.load('resources/images/waterFloor2.jpg');
        waterFloorTexture.colorSpace = THREE.SRGBColorSpace;
        let testCube = new THREE.Mesh(floorGeometry, new THREE.MeshPhongMaterial({ map: waterFloorTexture }));
        testCube.scale.set(mapX, 0.1, mapZ);
        testCube.position.set((mapX / 2) - 0.5, 0, (mapZ / 2) - 0.5);
        testCube.receiveShadow = true;
        g_scene.add(testCube);
    }

    g_map = [];
    g_grassMap = [];
    g_blowfishMap = [];
    for (let x = 0; x < mapX; x++) {
        let row = [];
        let grassRow = [];
        let blowfishRow = [];
        for (let z = 0; z < mapZ; z++) {
            let cube = createCube(x, z);
            row.push(cube);
            grassRow.push(null);
            blowfishRow.push(null);
        }
        g_map.push(row);
        g_grassMap.push(grassRow);
        g_blowfishMap.push(blowfishRow);
    }

    for (let x = 0; x < mapX; x++) {
        for (let z = 0; z < mapZ; z++) {
            createGrass(x, z);
        }
    }
}

function createCube(posX, posZ) {
    let geometry = new THREE.BoxGeometry(1, 1, 1);
    let material = new THREE.MeshPhongMaterial({ color: 0xFFFFFF });
    let cube = new THREE.Mesh(geometry, material);
    cube.name = `${posX}, ${posZ}`;
    cube.position.set(posX, 0, posZ);
    cube.layers.set(1);
    g_scene.add(cube);
    return cube;
}

function createAnglerfish(lastX, lastZ) {
    // anglerfish
    {
        const mtlLoader = new MTLLoader();
        const objLoader = new OBJLoader();
        mtlLoader.load('resources/models/anglerfish/materials.mtl', (mtl) => {
            mtl.preload();
            objLoader.setMaterials(mtl);
            objLoader.load('resources/models/anglerfish/model.obj', (root) => {
                root.position.set(lastX, 2, lastZ);
                root.scale.set(3, 3, 3);
                // root.rotation.set(0, Math.PI / 2, 0);
                g_scene.add(root);
                g_anglerfish = root;
            });
        });
    }
}

function toggleBlowfish(posX, posZ) {
    if (g_blowfishMap[posX][posZ] === null) {
        createBlowfish(posX, posZ);
        return true;
    }
    else {
        removeBlowfish(posX, posZ);
        return false;
    }
}

function createBlowfish(posX, posZ) {
    const mtlLoader = new MTLLoader();
    const objLoader = new OBJLoader();
    mtlLoader.load('resources/models/blowfish/NOVELO_PUFFERFISH.mtl', (mtl) => {
        mtl.preload();
        objLoader.setMaterials(mtl);
        objLoader.load('resources/models/blowfish/NOVELO_PUFFERFISH.obj', (root) => {
            root.position.set(posX, 1, posZ);
            root.scale.set(0.003, 0.003, 0.003);
            // root.rotation.set(0, Math.PI / 2, 0);
            g_scene.add(root);
            g_blowfishMap[posX][posZ] = root;
        });
    });
}

function removeBlowfish(posX, posZ) {
    let blowfish = g_blowfishMap[posX][posZ];
    if (blowfish == null)
        return false;
    g_scene.remove(blowfish);
    // grass.geometry.dispose();
    // grass.material.dispose();
    g_blowfishMap[posX][posZ] = null;
    return true;
}

function createGrass(posX, posZ) {
    // const mtlLoader = new MTLLoader();
    // const objLoader = new OBJLoader();
    // mtlLoader.load('resources/models/grassblades/materials.mtl', (mtl) => {
    //     mtl.preload();
    //     objLoader.setMaterials(mtl);
    //     objLoader.load('resources/models/grassblades/model.obj', (root) => {
    //         // shadows dont seem to work
    //         // root.traverse(function(child){
    //         //     if(child instanceof THREE.Mesh){
    //         //         child.material.castShadow = true;
    //         //         child.material.receiveShadow = true;
    //         //     }
    //         // })
    //         root.position.set(posX, 0, posZ);
    //         root.scale.set(3, 3, 3);
    //         root.castShadow = true;
    //         root.receiveShadow = true;
    //         g_scene.add(root);
    //         g_grassMap[posX][posZ] = root;


    //     });
    // });

    const fbxLoader = new FBXLoader();
    fbxLoader.load(
        "resources/models/seaweed/seaweed02.fbx",
        (object) => {
            object.scale.set(0.01, 0.01, 0.01);
            object.position.set(posX, 0, posZ);
            object.castShadow = true;
            object.receiveShadow = true;
            g_scene.add(object);
            g_grassMap[posX][posZ] = object;
        },
        (xhr) => {
            console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
        },
        (error) => {
            console.log(error)
        }
    );
}

function removeGrass(posX, posZ) {
    let grass = g_grassMap[posX][posZ];
    if (grass == null)
        return false;
    g_scene.remove(grass);
    // grass.geometry.dispose();
    // grass.material.dispose();
    g_grassMap[posX][posZ] = null;
    return true;
}

function setupModels(mapX, mapZ) {
    // lobster
    {
        const mtlLoader = new MTLLoader();
        const objLoader = new OBJLoader();
        mtlLoader.load('resources/models/lobster/lobster.mtl', (mtl) => {
            mtl.preload();
            objLoader.setMaterials(mtl);
            objLoader.load('resources/models/lobster/lobster.obj', (root) => {
                root.position.set(0, 0, -5);
                root.scale.set(10, 10, 10);
                root.rotation.set(0, Math.PI / 2, 0);
                g_scene.add(root);
                g_lobster = root;
            });
        });
    }

    // fish
    {
        const fbxLoader = new FBXLoader();
        fbxLoader.load(
            "resources/models/fish/Fish3.fbx",
            (object) => {
                g_fishMixer = new THREE.AnimationMixer(object);
                const action = g_fishMixer.clipAction(object.animations[0]);
                action.play();
                object.scale.set(0.01, 0.01, 0.01);
                object.position.set(mapX + 10, 3, 0);
                g_scene.add(object);
                g_fish = object;
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
            },
            (error) => {
                console.log(error)
            }
        );
    }

    // mantaray
    {
        const fbxLoader = new FBXLoader();
        fbxLoader.load(
            "resources/models/mantaray/Manta_ray.fbx",
            (object) => {
                g_mantarayMixer = new THREE.AnimationMixer(object);
                const action = g_mantarayMixer.clipAction(object.animations[0]);
                action.play();
                object.scale.set(0.01, 0.01, 0.01);
                object.position.set(mapX + 10, 0, 0);
                g_scene.add(object);
                g_mantaray = object;
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
            },
            (error) => {
                console.log(error)
            }
        );
    }

    // // blowfish
    // {
    //     const fbxLoader = new FBXLoader();
    //     fbxLoader.load(
    //         "resources/models/seaweed/seaweed02.fbx",
    //         (object) => {
    //             // g_blowfishMixer = new THREE.AnimationMixer(object);
    //             // const action = g_blowfishMixer.clipAction(object.animations[0]);
    //             // action.play();
    //             object.scale.set(0.01, 0.01, 0.01);
    //             // object.position.set(mapX + 10, 0, 0);
    //             g_scene.add(object);
    //             // g_blowfish = object;
    //         },
    //         (xhr) => {
    //             console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
    //         },
    //         (error) => {
    //             console.log(error)
    //         }
    //     );
    // }
}

function setup(mapX, mapZ) {
    g_canvas = document.querySelector('#c');
    g_renderer = new THREE.WebGLRenderer({ antialias: true, canvas: g_canvas, alpha: true });
    g_renderer.shadowMap.enabled = true;
    g_camera = new THREE.PerspectiveCamera(45, 2, 0.1, 10000);
    g_camera.position.set(0, 15, 20);
    // g_camera.layers.set(1); // for testing
    g_scene = new THREE.Scene();
    g_raycaster = new THREE.Raycaster();
    g_raycaster.layers.set(1);

    g_clock = new THREE.Clock();

    initializeMap(mapX, mapZ);
    setupModels(mapX, mapZ);

    // orbit controls
    const controls = new OrbitControls(g_camera, g_canvas);
    controls.target.set(mapX / 2, 0, mapZ / 2);
    controls.update();
}

function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
        renderer.setSize(width, height, false);
    }
    return needResize;
}

let g_fishAngle = 0;
let g_mantarayAngle = 0;
function render(time) {
    time *= 0.001;  // convert time to seconds

    if (resizeRendererToDisplaySize(g_renderer)) {
        const canvas = g_renderer.domElement;
        g_camera.aspect = canvas.clientWidth / canvas.clientHeight;
        g_camera.updateProjectionMatrix();
    }

    if (g_lobster) {
        g_lobster.rotation.y += 3 * g_clock.getDelta();
    }

    if (g_fishMixer) {
        g_fishMixer.update(0.005);

        let radius = 15;
        const x = Math.cos(g_fishAngle) * radius;
        const z = Math.sin(g_fishAngle) * radius;
        const rotationAngle = - g_fishAngle - Math.PI / 4;

        g_fish.position.set(x, 3, z);
        g_fish.rotation.y = rotationAngle;

        g_fishAngle += 0.001; // trying to make it based on delta time makes it too stuttery
    }

    if (g_mantarayMixer) {
        g_mantarayMixer.update(0.005);

        let radius = 7;
        const x = -Math.cos(g_mantarayAngle) * radius;
        const z = -Math.sin(g_mantarayAngle) * radius;
        const rotationAngle = - g_mantarayAngle - Math.PI / 4;

        g_mantaray.position.set(x, -10, z);
        g_mantaray.rotation.y = rotationAngle;

        g_mantarayAngle -= 0.001; // trying to make it based on delta time makes it too stuttery
    }

    if(g_anglerfish && g_anglerfishFollow){
        g_anglerfish.lookAt(g_camera.position);
        g_anglerfish.rotation.y = -3 * Math.PI / 4;
        let direc = new THREE.Vector3();
        direc.subVectors(g_camera.position, g_anglerfish.position).normalize();
        g_anglerfish.position.addScaledVector(direc, 1);
        let distance = g_anglerfish.position.distanceTo(g_camera.position);

        if(distance < 4)
            g_anglerfishFollow = false;
    }



    g_renderer.render(g_scene, g_camera);

    requestAnimationFrame(render);
}




export { main, setup, initializeMap, raycast, removeGrass, createText, getTextColor, toggleBlowfish, createBlowfish, removeBlowfish, createAnglerfish, createStatusText };
