import { defineStore } from 'pinia'
export const useAppStore = defineStore("app",{
    state: () => ({ 
      isload: false,
      isopenmenu:true,
      isopenai: false}),
    getters: {
      load: (state) => state.isload,
      openmenu:(state) => state.isopenmenu,
      openai:(state)=> state.isopenai
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
      }
    },
})