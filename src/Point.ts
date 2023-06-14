export class Point {
    args: number[];

    constructor(...args: number[]) {
        this.args = args;
    }

    makeVectorWith(p: Point) {
        const v: number[] = [];

        for (let i = 0; i < p.args.length; i++) {
            v.push(p.args[i] - this.args[i]);
        }

        return v;
    }
}
