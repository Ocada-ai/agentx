import {create} from "zustand"

type userStore = {
    user: string;
}

export const useUserStore = create<userStore>(() => ({
    user: "",
}))