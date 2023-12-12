<script setup lang="ts">
import Viewer from '@/core/viewer/viewer';
import Icon from './Icon.vue';
import { useAppStore } from '@/store';
import {fetchAudio} from '@/api'
import {setupWebSocket,closeWebSocket} from '@/core/socket/webSocket'
import {Screenplay, textsToScreenplay, EmotionType} from '@/core/message/message'
import {sleep} from '@/utils/commonUtil'

let lastTime = 0;
const appStore = useAppStore();
const viewer = inject<Viewer>("viewer");
const handleSpeakAi = async (screenplay: Screenplay, onStart?: () => void,onEnd?: () => void)=>{
  console.log("speak",screenplay.talk.message)
  const now = Date.now();
      if (now - lastTime < 1000) {
        await sleep(1000 - (now - lastTime));
      }
  const audioBuffer = await fetchAudio(screenplay.talk.message);
  lastTime = Date.now();
  onStart?.();
  if (!audioBuffer || !viewer) {
    return;
  }
  await viewer.model?.speak(audioBuffer, screenplay);
  onEnd?.();
}
const handleUserMessage = async (content: string,emote: string)=> {
  console.log("chatbot message:" + content + " emote:" + emote)
  if (content == null || content == '' || content == ' ') {
      return
  }
  const aiText = content;
  const aiTalks = textsToScreenplay([aiText], emote);
  await handleSpeakAi(aiTalks[0]);
}
const handleBehaviorAction = async (content: string,emote: string) => {
  console.log("behavior action message:" + content + " emote:" + emote)
  if (!viewer?.model) throw Error("viewer is not null!");
  await viewer.model.emote(emote as EmotionType);
  await viewer.model.loadSystemFBX(content);
}
const handleDanmakuMessage = async (content: string,emote: string,action: string) => {
  console.log("danmaku message:" + content + " emote:" + emote)
  // 如果content为空，不进行处理
  // 如果与上一句content完全相同，不进行处理
  if (content == null || content == '' || content == ' ') {
    return
  }
  // 如果有，则播放相应动作
  if (action != null && action != '') {
    await handleBehaviorAction(action,emote);
  }

  const aiText = content;
  const aiTalks = textsToScreenplay([aiText], emote);
  await handleSpeakAi(aiTalks[0]);
  // 语音播放完后需要恢复到原动画
  if (action != null && action != '') {
    await handleBehaviorAction("idle_01","neutral");
  }
}
const handleWebSocketMessage = async (event: MessageEvent) => {
  const data = event.data;
  const chatMessage = JSON.parse(data);
  console.log(`message`,chatMessage);
  const type = chatMessage.type;
  if (type === "user") {
    await handleUserMessage(
      chatMessage.content,
      chatMessage.emote,
    );
  } else if (type === "behavior_action") {
    await handleBehaviorAction(
      chatMessage.content,
      chatMessage.emote,
    );
  } else if (type === "danmaku") {
    await handleDanmakuMessage(
      chatMessage.content,
      chatMessage.emote,
      chatMessage.action
    );
  }
};

const openOrHideMenu = () => appStore.isopenmenu?appStore.hideMenu():appStore.showMenu();
const openOrCloseAI = () => {
  if(appStore.isopenai){
    closeWebSocket();
    console.log(">>>> closeWebSocket")
    appStore.closeAI();
  }else{
    console.log(">>>> setupWebSocket")
    setupWebSocket(handleWebSocketMessage); 
    appStore.openAI();
  }
}
</script>
<template>
  <div class="sidebar-contanter">
    <div class="button-container">
      <button class="button-item info" title="操作手册">
        <Icon name="info"/>
      </button>
      <button class="button-item github" title="github">
        <Icon name="github"/>
      </button>
      <button class="button-item live" title="直播">
        <Icon name="live"/>
      </button>
      <button @click="openOrCloseAI" class="button-item ai" title="AI托管">
        <Icon v-if="appStore.openai" class="icon" name="ai" fill="#23a5d0"/>
        <Icon v-else name="ai" class="nion-icon"/>
      </button>
      <button @click="openOrHideMenu" class="button-item eye" :title="useAppStore().openmenu?'关闭菜单':'打开菜单'" >
        <Icon v-if="appStore.openmenu" name="eye"/>
        <Icon v-else name="eye-close"/>
      </button>
    </div>
  </div>
</template>
  
<style scoped>
.button-container {
  display: block;
  position: absolute;
  top: 40px;
  right: 80px;
  display: flex;
  flex-direction: column; 
}
.button-item{
  position: absolute;
  width: 28px;
  height: 28px;
  outline: none;
  border: none;
  background-color: rgba(0, 60, 255, 0); 
  padding: 0;
}

.info{
  top: 0;
}

.github{
  top: 40px
}

.live{
  top: 80px
}
.ai{
  top: 120px
}
.eye{
  top: 160px
}
</style>
  