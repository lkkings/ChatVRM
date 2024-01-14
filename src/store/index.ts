import { defineStore } from 'pinia'
export const useAppStore = defineStore("app",{
    state: () => ({ 
      isload: false,
      isopenmenu:true,
      isopenai: false,
      isopencamera: false,
      isopenviewer: true
    }),
    getters: {
      load: (state) => state.isload,
      openmenu:(state) => state.isopenmenu,
      openai:(state)=> state.isopenai,
      opencamera:(state)=> state.isopencamera,
      openviewer:(state)=> state.isopenviewer,
    },
    actions: {
      loading() {
        this.isload = true;
      },
      loaded(){
        this.isload = false;
      },
      showMenu(){
        this.isopenmenu = true;
      },
      hideMenu(){
        this.isopenmenu = false;
      },
      openAI(){
        this.isopenai = true;
      },
      closeAI(){
        this.isopenai = false;
      },
      openCarmera(){
        this.isopencamera = true;
      },
      closeCamera(){
        this.isopencamera = false;
      },
      openViewer(){
        this.isopenviewer = true;
      },
      closeViewer(){
        this.isopenviewer = false;
      }
    },
})