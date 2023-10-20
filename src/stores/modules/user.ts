import { defineStore } from "pinia";
import { UserState } from "@/stores/interface";
import piniaPersistConfig from "@/config/piniaPersist";

export const useUserStore = defineStore({
  id: "4pbooks-user",
  state: (): UserState => ({
    token: "",
  }),
  getters: {},
  actions: {
    // Set Token
    setToken(token: string) {
      this.token = token;
    },
  },
  persist: piniaPersistConfig("4pbooks-user")
});
