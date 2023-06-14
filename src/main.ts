interface Ray {
    distance: number;
    angle: number;
    vertical: boolean;
}

const map = [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
];

const SCREEN_WIDTH = window.innerWidth;
const SCREEN_HEIGHT = window.innerHeight;

const TICK = 40;
const CELL_SIZE = 32;
const FOV = toRadians(60);
const COLOURS = {
    player: 'blue',
    wallMinimap: 'grey',
    floor: '#73716d',
    ceiling: '#09f',
    wall: '#4a3918',
    wallDark: '#362a11',
    rays: 'transparent',
};

const player = {
    x: CELL_SIZE * 1.5,
    y: CELL_SIZE * 2,
    angle: toRadians(0),
    speed: 0,
};

const canvas = document.createElement('canvas');
canvas.setAttribute('width', SCREEN_WIDTH.toString());
canvas.setAttribute('height', SCREEN_HEIGHT.toString());
document.body.appendChild(canvas);

const ctx = canvas.getContext('2d');

function clearScreen() {
    if (ctx == null) return;
    ctx.fillStyle = 'green';
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
}

function renderMinimap(posX = 0, posY = 0, scale: number, rays: Ray[]) {
    if (ctx == null) return;

    const scaledSize = scale * CELL_SIZE;
    map.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell) {
                ctx.fillStyle = COLOURS.wallMinimap;
                ctx.fillRect(
                    posX + x * scaledSize,
                    posY + y * scaledSize,
                    scaledSize,
                    scaledSize
                );
            }
        });
    });

    ctx.fillStyle = COLOURS.player;
    ctx.fillRect(
        posX + player.x * scale - 10 / 2,
        posY + player.y * scale - 10 / 2,
        10,
        10
    );

    console.log(player.x, player.y * scale);

    ctx.strokeStyle = 'blue';
    ctx.beginPath();
    ctx.moveTo(player.x * scale, player.y * scale);
    ctx.lineTo(
        (player.x + Math.cos(player.angle) * 20) * scale,
        (player.y + Math.sin(player.angle) * 20) * scale
    );
    ctx.closePath();
    ctx.stroke();

    ctx.strokeStyle = COLOURS.rays;
    rays.forEach((ray) => {
        ctx.beginPath();
        ctx.moveTo(player.x * scale, player.y * scale);
        ctx.lineTo(
            (player.x + Math.cos(ray.angle) * ray.distance) * scale,
            (player.y + Math.sin(ray.angle) * ray.distance) * scale
        );
        ctx.closePath();
        ctx.stroke();
    });
}

function toRadians(deg: number) {
    return (deg * Math.PI) / 180;
}

function distance(x1: number, y1: number, x2: number, y2: number) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function outOfMapBounds(x: number, y: number) {
    return x < 0 || x >= map[0].length || y < 0 || y >= map.length;
}

function getVCollision(angle: number) {
    const right = Math.abs(Math.floor((angle - Math.PI / 2) / Math.PI) % 2);

    const firstX = right
        ? Math.floor(player.x / CELL_SIZE) * CELL_SIZE + CELL_SIZE
        : Math.floor(player.x / CELL_SIZE) * CELL_SIZE;

    const firstY = player.y + (firstX - player.x) * Math.tan(angle);

    const xA = right ? CELL_SIZE : -CELL_SIZE;
    const yA = xA * Math.tan(angle);

    let wall;
    let nextX = firstX;
    let nextY = firstY;
    while (!wall) {
        const cellX = right
            ? Math.floor(nextX / CELL_SIZE)
            : Math.floor(nextX / CELL_SIZE) - 1;
        const cellY = Math.floor(nextY / CELL_SIZE);

        if (outOfMapBounds(cellX, cellY)) {
            break;
        }
        wall = map[cellY][cellX];
        if (!wall) {
            nextX += xA;
            nextY += yA;
        }
    }

    return {
        angle,
        distance: distance(player.x, player.y, nextX, nextY),
        vertical: true,
    };
}

function getHCollision(angle: number) {
    const up = Math.abs(Math.floor(angle / Math.PI) % 2);
    const firstY = up
        ? Math.floor(player.y / CELL_SIZE) * CELL_SIZE
        : Math.floor(player.y / CELL_SIZE) * CELL_SIZE + CELL_SIZE;
    const firstX = player.x + (firstY - player.y) / Math.tan(angle);

    const yA = up ? -CELL_SIZE : CELL_SIZE;
    const xA = yA / Math.tan(angle);

    let wall;
    let nextX = firstX;
    let nextY = firstY;
    while (!wall) {
        const cellX = Math.floor(nextX / CELL_SIZE);
        const cellY = up
            ? Math.floor(nextY / CELL_SIZE) - 1
            : Math.floor(nextY / CELL_SIZE);

        if (outOfMapBounds(cellX, cellY)) {
            break;
        }

        wall = map[cellY][cellX];
        if (!wall) {
            nextX += xA;
            nextY += yA;
        }
    }
    return {
        angle,
        distance: distance(player.x, player.y, nextX, nextY),
        vertical: false,
    };
}

function castRay(angle: number) {
    const vCollision = getVCollision(angle);
    const hCollision = getHCollision(angle);

    return hCollision.distance >= vCollision.distance ? vCollision : hCollision;
}

function fixFishEye(distance: number, angle: number, playerAngle: number) {
    const diff = angle - playerAngle;
    return distance * Math.cos(diff);
}

function getRays() {
    const initialAngle = player.angle - FOV / 2;
    const numberOfRays = SCREEN_WIDTH;
    const angleStep = FOV / numberOfRays;
    return Array.from({ length: numberOfRays }, (_, i) => {
        const angle = initialAngle + i * angleStep;
        const ray = castRay(angle);
        return ray;
    });
}

function movePlayer() {
    player.x += Math.cos(player.angle) * player.speed;
    player.y += Math.sin(player.angle) * player.speed;
}

function renderScene(rays: Ray[]) {
    if (ctx == null) return;

    rays.forEach((ray, index) => {
        const distance = fixFishEye(ray.distance, ray.angle, player.angle);
        // const distance = ray.distance;
        const wallHeight = ((CELL_SIZE * 5) / distance) * 277;
        ctx.fillStyle = ray.vertical ? COLOURS.wallDark : COLOURS.wall;
        ctx.fillRect(index, SCREEN_HEIGHT / 2 - wallHeight / 2, 1, wallHeight);
        ctx.fillStyle = COLOURS.floor;
        ctx.fillRect(
            index,
            SCREEN_HEIGHT / 2 + wallHeight / 2,
            1,
            SCREEN_HEIGHT / 2 - wallHeight / 2
        );
        ctx.fillStyle = COLOURS.ceiling;
        ctx.fillRect(index, 0, 1, SCREEN_HEIGHT / 2 - wallHeight / 2);
    });
}

function gameLoop() {
    clearScreen();
    movePlayer();
    const rays = getRays();
    renderScene(rays);
    renderMinimap(0, 0, 0.5, rays);
}

setInterval(gameLoop, TICK);

canvas.addEventListener('click', () => {
    canvas.requestPointerLock();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') {
        player.speed = 2;
    }
    if (e.key === 'ArrowDown' || e.key.toLocaleLowerCase() == 's') {
        player.speed = -1;
    }

    if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        player.angle -= toRadians(1.5);
    }

    if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        player.angle += toRadians(1.5);
    }
});

document.addEventListener('keyup', (e) => {
    if (
        e.key === 'ArrowUp' ||
        e.key === 'ArrowDown' ||
        e.key === 'w' ||
        e.key === 's' ||
        e.key === 'a' ||
        e.key === 'd'
    ) {
        player.speed = 0;
    }
});

document.addEventListener('mousemove', function (event) {
    player.angle += toRadians(event.movementX);
});

const a = [1, 4];
const b = [5, 7];
