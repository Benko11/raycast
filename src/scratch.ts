const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

const SCREEN_WIDTH = innerWidth;
const SCREEN_HEIGHT = innerHeight;

canvas.width = SCREEN_WIDTH;
canvas.height = SCREEN_HEIGHT;
document.body.appendChild(canvas);

export interface PlayerMap {
    data: number[];
    width: number;
    height: number;
}

export interface Ray {
    distance: number;
    angle: number;
    vertical: boolean;
}

export interface Settings {
    cellSize: number;
    scale: number;
}

export const COLOURS = {
    player: 'blue',
    wallMinimap: 'grey',
    floor: '#73716d',
    ceiling: '#09f',
    wall: '#4a3918',
    wallDark: '#362a11',
    rays: 'transparent',
};

const map: PlayerMap = {
    data: [
        1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1,
        1, 0, 1, 0, 0, 0, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 1,
        1, 0, 1, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    ],
    width: 8,
    height: 11,
};

const settings: Settings = { cellSize: 32, scale: 0.75 };

class Player {
    x: number;
    y: number;
    speed: number;
    angle: number;

    constructor(x: number, y: number, speed: number, angle: number) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.angle = angle;
    }

    move() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.cos(this.angle) * this.speed;
    }
}

class Game {
    ctx: CanvasRenderingContext2D;
    _map: PlayerMap;
    scale: number;
    player: Player;
    cellSize: number;

    constructor(
        ctx: CanvasRenderingContext2D,
        map: PlayerMap,
        player: Player,
        settings: Settings
    ) {
        this.ctx = ctx;
        this._map = map;
        this.scale = settings.scale;
        this.cellSize = settings.cellSize;
        this.player = player;
    }

    get map(): PlayerMap {
        return this._map;
    }

    get mapGrid(): number[] {
        return this._map.data;
    }

    move() {
        this.player.move();
    }

    renderMinimap(startX = 0, startY = 0, rays: Ray[]) {
        if (ctx == null) return;

        const scaledSize = this.cellSize * this.scale;

        const drawGrid = () => {
            this.mapGrid.forEach((cell, index) => {
                if (cell === 1) ctx.fillStyle = COLOURS.wallMinimap;
                if (cell === 0) ctx.fillStyle = 'transparent';

                const x = index % this.map.width;
                const y = Math.floor(index / this.map.width);

                ctx.fillRect(
                    startX + x * scaledSize,
                    startY + y * scaledSize,
                    scaledSize,
                    scaledSize
                );
            });
        };

        const drawPlayer = () => {
            const sideLength = 10;
            ctx.fillStyle = COLOURS.player;
            ctx.fillRect(
                startX + this.player.x * scaledSize - sideLength / 2,
                startY + this.player.y * scaledSize - sideLength / 2,
                sideLength,
                sideLength
            );

            ctx.strokeStyle = COLOURS.player;
            ctx.beginPath();
            ctx.moveTo(this.player.x * scaledSize, this.player.y * scaledSize);
            ctx.lineTo(
                this.player.x * scaledSize + Math.cos(player.angle) * 20,
                this.player.y * scaledSize + Math.sin(player.angle) * 20
            );
            ctx.closePath();
            ctx.stroke();
        };

        const drawRays = () => {
            ctx.strokeStyle = COLOURS.rays;
            rays.forEach((ray) => {
                ctx.beginPath();
                ctx.moveTo(
                    this.player.x * scaledSize,
                    this.player.y * scaledSize
                );
                ctx.lineTo(
                    this.player.x +
                        Math.cos(ray.angle) * ray.distance * this.scale,
                    this.player.y + Math.sin(ray.angle) * ray.distance
                );
                ctx.closePath();
                ctx.stroke();
            });
        };

        drawGrid();
        drawPlayer();
        drawRays();
    }
}

const player = {
    x: 1.5,
    y: 1.5,
    angle: toRadians(0),
    speed: 0,
};

const game = new Game(
    ctx as CanvasRenderingContext2D,
    map,
    new Player(1.5, 1.5, toRadians(0), 0),
    settings
);

let animationFrameId: number;

function gameLoop() {
    game.renderMinimap(0, 0, []);
    game.move();
    animationFrameId = requestAnimationFrame(gameLoop);
}

function toRadians(angle: number) {
    return (angle * Math.PI) / 180;
}

animationFrameId = requestAnimationFrame(gameLoop);

document.addEventListener('mousemove', (e) => {
    player.angle += toRadians(e.movementX);
});

document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (key === 'arrowup') {
        console.log('speed change');
        game.player.speed = 2;
    }
});
