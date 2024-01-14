export const sleep = async (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));


/**
 * 获取当前时间的函数，
 * @returns  返回格式化的字符串
 */
export const getCurrentTime = ():string=> {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0'); // 将小时格式化为两位数
  const minutes = now.getMinutes().toString().padStart(2, '0'); // 将分钟格式化为两位数
  const seconds = now.getSeconds().toString().padStart(2, '0'); // 将秒数格式化为两位数

  return `${hours}:${minutes}:${seconds}`;
}


/**
 * 展示提示消息
 * @param messageStr 提示消息
 * @param time 展示时间
 */
export const showMessage = (messageStr:string,time=1000):void=>{
      const message = document.createElement('div');
      message.textContent = messageStr;
      message.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        border-radius: 5px;
        border: 2px solid #3498db;
        color: #fff;
        background-color: #3498db;
        padding: 10px;
        z-index: 9999;
      `;
      document.body.appendChild(message);
      setTimeout(() => {
        document.body.removeChild(message);
      }, time);
}