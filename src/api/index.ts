import {postRequestArraybuffer} from '@/utils/httpClientUtil'

export const fetchAudio = async (message:string): Promise<ArrayBuffer> => {  
    const requestBody = {
      text: message,
      voice_id: import.meta.env.APP_VOICE_ID,
      type: import.meta.env.APP_VITS_TYPE
    };
  
    const headers = {
      'Content-Type': 'application/json',
    }
    const data = await postRequestArraybuffer("/tts/generate", headers, requestBody);
    return data;
};