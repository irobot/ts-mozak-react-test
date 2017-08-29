import {
    Geometry, Line, Object3D, Vector3,
} from 'three';
import {Node} from '../type/neuron';

const createLines = (segments: Node[][]): Object3D[] => {
    return segments.map((segment: Node[]) => {
        const geometry = new Geometry();
        segment.forEach(({position}) => {
            const {x, y, z} = position;
            const vpos = new Vector3(x, y, z);
            geometry.vertices.push(vpos.divideScalar(10.0));
        });
        return new Line(geometry);
    });
};

export default createLines;
