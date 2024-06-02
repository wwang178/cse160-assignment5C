import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';

function createCube(scene, posX, posY, posZ) {
    let geometry = new THREE.BoxGeometry(1, 1, 1);
    let material = new THREE.MeshPhongMaterial({ color: 0xFFFFFF });
    let cube = new THREE.Mesh(geometry, material);
    cube.position.set(posX, posY, posZ);
    scene.add(cube);
    return cube;
}

function handleRotateCube(cube, delay, axis) {
    setTimeout(() => {
        let startTime = Date.now();
        rotateCube(cube, startTime, 3 * 1000, axis);
    }, delay);
}

function rotateCube(cube, startTime, duration, axis) {
    let elapsedTime = Date.now() - startTime;
    if (elapsedTime < duration) {
        if (axis == "x")
            cube.rotation.x -= 0.1;
        else if (axis == "y")
            cube.rotation.y += 0.1;
        // cube.rotation.z -= 0.05;
        requestAnimationFrame(() => { rotateCube(cube, startTime, duration, axis) });
    }
    else {
        let nextAxis;
        if (axis == "x")
            nextAxis = "y"
        else
            nextAxis = "x"
        handleRotateCube(cube, 3 * 1000, nextAxis);
        // requestAnimationFrame(() => { rotateCube(cube, Date.now(), duration, nextAxis) });

    }
}

function main() {
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas, alpha: true });

    // camera
    const fov = 45;
    const aspect = 2;  // the canvas default
    const near = 0.1;
    const far = 10000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 15, 20);

    // orbit controls
    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 5, 0);
    controls.update();

    // scene
    const scene = new THREE.Scene();

    // light
    const color = 0xFFFFFF;
    const light = new THREE.DirectionalLight(color, 3);
    light.position.set(0, 5, 5);
    scene.add(light);

    // light
    const redColor = 0xFF0000;
    const light2 = new THREE.HemisphereLight(redColor, 1);
    light2.position.set(0, -10, 0);
    scene.add(light2);

    // ambient light
    const blackColor = 0x000000;
    const light3 = new THREE.AmbientLight(blackColor, 0.5);
    scene.add(light3);

    // cubes
    const boxWidth = 1;
    const boxHeight = 1;
    const boxDepth = 1;
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

    function makeInstance(geometry, color, x) {
        const material = new THREE.MeshPhongMaterial({ color });

        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);

        cube.position.x = x;

        return cube;
    }

    const cubes = [
        makeInstance(geometry, 0x44aa88, 0),
        makeInstance(geometry, 0x8844aa, -2),
        makeInstance(geometry, 0xaa8844, 2),
    ];

    // sphere
    const loader = new THREE.TextureLoader();
    const texture = loader.load('resources/images/disco2.jpg');
    texture.colorSpace = THREE.SRGBColorSpace;

    const sphereGeometry = new THREE.SphereGeometry(
        5,
        10,
        10
    );
    const sphereColor = 0xFF00FF;
    const sphereMaterial = new THREE.MeshPhongMaterial({ map: texture });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(0, 5, -15);
    scene.add(sphere);

    //cylinder
    const cylinderGeometry = new THREE.CylinderGeometry(
        4,
        4,
        1
    );
    const cylinderColor = 0xFFFFFF;
    const cylinderMaterial = new THREE.MeshPhongMaterial({ color: cylinderColor });
    const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    cylinder.position.set(0, -2, -5);
    scene.add(cylinder);

    let skyboxSize = 300;
    let halfSkyboxSize = skyboxSize / 2;
    let skyboxGeometry = new THREE.BoxGeometry(skyboxSize, 0.1, skyboxSize);
    let skyboxGeometryWallHX = new THREE.BoxGeometry(skyboxSize, skyboxSize, 0.1);
    let skyboxGeometryWallHZ = new THREE.BoxGeometry(0.1, skyboxSize, skyboxSize);
    let skyboxTexture = loader.load("resources/images/sky.jpg");
    let skyboxMaterial = new THREE.MeshPhongMaterial({ map: skyboxTexture });
    // // sky
    // let skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
    // skybox.position.set(0, halfSkyboxSize, 0);
    // scene.add(skybox);
    // // floor
    // let skybox2 = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
    // skybox2.position.set(0, -halfSkyboxSize, 0);
    // scene.add(skybox2);
    // // wall back
    // let skybox3 = new THREE.Mesh(skyboxGeometryWallHX, skyboxMaterial);
    // skybox3.position.set(0, 0, -halfSkyboxSize);
    // scene.add(skybox3);
    // // wall front
    // let skybox4 = new THREE.Mesh(skyboxGeometryWallHX, skyboxMaterial);
    // skybox4.position.set(0, 0, halfSkyboxSize);
    // scene.add(skybox4);
    // // wall left
    // let skybox5 = new THREE.Mesh(skyboxGeometryWallHZ, skyboxMaterial);
    // skybox5.position.set(-halfSkyboxSize, 0, 0);
    // scene.add(skybox5);
    // // wall right
    // let skybox6 = new THREE.Mesh(skyboxGeometryWallHZ, skyboxMaterial);
    // skybox6.position.set(halfSkyboxSize, 0, 0);
    // scene.add(skybox6);

    // testCube
    let testCubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    let testCube = new THREE.Mesh(testCubeGeometry, new THREE.MeshPhongMaterial({ color: 0x000000 }));
    testCube.position.set(0, -10, 0);
    scene.add(testCube);


    let cubeArray = [];
    let cubeArrayLength = 10;
    let xOffset = 10;
    for (let x = 0; x < cubeArrayLength; x++) {
        let column = [];
        for (let y = 0; y < cubeArrayLength; y++) {
            let cube = createCube(scene, x + xOffset, y, 0);
            column.push(cube);
        }
        cubeArray.push(column);
    }

    let rotationDelay = 0.5 * 1000;
    let currentRotationDelay = 0;
    for (let x = 0; x < cubeArrayLength * 2; x++) {
        for (let y = 0; y <= x; y++) {
            let i = x - y;
            if (i < cubeArrayLength && y < cubeArrayLength) {
                handleRotateCube(cubeArray[i][y], currentRotationDelay, "y");
            }
        }
        currentRotationDelay += rotationDelay * Math.abs(Math.sin(x));
    }


    // obj file
    let lobster;

    const mtlLoader = new MTLLoader();
    const objLoader = new OBJLoader();
    mtlLoader.load('resources/models/lobster/lobster.mtl', (mtl) => {
        mtl.preload();
        objLoader.setMaterials(mtl);
        objLoader.load('resources/models/lobster/lobster.obj', (root) => {
            root.position.set(0, 0, -5);
            root.scale.set(10, 10, 10);
            root.rotation.set(0, Math.PI / 2, 0);
            scene.add(root);
            lobster = root;
        });
    });


    // rendering
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

    function render(time) {
        time *= 0.001;  // convert time to seconds

        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        cubes.forEach((cube, ndx) => {

            const speed = 1 + ndx * .1;
            const rot = time * speed;
            cube.rotation.x = rot;
            cube.rotation.y = rot;

        });

        if (lobster)
            lobster.rotation.y += 0.05;

        if (sphere)
            sphere.rotation.y += 0.07;

        renderer.render(scene, camera);

        requestAnimationFrame(render);
    }



    requestAnimationFrame(render);
}

main();