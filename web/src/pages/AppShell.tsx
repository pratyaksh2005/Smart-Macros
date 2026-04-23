import { NavLink, useNavigate, Outlet } from "react-router-dom";
import { logout } from "../services/mockAuth";
import { getUser } from "../services/storage";

export default function AppShell() {
  const nav = useNavigate();
  const user = getUser();
  const role = user?.role || "PATIENT"; 

  function onLogout() {
    logout();
    nav("/", { replace: true });
  }

  return (
    <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
        <div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>Smart Macros</div>
          <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>
            {role === "CLINICIAN" ? "🏥 Clinician Dashboard" : "👤 Patient Dashboard"}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '14px', color: '#475569' }}>{user?.email}</span>
          <button onClick={onLogout} style={{ padding: '8px 16px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
            Logout
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '2px solid #e2e8f0', paddingBottom: '2px' }}>
        {role === "PATIENT" ? (
          <>
            <TabLink to="profile" label="Medical Profile" />
            <TabLink to="grocery" label="Clinical Diet Engine" />
            <TabLink to="messages" label="Secure Inbox" />
          </>
        ) : (
          <>
            <TabLink to="clinician-dashboard" label="Patient Directory" />
            <TabLink to="ai-diagnostics" label="Risk Analysis Engine" />
          </>
        )}
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <Outlet />
      </div>
    </div>
  );
}

function TabLink({ to, label }: { to: string, label: string }) {
  return (
    <NavLink to={to} style={({ isActive }) => ({
      padding: '12px 20px', textDecoration: 'none', color: isActive ? '#2563eb' : '#64748b',
      fontWeight: isActive ? 'bold' : '500', borderBottom: isActive ? '3px solid #2563eb' : '3px solid transparent', transition: 'all 0.2s'
    })}>
      {label}
    </NavLink>
  );
}