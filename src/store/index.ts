import { defineStore } from 'pinia'
export const useAppStore = defineStore("app",{
    state: () => ({ isload: false}),
    getters: {
      load: (state) => state.isload
    },
    actions: {
      loading() {
        this.isload = true;
      },
      loaded(){
        this.isload = false;
      }
    },
})