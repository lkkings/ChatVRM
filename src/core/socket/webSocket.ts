
const host = import.meta.env.APP_HOST;
const baseUrl = import.meta.env.APP_WEBSOCKET_PATH;

export let socketInstance : WebSocket | null = null;


export const connect= async (): Promise<WebSocket>=>{
    const socket = new WebSocket(`ws://${host}${baseUrl}`);
    socket.onopen = () => {
        console.log('WebSocket connection established.');
        socket.send('connection success');
    };
    socket.onclose = (event) => {
        console.log('WebSocket connection closed:', event);
        // 重新连接，每隔1秒尝试一次
        setTimeout(() => {
            console.log('Reconnecting...');
            connect(); // 重新调用connect()函数进行连接
        }, 1000);
    };
    return socket;
}

export const setupWebSocket = (handleWebSocketMessage: (event: MessageEvent) => void) => {

    connect().then((webSocket) => {
        socketInstance = webSocket;
        socketInstance.onmessage = handleWebSocketMessage; // Set onmessage listener
        socketInstance.onclose = (event) => {
            console.log('WebSocket connection closed:', event);
            console.log('Reconnecting...');
            setupWebSocket(handleWebSocketMessage); // 重新调用connect()函数进行连接
        };
    });
}