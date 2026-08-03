import { api } from "@/lib/api";
import axios from "axios";

interface LoginResponse {
  status: string;
  message: string;
  data: {
    token: string;
    user: string;
  };
}

export const loginUser = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  try {
    const { data } = await api.post<LoginResponse>("/auth/login", {
      email,
      password,
    });

    
    localStorage.setItem("accessToken", data.data.token);
    localStorage.setItem("userId", data.data.user);

    return data;

  } catch (error: unknown) {

    if (axios.isAxiosError<{ message?: string }>(error)) {
      throw new Error(error.response?.data?.message ?? "Login failed");
    }

    if (error instanceof Error) {
      throw new Error(error.message);
    }

    throw new Error("Unexpected error occurred");
  }
};