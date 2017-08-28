import * as React from 'react';
import {connect} from 'react-redux';
import {State} from '../../redux/state';
import { NeuronState } from '../../redux/reducer/neuron';
import './Viewer.css';
import SceneRenderer from '../../scene/renderer';
import {Scene} from 'three';
import createLines from '../../scene/neuron-lines';
// import createLines from '../../scene/random-lines';
import SceneObject from '../scene/scene-object';

const mapStateToProps = ({ neuron }: State) => ({ neuron });

export interface Props {
  name: string;
  neuron: NeuronState;
}

type ViewerState = {
  width: number, height: number
  mouseX: number, mouseY: number,
  phi: number, theta: number
};

class Viewer extends React.Component<Props, ViewerState> {

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
    const { name } = this.props;
    const {width, height, mouseX, mouseY, phi, theta} = this.state;

    const lines = createLines(this.props.neuron.branches).map((line, idx) =>
      <SceneObject renderer={this.renderer} object3d={line} key={idx} />
    );

    return (
      <div className="container">
        <div>
          width: {width} height {height}
          mouse: {mouseX.toFixed(2)}, {mouseY.toFixed(2)}, {phi} {theta}
        </div>
        <div ref={e => this.setElement(e)} className="viewer item">
          Hello {name}
        </div>
        <div>{lines}</div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(Viewer);