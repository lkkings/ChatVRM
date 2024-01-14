import * as THREE from "three";
import Model from "./model";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { loadMixamoAnimation } from "@/lib/VRMAnimation/loadMixamoAnimation.ts";
import {Results} from "@mediapipe/holistic"
import * as TWEEN from "@tweenjs/tween.js";

/**
 * three.jsを使った3Dビューワー
 *
 * setup()でcanvasを渡してから使う
 */
export default class Viewer {
  public isReady: boolean;
  public model?: Model;

  private _inputVideo?: HTMLVideoElement;
  private _renderer?: THREE.WebGLRenderer;
  private _clock: THREE.Clock;
  private _scene: THREE.Scene;
  private _camera?: THREE.PerspectiveCamera;
  private _cameraControls?: OrbitControls;
  private _loader?: THREE.TextureLoader;


  constructor() {
    this.isReady = false;

    //loader
    this._loader = new THREE.TextureLoader();

    // scene
    const scene = new THREE.Scene();
    const backgroundImage = import.meta.env.APP_DEFAULT_BACKGROUND_IMAGE;
    
    const backgroundTexture = this._loader.load(backgroundImage);
    scene.background = backgroundTexture;
    this._scene = scene;

    // light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(1.0, 1.0, 1.0).normalize();
    scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // animate
    this._clock = new THREE.Clock();
    this._clock.start();
  }

  private async _initLoadSystemFbx(){
    if (!this.model?.vrm) return; 
    this.model.clipMap.set("idle_01",await loadMixamoAnimation("daily/idle_01.fbx",this.model.vrm));
    this.model.clipMap.set("idle_02",await loadMixamoAnimation("daily/idle_02.fbx",this.model.vrm));
    //this.model.clipMap.set("idle_03",await loadMixamoAnimation("daily/idle_03.fbx",this.model.vrm));
    this.model.clipMap.set("idle_happy_01",await loadMixamoAnimation("daily/idle_happy_01.fbx",this.model.vrm));
    this.model.clipMap.set("idle_happy_02",await loadMixamoAnimation("daily/idle_happy_02.fbx",this.model.vrm));
    this.model.clipMap.set("idle_happy_03",await loadMixamoAnimation("daily/idle_happy_03.fbx",this.model.vrm));
    this.model.clipMap.set("kiss_01",await loadMixamoAnimation("daily/kiss_01.fbx",this.model.vrm));
    this.model.clipMap.set("talking_01",await loadMixamoAnimation("daily/talking_01.fbx",this.model.vrm));
    this.model.clipMap.set("talking_02",await loadMixamoAnimation("daily/talking_02.fbx",this.model.vrm));
    this.model.clipMap.set("standing_greeting",await loadMixamoAnimation("emote/standing_greeting.fbx",this.model.vrm));
    this.model.clipMap.set("thinking",await loadMixamoAnimation("emote/thinking.fbx",this.model.vrm));
    this.model.clipMap.set("excited",await loadMixamoAnimation("emote/excited.fbx",this.model.vrm));
  }

  public changeBackgroundImage(url: string){
     // 加载新的背景图片纹理
    console.log(url);
    const newTexture = this._loader?.load(url);
     // 在 Tween.js 动画中平滑过渡背景图片变化
    new TWEEN.Tween(this._scene.background)
      .to(newTexture, 1000)
      .onUpdate(()=>{
        this._scene.background = this._scene.background;
      })
      .start();
  }

  public loadVrm(url: string,onLoad?: () => void,) {
    if (this.model?.vrm) {
      this.unloadVRM();
    }
    // gltf and vrm
    this.model = new Model(this._camera || new THREE.Object3D());
    this.model.loadVRM(url).then(async () => {
      if (!this.model?.vrm) return;

      // Disable frustum culling
      this.model.vrm.scene.traverse((obj) => {
        obj.frustumCulled = false;
      });
      
      // 修改相机的位置
      this._camera?.position.set(0, 0, 5.0);  

      this._scene.add(this.model.vrm.scene);

      // 初始化加载人物动作
      await this._initLoadSystemFbx();
      await this.model.loadSystemFBX(import.meta.env.APP_DEFAULT_DAILY);
      // 加载完成回调
      onLoad?.();
      // HACK: アニメーションの原点がずれているので再生後にカメラ位置を調整する
      requestAnimationFrame(() => {
        this.resetCamera();
      });
    });
  }

  public camera2position() {
    if (!this._cameraControls) throw Error("camera controls is not found!");
    if (!this._camera) throw Error("head node is not found!");
    const headNode = this.model?.vrm?.humanoid.getNormalizedBoneNode("head");
    if (!headNode) throw Error("head node is not found!");
    const headWPos = headNode.getWorldPosition(new THREE.Vector3());
    const position = {x:headWPos.x, y:headWPos.y, z:headWPos.z}
    const initialPosition = {x:this._camera.position.x,y:this._camera.position.y,z:this._camera.position.z}
    console.log("initialPosition",initialPosition)
    new TWEEN.Tween(initialPosition)
      .to(position, 2000)
      .onUpdate(() => {
        this._camera?.position.set(
          this._camera.position.x,
          initialPosition.y,
          this._camera.position.z
        );
        this._cameraControls?.target.set(initialPosition.x, initialPosition.y, initialPosition.z);
        this._cameraControls?.update();
      })
      .onComplete(()=>{console.log("endPosition",initialPosition)})
      .start();
  }

  public unloadVRM(): void {
    if (this.model?.vrm) {
      this._scene.remove(this.model.vrm.scene);
      this.model?.unLoadVrm();
    }
  }

  public capture(results: Results){
    this.model?.captureUpdate(results,this._inputVideo);
  }

  public bootCapture(video: HTMLVideoElement){
    if(!this.model) return;
    this._inputVideo = video;
    this.model.enableCapture = true;
  }

  public shutCapture(){
    if(!this.model) return;
    this.model.enableCapture = false;
  }

  /**
   * Reactで管理しているCanvasを後から設定する
   */
  public setup(canvas: HTMLCanvasElement) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    // renderer
    this._renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
    });
    this._renderer.outputEncoding = THREE.sRGBEncoding;
    this._renderer.setSize(width, height);
    this._renderer.setPixelRatio(window.devicePixelRatio); 

    // camera
    this._camera = new THREE.PerspectiveCamera( 30.0, width / height, 0.1, 20.0 );

    // camera controls
    this._cameraControls = new OrbitControls(
      this._camera,
      this._renderer.domElement
    );
    this._cameraControls.screenSpacePanning = true;
    //this._cameraControls?.target.set(0, 1.3, 0);
    this._cameraControls.update();

    if(import.meta.env.APP_MODEL === "debug"){
      // helpers
			const gridHelper = new THREE.GridHelper( 10, 10 );
			this._scene.add( gridHelper );

			const axesHelper = new THREE.AxesHelper( 5 );
			this._scene.add( axesHelper );

    }

    window.addEventListener("resize", () => {
      if(!this._renderer) return;
      const parentElement = this._renderer.domElement.parentElement;
      if(parentElement)
      this.resize(parentElement.clientWidth,parentElement.clientHeight);
    });
    this.isReady = true;
    this.update();
  }

  /**
   * VRMのheadノードを参照してカメラ位置を調整する
   */
  public resetCamera() {
    const headNode = this.model?.vrm?.humanoid.getNormalizedBoneNode("head");

    if (headNode) {
      const headWPos = headNode.getWorldPosition(new THREE.Vector3());
      this._camera?.position.set(
        this._camera.position.x,
        headWPos.y,
        this._camera.position.z
      );
      this._cameraControls?.target.set(headWPos.x, headWPos.y, headWPos.z);
      this._cameraControls?.update();
    }
  }

  public update = () => {
    requestAnimationFrame(this.update);
    const delta = this._clock.getDelta();
    // update vrm components
    if (this.model) {
      this.model.update(delta);
    }
    

    if (this._renderer && this._camera) {
      this._renderer.render(this._scene, this._camera);
      TWEEN.update();
    }
  };


  public resize(width:number,height:number){
    if (!this._renderer) return;
    this._renderer.setPixelRatio(window.devicePixelRatio);
    this._renderer.setSize(width,height);

    if (!this._camera) return;
    this._camera.aspect = width / height;
    this._camera.updateProjectionMatrix();
  }
}
