'use client'
import { useRouter } from "next/navigation";
import React from "react";

const RegisterPage = () => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error registering user");
        throw new Error(data.error);
      }
      console.log("User registered successfully", data);
      setError("");
      router.push("/login");
    } catch (error) {
      console.log("Error registering user", error);
      setError("Error registering user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-900 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center">Register</h1>
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
          <div>
            <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <button type="submit" disabled={loading} className="w-full px-4 py-2 text-white bg-indigo-600 rounded-lg disabled:bg-gray-500 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            {loading ? "Loading..." : "Register"}
          </button>
          {error && <p className="text-red-500 text-center">{error}</p>}
        </form>
        <div className="text-center">
          <p>Already have an account? <a href="/login" className="text-indigo-400 hover:underline">Login</a></p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;