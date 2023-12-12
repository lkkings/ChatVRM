<script setup lang="ts">
const inputbox = ref(['', '', '', '', '', '']);
const isDown = ref(true);
const props = defineProps({
    confirmText:{
        type:String,
        required: true
    }
})
const emits = defineEmits(['confirm']);
const onInput = (index: number,event :any)=>{
    const value = event.target.value;
    inputbox.value[index] = value;
    if (inputbox.value.join('').length === inputbox.value.length) {
        isDown.value = false;
    }
    // index < 5 ，如果是第6格，不触发光标移动至下一个输入框。
    if (value && index < inputbox.value.length) {
        const nextInput = event.target.nextElementSibling;
        if (nextInput) {
        nextTick(() => {
            nextInput.focus();
        });
        }

    }
}
const confirm = ()=>emits('confirm', inputbox.value.join(''));
const onKeydown = (index:number,event:any)=>{
  if (event.key !== 'Backspace') return;

  // 处理删除操作
    isDown.value = true;
    if(event.target.value || index===0) return;
    const prevInput = event.target.previousElementSibling;
    if (prevInput) {
        nextTick(() => {
        prevInput.focus();
        });
    }
}
</script>
<template>
    <div class="password-contaner">
      <div class="six-input-box">
        <input v-for="(_,index) in inputbox"
               :key="index"
               class="input"
               v-model="inputbox[index]"
               type="text"
               oninput="value=value.replace(/[^\d]/g,'')"
               @input="onInput(index, $event)"
               @keydown="onKeydown(index,$event)"
               maxlength="1" />
      </div>
      <button @click="confirm" class="custom-button" :disabled="isDown">{{ props.confirmText }}</button>
    </div>
</template>
<style  scoped>
  .password-contaner{
    display: flex;
    justify-content: center; /* 在主轴上居中 */
    align-items: center; /* 在交叉轴上居中 */
    flex-direction: column;
  }
  .six-input-box {
    display: flex;
    flex-direction: row;
  }
  .input {
    display: flex;
    width: 25px;
    margin-left: 10px;
    height: 44px;
    font-size: 28px;
    color: #23a5d0;
    caret-color:#23a5d0;
    background: transparent; /* 背景透明 */
    border-bottom: 1px solid #000; /* 下划线 */
    text-align: center;
    outline: none;
    border-top: 0px;
    border-left: 0px;
    border-right: 0px;
  }
</style>