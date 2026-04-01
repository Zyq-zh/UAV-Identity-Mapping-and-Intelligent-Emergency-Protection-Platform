import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { UserProfile } from "@/types";

export const useUserStore = defineStore("user", () => {
  const profile = ref<UserProfile | null>({
    id: "u-admin-01",
    name: "安全运维-管理员",
    role: "admin",
  });

  const displayName = computed(() => profile.value?.name ?? "未登录");

  function setProfile(p: UserProfile | null) {
    profile.value = p;
  }

  return { profile, displayName, setProfile };
});
