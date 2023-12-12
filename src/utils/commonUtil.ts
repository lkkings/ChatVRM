export const sleep = async (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const showMessage = (messageStr:string,time=1000)=>{
      // 创建一个提示消息元素并显示提示消息
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

      // 3秒后隐藏提示消息
      setTimeout(() => {
        document.body.removeChild(message);
      }, time);
}