import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Water } from 'three/addons/objects/Water.js';
import { Sky } from 'three/addons/objects/Sky.js';

export function Ocean(props) {
  const containerRef = useRef();

  useEffect(() => {
    let camera, scene, renderer;
    let controls, water, sun;
    
    
    init();
    animate();
    
    function init() {
    
      //
    
      renderer = new THREE.WebGLRenderer();
      renderer.setPixelRatio( window.devicePixelRatio );
      renderer.setSize( window.innerWidth, window.innerHeight );
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 0.5;
      document.body.appendChild( renderer.domElement );
    
      //
    
      scene = new THREE.Scene();
    
      camera = new THREE.PerspectiveCamera( 55, window.innerWidth / window.innerHeight, 1, 20000 );
      camera.position.set( -10, 30, 100 );
    
    
      // boat.add(camera);
    
      //
    
      sun = new THREE.Vector3();
    
      // Water
    
      const waterGeometry = new THREE.PlaneGeometry( 10000, 10000 );
    
      water = new Water(
        waterGeometry,
        {
          textureWidth: 512,
          textureHeight: 512,
          waterNormals: new THREE.TextureLoader().load( 'assets/waternormals.jpg', function ( texture ) {
    
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    
          } ),
          sunDirection: new THREE.Vector3(),
          sunColor: 0xffffff,
          waterColor: 0x001e0f,
          distortionScale: 3.7,
          fog: scene.fog !== undefined
        }
      );
    
      water.rotation.x = - Math.PI / 2;
    
      scene.add( water );
    
      // Skybox
    
      const sky = new Sky();
      sky.scale.setScalar( 10000 );
      scene.add( sky );
    
      const skyUniforms = sky.material.uniforms;
    
      skyUniforms[ 'turbidity' ].value = 10;
      skyUniforms[ 'rayleigh' ].value = 2;
      skyUniforms[ 'mieCoefficient' ].value = 0.005;
      skyUniforms[ 'mieDirectionalG' ].value = 0.8;
    
      const parameters = {
        elevation: 2,
        azimuth: 180
      };
    
      const pmremGenerator = new THREE.PMREMGenerator( renderer );
      const sceneEnv = new THREE.Scene();
    
      let renderTarget;
    
      function updateSun() {
    
        const phi = THREE.MathUtils.degToRad( 90 - parameters.elevation );
        const theta = THREE.MathUtils.degToRad( parameters.azimuth );
    
        sun.setFromSphericalCoords( 1, phi, theta );
    
        sky.material.uniforms[ 'sunPosition' ].value.copy( sun );
        water.material.uniforms[ 'sunDirection' ].value.copy( sun ).normalize();
    
        if ( renderTarget !== undefined ) renderTarget.dispose();
    
        sceneEnv.add( sky );
        renderTarget = pmremGenerator.fromScene( sceneEnv );
        scene.add( sky );
    
        scene.environment = renderTarget.texture;
    
      }
    
      updateSun();
    
      const waterUniforms = water.material.uniforms;
    
      window.addEventListener( 'resize', onWindowResize );
    
    }
    
    function onWindowResize() {
    
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    
      renderer.setSize( window.innerWidth, window.innerHeight );
    
    }
    
    function animate() {
      requestAnimationFrame( animate );
      render();
    }
    
    function render() {
    
      water.material.uniforms[ 'time' ].value += 1.0 / 60.0;
    
      renderer.render( scene, camera );
    
    }

    // Clean up Three.js scene on component unmount
    return () => {
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={containerRef} style={{ position: "absolute", width: "100%", height: "100%" }}>
    {props.children}
  </div>;
}