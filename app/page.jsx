"use client"; // para usar hooks

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { formatDistanceToNowStrict, isAfter } from "date-fns";

const supabase = createClient(
  "https://juslqwxycvevshiofhun.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1c2xxd3h5Y3ZldnNoaW9maHVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyNjI0MTYsImV4cCI6MjA2MjgzODQxNn0.WjECu6HXYk8YPubD9n6f3HbsjUD1nLMdBixOikwGKeE"
);

export default function Home() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => listener?.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      fetchUserInfo();
    }
  }, [session]);

  async function fetchUserInfo() {
    const { data, error } = await supabase
      .from("users")
      .select("access_expires_at, is_paid")
      .eq("email", session.user.email)
      .single();

    if (!error) {
      setUserInfo(data);
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    await supabase.auth.signInWithOtp({ email });
    alert("Verifique seu e-mail para o link de login.");
  };

  const expired =
    userInfo && !userInfo.is_paid && isAfter(new Date(), new Date(userInfo.access_expires_at));

  if (loading) return <p className="text-white">Carregando...</p>;

  if (!session)
    return (
      <main className="flex items-center justify-center min-h-screen bg-[#1a001f] text-white">
        <form onSubmit={handleLogin} className="bg-[#2a0033] p-8 rounded-xl shadow-xl">
          <h1 className="text-2xl mb-4 font-bold">Truque das Amantes</h1>
          <p className="mb-4 text-sm">Acesse o curso com seu e-mail:</p>
          <input
            type="email"
            name="email"
            placeholder="seu@email.com"
            className="p-2 rounded w-full text-black mb-4"
            required
          />
          <button type="submit" className="bg-purple-700 px-4 py-2 rounded w-full hover:bg-purple-800">
            Entrar
          </button>
        </form>
      </main>
    );

  if (expired)
    return (
      <main className="flex items-center justify-center min-h-screen bg-[#1a001f] text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Seu acesso expirou 😢</h1>
          <p>Para continuar, finalize seu pagamento na Kiwify.</p>
        </div>
      </main>
    );

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#1a001f] to-[#300033] text-white p-6">
      <h1 className="text-3xl font-bold mb-2">Truque das Amantes 💋</h1>
      <p className="mb-4">Bem-vinda ao seu curso exclusivo de sexualidade.</p>

      {!userInfo?.is_paid && (
        <div className="mb-4 p-4 bg-purple-900 rounded-xl">
          <p className="text-sm">
            Você está no acesso gratuito. Tempo restante:
            <strong className="ml-2">
              {formatDistanceToNowStrict(new Date(userInfo.access_expires_at))}
            </strong>
          </p>
        </div>
      )}

      <div className="p-4 bg-[#2a0033] rounded-xl">
        <h2 className="text-xl font-semibold mb-2">Módulo 1 - O Despertar</h2>
        <p>Conteúdo do curso aqui...</p>
      </div>
    </main>
  );
}
