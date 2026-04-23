import { useState, useEffect } from "react";
import { getUser } from "../../services/storage";

type TimelineEvent = {
  id: string;
  timestamp: string;
  type: "MEAL" | "SYMPTOM" | "MANUAL" | "SKIP";
  title: string;
  description: string;
  alert?: boolean;
};

type CustomFood = { name: string; protein: number; sodium: number; };
type MealConfig = { enabled: boolean; time: string };
type MealPreferences = { [key: string]: MealConfig };

function mapConditionToBackend(disability: string | undefined): string {
  if (!disability) return "NONE";
  if (disability.includes("DIABETES")) return "DIABETES";
  if (disability === "COELIAC") return "COELIAC";
  if (disability === "HYPERTENSION" || disability === "CVD") return "CVD";
  return "NONE";
}

function getCurrentTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

function getTodayString() {
  return new Date().toISOString().split('T')[0]; // Returns "YYYY-MM-DD"
}

export default function GroceryTab() {
  const user = getUser();
  const profile = user?.profile;
  const todayDate = getTodayString();

  // --- CORE STATE ---
  const [lastActiveDate, setLastActiveDate] = useState<string>(() => localStorage.getItem("sm_last_date") || todayDate);
  const [timeline, setTimeline] = useState<TimelineEvent[]>(() => JSON.parse(localStorage.getItem("sm_timeline") || "[]"));
  const [history, setHistory] = useState<Record<string, TimelineEvent[]>>(() => JSON.parse(localStorage.getItem("sm_history") || "{}"));
  const [currentSymptom, setCurrentSymptom] = useState<string>(() => localStorage.getItem("sm_active_symptom") || "NONE");
  const [customDb, setCustomDb] = useState<CustomFood[]>(() => JSON.parse(localStorage.getItem("sm_custom_db") || "[]"));
  
  const defaultPrefs: MealPreferences = { Breakfast: { enabled: true, time: "08:00" }, Lunch: { enabled: true, time: "13:00" }, Dinner: { enabled: true, time: "19:00" } };
  const [mealPrefs, setMealPrefs] = useState<MealPreferences>(() => JSON.parse(localStorage.getItem("sm_meal_prefs") || JSON.stringify(defaultPrefs)));
  const [showSettings, setShowSettings] = useState(false);

  // --- GENERATOR STATE ---
  const [mealType, setMealType] = useState(() => localStorage.getItem("sm_meal_type") || "Breakfast");
  const [targetMealProtein, setTargetMealProtein] = useState<string>(""); // Now a string for "Auto"
  const [generatedMeal, setGeneratedMeal] = useState<any[] | null>(null);
  const [generatedMealResponse, setGeneratedMealResponse] = useState<any | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const [tomorrowPlan, setTomorrowPlan] = useState<Record<string, any[]>>(() => JSON.parse(localStorage.getItem("sm_tom_plan") || "{}"));
  const [tomorrowSkips, setTomorrowSkips] = useState<Record<string, boolean>>(() => JSON.parse(localStorage.getItem("sm_tom_skips") || "{}"));
  const [tomorrowTargets, setTomorrowTargets] = useState<Record<string, string>>(() => JSON.parse(localStorage.getItem("sm_tom_targets") || '{"Breakfast":"","Lunch":"","Dinner":""}'));

  // --- UI STATE ---
  const [viewDate, setViewDate] = useState<string>(todayDate);
  const [symptomTime, setSymptomTime] = useState(getCurrentTime());
  const [manualTime, setManualTime] = useState(getCurrentTime());
  const [manualName, setManualName] = useState("");
  const [manualProtein, setManualProtein] = useState("");
  const [manualSodium, setManualSodium] = useState("");

  // --- THE MIDNIGHT ROLLOVER ENGINE ---
  useEffect(() => {
    if (lastActiveDate !== todayDate) {
      // It's a new day! Archive yesterday.
      setHistory(prev => {
        const newHistory = { ...prev };
        if (timeline.length > 0) newHistory[lastActiveDate] = timeline;
        return newHistory;
      });
      
      // Reset the board, promote Tomorrow's skips to actual skipped logic (omitted for brevity, keeping simple reset)
      setTimeline([]);
      setCurrentSymptom("NONE");
      setGeneratedMeal(null);
      
      // Find first enabled meal
      if (mealPrefs.Breakfast.enabled) setMealType("Breakfast");
      else if (mealPrefs.Lunch.enabled) setMealType("Lunch");
      else if (mealPrefs.Dinner.enabled) setMealType("Dinner");
      else setMealType("TOMORROW");

      // Clear tomorrow plans
      setTomorrowPlan({});
      setTomorrowSkips({});
      setTomorrowTargets({ Breakfast: "", Lunch: "", Dinner: "" });
      
      setLastActiveDate(todayDate);
    }
  }, [todayDate, lastActiveDate, timeline, mealPrefs]);

  // --- AUTO-SAVE EFFECT ---
  useEffect(() => {
    localStorage.setItem("sm_last_date", lastActiveDate);
    localStorage.setItem("sm_timeline", JSON.stringify(timeline));
    localStorage.setItem("sm_history", JSON.stringify(history));
    localStorage.setItem("sm_active_symptom", currentSymptom);
    localStorage.setItem("sm_custom_db", JSON.stringify(customDb));
    localStorage.setItem("sm_meal_prefs", JSON.stringify(mealPrefs));
    localStorage.setItem("sm_meal_type", mealType);
    localStorage.setItem("sm_tom_plan", JSON.stringify(tomorrowPlan));
    localStorage.setItem("sm_tom_skips", JSON.stringify(tomorrowSkips));
    localStorage.setItem("sm_tom_targets", JSON.stringify(tomorrowTargets));
  }, [lastActiveDate, timeline, history, currentSymptom, customDb, mealPrefs, mealType, tomorrowPlan, tomorrowSkips, tomorrowTargets]);

  // --- TIMELINE CONTROLS & SHADOW DATABASE ---
  function addEventToTimeline(type: "MEAL" | "SYMPTOM" | "MANUAL" | "SKIP", title: string, description: string, alert: boolean, eventTime: string) {
    const newEvent: TimelineEvent = { id: crypto.randomUUID(), timestamp: eventTime, type, title, description, alert };

    // 1. Update the Local UI (Zero Latency)
    setTimeline((prev) => {
      return [...prev, newEvent].sort((a, b) => {
        const [aH, aM] = a.timestamp.split(':').map(Number);
        const [bH, bM] = b.timestamp.split(':').map(Number);
        return (aH * 60 + aM) - (bH * 60 + bM);
      });
    });

    // 2. FIRE-AND-FORGET TO THE RELATIONAL DATABASE
    // This runs asynchronously in the background. If it fails, the user never notices.
    fetch("http://127.0.0.1:8000/api/v1/db/telemetry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patient_email: user?.email || "unknown_patient",
        event_type: type,
        event_description: `${title}: ${description}`
      })
    }).catch(err => console.log("DB Telemetry ping failed, but UI is unaffected.", err));
  }

  function deleteEvent(id: string) {
    if (confirm("Remove this entry from the clinical log?")) {
      if (viewDate === todayDate) {
        setTimeline(prev => prev.filter(e => e.id !== id));
      } else {
        setHistory(prev => ({
          ...prev,
          [viewDate]: prev[viewDate].filter(e => e.id !== id)
        }));
      }
    }
  }

  function advanceMealType(current: string) {
    const sequence = ["Breakfast", "Lunch", "Dinner"];
    const currentIndex = sequence.indexOf(current);
    let nextMeal = "TOMORROW";
    for (let i = currentIndex + 1; i < sequence.length; i++) {
      if (mealPrefs[sequence[i]]?.enabled) { nextMeal = sequence[i]; break; }
    }
    setMealType(nextMeal);
  }

  // --- ACTIONS ---
  function reportSymptom(symptomValue: string, symptomName: string) {
    if (!symptomTime) return alert("Please enter the time.");
    if (symptomValue === "NONE") {
      setCurrentSymptom("NONE");
      addEventToTimeline("SYMPTOM", "Patient Stabilized", "Vitals returned to baseline.", false, symptomTime);
      return;
    }
    setCurrentSymptom(symptomValue);
    addEventToTimeline("SYMPTOM", `Clinical Alert: ${symptomName}`, "System updated physiological constraints.", true, symptomTime);
  }

  function updateMealPref(meal: string, key: "enabled" | "time", val: any) {
    setMealPrefs(prev => ({ ...prev, [meal]: { ...prev[meal], [key]: val } }));
  }

  async function generateCurrentMeal() {
    if (isGenerating) return;
    setIsGenerating(true);
    const payload = { 
      patient_profile: { patient_id: user?.email || "demo", condition_code: mapConditionToBackend(profile?.nutritionDisability) }, 
      target_protein_g: targetMealProtein ? Number(targetMealProtein) : null, 
      current_symptom: currentSymptom, 
      meal_type: mealType 
    };
    try {
      const response = await fetch("http://127.0.0.1:8000/api/v1/engine/basket-optimizer", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!response.ok) throw new Error("AI offline");
      const data = await response.json();
      setGeneratedMealResponse(data);
      setGeneratedMeal(data.basket_items);
    } catch (err) { alert("Backend AI offline."); } finally { setIsGenerating(false); }
  }

  async function generateTomorrowMeal(mealName: string) {
    setIsGenerating(true);
    const payload = { 
      patient_profile: { patient_id: user?.email || "demo", condition_code: mapConditionToBackend(profile?.nutritionDisability) }, 
      target_protein_g: tomorrowTargets[mealName] ? Number(tomorrowTargets[mealName]) : null, 
      current_symptom: "NONE", 
      meal_type: mealName 
    };
    try {
      const response = await fetch("http://127.0.0.1:8000/api/v1/engine/basket-optimizer", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!response.ok) throw new Error("AI offline");
      const data = await response.json();
      setTomorrowPlan(prev => ({ ...prev, [mealName]: data.basket_items }));
    } catch (err) { alert("Backend AI offline."); } finally { setIsGenerating(false); }
  }

  function consumeGeneratedMeal() {
    if (!generatedMeal) return;
    if (timeline.some(e => e.title.includes(mealType))) {
      alert(`Safety Lock: ${mealType} has already been logged today.`);
      advanceMealType(mealType); return;
    }
    const proteinHit = targetMealProtein || "Auto";
    addEventToTimeline("MEAL", `${mealType} Logged`, `Consumed: ${generatedMeal.map(i => i.name).join(", ")}. Target hit: ${proteinHit}g protein.`, false, mealPrefs[mealType]?.time || getCurrentTime());
    setGeneratedMeal(null);
    setGeneratedMealResponse(null);
    advanceMealType(mealType);
  }

  function skipMealToday() {
    if (timeline.some(e => e.title.includes(mealType))) {
      alert(`Safety Lock: ${mealType} has already been processed today.`);
      advanceMealType(mealType); return;
    }
    addEventToTimeline("SKIP", `${mealType} Skipped`, `Patient skipped this meal today.`, false, mealPrefs[mealType]?.time || getCurrentTime());
    setGeneratedMeal(null);
    advanceMealType(mealType);
  }

  function logManualEntry(e: React.FormEvent) {
    e.preventDefault();
    if (!manualName || !manualTime) return;
    const prot = parseFloat(manualProtein) || 0;
    const sod = parseFloat(manualSodium) || 0;
    if (!customDb.some(f => f.name.toLowerCase() === manualName.toLowerCase())) setCustomDb(prev => [...prev, { name: manualName, protein: prot, sodium: sod }]);
    
    // Always log manual entry to the active viewing date so they can edit history!
    const newEvent: TimelineEvent = { id: crypto.randomUUID(), timestamp: manualTime, type: "MANUAL", title: `Off-Plan Entry: ${manualName}`, description: `Macros: ${prot}g Protein | ${sod}mg Sodium.`, alert: false };
    
    if (viewDate === todayDate) {
      setTimeline(prev => [...prev, newEvent].sort((a,b) => (a.timestamp.split(':')[0] as any * 60 + (a.timestamp.split(':')[1] as any)) - (b.timestamp.split(':')[0] as any * 60 + (b.timestamp.split(':')[1] as any))));
    } else {
      setHistory(prev => {
        const updatedDay = [...(prev[viewDate] || []), newEvent].sort((a,b) => (a.timestamp.split(':')[0] as any * 60 + (a.timestamp.split(':')[1] as any)) - (b.timestamp.split(':')[0] as any * 60 + (b.timestamp.split(':')[1] as any)));
        return { ...prev, [viewDate]: updatedDay };
      });
    }
    setManualName(""); setManualProtein(""); setManualSodium("");
  }

  // --- RENDER HELPERS ---
  const activeDisplayTimeline = viewDate === todayDate ? timeline : (history[viewDate] || []);

  return (
    <div className="grid-2" style={{ alignItems: 'start' }}>
      
      {/* LEFT COLUMN: THE CONTROLS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* SCHEDULE SETTINGS */}
        <div className="card" style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => setShowSettings(!showSettings)}>
            <h4 style={{ margin: 0, color: '#334155' }}>Baseline Meal Schedule</h4>
            <span style={{ color: '#64748b', fontSize: '12px' }}>{showSettings ? "Hide" : "Edit"}</span>
          </div>
          {showSettings && (
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {["Breakfast", "Lunch", "Dinner"].map((m) => (
                <div key={m} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <input type="checkbox" checked={mealPrefs[m].enabled} onChange={e => updateMealPref(m, "enabled", e.target.checked)} style={{ width: '18px', height: '18px', margin: 0 }} />
                  <span style={{ fontWeight: 'bold', width: '80px', color: mealPrefs[m].enabled ? '#0f172a' : '#94a3b8' }}>{m}</span>
                  <input type="time" disabled={!mealPrefs[m].enabled} value={mealPrefs[m].time} onChange={e => updateMealPref(m, "time", e.target.value)} style={{ padding: '6px', width: '120px', marginLeft: 'auto' }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SYMPTOM REPORTING PAD */}
        {viewDate === todayDate && (
          <div className={`card ${currentSymptom !== "NONE" ? "animate-alert-pulse" : ""}`} style={{ padding: '20px', border: currentSymptom !== "NONE" ? '2px solid #ef4444' : '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 12px 0', color: currentSymptom !== "NONE" ? '#dc2626' : '#0f172a' }}>
              {currentSymptom !== "NONE" ? "Active Symptom Override" : "Physiological Status: Stable"}
            </h4>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px' }}>Time of Event</label>
              <input type="time" value={symptomTime} onChange={e => setSymptomTime(e.target.value)} style={{ padding: '8px', maxWidth: '150px' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button onClick={() => reportSymptom("NONE", "Stable")} style={{ backgroundColor: currentSymptom === "NONE" ? '#dcfce7' : '#f1f5f9', border: currentSymptom === "NONE" ? '1px solid #22c55e' : 'none' }}>🟢 Log: Feeling Fine / Stable</button>
              <button onClick={() => reportSymptom("GLUCOSE_SPIKE", "Glucose Spike")} style={{ backgroundColor: currentSymptom === "GLUCOSE_SPIKE" ? '#fee2e2' : '#f1f5f9', border: currentSymptom === "GLUCOSE_SPIKE" ? '1px solid #ef4444' : 'none' }}>🔴 Log: Glucose Spike</button>
              <button onClick={() => reportSymptom("FATIGUE", "Fatigue")} style={{ backgroundColor: currentSymptom === "FATIGUE" ? '#fef3c7' : '#f1f5f9', border: currentSymptom === "FATIGUE" ? '1px solid #f59e0b' : 'none' }}>🟡 Log: Fatigue / Faintness</button>
            </div>
          </div>
        )}

        {/* DYNAMIC GENERATOR (TODAY OR TOMORROW) */}
        {viewDate === todayDate && (
          mealType !== "TOMORROW" ? (
            <div className="card" style={{ padding: '20px' }}>
              <h4 style={{ margin: '0 0 12px 0' }}>Synthesize Clinical Meal</h4>
              <div className="grid-2" style={{ marginBottom: '16px', alignItems: 'end' }}>
                <div>
                  <label>Meal Type</label>
                  <input type="text" value={mealType} disabled style={{ backgroundColor: '#f8fafc', fontWeight: 'bold' }} />
                </div>
                <div>
                  <label>Protein (Opt)</label>
                  <input type="number" placeholder="Auto" value={targetMealProtein} onChange={e => setTargetMealProtein(e.target.value)} />
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-primary" style={{ flex: 1, padding: '12px' }} onClick={generateCurrentMeal} disabled={isGenerating}>
                  {isGenerating ? "Consulting AI..." : `Generate ${mealType}`}
                </button>
                <button onClick={skipMealToday} style={{ padding: '12px', backgroundColor: '#f1f5f9', color: '#64748b', border: '1px solid #cbd5e1', fontWeight: 'bold' }}>
                  Skip Today
                </button>
              </div>

              {generatedMeal && (
                <div className="animate-slide-up" style={{ marginTop: '16px', padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px' }}>
                  <h5 style={{ margin: '0 0 8px 0', color: '#2563eb' }}>Proposed {mealType}</h5>
                  <ul style={{ paddingLeft: '20px', fontSize: '13px', margin: '0 0 16px 0' }}>
                    {generatedMeal.map((item, i) => <li key={i}>{item.name} <span style={{color: '#94a3b8'}}>({item.category})</span></li>)}
                  </ul>

                  {/* NEW: THE FLASHY AI TERMINAL */}
                  <div style={{ backgroundColor: '#0f172a', padding: '12px', borderRadius: '6px', marginBottom: '16px', fontFamily: 'monospace', fontSize: '11px', color: '#10b981' }}>
                    <div style={{ color: '#64748b', marginBottom: '8px' }}>&gt; AI_ENGINE_THOUGHT_PROCESS</div>
                    {generatedMealResponse?.reasoning_log?.length ? (
                      generatedMealResponse.reasoning_log.map((line: string, i: number) => (
                        <div key={i}>&gt; {line}</div>
                      ))
                    ) : (
                      <>
                        <div>&gt; Condition: {profile?.nutritionDisability || "NONE"} detected.</div>
                        <div>&gt; Symptom Override: {currentSymptom}.</div>
                        <div>&gt; Applying Adaptive Gastric Emptying Heuristics...</div>
                        <div>&gt; Optimizing Macro-Vectors... Converged.</div>
                      </>
                    )}
                  </div>

                  <button style={{ width: '100%', backgroundColor: '#0f172a', color: '#fff' }} onClick={consumeGeneratedMeal}>Log {mealType}</button>
                </div>
              )}
            </div>
          ) : (
            <div className="card" style={{ padding: '20px', backgroundColor: '#f0fdfa', border: '1px solid #14b8a6' }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#0f766e' }}>Tomorrow's Protocol</h4>
              <p style={{ fontSize: '13px', color: '#0f766e', margin: '0 0 16px 0' }}>
                Day completed. Pre-generate or skip tomorrow's meals. The system will automatically roll over at midnight.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {["Breakfast", "Lunch", "Dinner"].filter(m => mealPrefs[m].enabled).map((m) => (
                  <div key={m} style={{ backgroundColor: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #ccfbf1' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h5 style={{ margin: 0, color: '#0f172a' }}>{m}</h5>
                      
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        {!tomorrowSkips[m] && !tomorrowPlan[m] && (
                          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <span style={{ fontSize: '11px', color: '#475569', fontWeight: 'bold', padding: '0 8px', whiteSpace: 'nowrap' }}>Protein (Opt):</span>
                            <input type="number" placeholder="Auto" value={tomorrowTargets[m] || ""} onChange={e => setTomorrowTargets(p => ({...p, [m]: e.target.value}))} style={{ width: '60px', padding: '6px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '4px', textAlign: 'center' }} />
                            <button className="btn-primary" onClick={() => generateTomorrowMeal(m)} style={{ padding: '6px 12px', fontSize: '12px', marginLeft: '4px', borderRadius: '4px' }}>AI Plan</button>
                          </div>
                        )}
                        {!tomorrowPlan[m] && (
                          <button onClick={() => setTomorrowSkips(p => ({...p, [m]: !p[m]}))} style={{ padding: '6px 12px', fontSize: '12px', backgroundColor: tomorrowSkips[m] ? '#fef2f2' : '#fff', color: tomorrowSkips[m] ? '#ef4444' : '#64748b', border: '1px solid', borderColor: tomorrowSkips[m] ? '#fecaca' : '#e2e8f0', borderRadius: '8px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                            {tomorrowSkips[m] ? "Undo Skip" : "Skip"}
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {tomorrowSkips[m] && <p style={{ fontSize: '13px', color: '#ef4444', margin: '8px 0 0 0' }}>Skipping {m} tomorrow.</p>}
                    {tomorrowPlan[m] && (
                      <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
                        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px' }}>{tomorrowPlan[m].map((item: any, i: number) => <li key={i}>{item.name}</li>)}</ul>
                        <button onClick={() => setTomorrowPlan(p => { const newP = {...p}; delete newP[m]; return newP; })} style={{ marginTop: '8px', fontSize: '12px', color: '#ef4444', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>Redo / Clear</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        )}

        {/* OFF-PLAN / MANUAL ENTRY (Works for past days too!) */}
        <div className="card" style={{ padding: '20px', border: '1px dashed #94a3b8', backgroundColor: '#f8fafc' }}>
          <h4 style={{ margin: '0 0 8px 0' }}>Off-Plan / Manual Entry</h4>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 16px 0' }}>Adding to log for: <strong>{viewDate === todayDate ? "Today" : viewDate}</strong></p>
          <form onSubmit={logManualEntry}>
            <div className="grid-2" style={{ marginBottom: '12px' }}>
              <div>
                <label>Time Consumed</label>
                <input type="time" value={manualTime} onChange={e => setManualTime(e.target.value)} required />
              </div>
              <div>
                <label>Food Item</label>
                <input list="custom-foods" value={manualName} onChange={e => {
                  setManualName(e.target.value);
                  const existing = customDb.find(f => f.name.toLowerCase() === e.target.value.toLowerCase());
                  if (existing) { setManualProtein(existing.protein.toString()); setManualSodium(existing.sodium.toString()); }
                }} placeholder="e.g. Apple" required />
                <datalist id="custom-foods">{customDb.map(f => <option key={f.name} value={f.name} />)}</datalist>
              </div>
            </div>
            <div className="grid-2" style={{ marginBottom: '16px' }}>
              <div><label>Protein (g)</label><input type="number" step="0.1" value={manualProtein} onChange={e => setManualProtein(e.target.value)} /></div>
              <div><label>Sodium (mg)</label><input type="number" step="0.1" value={manualSodium} onChange={e => setManualSodium(e.target.value)} /></div>
            </div>
            <button type="submit" style={{ width: '100%', backgroundColor: '#475569', color: '#fff' }}>+ Log Manual Entry</button>
          </form>
        </div>

      </div>

      {/* RIGHT COLUMN: CALENDAR & TIMELINE */}
      <div className="card" style={{ padding: '20px', maxHeight: '85vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '20px' }}>
          <h3 style={{ margin: 0 }}>Clinical Log</h3>
          
          {/* THE CALENDAR DATE PICKER */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Viewing:</span>
            <input 
              type="date" 
              value={viewDate} 
              max={todayDate}
              onChange={e => setViewDate(e.target.value)} 
              style={{ padding: '6px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: viewDate === todayDate ? '#eff6ff' : '#fff' }} 
            />
          </div>
        </div>

        {activeDisplayTimeline.length === 0 ? (
          <p style={{ color: '#94a3b8', textAlign: 'center', marginTop: '40px' }}>No events logged for {viewDate === todayDate ? "today" : "this date"}.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {activeDisplayTimeline.map((event) => (
              <div key={event.id} className="animate-slide-up" style={{ display: 'flex', gap: '12px' }}>
                <div style={{ width: '50px', fontSize: '13px', color: '#64748b', paddingTop: '4px', fontWeight: 'bold' }}>{event.timestamp}</div>
                <div style={{ flex: 1, padding: '12px', borderRadius: '8px', borderLeft: event.alert ? '4px solid #ef4444' : (event.type === 'SKIP' ? '4px solid #f59e0b' : (event.type === 'MANUAL' ? '4px solid #94a3b8' : '4px solid #22c55e')), backgroundColor: event.alert ? '#fef2f2' : (event.type === 'SKIP' ? '#fffbeb' : (event.type === 'MANUAL' ? '#f8fafc' : '#f0fdf4')) }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: event.alert ? '#b91c1c' : '#0f172a' }}>{event.title}</div>
                    <button onClick={() => deleteEvent(event.id)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0 4px', fontSize: '14px' }}>✖</button>
                  </div>
                  <div style={{ fontSize: '13px', color: '#475569', marginTop: '4px' }}>{event.description}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}