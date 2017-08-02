/**
 * Created by Yanko on 7/4/2017.
 */

import * as React from 'react';
import './Viewer.css';
import SceneRenderer from '../../scene/renderer';
import {Scene} from 'three';
import createLines from '../../scene/random-lines';
import Object3 from '../three/object';

export interface Props {
  name: string;
}

type State = {
  width: number, height: number
  mouseX: number, mouseY: number,
  phi: number, theta: number
};

class Viewer extends React.Component<Props, State> {

  private renderer: SceneRenderer;
  private element: HTMLElement;

  componentDidMount() {
    if (this.element) {
      this.renderer.initScene(this.element);
      this.renderer.renderLoop();
    }
  }

  componentWillUnmount() {
    this.renderer.dispose();
  }

  constructor(props: Props) {
    super(props);
    this.state = {width: 0, height: 0, mouseX: 0, mouseY: 0, phi: 0, theta: 0};
    this.renderer = new SceneRenderer(new Scene(), ({x, y, z}) => {
      this.setState({mouseX: x, mouseY: y});
    });
  }

  setElement(e: HTMLElement | null) {
    if (e !== null) {
      this.element = e;
    }
  }

  render() {
    const {name} = this.props;
    const {width, height, mouseX, mouseY, phi, theta} = this.state;

    const lines = createLines().map((line, idx) =>
      <Object3 renderer={this.renderer} object3d={line} key={idx} />
    );

    return (
      <div className="container">
        <div>
          Hello {name} width: {width} height {height} mouse: {mouseX.toFixed(2)}, {mouseY.toFixed(2)}, {phi} {theta}
        </div>
        <div ref={e => this.setElement(e)} className="viewer item"/>
        <div>{lines}</div>
      </div>
    );
  }
}

export default Viewer;