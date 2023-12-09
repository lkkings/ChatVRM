import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.APP_API_URL, 
  //其他的配置，比如 headers、timeout 等，可以在这里添加
});

export async function postRequest(endpoint: string, headers: Record<string, string>, data: object): Promise<any> {
  const response = await instance.post(endpoint, data, { headers });
  return response.data; // 返回解析后的数据
}
  
export async function postRequestArraybuffer(endpoint: string, headers: Record<string, string>, data: object): Promise<any> {
  const response = await instance.post(endpoint, data, {
    responseType: 'arraybuffer',
    headers: headers,
  });
  return response.data; // 返回解析后的数据
}

// 定义一个发送Get请求的函数
export async function getRequest(endpoint: string, headers: Record<string, string>): Promise<any> {
  const response = await instance.get(endpoint, { headers });
  return response.data; // 返回响应对象
}