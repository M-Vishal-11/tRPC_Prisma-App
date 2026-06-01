"use client";

import { signIn, signUp } from "@/lib/auth-client"; // 👑 Added signUp named import
import { useState, SubmitEvent } from "react"; // Using modern React 19 SubmitEvent

export default function AuthenticationPage() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const toggleTab = (signInMode: boolean) => {
    setError(null);
    setIsSignIn(signInMode);
  };

  async function handleSignin(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    if (!formData.get("email")) {
      setError("All form fields are required.");
      return;
    } else if (!formData.get("password")) {
      setError("All form fields are required.");
      return;
    }

    const res = await signIn.email({
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    });

    if (res?.error) {
      console.error("Signin Failed: ", res.error.message);
      setError(res.error.message || "Something went wrong.");
    } else {
      console.log("Logged in successfully!", res);
      setSuccess("Logged in successfully!");
    }
  }

  async function handleSignup(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    const nameInput = formData.get("name");
    const emailInput = formData.get("email");
    const passwordInput = formData.get("password");

    if (!nameInput || !emailInput || !passwordInput) {
      setError("All form fields are required.");
      return;
    }

    const res = await signUp.email({
      name: nameInput as string,
      email: emailInput as string,
      password: passwordInput as string,
    });

    if (res?.error) {
      console.log("Signup Failed: ", res.error.message);
      setError(res.error.message || "Could not register account.");
    } else {
      console.log("Account created successfully!", res);
      setSuccess("Account created successfully!");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        {/* Navigation Tabs */}
        <div className="flex mb-6 bg-gray-200 rounded-lg p-1">
          <button
            type="button"
            onClick={() => toggleTab(true)}
            className={`flex-1 py-2 rounded-md transition ${
              isSignIn ? "bg-white shadow font-semibold" : "text-gray-600"
            }`}
          >
            Sign In
          </button>

          <button
            type="button"
            onClick={() => toggleTab(false)}
            className={`flex-1 py-2 rounded-md transition ${
              !isSignIn ? "bg-white shadow font-semibold" : "text-gray-600"
            }`}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg font-medium animate-fade-in">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg font-medium animate-fade-in">
            {success}
          </div>
        )}

        {isSignIn ? (
          /* Sign In Form Configuration */
          <form className="space-y-4" onSubmit={handleSignin}>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="email@example.com"
                className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Sign In
            </button>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={handleSignup}>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="John Doe"
                className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="email@example.com"
                className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-medium"
            >
              Create Account
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
