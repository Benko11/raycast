import { COLOURS, PlayerMap, Ray, Settings } from './scratch';

export default class Game {
    ctx: CanvasRenderingContext2D;
    _map: PlayerMap;
    scale: number;
    cellSize: number;

    constructor(
        ctx: CanvasRenderingContext2D,
        map: PlayerMap,
        settings: Settings
    ) {
        this.ctx = ctx;
        this._map = map;
        this.scale = settings.scale;
        this.cellSize = settings.cellSize;
    }

    get map(): PlayerMap {
        return this.map;
    }

    get mapGrid(): number[] {
        return this.map.data;
    }

    renderMinimap(rays: Ray[]) {
        if (ctx == null) return;

        console.log('uwu');
        this.mapGrid.forEach((cell, index) => {
            ctx.fillStyle = COLOURS.wallMinimap;
            ctx.fillRect(
                50,
                50,
                this.cellSize * this.scale,
                this.cellSize * this.scale
            );
        });
    }
}
