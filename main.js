import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.153.0/build/three.module.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const plane = createPlane();
scene.add(plane);

camera.position.set(0, 2, 5);
camera.lookAt(plane.position);

const clock = new THREE.Clock();
const keys = {};

document.addEventListener('keydown', (e) => {
  keys[e.code] = true;
  if (e.code === 'Space') {
    fireMissile();
  }
});

document.addEventListener('keyup', (e) => {
  keys[e.code] = false;
});

createCity();
const cars = createTraffic();
const enemies = createEnemies();
const missiles = [];

function createPlane() {
  const geometry = new THREE.BoxGeometry(1, 0.3, 2);
  const material = new THREE.MeshPhongMaterial({ color: 0x555555 });
  return new THREE.Mesh(geometry, material);
}

function createCity() {
  const buildingGeometry = new THREE.BoxGeometry(1, 1, 1);
  const buildingMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });
  for (let x = -50; x <= 50; x += 5) {
    for (let z = -50; z <= 50; z += 5) {
      const h = Math.random() * 5 + 1;
      const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
      building.scale.y = h;
      building.position.set(x, h / 2, z);
      scene.add(building);
    }
  }
  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);
  const dir = new THREE.DirectionalLight(0xffffff, 1);
  dir.position.set(5, 10, 7);
  scene.add(dir);
}

function createTraffic() {
  const carGeometry = new THREE.BoxGeometry(0.5, 0.2, 1);
  const carMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const items = [];
  for (let i = 0; i < 20; i++) {
    const car = new THREE.Mesh(carGeometry, carMaterial);
    car.position.set((Math.random() - 0.5) * 100, 0.1, (Math.random() - 0.5) * 100);
    car.userData.speed = 0.5 + Math.random();
    items.push(car);
    scene.add(car);
  }
  return items;
}

function createEnemies() {
  const enemies = [];
  const geo = new THREE.BoxGeometry(1, 0.3, 2);
  const mat = new THREE.MeshPhongMaterial({ color: 0xff0000 });
  for (let i = 0; i < 3; i++) {
    const enemy = new THREE.Mesh(geo, mat);
    enemy.position.set((Math.random() - 0.5) * 50, 5 + Math.random() * 10, (Math.random() - 0.5) * 50);
    enemy.userData.phase = Math.random() * Math.PI * 2;
    enemies.push(enemy);
    scene.add(enemy);
  }
  return enemies;
}

function fireMissile() {
  const geometry = new THREE.CylinderGeometry(0.02, 0.02, 0.5);
  const material = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
  const missile = new THREE.Mesh(geometry, material);
  missile.rotation.copy(camera.rotation);
  missile.position.copy(plane.position);
  missile.userData.velocity = new THREE.Vector3();
  missile.userData.velocity.set(0, 0, -1).applyQuaternion(plane.quaternion).multiplyScalar(1);
  missiles.push(missile);
  scene.add(missile);
}

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  const speed = 10 * delta;

  if (keys['KeyW'] || keys['ArrowUp']) plane.position.z -= speed;
  if (keys['KeyS'] || keys['ArrowDown']) plane.position.z += speed;
  if (keys['KeyA'] || keys['ArrowLeft']) plane.position.x -= speed;
  if (keys['KeyD'] || keys['ArrowRight']) plane.position.x += speed;
  if (keys['KeyQ']) plane.position.y += speed;
  if (keys['KeyE']) plane.position.y -= speed;

  camera.position.copy(plane.position).add(new THREE.Vector3(0, 2, 5));
  camera.lookAt(plane.position);

  cars.forEach((c) => {
    c.position.x += Math.sin(Date.now() * 0.001 * c.userData.speed) * delta * 10;
    c.position.z += Math.cos(Date.now() * 0.001 * c.userData.speed) * delta * 10;
  });

  enemies.forEach((e, i) => {
    e.userData.phase += delta;
    e.position.x += Math.sin(e.userData.phase + i) * delta * 5;
    e.position.z += Math.cos(e.userData.phase + i) * delta * 5;
  });

  for (let i = missiles.length - 1; i >= 0; i--) {
    const m = missiles[i];
    m.position.addScaledVector(m.userData.velocity, delta * 20);
    if (m.position.length() > 200) {
      scene.remove(m);
      missiles.splice(i, 1);
    }
  }

  renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
