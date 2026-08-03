import { api } from "@/lib/api";

export const logoutUser = async (): Promise<void> => {
  try {
    await api.post("/auth/logout");
  } catch (error) {
    console.error("Logout backend error:", error);
  } finally {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userId");
  }
};