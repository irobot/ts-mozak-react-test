/**
 * Created by Yanko on 7/4/2017.
 */

import * as React from 'react';
import './Viewer.css';
import * as THREE from 'three';
import {OrbitControls} from '../../lib/three-orbitcontrols-ts';

export interface Props {
  name: string;
}

type State = {
  width: number, height: number
  mouseX: number, mouseY: number,
  phi: number, theta: number
};

class Viewer extends React.Component<Props, State> {

  private element: HTMLElement;
  private boundUpdateSize: () => {};
  private boundMouseMove: () => {};
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;
  private sphereInter: THREE.Mesh;
  private linesGroup: THREE.Object3D;
  private raycaster: THREE.Raycaster;
  private renderer: THREE.WebGLRenderer;
  private mouse = new THREE.Vector2();
  private currentIntersected;
  private controls: OrbitControls;

  componentDidMount() {
    window.addEventListener('resize', this.boundUpdateSize);
    window.addEventListener('mousemove', this.boundMouseMove);
    this.updateSize();
    if (this.element) {
      this.initScene(this.element);
      this.renderLoop();
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.boundUpdateSize);
  }

  constructor(props: Props) {
    super(props);
    this.state = {width: 0, height: 0, mouseX: 0, mouseY: 0, phi: 0, theta: 0};
    this.boundUpdateSize = this.updateSize.bind(this);
    this.boundMouseMove = this.onMouseMove.bind(this);
  }

  setupControls() {

    if (this.controls) {
      return;
    }
    if (!this.camera || !this.element) {
      return;
    }
    const controls = new OrbitControls(this.camera, this.element);
    this.controls = controls;

    // How far you can orbit vertically, upper and lower limits.
    controls.minPolarAngle = -Infinity;
    controls.maxPolarAngle = Infinity;

    // How far you can dolly in and out ( PerspectiveCamera only )
    controls.minDistance = 0;
    controls.maxDistance = Infinity;

    // Set to false to disable zooming
    controls.enableZoom = true;
    controls.zoomSpeed = 1.0;

    // Set to false to disable panning (ie vertical and horizontal translations)
    controls.enablePan = true;

    // Set to false to disable damping (ie inertia)
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.rotateSpeed = 0.1;
  }

  updateSize() {

    const width = this.element && this.element.clientWidth || 0;
    const height = Math.min(this.element && this.element.clientHeight || 0, 800);

    if (this.camera) {
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      if (this.element) {
        this.setupControls();
      }
    }
    if (this.renderer) {
      this.renderer.setSize( width, height );
    }

    this.setState({...this.state, width, height});
  }

  initScene(container: HTMLElement) {
    const {width, height} = this.state;
    this.camera = new THREE.PerspectiveCamera( 71, width / height, 1, 10000 );
    this.camera.position.set(0, 1, -100);
    this.scene = new THREE.Scene();
    const geometry1 = new THREE.SphereGeometry( 5 );
    const material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
    this.sphereInter = new THREE.Mesh( geometry1, material );
    this.sphereInter.visible = false;
    this.scene.add( this.sphereInter );

    const rand = (offset: number, scale = 1) => Math.random() * scale + offset;
    const rand3 = (g: () => number, v: THREE.Vector3 | THREE.Euler = new THREE.Vector3) => v.set(g(), g(), g());

    const geometry2 = new THREE.Geometry();
    const point = new THREE.Vector3();
    const direction = new THREE.Vector3();
    for ( let i = 0; i < 50; i ++ ) {
        direction.add(rand3(() => rand(-0.5)) as THREE.Vector3);
        direction.normalize().multiplyScalar( 10 );
        point.add( direction );
        geometry2.vertices.push( point.clone() );
    }

    const t = new THREE.Object3D();
    rand3(() => rand(-20, 40),        t.position);
    rand3(() => rand(0, 2 * Math.PI), t.rotation);
    rand3(() => rand(0.5),            t.scale);
    this.linesGroup = t;

    for ( let i = 0; i < 50; i ++ ) {
      let object = ( Math.random() > 0.5 )
          ? new THREE.Line( geometry2 )
          : new THREE.LineSegments( geometry2 );
      rand3(() => rand(-200, 400), object.position);
      rand3(() => rand(0, 2 * Math.PI), object.rotation);
      rand3(() => rand(0.5), object.scale);
      this.linesGroup.add( object );
    }

    this.scene.add( this.linesGroup );
    this.raycaster = new THREE.Raycaster();
    this.raycaster.linePrecision = 3;
    this.renderer = new THREE.WebGLRenderer( { antialias: true } );
    this.renderer.setClearColor( 0xf0f0f0 );
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild(this.renderer.domElement);
  }

  renderFrame() {
    if (this.controls) {
      this.controls.update();
    }
    this.camera.lookAt( this.scene.position );
    this.camera.updateMatrixWorld(false);
    // find intersections
    this.raycaster.setFromCamera( this.mouse, this.camera );
    const intersects = this.raycaster.intersectObjects( this.linesGroup.children, true);
    if ( intersects.length > 0 ) {
      if ( this.currentIntersected !== undefined ) {
        this.currentIntersected.material.linewidth = 1;
      }
      this.currentIntersected = intersects[ 0 ].object;
      this.currentIntersected.material.linewidth = 5;
      this.sphereInter.visible = true;
      const intersectionPoint = intersects[ 0 ].point;
      this.sphereInter.position.copy( intersectionPoint );
      const {x, y} = intersectionPoint;
      this.setState({...this.state, mouseX: x, mouseY: y});
    } else {
      if ( this.currentIntersected !== undefined ) {
        this.currentIntersected.material.linewidth = 1;
      }
      this.currentIntersected = undefined;
      this.sphereInter.visible = false;
    }
    this.renderer.render( this.scene, this.camera );

    this.renderLoop();
  }

  onMouseMove( event: MouseEvent ) {
    const {width, height} = this.state;
    let x = event.clientX;
    let y = event.clientY;
    if (this.element) {
      x -= this.element.offsetLeft;
      y -= this.element.offsetTop;
    }
    this.mouse.x = ( x / width ) * 2 - 1;
    this.mouse.y = - ( y / height ) * 2 + 1;
  }

  renderLoop() {
    requestAnimationFrame(() => this.renderFrame());
  }

  setElement(e: HTMLElement | null) {
    if (e !== null) {
      this.element = e;
    }
  }

  render() {
    const {name} = this.props;
    const {width, height, mouseX, mouseY, phi, theta} = this.state;

    return (
      <div>
        <div>
          Hello {name} width: {width} height {height} mouse: {mouseX.toFixed(2)}, {mouseY.toFixed(2)}, {phi} {theta}
        </div>
        <div ref={e => this.setElement(e)} className="viewer"/>
      </div>
    );
  }
}

export default Viewer;