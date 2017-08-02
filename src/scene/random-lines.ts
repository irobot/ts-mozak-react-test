/**
 * Created by Yanko on 7/15/2017.
 */
import {
    Euler, Geometry, Line, LineSegments, Object3D, Vector3
} from 'three';

const createLines = (): Object3D[] => {
    const rand = (offset: number, scale = 1) => Math.random() * scale + offset;
    const rand3 =
        (g: () => number, v: Vector3 | Euler = new Vector3) => v.set(g(), g(), g());

    const geometry2 = new Geometry();
    const point = new Vector3();
    const direction = new Vector3();
    for (let i = 0; i < 50; i++) {
        direction.add(rand3(() => rand(-0.5)) as Vector3);
        direction.normalize().multiplyScalar(10);
        point.add(direction);
        geometry2.vertices.push(point.clone());
    }

    const lines: Object3D[] = [];

    for (let i = 0; i < 50; i++) {
        let object = ( Math.random() > 0.5 )
            ? new Line(geometry2)
            : new LineSegments(geometry2);
        rand3(() => rand(-200, 400), object.position);
        rand3(() => rand(0, 2 * Math.PI), object.rotation);
        rand3(() => rand(0.5), object.scale);
        lines.push(object);
    }
    return lines;
};

export default createLines;
