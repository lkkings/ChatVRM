
const wsUrl = import.meta.env.APP_AI_WS_URL;

let timer: any = null;

let socketInstance : WebSocket | null = null;


export const closeWebSocket = ()=>{
    socketInstance?.close();
    clearTimeout(timer);
    timer = null;
}

export const setupWebSocket = (handleWebSocketMessage: (event: MessageEvent) => void,onSuccess?:()=>{}) => {
    const socketInstance = new WebSocket(wsUrl);
    socketInstance.onopen = () => {
        console.log('WebSocket connection established.');
        onSuccess?.();
    };
    socketInstance.onclose = (event) => {
        console.log('WebSocket connection closed:', event);
        console.log('Reconnecting...');
        // 重新连接，每隔1秒尝试一次
        timer = setTimeout(() => {
            setupWebSocket(handleWebSocketMessage);
        }, 1000);
    };
    socketInstance.onmessage = handleWebSocketMessage; 

}