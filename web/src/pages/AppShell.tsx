import { NavLink, useNavigate, Outlet } from "react-router-dom";
import { logout } from "../services/mockAuth";
import { getUser } from "../services/storage";

export default function AppShell() {
  const nav = useNavigate();
  const user = getUser();

  function onLogout() {
    logout();
    nav("/", { replace: true });
  }

  return (
    <div className="container">
      <div className="navbar">
        <div className="brand">
          <div className="brand-title">Smart Macros</div>
          <div className="brand-sub">
            {user?.email ? `Signed in as ${user.email}` : "Prototype build"}
          </div>
        </div>

        <button onClick={onLogout}>Logout</button>
      </div>

      <div className="tabs">
        <NavLink
          to="workout"
          className={({ isActive }) => (isActive ? "tab tab-active" : "tab")}
        >
          Workout
        </NavLink>

        <NavLink
          to="meals"
          className={({ isActive }) => (isActive ? "tab tab-active" : "tab")}
        >
          Meals
        </NavLink>

        <NavLink
          to="grocery"
          className={({ isActive }) => (isActive ? "tab tab-active" : "tab")}
        >
          Grocery
        </NavLink>

        <NavLink
          to="profile"
          className={({ isActive }) => (isActive ? "tab tab-active" : "tab")}
        >
          Profile
        </NavLink>
      </div>

      <div style={{ height: 14 }} />

      <Outlet />
    </div>
  );
}