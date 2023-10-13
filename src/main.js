import './styles/style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import gsap from 'gsap'


export default class Sketch {
  constructor(options) {
    this.scene = new THREE.Scene();

    this.container = options.dom;
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer = new THREE.WebGLRenderer( { 
      antialias: true,
      alpha: true,
     });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0xeeeeee, 1); 

    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      70,
      this.width/this.height,
      100,
      2000
    );

    // var frustumSize = 10;
    // var aspect = window.innerWidth / window.innerHeight;
    // this.camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, -1000, 1000 );
    this.camera.position.set(0, 0, 600);

    this.camera.fov = 2*Math.atan( (this.height/2)/600)* (180/Math.PI);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.time = 0;

    this.images = [...document.querySelectorAll('img')];
    this.isPlaying = true;

    this.addImages();
    this.setPosition();
    this.addObjects();
    this.resize();
    this.render();
    this.setupResize();
    // this.settings();
    
  }

  settings() {
    let that = this;
    this.settings = {
      progress: 0,
    };
    this.gui = new dat.GUI();
    this.gui.add(this.settings, "progress", 0, 1, 0.01);
  }

  setupResize() {
    window.addEventListener("resize", this.resize.bind(this));
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
  }

  addImages(){
    this.imageStore = this.images.map(img=>{
      let bounds = img.getBoundingClientRect()

      let geometry = new THREE.PlaneGeometry(bounds.width,bounds.height,1,1);
      let texture = new THREE.Texture(img);
      texture.needsUpdate = true;
      let material = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        map: texture
      })
      let mesh = new THREE.Mesh(geometry,material);

      this.scene.add(mesh)

      return {
        img: img,
        mesh: mesh,
        top: bounds.top,
        left: bounds.left,
        width: bounds.width,
        height: bounds.height
      }
    })
  }

  setPosition(){
    this.imageStore.forEach(o=>{
      o.mesh.position.y = -o.top + this.height/2 - o.height/2;
      o.mesh.position.x = o.left - this.width/2 + o.width/2;
    })
  }

  addObjects() {
    let that = this;
    this.material = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable"
      },
      side: THREE.DoubleSide,
      uniforms: {
        time: { value: 0 },
        resolution: { value: new THREE.Vector4() },
      },
      wireframe: true,
      // transparent: true,
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }
      `,
      fragmentShader: ` 
        varying vec2 vUv;
        void main()	{
          // vec2 newUV = (vUv - vec2(0.5))*resolution.zw + vec2(0.5);
          gl_FragColor = vec4(vUv,0.0,1.);
        }
      `
    });

    this.geometry = new THREE.PlaneGeometry(200, 400, 10, 10);

    this.plane = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.plane);
  }

  stop() {
    this.isPlaying = false;
  }

  play() {
    if(!this.isPlaying){
      this.render()
      this.isPlaying = true;
    }
  }

  render() {
    if (!this.isPlaying) return;
    this.time += 0.05;
    this.material.uniforms.time.value = this.time;
    requestAnimationFrame(this.render.bind(this));
    this.renderer.render(this.scene, this.camera);
  }
}

new Sketch({
  dom: document.getElementById("container")
});

