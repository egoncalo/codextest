import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js";

const letterValues = {
  A: 1,
  B: 3,
  C: 3,
  D: 2,
  E: 1,
  F: 4,
  G: 2,
  H: 4,
  I: 1,
  J: 8,
  K: 5,
  L: 1,
  M: 3,
  N: 1,
  O: 1,
  P: 3,
  Q: 10,
  R: 1,
  S: 1,
  T: 1,
  U: 1,
  V: 4,
  W: 4,
  X: 8,
  Y: 4,
  Z: 10,
};

const letterDistribution = [
  { letter: "A", count: 9 },
  { letter: "B", count: 2 },
  { letter: "C", count: 2 },
  { letter: "D", count: 4 },
  { letter: "E", count: 12 },
  { letter: "F", count: 2 },
  { letter: "G", count: 3 },
  { letter: "H", count: 2 },
  { letter: "I", count: 9 },
  { letter: "J", count: 1 },
  { letter: "K", count: 1 },
  { letter: "L", count: 4 },
  { letter: "M", count: 2 },
  { letter: "N", count: 6 },
  { letter: "O", count: 8 },
  { letter: "P", count: 2 },
  { letter: "Q", count: 1 },
  { letter: "R", count: 6 },
  { letter: "S", count: 4 },
  { letter: "T", count: 6 },
  { letter: "U", count: 4 },
  { letter: "V", count: 2 },
  { letter: "W", count: 2 },
  { letter: "X", count: 1 },
  { letter: "Y", count: 2 },
  { letter: "Z", count: 1 },
];

const boardSize = 8;
const tileSpacing = 1.1;
const tileHeight = 0.22;
const tileGeom = new THREE.BoxGeometry(1, tileHeight, 1);
const tileTopGeom = new THREE.PlaneGeometry(0.92, 0.92);
const tileColors = [0x1b2a6b, 0x16245a, 0x21347a, 0x1a255e];

const letterBag = [];
function refillLetterBag() {
  letterBag.length = 0;
  letterDistribution.forEach((entry) => {
    for (let i = 0; i < entry.count; i += 1) {
      letterBag.push(entry.letter);
    }
  });
}

function drawLetter() {
  if (letterBag.length === 0) {
    refillLetterBag();
  }
  const index = Math.floor(Math.random() * letterBag.length);
  return letterBag.splice(index, 1)[0];
}

function createLetterTexture(letter, value, themeIndex) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  const palette = [
    ["#283b8f", "#17275f"],
    ["#2f3d7f", "#1a2557"],
    ["#38449b", "#202c61"],
    ["#304593", "#1b2e6b"],
  ];
  const [primary, secondary] = palette[themeIndex % palette.length];
  const gradient = ctx.createLinearGradient(0, 0, 256, 256);
  gradient.addColorStop(0, primary);
  gradient.addColorStop(1, secondary);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);

  ctx.strokeStyle = "rgba(255,255,255,0.15)";
  ctx.lineWidth = 4;
  for (let i = -128; i < 256; i += 32) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 256, 256);
    ctx.stroke();
  }
  for (let i = 0; i < 256; i += 32) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(256, i + 128);
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(33, 46, 100, 0.4)";
  ctx.beginPath();
  ctx.moveTo(128, 24);
  ctx.lineTo(224, 128);
  ctx.lineTo(128, 232);
  ctx.lineTo(32, 128);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#f5f6ff";
  ctx.font = "bold 150px 'Trebuchet MS', 'Segoe UI', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(letter, 128, 138);

  ctx.fillStyle = "#b7c7ff";
  ctx.font = "bold 52px 'Trebuchet MS', 'Segoe UI', sans-serif";
  ctx.textAlign = "right";
  ctx.fillText(value, 216, 214);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}

function createRuneTexture(seed) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "rgba(48, 71, 170, 0.65)";
  ctx.fillRect(0, 0, 256, 256);
  ctx.strokeStyle = "rgba(190, 221, 255, 0.8)";
  ctx.lineWidth = 5;
  ctx.beginPath();
  const radius = 90 + (seed % 5) * 8;
  ctx.arc(128, 128, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(128, 128, radius * 0.6, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(128, 32);
  ctx.lineTo(210, 196);
  ctx.lineTo(46, 196);
  ctx.closePath();
  ctx.stroke();
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(128, 58);
  ctx.lineTo(128, 198);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(74, 150);
  ctx.lineTo(182, 150);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function createStarField(radius, count) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const distance = radius * (0.6 + Math.random() * 0.6);
    const height = (Math.random() - 0.5) * radius * 0.35 + 3.5;
    positions[i * 3] = Math.cos(angle) * distance;
    positions[i * 3 + 1] = height;
    positions[i * 3 + 2] = Math.sin(angle) * distance;

    const tint = 0.6 + Math.random() * 0.4;
    colors[i * 3] = 0.45 * tint;
    colors[i * 3 + 1] = 0.55 * tint;
    colors[i * 3 + 2] = tint;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const material = new THREE.PointsMaterial({ size: 0.08, vertexColors: true, transparent: true, opacity: 0.85 });
  return new THREE.Points(geometry, material);
}

const container = document.getElementById("game");
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
container.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0e142b);
scene.fog = new THREE.FogExp2(0x0b1124, 0.045);

const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
const boardCenter = (boardSize - 1) * tileSpacing * 0.5;
camera.position.set(boardCenter + 6, 10, boardCenter + 8);
camera.lookAt(new THREE.Vector3(0, 0, 0));

const ambientLight = new THREE.HemisphereLight(0x8faeff, 0x050710, 0.9);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xf8f6ff, 0.85);
directionalLight.position.set(9, 12, 6);
scene.add(directionalLight);

const rimLight = new THREE.DirectionalLight(0x4f6dff, 0.4);
rimLight.position.set(-6, 8, -6);
scene.add(rimLight);

const starField = createStarField(boardSize * tileSpacing * 2.4, 420);
scene.add(starField);

const islandTop = new THREE.Mesh(
  new THREE.CylinderGeometry(boardSize * 0.55, boardSize * 0.65, 0.5, 12),
  new THREE.MeshStandardMaterial({ color: 0x131f3a, roughness: 0.85, metalness: 0.05 })
);
islandTop.position.y = -0.55;
scene.add(islandTop);

const islandCore = new THREE.Mesh(
  new THREE.ConeGeometry(boardSize * 0.52, 3.2, 10),
  new THREE.MeshStandardMaterial({ color: 0x0a1024, roughness: 0.9, emissive: 0x18204a, emissiveIntensity: 0.35 })
);
islandCore.position.y = -2.15;
scene.add(islandCore);

const islandGlow = new THREE.Mesh(
  new THREE.CylinderGeometry(boardSize * 0.4, boardSize * 0.4, 0.1, 24),
  new THREE.MeshBasicMaterial({ color: 0x3c6dff, transparent: true, opacity: 0.35 })
);
islandGlow.position.y = -0.3;
scene.add(islandGlow);

const boardGroup = new THREE.Group();
scene.add(boardGroup);

const runeGroup = new THREE.Group();
scene.add(runeGroup);

for (let i = 0; i < 6; i += 1) {
  const runeMaterial = new THREE.MeshBasicMaterial({
    map: createRuneTexture(i),
    transparent: true,
    opacity: 0.85,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const rune = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.8), runeMaterial);
  const runeRadius = boardSize * tileSpacing * 0.9;
  rune.position.set(
    (Math.random() - 0.5) * runeRadius,
    1.6 + Math.random() * 1.2,
    (Math.random() - 0.5) * runeRadius
  );
  rune.rotation.x = -Math.PI / 2;
  rune.rotation.z = Math.random() * Math.PI;
  rune.userData = { speed: 0.6 + Math.random() * 0.6, offset: Math.random() * Math.PI * 2 };
  runeGroup.add(rune);
}

const tileData = [];
const interactiveMeshes = [];

function createTile(x, z) {
  const letter = drawLetter();
  const value = letterValues[letter];
  const paletteIndex = (x + z) % tileColors.length;
  const baseColor = new THREE.Color(tileColors[paletteIndex]);
  const hoverColor = baseColor.clone().lerp(new THREE.Color(0x6b8cff), 0.55);
  const selectColor = baseColor.clone().lerp(new THREE.Color(0xaec8ff), 0.85);

  const baseMaterial = new THREE.MeshStandardMaterial({
    color: baseColor,
    roughness: 0.65,
    metalness: 0.05,
  });
  const base = new THREE.Mesh(tileGeom, baseMaterial);

  const letterMaterial = new THREE.MeshBasicMaterial({
    map: createLetterTexture(letter, value, paletteIndex),
    transparent: true,
  });
  const top = new THREE.Mesh(tileTopGeom, letterMaterial);
  top.rotation.x = -Math.PI / 2;
  top.position.y = tileHeight * 0.5 + 0.002;

  const group = new THREE.Group();
  group.add(base);
  group.add(top);

  const offset = (boardSize - 1) * tileSpacing * 0.5;
  group.position.set(
    x * tileSpacing - offset,
    0,
    z * tileSpacing - offset
  );

  const tile = {
    gridX: x,
    gridZ: z,
    letter,
    value,
    group,
    base,
    top,
    baseMaterial,
    letterMaterial,
    baseColor,
    hoverColor,
    selectColor,
    isSelected: false,
    isHovered: false,
    lift: 0,
  };

  base.userData.tile = tile;
  top.userData.tile = tile;
  interactiveMeshes.push(base, top);

  tileData.push(tile);
  boardGroup.add(group);
  return tile;
}

for (let z = 0; z < boardSize; z += 1) {
  for (let x = 0; x < boardSize; x += 1) {
    createTile(x, z);
  }
}

const hero = {
  hp: 65,
  maxHp: 65,
  miniature: createHeroMiniature(),
  bobOffset: Math.random() * Math.PI * 2,
};
const enemy = {
  hp: 70,
  maxHp: 70,
  miniature: createEnemyMiniature(),
  bobOffset: Math.random() * Math.PI * 2,
};

scene.add(hero.miniature);
scene.add(enemy.miniature);
placeMiniatureOnTile(hero.miniature, tileData.find((tile) => tile.gridX === 1 && tile.gridZ === 6));
placeMiniatureOnTile(enemy.miniature, tileData.find((tile) => tile.gridX === 6 && tile.gridZ === 1));
hero.baseY = hero.miniature.position.y;
enemy.baseY = enemy.miniature.position.y;

const heroHpEl = document.getElementById("heroHp");
const enemyHpEl = document.getElementById("enemyHp");
const wordDisplayEl = document.getElementById("wordDisplay");
const castButton = document.getElementById("castButton");
const clearButton = document.getElementById("clearButton");
const logEl = document.getElementById("log");

const selectedTiles = [];
let hoveredTile = null;
let gameOver = false;

function updateStats() {
  heroHpEl.textContent = `${hero.hp}`;
  enemyHpEl.textContent = `${enemy.hp}`;
}

function addLogEntry(message) {
  const entry = document.createElement("div");
  entry.className = "log-entry";
  entry.textContent = message;
  logEl.prepend(entry);
}

function getPotentialScore() {
  if (selectedTiles.length === 0) return 0;
  const base = selectedTiles.reduce((sum, tile) => sum + tile.value, 0);
  const lengthBonus = 1 + Math.max(0, selectedTiles.length - 2) * 0.35;
  return Math.round(base * lengthBonus);
}

function updateWordDisplay() {
  if (selectedTiles.length === 0) {
    wordDisplayEl.textContent = "Select adjacent tiles to form a word.";
  } else {
    const word = selectedTiles.map((tile) => tile.letter).join("");
    const base = selectedTiles.reduce((sum, tile) => sum + tile.value, 0);
    const bonus = Math.max(0, selectedTiles.length - 2) * 35;
    const damage = getPotentialScore();
    wordDisplayEl.innerHTML = `<strong>${word}</strong><br />Base score: ${base} &bull; Bonus: ${bonus}%<br />Potential damage: ${damage}`;
  }
  castButton.disabled = gameOver || selectedTiles.length < 2;
  clearButton.disabled = gameOver || selectedTiles.length === 0;
}

function clearSelection() {
  selectedTiles.forEach((tile) => {
    tile.isSelected = false;
  });
  selectedTiles.length = 0;
  updateWordDisplay();
}

function isAdjacent(a, b) {
  const dx = Math.abs(a.gridX - b.gridX);
  const dz = Math.abs(a.gridZ - b.gridZ);
  return dx <= 1 && dz <= 1 && !(dx === 0 && dz === 0);
}

function handleTileClick(tile) {
  if (gameOver) return;
  if (tile.isSelected) {
    const last = selectedTiles[selectedTiles.length - 1];
    if (last === tile) {
      tile.isSelected = false;
      selectedTiles.pop();
      updateWordDisplay();
    }
    return;
  }
  if (selectedTiles.length > 0) {
    const previous = selectedTiles[selectedTiles.length - 1];
    if (!isAdjacent(previous, tile)) {
      wordDisplayEl.textContent = "Tiles must touch the last selected tile.";
      return;
    }
  }
  tile.isSelected = true;
  selectedTiles.push(tile);
  updateWordDisplay();
}

function assignNewLetter(tile) {
  const newLetter = drawLetter();
  tile.letter = newLetter;
  tile.value = letterValues[newLetter];
  const newTexture = createLetterTexture(newLetter, tile.value, (tile.gridX + tile.gridZ) % tileColors.length);
  tile.letterMaterial.map.dispose();
  tile.letterMaterial.map = newTexture;
  tile.letterMaterial.needsUpdate = true;
}

function placeMiniatureOnTile(mesh, tile) {
  if (!tile) return;
  mesh.position.set(tile.group.position.x, tile.group.position.y + 0.6, tile.group.position.z);
}

function createHeroMiniature() {
  const group = new THREE.Group();

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.62, 0.18, 6),
    new THREE.MeshStandardMaterial({ color: 0x2a3a85, roughness: 0.7, metalness: 0.2 })
  );
  group.add(base);

  const robe = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.5, 0.9, 7, 1, false),
    new THREE.MeshStandardMaterial({ color: 0x6ea4ff, roughness: 0.4, metalness: 0.25 })
  );
  robe.position.y = 0.55;
  group.add(robe);

  const sash = new THREE.Mesh(
    new THREE.TorusGeometry(0.36, 0.08, 12, 24),
    new THREE.MeshStandardMaterial({ color: 0xffe074, roughness: 0.3, metalness: 0.45 })
  );
  sash.rotation.x = Math.PI / 2;
  sash.position.y = 0.25;
  group.add(sash);

  const arms = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.09, 0.45, 8, 16),
    new THREE.MeshStandardMaterial({ color: 0x4f77ff, roughness: 0.5 })
  );
  arms.rotation.z = Math.PI / 2;
  arms.position.set(0, 0.65, 0);
  group.add(arms);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.24, 18, 18),
    new THREE.MeshStandardMaterial({ color: 0xfff5cc, roughness: 0.6 })
  );
  head.position.y = 1.1;
  group.add(head);

  const visor = new THREE.Mesh(
    new THREE.SphereGeometry(0.27, 12, 12, 0, Math.PI),
    new THREE.MeshStandardMaterial({ color: 0x192b5a, transparent: true, opacity: 0.85 })
  );
  visor.rotation.y = Math.PI;
  visor.position.y = 1.08;
  group.add(visor);

  const hat = new THREE.Mesh(
    new THREE.ConeGeometry(0.34, 0.7, 7),
    new THREE.MeshStandardMaterial({ color: 0xff6b88, roughness: 0.35 })
  );
  hat.position.y = 1.48;
  hat.rotation.y = Math.PI / 6;
  group.add(hat);

  const gem = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.14),
    new THREE.MeshStandardMaterial({ color: 0x8cf2ff, emissive: 0x3fa8d6, emissiveIntensity: 0.6 })
  );
  gem.position.set(0, 1.3, 0.18);
  group.add(gem);

  group.traverse((child) => {
    child.castShadow = false;
    child.receiveShadow = false;
  });

  return group;
}

function createEnemyMiniature() {
  const group = new THREE.Group();

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.55, 0.7, 0.2, 8),
    new THREE.MeshStandardMaterial({ color: 0x2f143a, roughness: 0.8, metalness: 0.15 })
  );
  group.add(base);

  const legs = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.6, 0.4, 8, 1, true),
    new THREE.MeshStandardMaterial({ color: 0x5a1f5f, roughness: 0.6 })
  );
  legs.position.y = 0.35;
  group.add(legs);

  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.38, 0.8, 12, 24),
    new THREE.MeshStandardMaterial({ color: 0x933484, roughness: 0.5, metalness: 0.1 })
  );
  body.position.y = 0.9;
  group.add(body);

  const chestPlate = new THREE.Mesh(
    new THREE.DodecahedronGeometry(0.45, 0),
    new THREE.MeshStandardMaterial({
      color: 0x4a1f6d,
      emissive: 0x7313b1,
      emissiveIntensity: 0.4,
      roughness: 0.35,
    })
  );
  chestPlate.position.set(0, 1.05, 0);
  group.add(chestPlate);

  const head = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.32),
    new THREE.MeshStandardMaterial({ color: 0xfad8ff, emissive: 0x58217b, emissiveIntensity: 0.2 })
  );
  head.position.y = 1.5;
  group.add(head);

  const hornMaterial = new THREE.MeshStandardMaterial({ color: 0xffdd7a, roughness: 0.3, metalness: 0.35 });
  const hornLeft = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.6, 5), hornMaterial);
  hornLeft.position.set(-0.26, 1.72, 0);
  hornLeft.rotation.z = Math.PI * 0.6;
  group.add(hornLeft);
  const hornRight = hornLeft.clone();
  hornRight.position.x = 0.26;
  hornRight.rotation.z = -Math.PI * 0.6;
  group.add(hornRight);

  const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xff4f4f, emissiveIntensity: 0.9 });
  const eyeLeft = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 12), eyeMaterial);
  eyeLeft.position.set(-0.11, 1.45, 0.22);
  group.add(eyeLeft);
  const eyeRight = eyeLeft.clone();
  eyeRight.position.x = 0.11;
  group.add(eyeRight);

  const crown = new THREE.Mesh(
    new THREE.TorusGeometry(0.32, 0.07, 12, 32),
    new THREE.MeshStandardMaterial({ color: 0xffb347, roughness: 0.2, metalness: 0.6 })
  );
  crown.rotation.x = Math.PI / 2;
  crown.position.y = 1.3;
  group.add(crown);

  group.traverse((child) => {
    child.castShadow = false;
    child.receiveShadow = false;
  });

  return group;
}

function resizeRenderer() {
  const width = container.clientWidth;
  const height = container.clientHeight;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

window.addEventListener("resize", resizeRenderer);
resizeRenderer();

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function updatePointer(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

renderer.domElement.addEventListener("pointermove", (event) => {
  updatePointer(event);
  raycaster.setFromCamera(pointer, camera);
  const intersections = raycaster.intersectObjects(interactiveMeshes, false);
  hoveredTile = intersections.length > 0 ? intersections[0].object.userData.tile : null;
});

renderer.domElement.addEventListener("pointerleave", () => {
  hoveredTile = null;
});

renderer.domElement.addEventListener("pointerdown", (event) => {
  updatePointer(event);
  raycaster.setFromCamera(pointer, camera);
  const intersections = raycaster.intersectObjects(interactiveMeshes, false);
  if (intersections.length > 0) {
    const tile = intersections[0].object.userData.tile;
    handleTileClick(tile);
  }
});

clearButton.addEventListener("click", () => {
  clearSelection();
});

castButton.addEventListener("click", () => {
  if (selectedTiles.length < 2 || gameOver) return;
  const word = selectedTiles.map((tile) => tile.letter).join("");
  const damage = getPotentialScore();
  enemy.hp = Math.max(0, enemy.hp - damage);
  updateStats();
  addLogEntry(`Hero casts \"${word}\" for ${damage} damage!`);

  selectedTiles.forEach((tile) => {
    tile.isSelected = false;
    assignNewLetter(tile);
  });
  selectedTiles.length = 0;
  updateWordDisplay();

  if (enemy.hp <= 0) {
    addLogEntry("The foe dissolves into stardust! You win.");
    gameOver = true;
    castButton.disabled = true;
    clearButton.disabled = true;
    return;
  }

  const retaliationBase = 6 + Math.floor(Math.random() * 5);
  const mitigation = Math.floor(damage / 8);
  const retaliation = Math.max(3, retaliationBase - mitigation);
  hero.hp = Math.max(0, hero.hp - retaliation);
  updateStats();
  addLogEntry(`The astral tyrant retaliates for ${retaliation} damage!`);

  if (hero.hp <= 0) {
    addLogEntry("Your hero collapses. The incantation fades...");
    gameOver = true;
    castButton.disabled = true;
    clearButton.disabled = true;
  }
});

clearSelection();
updateStats();
addLogEntry("Welcome to Spellbound Tactics! Form words to blast the foe.");

function animate(time) {
  requestAnimationFrame(animate);
  const seconds = time * 0.001;

  tileData.forEach((tile) => {
    const targetLift = tile.isSelected ? 0.3 : hoveredTile === tile ? 0.16 : 0;
    tile.lift = THREE.MathUtils.lerp(tile.lift, targetLift, 0.12);
    tile.group.position.y = tile.lift;
    tile.baseMaterial.color.lerp(
      tile.isSelected ? tile.selectColor : hoveredTile === tile ? tile.hoverColor : tile.baseColor,
      0.1
    );
    tile.top.rotation.z = Math.sin(seconds * 1.5 + tile.gridX * 0.3 + tile.gridZ * 0.2) * 0.02;
  });

  runeGroup.children.forEach((rune) => {
    const { speed, offset } = rune.userData;
    rune.material.opacity = 0.6 + Math.sin(seconds * speed + offset) * 0.25;
    rune.position.y = 1.6 + Math.sin(seconds * speed + offset) * 0.35;
    rune.rotation.z += 0.0015 * speed;
  });

  const heroLift = Math.sin(seconds * 2 + hero.bobOffset) * 0.08;
  hero.miniature.position.y = hero.baseY + heroLift;
  const enemyLift = Math.sin(seconds * 1.6 + enemy.bobOffset) * 0.1;
  enemy.miniature.position.y = enemy.baseY + enemyLift;

  renderer.render(scene, camera);
}

requestAnimationFrame(animate);

