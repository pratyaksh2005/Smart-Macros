import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/mockAuth";
import { getUser } from "../services/storage";

export default function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    login(email.trim(), password);

    const user = getUser();
    if (!user) return;

    if (!user.profile) {
      nav("/onboarding");
      return;
    }

    if (!user.profile.nutritionDisability) {
      nav("/medical");
      return;
    }

    nav("/app");
  }

  return (
    <div style={{ maxWidth: 420, margin: "60px auto", padding: 16 }}>
      <h1>Smart Macros</h1>
      <p>Mock login for IPD prototype</p>

      <form onSubmit={onSubmit}>
        <label>Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          style={{ width: "100%", padding: 10, margin: "6px 0 12px" }}
        />

        <label>Password</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="••••••••"
          style={{ width: "100%", padding: 10, margin: "6px 0 12px" }}
        />

        <button style={{ width: "100%", padding: 10 }}>
          Continue
        </button>
      </form>
    </div>
  );
}