import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:8080/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message);
        return;
      }

      login();

      navigate("/dashboard");
    } catch (error) {
      setError("Unable to connect to server");
    }
  };

  return (
    <div className="flex flex-col mx-auto m-32 md:w-1/2">
      <h1 className="text-2xl text-center font-bold py-6">
        Login to Focus
      </h1>

      <form
        className="flex flex-col gap-4 p-5 items-center"
        onSubmit={handleLogin}
      >
        {error && <p className="text-red-500">{error}</p>}

        <div className="flex items-stretch">
          <label className="w-40">Email</label>

          <input
            className="border-2 border-gray-300 rounded-md px-5 py-1 hover:border-blue-600 bg-blue-200 focus:outline-none focus:ring-1"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="flex items-center">
          <label className="w-40">Password</label>

          <input
            className="border-2 border-gray-300 rounded-md px-5 py-1 hover:border-blue-600 bg-blue-200 focus:outline-none focus:ring-1"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          className="bg-black text-gray-400 p-2 rounded-lg cursor-pointer w-1/2"
          type="submit"
        >
          Login
        </button>
      </form>
    </div>
  );
}

export default LoginPage;