import * as THREE from "three";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { VRM, VRMLoaderPlugin, VRMUtils} from "@pixiv/three-vrm";
import { LipSync } from "@/core/lipSync/lipSync";
import EmoteMananger from "@/core/emote/emoteManager";
import { Screenplay, EmotionType } from "@/core/message/message";
import VRMLookAtSmootherLoaderPlugin from "@/lib/VRMLookAtSmootherLoaderPlugin/VRMLookAtSmootherLoaderPlugin";


/**
 * 3Dキャラクターを管理するクラス
 */
export default class Model {
  public vrm?: VRM | null;
  public mixer?: THREE.AnimationMixer;
  public emoteMananger?: EmoteMananger;
  public clipMap: Map<string, THREE.AnimationClip> = new Map();
  public blendTime: number = 0.5; // 这是混合时间，可以根据需要调整
  public current_clipMap: Map<string, THREE.AnimationClip> = new Map();

  private _lookAtTargetParent: THREE.Object3D;
  private _lipSync?: LipSync;

  constructor(lookAtTargetParent: THREE.Object3D) {
    this._lookAtTargetParent = lookAtTargetParent;
    this._lipSync = new LipSync(new AudioContext());
  }

  public async loadVRM(url: string): Promise<void> {
    const loader = new GLTFLoader();
    loader.register(
      (parser) =>
        new VRMLoaderPlugin(parser, {
          lookAtPlugin: new VRMLookAtSmootherLoaderPlugin(parser),
        })
    );

    const gltf = await loader.loadAsync(url);

    const vrm = (this.vrm = gltf.userData.vrm);
    vrm.scene.name = "VRMRoot";

    VRMUtils.rotateVRM0(vrm);
    this.mixer = new THREE.AnimationMixer(vrm.scene);

    if (vrm.lookAt) vrm.lookAt.target = this._lookAtTargetParent;

    this.emoteMananger = new EmoteMananger(vrm);

  }

  public unLoadVrm() {
    if (this.vrm) {
      VRMUtils.deepDispose(this.vrm.scene);
      this.vrm = null;
    }
  }


  // mixamo animation
  public async loadSystemFBX(animationUrl: string) {
    const { vrm, mixer, clipMap,current_clipMap } = this;

    const animationClip = clipMap.get(animationUrl)
    const currentClip = current_clipMap.get("current")
    if (vrm == null || mixer == null || animationClip == null) {
      throw new Error("You have to load VRM first");
    }

    if (currentClip != null) {

      const currentClipAction = mixer.clipAction(currentClip)
      const animationClipAction = mixer.clipAction(animationClip)
      this.crossPlay(currentClipAction,animationClipAction)
    } else {
      mixer.clipAction(animationClip)?.play();
    }
    current_clipMap?.set("current", animationClip)
  }

  

   // 给动作切换时加一个淡入淡出效果，避免角色抖动
  public async crossPlay(curAction: THREE.AnimationAction, newAction: THREE.AnimationAction) {
    curAction.fadeOut(1);
    newAction.reset();
    newAction.setEffectiveWeight(1);
    newAction.play();
    newAction.fadeIn(1);
  }

  /**
   * 音声を再生し、リップシンクを行う
   */
  public async speak(buffer: ArrayBuffer, screenplay: Screenplay) {
    this.emoteMananger?.playEmotion(screenplay.expression);
    await new Promise((resolve) => {
      this._lipSync?.playFromArrayBuffer(buffer, () => {
        resolve(true);
        this.emoteMananger?.playEmotion("neutral" as EmotionType);
      });
    });
  }

  public async emote(emotionType: EmotionType) {
    this.emoteMananger?.playEmotion(emotionType);
  }

  public update(delta: number): void {
    if (this._lipSync) {
      const { volume } = this._lipSync.update();
      this.emoteMananger?.lipSync("aa", volume);
    }

    this.emoteMananger?.update(delta);
    this.mixer?.update(delta);
    this.vrm?.update(delta);
  }
}
