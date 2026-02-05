import { NavLink, useNavigate, Outlet } from "react-router-dom";
import { logout } from "../services/mockAuth";

const linkStyle = ({ isActive }: { isActive: boolean }) => ({
  padding: "10px 12px",
  borderRadius: 10,
  textDecoration: "none",
  color: "black",
  background: isActive ? "#eaeaea" : "transparent",
});

export default function AppShell() {
  const nav = useNavigate();

  function onLogout() {
    logout();
    nav("/", { replace: true });
  }

  return (
    <div style={{ maxWidth: 980, margin: "24px auto", padding: 16 }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2 style={{ margin: 0 }}>Smart Macros</h2>
        <button onClick={onLogout} style={{ padding: "10px 12px" }}>Logout</button>
      </header>

      <nav style={{ display: "flex", gap: 8, marginTop: 16, padding: 8, borderRadius: 14, background: "#f6f6f6" }}>
        <NavLink to="workout" style={linkStyle}>Workout</NavLink>
        <NavLink to="meals" style={linkStyle}>Meals</NavLink>
        <NavLink to="grocery" style={linkStyle}>Grocery</NavLink>
        <NavLink to="profile" style={linkStyle}>Profile</NavLink>
      </nav>

      <main style={{ marginTop: 16 }}>
        <Outlet />
      </main>
    </div>
  );
}
