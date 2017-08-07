/**
 * Created by Yanko on 8/2/2017.
 */

import * as React from 'react';
import {Object3D} from 'three';
import SceneRenderer from '../../scene/renderer';

export interface Props {
  renderer: SceneRenderer;
  object3d: Object3D;
}

class SceneObject extends React.Component<Props, object> {
  componentDidMount() {
    this.props.renderer.addToScene(this.props.object3d);
  }
  componentWillUnmount() {
    this.props.renderer.removeFromScene(this.props.object3d);
  }
  render() {
    return null;
  }
}

export default SceneObject;