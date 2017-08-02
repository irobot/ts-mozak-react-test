/**
 * Created by Yanko on 7/9/2017.
 */

import {
    Vector2, Vector3, PerspectiveCamera,
    Mesh, Scene, Object3D, Raycaster, WebGLRenderer,
    SphereGeometry, MeshBasicMaterial, Group,
} from 'three';
import {OrbitControls} from '../lib/three-orbitcontrols-ts';

class SceneRenderer {

    private container: HTMLElement;
    private boundUpdateSize: () => {};
    private boundMouseMove: () => {};
    private camera: PerspectiveCamera;
    private pointer: Mesh;
    private intersectables: Object3D;
    private raycaster: Raycaster;
    private renderer: WebGLRenderer;
    private mouse = new Vector2();
    private currentIntersected;
    private controls;
    private containerSize = { width: 0, height: 0 };

    constructor(
        private scene: Scene,
        private intersectedAction: (v: Vector3) => void
    ) {
        this.boundUpdateSize = this.updateSize.bind(this);
        this.boundMouseMove = this.onMouseMove.bind(this);
        this.intersectables = new Group();
    }

    setupControls(camera: PerspectiveCamera, container: HTMLElement) {

        if (this.controls) {
            return;
        }
        if (!camera || !container) {
            return;
        }
        const controls = new OrbitControls(camera, container);
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
        controls.dampingFactor = 0.05;
        controls.rotateSpeed = 0.05;
        controls.zoomSpeed = 2;
    }

    updateContainerSize() {
        const c = this.container;
        const width = c && c.clientWidth || 0;
        const height = c && c.clientHeight || 0;

        this.containerSize = {width, height};
        return this.containerSize;
    }

    updateSize() {
        const {width, height} = this.updateContainerSize();
        if (this.camera) {
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
        }
        if (this.renderer) {
            this.renderer.setSize( width, height );
        }
    }

    createPointer() {
        const geometry1 = new SphereGeometry( 5 );
        const material = new MeshBasicMaterial( { color: 0xff0000 } );
        return new Mesh( geometry1, material );
    }

    initScene(container: HTMLElement) {

        this.container = container;
        const {width, height} = this.updateContainerSize();
        this.camera = new PerspectiveCamera( 71, width / height, 1, 10000 );
        this.camera.position.set(0, 0, -500);
        this.setupControls(this.camera, container);
        this.scene = new Scene();
        this.pointer = this.createPointer();
        this.pointer.visible = false;
        this.scene.add( this.pointer );
        this.scene.add(this.intersectables);
        this.raycaster = new Raycaster();
        this.raycaster.linePrecision = 3;
        this.renderer = new WebGLRenderer( { antialias: true } );
        this.renderer.setClearColor( 0x333333 );
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( width, height );
        container.appendChild(this.renderer.domElement);

        window.addEventListener('resize', this.boundUpdateSize);
        window.addEventListener('mousemove', this.boundMouseMove);
        this.updateSize();
    }

    addToScene(object: Object3D) {
        this.intersectables.add(object);
    }

    removeFromScene(object: Object3D) {
        this.intersectables.remove(object);
    }

    raycastPointer() {
        // find intersections
        this.raycaster.setFromCamera( this.mouse, this.camera );
        const intersects = this.raycaster.intersectObjects( this.intersectables.children, true);
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
        this.renderer.render( this.scene, this.camera );

        this.renderLoop();
    }

    onMouseMove( event: MouseEvent ) {
        if (!this.container) {
            return;
        }
        const x = event.clientX - this.container.offsetLeft;
        const y = event.clientY - this.container.offsetTop;
        const {width, height} = this.containerSize;
        this.mouse.x = ( x / width ) * 2 - 1;
        this.mouse.y = - ( y / height ) * 2 + 1;
        this.raycastPointer();
    }

    renderLoop() {
        requestAnimationFrame(() => this.renderFrame());
    }

    dispose() {
        window.removeEventListener('resize', this.boundUpdateSize);
    }
}

export default SceneRenderer;
