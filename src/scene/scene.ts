/**
 * Created by Yanko on 7/9/2017.
 */

import * as THREE from 'three';
import {OrbitControls} from '../lib/three-orbitcontrols-ts';

class MyScene {

    private container: HTMLElement;
    private boundUpdateSize: () => {};
    private boundMouseMove: () => {};
    private camera: THREE.PerspectiveCamera;
    private scene: THREE.Scene;
    private pointer: THREE.Mesh;
    private linesGroup: THREE.Object3D;
    private raycaster: THREE.Raycaster;
    private renderer: THREE.WebGLRenderer;
    private mouse = new THREE.Vector2();
    private currentIntersected;
    private controls: OrbitControls;
    private containerSize = { width: 0, height: 0 };

    constructor(
        private intersectedAction: (v: THREE.Vector3) => void
    ) {
        this.boundUpdateSize = this.updateSize.bind(this);
        this.boundMouseMove = this.onMouseMove.bind(this);
    }

    setupControls() {

        if (this.controls) {
            return;
        }
        if (!this.camera || !this.container) {
            return;
        }
        const controls = new OrbitControls(this.camera, this.container);
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

    updateContainerSize() {
        const width = this.container && this.container.clientWidth || 0;
        const height = Math.min(this.container && this.container.clientHeight || 0, 800);

        this.containerSize = {width, height};
        return this.containerSize;
    }

    updateSize() {
        const {width, height} = this.updateContainerSize();
        if (this.camera) {
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            if (this.container) {
                this.setupControls();
            }
        }
        if (this.renderer) {
            this.renderer.setSize( width, height );
        }
    }

    createPointer() {
        const geometry1 = new THREE.SphereGeometry( 5 );
        const material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
        return new THREE.Mesh( geometry1, material );
    }

    initScene(container: HTMLElement) {

        this.container = container;
        const {width, height} = this.updateContainerSize();
        this.camera = new THREE.PerspectiveCamera( 71, width / height, 1, 10000 );
        this.camera.position.set(0, 1, -100);
        this.scene = new THREE.Scene();
        this.pointer = this.createPointer();
        this.pointer.visible = false;
        this.scene.add( this.pointer );

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

    raycastPointer() {
        // find intersections
        this.raycaster.setFromCamera( this.mouse, this.camera );
        const intersects = this.raycaster.intersectObjects( this.linesGroup.children, true);
        if ( intersects.length > 0 ) {
            if ( this.currentIntersected !== undefined ) {
                this.currentIntersected.material.linewidth = 1;
            }
            this.currentIntersected = intersects[ 0 ].object;
            this.currentIntersected.material.linewidth = 5;
            this.pointer.visible = true;
            const intersectionPoint = intersects[ 0 ].point;
            this.pointer.position.copy( intersectionPoint );
            this.intersectedAction(intersectionPoint);
        } else {
            if ( this.currentIntersected !== undefined ) {
                this.currentIntersected.material.linewidth = 1;
            }
            this.currentIntersected = undefined;
            this.pointer.visible = false;
        }
    }

    renderFrame() {
        if (this.controls) {
            this.controls.update();
        }
        this.camera.lookAt( this.scene.position );
        this.camera.updateMatrixWorld(false);
        this.raycastPointer();
        this.renderer.render( this.scene, this.camera );

        this.renderLoop();
    }

    onMouseMove( event: MouseEvent ) {
        if (this.container) {
            const x = event.clientX - this.container.offsetLeft;
            const y = event.clientY - this.container.offsetTop;
            const {width, height} = this.containerSize;
            this.mouse.x = ( x / width ) * 2 - 1;
            this.mouse.y = - ( y / height ) * 2 + 1;
        }
    }

    renderLoop() {
        requestAnimationFrame(() => this.renderFrame());
    }
}

export default MyScene;
