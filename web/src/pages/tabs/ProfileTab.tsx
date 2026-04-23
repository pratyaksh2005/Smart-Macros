import { useNavigate } from "react-router-dom";
import { getUser } from "../../services/storage";

export default function ProfileTab() {
  const nav = useNavigate();
  const user = getUser();

  if (!user?.profile) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
        <h3>No Clinical Profile Found</h3>
        <p>You must complete the medical intake process to calibrate the AI engine.</p>
        <button className="btn-primary" onClick={() => nav("/onboarding")}>Begin Intake</button>
      </div>
    );
  }

  const p = user.profile;

  // Simple BMI calculation to show we use the biometrics
  const heightM = p.heightCm / 100;
  const bmi = (p.weightKg / (heightM * heightM)).toFixed(1);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>Active Medical Profile</h2>
        <button onClick={() => nav("/onboarding")} style={{ backgroundColor: '#e2e8f0' }}>Edit Data</button>
      </div>

      <div className="grid-2">
        <div className="card">
          <h4 style={{ color: '#64748b', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>Biometrics</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
            <div className="row"><strong>Patient:</strong> <span>{p.firstName} {p.lastName}</span></div>
            <div className="row"><strong>Age / Sex:</strong> <span>{p.age} Y / {p.gender}</span></div>
            <div className="row"><strong>Height:</strong> <span>{p.heightCm} cm</span></div>
            <div className="row"><strong>Weight:</strong> <span>{p.weightKg} kg</span></div>
            <div className="row"><strong>Estimated BMI:</strong> <span style={{ fontWeight: 'bold', color: '#2563eb' }}>{bmi}</span></div>
          </div>
        </div>

        <div className="card" style={{ border: p.nutritionDisability !== 'NONE' ? '2px solid #3b82f6' : '1px solid #e2e8f0' }}>
          <h4 style={{ color: '#64748b', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>Clinical Flags</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
            <div style={{ padding: '12px', backgroundColor: p.nutritionDisability !== 'NONE' ? '#eff6ff' : '#f8fafc', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
              <span style={{ fontSize: '12px', textTransform: 'uppercase', color: '#64748b', display: 'block', marginBottom: '4px' }}>Primary Condition</span>
              <strong style={{ fontSize: '16px', color: '#1e3a8a' }}>{p.nutritionDisability.replace("_", " ")}</strong>
            </div>
            
            <div className="row" style={{ marginTop: '8px' }}>
               <strong>Allergies:</strong> 
               <span style={{ color: p.allergies.length ? '#dc2626' : '#64748b' }}>
                 {p.allergies.length ? p.allergies.join(", ") : "None Recorded"}
               </span>
            </div>

            {p.disabilityNotes && (
              <div style={{ marginTop: '8px', padding: '10px', backgroundColor: '#fffbeb', borderRadius: '6px', fontSize: '13px', color: '#92400e' }}>
                <strong>Physician Notes:</strong> {p.disabilityNotes}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}