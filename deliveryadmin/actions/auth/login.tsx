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
  password: string,
): Promise<LoginResponse> => {
  try {
    const { data } = await api.post<LoginResponse>("/auth/login", {
      email,
      password,
    });

    if (data.status !== "success") {
      throw new Error(data.message ?? "Utilisateur non autorisé");
    }

    // The JWT is stored in a secure HTTP-only cookie by the backend.
    // No client-side token persistence is used.
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
