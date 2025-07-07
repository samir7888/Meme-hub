'use client'
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import React from "react";

const LoginPage = () => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      const result = await signIn("credentials", {
        redirect: false, // Prevent automatic redirect
        email,
        password,
      });

      if (result?.error) {
        setError(result.error || "Error logging in");
      } else {
        router.push("/");
      }
    } catch (error) {
      console.log("Error logging in", error);
      setError("Error logging in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-900 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center">Login</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="block mb-2 text-sm font-medium">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block mb-2 text-sm font-medium">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <button type="submit" disabled={loading} className="w-full px-4 py-2 text-white bg-indigo-600 rounded-lg disabled:bg-gray-500 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            {loading ? "Loading..." : "Login"}
          </button>
          {error && <p className="text-red-500 text-center">{error}</p>}
        </form>
        <div className="text-center">
          <p>Don't have an account? <a href="/register" className="text-indigo-400 hover:underline">Register</a></p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;