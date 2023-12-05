import axios from 'axios';

const baseUrl = import.meta.env.APP_HOST

export async function postRequest(endpoint: string, headers: Record<string, string>, data: object): Promise<any> {
  const response = await axios.post(`${baseUrl}${endpoint}`, data, { headers });
  return response.data; // 返回解析后的数据
}
  
export async function postRequestArraybuffer(endpoint: string, headers: Record<string, string>, data: object): Promise<any> {
  const response = await axios.post(`${baseUrl}${endpoint}`, data, {
    responseType: 'arraybuffer',
    headers: headers,
  });
  return response.data; // 返回解析后的数据
}

// 定义一个发送Get请求的函数
export async function getRequest(endpoint: string, headers: Record<string, string>): Promise<any> {
  const response = await axios.get(`${baseUrl}${endpoint}`, { headers });
  return response.data; // 返回响应对象
}