export class Vector {
    n: number[];

    constructor(n: number[]) {
        this.n = n;
    }

    length(): number {
        let sum = 0;

        for (let number of this.n) {
            sum += Math.pow(number, 2);
        }

        return Math.sqrt(sum);
    }
}
