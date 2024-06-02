import * as THREE from 'three';

let canvas;
let renderer;
let camera;
let scene;

function main() {
    canvas = document.querySelector('#c');
    renderer = new THREE.WebGLRenderer({ antialias: true, canvas });

    const fov = 75;
    const aspect = 2; // the canvas default
    const near = 0.1;
    const far = 5;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 2;

    scene = new THREE.Scene();

    const boxWidth = 1;
    const boxHeight = 1;
    const boxDepth = 1;
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

    const cubes = []; // just an array we can use to rotate the cubes
    const loader = new THREE.TextureLoader();

    const materials = [
        new THREE.MeshBasicMaterial({ map: loadColorTexture('resources/images/sky.jpg') }),
        new THREE.MeshBasicMaterial({ map: loadColorTexture('resources/images/sky.jpg') }),
        new THREE.MeshBasicMaterial({ map: loadColorTexture('resources/images/sky.jpg') }),
        new THREE.MeshBasicMaterial({ map: loadColorTexture('resources/images/sky.jpg') }),
        new THREE.MeshBasicMaterial({ map: loadColorTexture('resources/images/sky.jpg') }),
        new THREE.MeshBasicMaterial({ map: loadColorTexture('resources/images/sky.jpg') }),
    ];
    const cube = new THREE.Mesh(geometry, materials);
    scene.add(cube);
    cubes.push(cube); // add to our list of cubes to rotate

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

    function loadColorTexture(path) {

        const texture = loader.load(path);
        texture.colorSpace = THREE.SRGBColorSpace;
        return texture;

    }

    function render(time) {

        time *= 0.001;

        if (resizeRendererToDisplaySize(renderer)) {

            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();

        }

        cubes.forEach((cube, ndx) => {

            const speed = .2 + ndx * .1;
            const rot = time * speed;
            cube.rotation.x = rot;
            cube.rotation.y = rot;

        });

        renderer.render(scene, camera);

        requestAnimationFrame(render);

    }

    requestAnimationFrame(render);

}

export { main };