"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { loginUser } from "@/actions/auth/login";
import toast from "react-hot-toast";

const LoginPage: React.FC = () => {
  const router = useRouter();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPw, setShowPw] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleLogin = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await loginUser(email, password);

      if (response.status === "success") {
        toast.success("Connexion réussie!");
        router.push("/adminDashboard");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Login failed");
      }
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* ================= LEFT PANEL ================= */}
      <div
        className="relative hidden lg:flex flex-col justify-center px-20 text-white overflow-hidden
bg-gradient-to-br from-[#FF7A45] via-[#FF5E24] to-[#E64A19]"
      >
        {/* Decorative Circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute bottom-[-150px] right-[-100px] w-[500px] h-[500px] bg-white/5 rounded-full" />

        {/* Content */}
        <div className="relative z-10 max-w-lg">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-14">
            <Image
              src="/hunterlogo1.png"
              alt="Hunter Delivery Logo"
              width={36}
              height={36}
              className="object-contain"
            />
            <span className="text-2xl font-bold tracking-tight">
              Hunter<span className="font-light">Delivery</span>
            </span>
          </div>

          <h2 className="text-4xl font-extrabold mb-6">
            Portail Administration
          </h2>

          <p className="text-white/80 leading-relaxed mb-10">
            Supervisez les restaurants, gérez les commandes et optimisez les
            livraisons depuis un tableau de bord centralisé.
          </p>

          {/* Features */}
          <ul className="space-y-4 text-white/90">
            <li className="flex items-center gap-3">
              <span className="w-2 h-2 bg-white/70 rounded-full" />
              Gérer les Restaurants & Menus
            </li>
            <li className="flex items-center gap-3">
              <span className="w-2 h-2 bg-white/70 rounded-full" />
              Superviser les Commandes en Temps Réel
            </li>
            <li className="flex items-center gap-3">
              <span className="w-2 h-2 bg-white/70 rounded-full" />
              Assigner les Chauffeurs & Optimiser les Livraisons
            </li>
            <li className="flex items-center gap-3">
              <span className="w-2 h-2 bg-white/70 rounded-full" />
              Analyser les Revenus & Performances
            </li>
          </ul>
        </div>

        {/* Watermark */}
        <div className="absolute bottom-[-40px] left-10 text-[160px] font-black tracking-tight text-white/5 select-none">
          HUNTER DELIVERY
        </div>
      </div>

      {/* ================= RIGHT PANEL ================= */}
      <div className="flex items-center justify-center bg-gray-100 px-10">
        <div className="w-full max-w-md">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
            Bon retour
          </h1>

          <p className="text-gray-500 mb-10">
            Connectez-vous à votre compte administrateur
          </p>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* EMAIL */}
            <div>
              <label className="block text-xs font-bold tracking-wide text-gray-700 mb-2 uppercase">
                Email
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin ou admin@hunterdelivery"
                  className="w-full rounded-xl border border-gray-300 bg-white
                  pl-12 pr-4 py-4 text-sm
                  focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-xs font-bold tracking-wide text-gray-700 mb-2 uppercase">
                Mot de passe
              </label>

              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type={showPw ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-gray-300 bg-white
                  pl-12 pr-12 py-4 text-sm
                  focus:outline-none focus:ring-2 focus:ring-black"
                />

                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-2xl text-white font-semibold
              bg-gradient-to-br from-[#FF8A4C] via-[#FF5E24] to-[#D84315]
              hover:from-[#FF8A4C] hover:to-[#D84315]
              transition disabled:opacity-70"
            >
              {isLoading ? "Chargement..." : "Se Connecter"}
            </button>
          </form>

          {/*  <div className="mt-8 text-center">
            <span className="text-blue-600 font-medium cursor-pointer hover:underline">
              ← Retour au site
            </span>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
