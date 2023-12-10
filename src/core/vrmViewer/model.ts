import * as THREE from "three";
import {Results} from "@mediapipe/holistic"
import * as Kalidokit from "kalidokit"
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { VRM, VRMLoaderPlugin, VRMUtils, VRMHumanBoneName,VRMExpressionPresetName} from "@pixiv/three-vrm";
import { LipSync } from "@/core/lipSync/lipSync";
import EmoteMananger from "@/core/emote/emoteManager";
import { Screenplay, EmotionType } from "@/core/message/message";
import VRMLookAtSmootherLoaderPlugin from "@/lib/VRMLookAtSmootherLoaderPlugin/VRMLookAtSmootherLoaderPlugin";

//Import Helper Functions from Kalidokit
const clamp = Kalidokit.Utils.clamp;
const lerp = Kalidokit.Vector.lerp;

/**
 * 3Dキャラクターを管理するクラス
 */
export default class Model {
  public vrm?: VRM | null;
  public enableCapture = false;
  public mixer?: THREE.AnimationMixer;
  public emoteMananger?: EmoteMananger;
  public clipMap: Map<string, THREE.AnimationClip> = new Map();
  public blendTime: number = 0.5; // 这是混合时间，可以根据需要调整
  public current_clipMap: Map<string, THREE.AnimationClip> = new Map();

  private _lookAtTargetParent: THREE.Object3D;

  private _oldLookTarget = new THREE.Euler();
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
      throw new Error("You have to load VRM OR FBX first");
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

  private _rigFace(riggedFace: Kalidokit.TFace | undefined){
    if(!this.vrm || !riggedFace)return;
    this._rigRotation(VRMHumanBoneName.Neck, riggedFace.head, 0.7);
    // Blendshapes and Preset Name Schema
    const Blendshape = this.vrm.expressionManager;
    if(!Blendshape) return;
    // Simple example without winking. Interpolate based on old blendshape, then stabilize blink with `Kalidokit` helper function.
    // for VRM, 1 is closed, 0 is open.
    const B = Blendshape.getValue(VRMExpressionPresetName.Blink);
    const I = Blendshape.getValue(VRMExpressionPresetName.Ih);
    const A = Blendshape.getValue(VRMExpressionPresetName.Aa);
    const E = Blendshape.getValue(VRMExpressionPresetName.Ee);
    const O = Blendshape.getValue(VRMExpressionPresetName.Oh);
    const U = Blendshape.getValue(VRMExpressionPresetName.Ou);
    // if(!(B && I && A && E && O && U)) return;
    // console.log("riggedFace",riggedFace);
    riggedFace.eye.l = lerp(clamp(1 - riggedFace.eye.l, 0, 1),B, .5)
    riggedFace.eye.r = lerp(clamp(1 - riggedFace.eye.r, 0, 1),B, .5)
    riggedFace.eye = Kalidokit.Face.stabilizeBlink(riggedFace.eye,riggedFace.head.y)
    Blendshape.setValue(VRMExpressionPresetName.Blink, riggedFace.eye.l);
    // Interpolate and set mouth blendshapes
    Blendshape.setValue(VRMExpressionPresetName.Ih, lerp(riggedFace.mouth.shape.I,I, .5));
    Blendshape.setValue(VRMExpressionPresetName.Aa, lerp(riggedFace.mouth.shape.A,A, .5));
    Blendshape.setValue(VRMExpressionPresetName.Ee, lerp(riggedFace.mouth.shape.E,E, .5));
    Blendshape.setValue(VRMExpressionPresetName.Oh, lerp(riggedFace.mouth.shape.O,O, .5));
    Blendshape.setValue(VRMExpressionPresetName.Ou, lerp(riggedFace.mouth.shape.U,U, .5));

    //PUPILS
    //interpolate pupil and keep a copy of the value
    let lookTarget =
      new THREE.Euler(
        lerp(this._oldLookTarget.x , riggedFace.pupil.y, .4),
        lerp(this._oldLookTarget.y, riggedFace.pupil.x, .4),
        0,
        "XYZ"
      )
    this._oldLookTarget.copy(lookTarget)
    this.vrm.lookAt?.applier.lookAt(lookTarget);
  }

  private _rigPosition(name: VRMHumanBoneName,position = { x: 0, y: 0, z: 0 },dampener = 1,lerpAmount = 0.3){
    const Part = this.vrm?.humanoid.getNormalizedBoneNode(name);
    if (!Part) return;
    let vector = new THREE.Vector3(
      position.x * dampener,
      position.y * dampener,
      position.z * dampener
    );
    Part.position.lerp(vector, lerpAmount); // interpolate
  };
  


  

   // 给动作切换时加一个淡入淡出效果，避免角色抖动
  public async crossPlay(curAction: THREE.AnimationAction, newAction: THREE.AnimationAction) {
    curAction.fadeOut(1);
    newAction.reset();
    newAction.setEffectiveWeight(1);
    newAction.play();
    newAction.fadeIn(1);
  }
  public _rigRotation(name: VRMHumanBoneName,rotation = { x: 0, y: 0, z: 0 },dampener = 1,lerpAmount = 0.3){
    const Part = this.vrm?.humanoid.getNormalizedBoneNode(name);
    if (!Part) return;
    
    let euler = new THREE.Euler(
      rotation.x * dampener,
      rotation.y * dampener,
      rotation.z * dampener
    );
    let quaternion = new THREE.Quaternion().setFromEuler(euler);
    Part.quaternion.slerp(quaternion, lerpAmount); // interpolate
  };

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

  public captureUpdate(results: Results,sourceVideo?:HTMLVideoElement){  
    // Take the results from `Holistic` and animate character based on its Face, Pose, and Hand Keypoints.
    let riggedPose, riggedLeftHand, riggedRightHand, riggedFace;
  
    const faceLandmarks = results.faceLandmarks;
    // Pose 3D Landmarks are with respect to Hip distance in meters
    const pose3DLandmarks = results.za;
    // Pose 2D landmarks are with respect to videoWidth and videoHeight
    const pose2DLandmarks = results.poseLandmarks;
    // Be careful, hand landmarks may be reversed
    const leftHandLandmarks = results.rightHandLandmarks;
    const rightHandLandmarks = results.leftHandLandmarks;
  
    // Animate Face
    if (faceLandmarks) {
     riggedFace = Kalidokit.Face.solve(faceLandmarks,{
        runtime:"mediapipe",
        video:sourceVideo
     });
     this._rigFace(riggedFace)
    }
  
    // Animate Pose
    if (pose2DLandmarks && pose3DLandmarks) {
      riggedPose = Kalidokit.Pose.solve(pose3DLandmarks, pose2DLandmarks, {
        runtime: "mediapipe",
        video:sourceVideo,
      });

      if(!riggedPose) return;
      this._rigRotation(VRMHumanBoneName.Hips, riggedPose.Hips.rotation, 0.7);
      this._rigPosition(
        VRMHumanBoneName.Hips,
        {
          x: -riggedPose.Hips.position.x, // Reverse direction
          y: riggedPose.Hips.position.y + 1, // Add a bit of height
          z: -riggedPose.Hips.position.z // Reverse direction
        },
        1,
        0.07
      );
      this._rigRotation(VRMHumanBoneName.Chest, riggedPose.Spine, 0.25, .3);
      this._rigRotation(VRMHumanBoneName.Spine, riggedPose.Spine, 0.45, .3);
  
      this._rigRotation(VRMHumanBoneName.RightUpperArm, riggedPose.RightUpperArm, 1, .3);
      this._rigRotation(VRMHumanBoneName.RightLowerArm, riggedPose.RightLowerArm, 1, .3);
      this._rigRotation(VRMHumanBoneName.LeftUpperArm, riggedPose.LeftUpperArm, 1, .3);
      this._rigRotation(VRMHumanBoneName.LeftLowerArm, riggedPose.LeftLowerArm, 1, .3);
  
      this._rigRotation(VRMHumanBoneName.LeftUpperLeg, riggedPose.LeftUpperLeg, 1, .3);
      this._rigRotation(VRMHumanBoneName.LeftLowerLeg, riggedPose.LeftLowerLeg, 1, .3);
      this._rigRotation(VRMHumanBoneName.RightUpperLeg, riggedPose.RightUpperLeg, 1, .3);
      this._rigRotation(VRMHumanBoneName.RightLowerLeg, riggedPose.RightLowerLeg, 1, .3);
      if (leftHandLandmarks) {
        riggedLeftHand = Kalidokit.Hand.solve(leftHandLandmarks, "Left");
        if(!riggedLeftHand) return;
        this._rigRotation(VRMHumanBoneName.LeftHand, {
          // Combine pose rotation Z and hand rotation X Y
          z: riggedPose.LeftHand.z,
          y: riggedLeftHand.LeftWrist.y,
          x: riggedLeftHand.LeftWrist.x
        });
        this._rigRotation(VRMHumanBoneName.LeftRingProximal, riggedLeftHand.LeftRingProximal);
        this._rigRotation(VRMHumanBoneName.LeftRingIntermediate, riggedLeftHand.LeftRingIntermediate);
        this._rigRotation(VRMHumanBoneName.LeftRingDistal, riggedLeftHand.LeftRingDistal);
        this._rigRotation(VRMHumanBoneName.LeftIndexProximal, riggedLeftHand.LeftIndexProximal);
        this._rigRotation(VRMHumanBoneName.LeftIndexIntermediate, riggedLeftHand.LeftIndexIntermediate);
        this._rigRotation(VRMHumanBoneName.LeftIndexDistal, riggedLeftHand.LeftIndexDistal);
        this._rigRotation(VRMHumanBoneName.LeftMiddleProximal, riggedLeftHand.LeftMiddleProximal);
        this._rigRotation(VRMHumanBoneName.LeftMiddleIntermediate, riggedLeftHand.LeftMiddleIntermediate);
        this._rigRotation(VRMHumanBoneName.LeftMiddleDistal, riggedLeftHand.LeftMiddleDistal);
        this._rigRotation(VRMHumanBoneName.LeftThumbProximal, riggedLeftHand.LeftThumbProximal);
        this._rigRotation(VRMHumanBoneName.LeftThumbMetacarpal, riggedLeftHand.LeftThumbIntermediate);
        this._rigRotation(VRMHumanBoneName.LeftThumbDistal, riggedLeftHand.LeftThumbDistal);
        this._rigRotation(VRMHumanBoneName.LeftLittleProximal, riggedLeftHand.LeftLittleProximal);
        this._rigRotation(VRMHumanBoneName.LeftLittleIntermediate, riggedLeftHand.LeftLittleIntermediate);
        this._rigRotation(VRMHumanBoneName.LeftLittleDistal, riggedLeftHand.LeftLittleDistal);
      }
      if (rightHandLandmarks) {
        riggedRightHand = Kalidokit.Hand.solve(rightHandLandmarks, "Right");
        if(!riggedRightHand) return;
        this._rigRotation(VRMHumanBoneName.RightHand, {
          // Combine Z axis from pose hand and X/Y axis from hand wrist rotation
          z: riggedPose.RightHand.z,
          y: riggedRightHand.RightWrist.y,
          x: riggedRightHand.RightWrist.x
        });
        this._rigRotation(VRMHumanBoneName.RightRingProximal, riggedRightHand.RightRingProximal);
        this._rigRotation(VRMHumanBoneName.RightRingIntermediate, riggedRightHand.RightRingIntermediate);
        this._rigRotation(VRMHumanBoneName.RightRingDistal, riggedRightHand.RightRingDistal);
        this._rigRotation(VRMHumanBoneName.RightIndexProximal, riggedRightHand.RightIndexProximal);
        this._rigRotation(VRMHumanBoneName.RightIndexIntermediate,riggedRightHand.RightIndexIntermediate);
        this._rigRotation(VRMHumanBoneName.RightIndexDistal, riggedRightHand.RightIndexDistal);
        this._rigRotation(VRMHumanBoneName.RightMiddleProximal, riggedRightHand.RightMiddleProximal);
        this._rigRotation(VRMHumanBoneName.RightMiddleIntermediate, riggedRightHand.RightMiddleIntermediate);
        this._rigRotation(VRMHumanBoneName.RightMiddleDistal, riggedRightHand.RightMiddleDistal);
        this._rigRotation(VRMHumanBoneName.RightThumbProximal, riggedRightHand.RightThumbProximal);
        this._rigRotation(VRMHumanBoneName.RightThumbMetacarpal, riggedRightHand.RightThumbIntermediate);
        this._rigRotation(VRMHumanBoneName.RightThumbDistal, riggedRightHand.RightThumbDistal);
        this._rigRotation(VRMHumanBoneName.RightLittleProximal, riggedRightHand.RightLittleProximal);
        this._rigRotation(VRMHumanBoneName.RightLittleIntermediate, riggedRightHand.RightLittleIntermediate);
        this._rigRotation(VRMHumanBoneName.RightLittleDistal, riggedRightHand.RightLittleDistal);
      }
    }
  }

  public async emote(emotionType: EmotionType) {
    this.emoteMananger?.playEmotion(emotionType);
  }

  public update(delta: number): void {
    if(!this.enableCapture){
      if (this._lipSync) {
        const { volume } = this._lipSync.update();
        this.emoteMananger?.lipSync("aa", volume);
      }
      this.emoteMananger?.update(delta);
      this.mixer?.update(delta);
    }
    this.vrm?.update(delta);
  }
}
