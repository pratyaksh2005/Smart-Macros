import { useState, useEffect } from "react";

export default function LoginPage() {
  const [role, setRole] = useState<"PATIENT" | "CLINICIAN">("PATIENT");
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Seed the database on load so your demo patient always exists!
  useEffect(() => {
    const accounts = JSON.parse(localStorage.getItem("sm_accounts") || "{}");
    if (!accounts["patient@smartmacros.uk"]) {
      accounts["patient@smartmacros.uk"] = {
        password: "password",
        profile: {
          firstName: "Test", lastName: "Patient", age: 45, heightCm: 175, weightKg: 82, gender: "MALE",
          nutritionDisability: "DIABETES_T2", allergies: [], disabilityNotes: "Monitor for sudden glucose spikes."
        }
      };
      localStorage.setItem("sm_accounts", JSON.stringify(accounts));
    }
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // --- CLINICIAN AUTHENTICATION ---
    if (role === "CLINICIAN") {
      if (email === "clinician@pratyaksh.uk" && password === "1234") {
        localStorage.setItem("sm_user", JSON.stringify({
          email, role: "CLINICIAN", profile: { bypass_onboarding: true }
        }));
        window.location.href = "/app/clinician-dashboard";
      } else {
        setError("Invalid Clinician credentials. Access denied.");
      }
      return;
    }

    // --- PATIENT AUTHENTICATION (Database Mock) ---
    const accounts = JSON.parse(localStorage.getItem("sm_accounts") || "{}");

    if (isSignUp) {
      if (accounts[email]) {
        setError("An account with this email already exists. Please log in.");
        return;
      }
      // Register New Patient
      accounts[email] = { password, profile: null };
      localStorage.setItem("sm_accounts", JSON.stringify(accounts));

      // Start Session & Route to Medical Intake
      localStorage.setItem("sm_user", JSON.stringify({ email, role: "PATIENT", profile: null }));
      window.location.href = "/onboarding";
    } else {
      // Login Existing Patient
      const account = accounts[email];
      if (!account || account.password !== password) {
        setError("Invalid email or password.");
        return;
      }

      // Start Session & Route appropriately
      localStorage.setItem("sm_user", JSON.stringify({ email, role: "PATIENT", profile: account.profile }));
      if (!account.profile) {
         window.location.href = "/onboarding";
      } else {
         window.location.href = "/app/grocery";
      }
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="card" style={{ maxWidth: '450px', width: '100%', padding: '40px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', borderRadius: '12px', backgroundColor: '#fff' }}>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ color: '#0f172a', margin: '0 0 8px 0', fontSize: '28px' }}>Smart Macros</h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>Clinical Nutrition Engine v3.0</p>
        </div>

        {/* ROLE TOGGLE TABS */}
        <div style={{ display: 'flex', backgroundColor: '#f1f5f9', borderRadius: '8px', padding: '4px', marginBottom: '24px' }}>
          <button
            onClick={() => { setRole("PATIENT"); setIsSignUp(false); setError(""); }}
            style={{ flex: 1, padding: '10px', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer', backgroundColor: role === "PATIENT" ? '#fff' : 'transparent', color: role === "PATIENT" ? '#2563eb' : '#64748b', boxShadow: role === "PATIENT" ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s' }}
          >
            Patient Portal
          </button>
          <button
            onClick={() => { setRole("CLINICIAN"); setIsSignUp(false); setError(""); }}
            style={{ flex: 1, padding: '10px', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer', backgroundColor: role === "CLINICIAN" ? '#fff' : 'transparent', color: role === "CLINICIAN" ? '#0f172a' : '#64748b', boxShadow: role === "CLINICIAN" ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s' }}
          >
            Clinician Portal
          </button>
        </div>

        {error && (
          <div style={{ padding: '12px', backgroundColor: '#fef2f2', borderLeft: '4px solid #ef4444', color: '#b91c1c', fontSize: '13px', marginBottom: '20px', borderRadius: '4px' }}>
            {error}
          </div>
        )}

        {/* AUTH FORM */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', textTransform: 'uppercase' }}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={role === "CLINICIAN" ? "clinician@pratyaksh.uk" : "patient@domain.com"}
              required
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '6px' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', textTransform: 'uppercase' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '6px' }}
            />
          </div>

          <button type="submit" className="btn-primary" style={{ padding: '14px', fontSize: '15px', marginTop: '8px', backgroundColor: role === "CLINICIAN" ? '#0f172a' : '#2563eb' }}>
            {role === "CLINICIAN" ? "Secure Clinician Login" : (isSignUp ? "Register Account" : "Login to Portal")}
          </button>
        </form>

        {/* SIGN UP TOGGLE (PATIENTS ONLY) */}
        {role === "PATIENT" && (
          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#64748b' }}>
            {isSignUp ? "Already registered? " : "New patient? "}
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 'bold', cursor: 'pointer', padding: 0 }}
            >
              {isSignUp ? "Login here" : "Create an account"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
