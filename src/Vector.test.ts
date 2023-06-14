import { expect, test } from '@jest/globals';
import { Point } from './Point';
import { Vector } from './Vector';

test('two-dimensional points', () => {
    const A = new Point(1, 4);
    const B = new Point(4, 7);

    expect(A.args[0]).toBe(1);
    expect(B.args.length).toBe(2);
});

test('two-dimensional vectors', () => {
    const A = new Point(1, 4);
    const B = new Point(4, 7);

    const v = new Vector(A.makeVectorWith(B));
    expect(v.n[0]).toBe(3);
    expect(v.n[1]).toBe(3);
});

test('two-dimensional vector length', () => {
    const A = new Point(6, 9);
    const B = new Point(9, 13);

    const v = new Vector(A.makeVectorWith(B));
    expect(v.length()).toEqual(5);
});

test('two-dimensional vector length', () => {
    const A = new Point(-1, 5);
    const B = new Point(7, 4);

    const v = new Vector(A.makeVectorWith(B));
    expect(v.length()).toEqual(Math.sqrt(65));
});

test('many-dimensional vector length', () => {
    const A = new Point(5, 1, 0, 6, -9);
    const B = new Point(0, 11, 4, 5, 0);

    const v = new Vector(A.makeVectorWith(B));
    expect(v.length()).toEqual(Math.sqrt(223));
});
