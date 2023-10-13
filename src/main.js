import './styles/style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import gsap from 'gsap'
import Lenis from '@studio-freight/lenis'


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

    // this.images = [...document.querySelectorAll('img')];
    this.isPlaying = true;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.selectedPlane = null;
    this.previousMouseX = 0;
    this.isDragging = false;

    const lenis = new Lenis()

    lenis.on('scroll', (e) => {
      this.camera.position.x += lenis.velocity * 0.5
    })

    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    // this.addImages();
    // this.setPosition();
    this.addObjects();
    this.mouseMovement();
    this.resize();
    this.render();
    this.setupResize();
    // this.settings();

    
  }

  // settings() {
  //   let that = this;
  //   this.settings = {
  //     progress: 0,
  //   };
  //   this.gui = new dat.GUI();
  //   this.gui.add(this.settings, "progress", 0, 1, 0.01);
  // }


  mouseMovement(){
        
    window.addEventListener( 'mousemove', (event)=>{
        this.mouse.x = ( event.clientX / this.width ) * 2 - 1;
        this.mouse.y = - ( event.clientY / this.height ) * 2 + 1;

        // update the picking ray with the camera and mouse position
        this.raycaster.setFromCamera( this.mouse, this.camera );

        // calculate objects intersecting the picking ray
        const intersects = this.raycaster.intersectObjects( this.scene.children );

        if(intersects.length>0){
            // console.log(intersects[0]);
            let obj = intersects[0].object;
            obj.material.uniforms.hover.value = intersects[0].uv;
        }

    }, false );

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

  // addImages(){
  //   this.imageStore = this.images.map(img=>{
  //     let bounds = img.getBoundingClientRect()

  //     let geometry = new THREE.PlaneGeometry(bounds.width,bounds.height,1,1);
  //     let texture = new THREE.Texture(img);
  //     texture.needsUpdate = true;
  //     let material = new THREE.MeshBasicMaterial({
  //       color: 0xff0000,
  //       map: texture
  //     })
  //     let mesh = new THREE.Mesh(geometry,material);

  //     this.scene.add(mesh)

  //     return {
  //       img: img,
  //       mesh: mesh,
  //       top: bounds.top,
  //       left: bounds.left,
  //       width: bounds.width,
  //       height: bounds.height
  //     }
  //   })
  // }

  // setPosition(){
  //   this.imageStore.forEach(o=>{
  //     o.mesh.position.y = -o.top + this.height/2 - o.height/2;
  //     o.mesh.position.x = o.left - this.width/2 + o.width/2;
  //   })
  // }

  // addObjects() {
  //   let that = this;

  //   const textureLoader = new THREE.TextureLoader();
  //   const texture = textureLoader.load('https://uploads-ssl.webflow.com/63a027a7d4fdce748dd31f5b/6526e77f52db780b57b4e7b5_DJI_0157-Pano-min.JPG', (texture) => {
  //     this.material.uniforms.uImage.value = texture;
  //   });

  //   // const textureLoader2 = new THREE.TextureLoader();
  //   // const textureHover = textureLoader.load('https://uploads-ssl.webflow.com/63a027a7d4fdce748dd31f5b/6526e77eb2d64dcde34e3b9a_DJI_0187-min.JPG', (texture) => {
  //   //   this.material.uniforms.uImage.value = textureHover;
  //   // });

  //   this.material = new THREE.ShaderMaterial({
  //     extensions: {
  //       derivatives: "#extension GL_OES_standard_derivatives : enable"
  //     },
  //     side: THREE.DoubleSide,
  //     uniforms: {
  //       time: { value: 1 },
  //       // resolution: { value: new THREE.Vector4() },
  //       uImage: texture,
  //       hover: { value: new THREE.Vector2(0.5,0.5) },
  //       hoverState: { value: 0.5 },
  //     },
  //     wireframe: false,
  //     // transparent: true,
  //     vertexShader: `

  //     //	Classic Perlin 3D Noise 
  //     //	by Stefan Gustavson
  //     //
  //     vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
  //     vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
  //     vec3 fade(vec3 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

  //     float cnoise(vec3 P){
  //       vec3 Pi0 = floor(P); // Integer part for indexing
  //       vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
  //       Pi0 = mod(Pi0, 289.0);
  //       Pi1 = mod(Pi1, 289.0);
  //       vec3 Pf0 = fract(P); // Fractional part for interpolation
  //       vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
  //       vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  //       vec4 iy = vec4(Pi0.yy, Pi1.yy);
  //       vec4 iz0 = Pi0.zzzz;
  //       vec4 iz1 = Pi1.zzzz;

  //       vec4 ixy = permute(permute(ix) + iy);
  //       vec4 ixy0 = permute(ixy + iz0);
  //       vec4 ixy1 = permute(ixy + iz1);

  //       vec4 gx0 = ixy0 / 7.0;
  //       vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
  //       gx0 = fract(gx0);
  //       vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  //       vec4 sz0 = step(gz0, vec4(0.0));
  //       gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  //       gy0 -= sz0 * (step(0.0, gy0) - 0.5);

  //       vec4 gx1 = ixy1 / 7.0;
  //       vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
  //       gx1 = fract(gx1);
  //       vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  //       vec4 sz1 = step(gz1, vec4(0.0));
  //       gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  //       gy1 -= sz1 * (step(0.0, gy1) - 0.5);

  //       vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
  //       vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  //       vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
  //       vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  //       vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
  //       vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  //       vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
  //       vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

  //       vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  //       g000 *= norm0.x;
  //       g010 *= norm0.y;
  //       g100 *= norm0.z;
  //       g110 *= norm0.w;
  //       vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  //       g001 *= norm1.x;
  //       g011 *= norm1.y;
  //       g101 *= norm1.z;
  //       g111 *= norm1.w;

  //       float n000 = dot(g000, Pf0);
  //       float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  //       float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  //       float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  //       float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  //       float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  //       float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  //       float n111 = dot(g111, Pf1);

  //       vec3 fade_xyz = fade(Pf0);
  //       vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  //       vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  //       float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
  //       return 2.2 * n_xyz;
  //     }

        
  //       uniform float time;
  //       uniform vec2 hover;
  //       uniform float hoverState;
  //       varying float vNoise;
  //       varying vec2 vUv;
        
  //       void main() {
  //         vec3 newposition = position;
  //         float PI = 3.1415925;

  //         float noise = cnoise(3.*vec3(position.x,position.y,position.z + time/30.));

  //         float dist = distance(uv,hover);
  //         newposition.z += hoverState*10.*sin(dist*10. + time);

  //         vNoise = hoverState*sin(dist*10. - time);
  //         vUv = uv;
  //         gl_Position = projectionMatrix * modelViewMatrix * vec4( newposition, 1.0 );
  //       }
  //     `,
  //     fragmentShader: ` 
        
  //       uniform sampler2D uImage;
  //       uniform float time;
  //       uniform vec2 hover;
  //       varying float vNoise;
  //       varying vec2 vUv;

  //       void main()	{

  //         vec2 newUV = vUv;

  //         vec4 landscapeImage = texture2D(uImage, newUV);

  //         gl_FragColor = vec4(vUv,0.0,1.);

  //         gl_FragColor = landscapeImage;
  //         gl_FragColor.rgb += 0.07*vec3(vNoise);
  //       }
  //     `
  //   });


  addObjects() {
    const planeData = [
      { texturePath: 'https://uploads-ssl.webflow.com/63a027a7d4fdce748dd31f5b/6526e77f52db780b57b4e7b5_DJI_0157-Pano-min.JPG', width: 300, height: 400 },
      { texturePath: 'https://uploads-ssl.webflow.com/63a027a7d4fdce748dd31f5b/6526e77f58023a59a0bc0946_DJI_0224-Pano-min.JPG', width: 300, height: 400 },
      { texturePath: 'https://uploads-ssl.webflow.com/63a027a7d4fdce748dd31f5b/6526e77e7b9b65105ba567b6_DSC_0849-min.JPG', width: 300, height: 400 },
      { texturePath: 'https://uploads-ssl.webflow.com/63a027a7d4fdce748dd31f5b/6526e77eb2d64dcde34e3b9a_DJI_0187-min.JPG', width: 300, height: 400 },
      { texturePath: 'https://uploads-ssl.webflow.com/63a027a7d4fdce748dd31f5b/6526e77e8dc173134e026a98_DSC_0355-min.JPG', width: 300, height: 400 }
    ];

    for (let i = 0; i < planeData.length; i++) {
      const textureLoader = new THREE.TextureLoader();
      const texture = textureLoader.load(planeData[i].texturePath);

      this.material = new THREE.ShaderMaterial({
        extensions: {
          derivatives: "#extension GL_OES_standard_derivatives : enable"
        },
        side: THREE.DoubleSide,
        uniforms: {
          time: { value: 1 },
          // resolution: { value: new THREE.Vector4() },
          uImage: texture,
          hover: { value: new THREE.Vector2(0.5,0.5) },
          hoverState: { value: 0.5 },
        },
        wireframe: false,
        // transparent: true,
        vertexShader: `

        //	Classic Perlin 3D Noise 
        //	by Stefan Gustavson
        //
        vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
        vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
        vec3 fade(vec3 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

        float cnoise(vec3 P){
          vec3 Pi0 = floor(P); // Integer part for indexing
          vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
          Pi0 = mod(Pi0, 289.0);
          Pi1 = mod(Pi1, 289.0);
          vec3 Pf0 = fract(P); // Fractional part for interpolation
          vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
          vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
          vec4 iy = vec4(Pi0.yy, Pi1.yy);
          vec4 iz0 = Pi0.zzzz;
          vec4 iz1 = Pi1.zzzz;

          vec4 ixy = permute(permute(ix) + iy);
          vec4 ixy0 = permute(ixy + iz0);
          vec4 ixy1 = permute(ixy + iz1);

          vec4 gx0 = ixy0 / 7.0;
          vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
          gx0 = fract(gx0);
          vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
          vec4 sz0 = step(gz0, vec4(0.0));
          gx0 -= sz0 * (step(0.0, gx0) - 0.5);
          gy0 -= sz0 * (step(0.0, gy0) - 0.5);

          vec4 gx1 = ixy1 / 7.0;
          vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
          gx1 = fract(gx1);
          vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
          vec4 sz1 = step(gz1, vec4(0.0));
          gx1 -= sz1 * (step(0.0, gx1) - 0.5);
          gy1 -= sz1 * (step(0.0, gy1) - 0.5);

          vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
          vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
          vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
          vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
          vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
          vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
          vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
          vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

          vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
          g000 *= norm0.x;
          g010 *= norm0.y;
          g100 *= norm0.z;
          g110 *= norm0.w;
          vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
          g001 *= norm1.x;
          g011 *= norm1.y;
          g101 *= norm1.z;
          g111 *= norm1.w;

          float n000 = dot(g000, Pf0);
          float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
          float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
          float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
          float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
          float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
          float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
          float n111 = dot(g111, Pf1);

          vec3 fade_xyz = fade(Pf0);
          vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
          vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
          float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
          return 2.2 * n_xyz;
        }

          
          uniform float time;
          uniform vec2 hover;
          uniform float hoverState;
          varying float vNoise;
          varying vec2 vUv;
          
          void main() {
            vec3 newposition = position;
            float PI = 3.1415925;

            float noise = cnoise(3.*vec3(position.x,position.y,position.z + time/30.));

            float dist = distance(uv,hover);
            newposition.z += hoverState*10.*sin(dist*10. + time);

            vNoise = hoverState*sin(dist*10. - time);
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4( newposition, 1.0 );
          }
        `,
        fragmentShader: ` 
          
          uniform sampler2D uImage;
          uniform float time;
          uniform vec2 hover;
          varying float vNoise;
          varying vec2 vUv;

          void main()	{

            vec2 newUV = vUv;

            vec4 landscapeImage = texture2D(uImage, newUV);

            gl_FragColor = vec4(vUv,0.0,1.);

            gl_FragColor = landscapeImage;
            gl_FragColor.rgb += 0.07*vec3(vNoise);
          }
        `
      });

      this.geometry = new THREE.PlaneGeometry(planeData[i].width, planeData[i].height, 10, 10);
      this.plane = new THREE.Mesh(this.geometry, this.material);

      this.plane.position.x = (i - 0) * 380;

      this.scene.add(this.plane);

      // this.plane.userData.hoverState = { value: 0.5 };

      this.plane.addEventListener('mouseenter',()=>{
        gsap.to(this.plane.userData.hoverState,{
            duration:1,
            value:1
        });
      });
      this.plane.addEventListener('mouseout',()=>{
          gsap.to(this.plane.userData.hoverState,{
              duration:1,
              value:0
          });
      });

      this.material.uniforms.uImage.value = texture;
  }
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

    // this.plane.material.uniforms.time.value = this.time;

    // Iterate through each plane in the scene
    this.scene.children.forEach((object) => {
      if (object instanceof THREE.Mesh && object.material.uniforms.time !== undefined) {
          object.material.uniforms.time.value = this.time;
      }
    });


    requestAnimationFrame(this.render.bind(this));
    this.renderer.render(this.scene, this.camera);
  }
}

new Sketch({
  dom: document.getElementById("container")
});

