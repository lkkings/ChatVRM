import {postRequestArraybuffer} from '@/utils/httpClientUtil'

export const fetchAudio = async (message:string): Promise<ArrayBuffer> => {  
    const requestBody = {
      text: message,
      voice_id: import.meta.env.APP_VITS_TYPE,
      type: import.meta.env.APP_VITS_TYPE
    };
  
    const headers = {
      'Content-Type': 'application/json',
    }
    const data = await postRequestArraybuffer("/speech/tts/generate", headers, requestBody);
    return data;
};