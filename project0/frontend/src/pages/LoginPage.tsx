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
<div className="flex w-full min-h-[calc(100dvh-9rem)] items-center justify-center px-1 py-4 md:min-h-[calc(100dvh-6.5rem)]">  <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">

        <h1 className=" text-3xl whitespace-nowrap text-slate-900 text-center font-bold mb-2">
       Welcome to Focus!
        </h1>

        <p className="text-sm md:text-base text-slate-500 text-center mb-8">
          Login to continue your journey
        </p>

        <form
          className="flex flex-col gap-5"
          onSubmit={handleLogin}
        >

          {error && (
            <p className="text-red-500 text-sm text-center">
              {error}
            </p>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-slate-700 font-medium">
              Email
            </label>

            <input
              className="
                w-full
                border border-slate-300
                rounded-lg
                px-4 py-3
                focus:outline-none
                focus:border-blue-600
                focus:ring-1
                focus:ring-blue-600
              "
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-slate-700 font-medium">
              Password
            </label>

            <input
              className="
                w-full
                border border-slate-300
                rounded-lg
                px-4 py-3
                focus:outline-none
                focus:border-blue-600
                focus:ring-1
                focus:ring-blue-600
              "
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            className="
              w-full
              bg-blue-600
              hover:bg-blue-700
              text-white
              font-medium
              py-3
              rounded-lg
              cursor-pointer
              transition
            "
            type="submit"
          >
            Login
          </button>

        </form>
      </div>
    </div>
  );
}

export default LoginPage;