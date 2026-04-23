import { useEffect, useMemo, useState } from "react";

type TimelineEvent = {
	id: string;
	timestamp: string;
	type: "MEAL" | "SYMPTOM" | "MANUAL" | "SKIP";
	title: string;
	description: string;
	alert?: boolean;
};

export default function ClinicianDashboard() {
	const [patientProfile, setPatientProfile] = useState<any>(null);
	const [patientTimeline, setPatientTimeline] = useState<TimelineEvent[]>([]);
	const [patientHistory, setPatientHistory] = useState<Record<string, TimelineEvent[]>>({});
	const [messages, setMessages] = useState<any[]>([]);
	const [inputText, setInputText] = useState("");

	useEffect(() => {
		const storedPatientProfile = JSON.parse(localStorage.getItem("sm_patient_profile") || "null");
		const storedUser = JSON.parse(localStorage.getItem("sm_user") || "{}");
		const storedTimeline = JSON.parse(localStorage.getItem("sm_timeline") || "[]");
		const storedHistory = JSON.parse(localStorage.getItem("sm_history") || "{}");
		const storedMessages = JSON.parse(localStorage.getItem("sm_messages") || "[]");

		if (storedPatientProfile) {
			setPatientProfile(storedPatientProfile);
		} else if (storedUser.role === "PATIENT") {
			setPatientProfile(storedUser.profile || null);
		} else {
			setPatientProfile({
				firstName: "Demo",
				lastName: "Patient",
				age: 45,
				gender: "MALE",
				nutritionDisability: "DIABETES_T2",
				allergies: ["Peanuts"],
			});
		}

		setPatientTimeline(storedTimeline);
		setPatientHistory(storedHistory);
		setMessages(storedMessages);
	}, []);

	useEffect(() => {
		localStorage.setItem("sm_messages", JSON.stringify(messages));
	}, [messages]);

	function sendClinicianMessage(e: React.FormEvent) {
		e.preventDefault();
		if (!inputText.trim()) return;

		const newMsg = {
			id: crypto.randomUUID(),
			sender: "CLINICIAN",
			text: inputText.trim(),
			timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }),
		};

		setMessages((prev) => [...prev, newMsg]);
		setInputText("");
	}

	const totalLogs = useMemo(() => {
		const historyCount = Object.values(patientHistory).flat().length;
		return patientTimeline.length + historyCount;
	}, [patientHistory, patientTimeline.length]);

	if (!patientProfile) return <div>Loading Patient Data...</div>;

	return (
		<div className="grid-2" style={{ alignItems: "start" }}>
			<div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
				<div className="card" style={{ padding: "24px", borderTop: "4px solid #2563eb" }}>
					<h3 style={{ margin: "0 0 16px 0" }}>Assigned Patient</h3>
					<div style={{ padding: "16px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
						<div style={{ fontSize: "18px", fontWeight: "bold", color: "#0f172a" }}>
							{patientProfile.firstName} {patientProfile.lastName}
						</div>
						<div style={{ fontSize: "14px", color: "#64748b", marginTop: "4px" }}>
							ID: PT-84729 • {patientProfile.age} Y/O • {patientProfile.gender}
						</div>
						<hr style={{ border: "none", borderTop: "1px solid #cbd5e1", margin: "12px 0" }} />
						<div style={{ display: "flex", justifyContent: "space-between" }}>
							<span style={{ fontSize: "13px", fontWeight: "bold", color: "#b91c1c" }}>
								{String(patientProfile.nutritionDisability || "NONE").replace("_", " ")}
							</span>
							<span style={{ fontSize: "13px", color: "#64748b" }}>{totalLogs} Lifetime Logs</span>
						</div>
					</div>
				</div>

				<div className="card" style={{ padding: "24px" }}>
					<h3 style={{ margin: "0 0 16px 0" }}>Active Medical Alerts</h3>
					{patientTimeline.filter((event) => event.alert).length === 0 ? (
						<div style={{ padding: "12px", backgroundColor: "#f0fdf4", color: "#166534", borderRadius: "6px", fontSize: "14px" }}>
							No acute physiological alerts detected today.
						</div>
					) : (
						<div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
							{patientTimeline.filter((event) => event.alert).map((alert) => (
								<div key={alert.id} style={{ padding: "12px", backgroundColor: "#fef2f2", borderLeft: "4px solid #ef4444", borderRadius: "6px" }}>
									<div style={{ fontSize: "14px", fontWeight: "bold", color: "#b91c1c" }}>
										{alert.timestamp} - {alert.title}
									</div>
									<div style={{ fontSize: "13px", color: "#7f1d1d" }}>{alert.description}</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>

			<div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
				<div className="card" style={{ padding: "24px", maxHeight: "55vh", overflowY: "auto" }}>
					<h3 style={{ margin: "0 0 16px 0" }}>EHR Dietary Audit Log (Read-Only)</h3>
					<p style={{ fontSize: "13px", color: "#64748b", marginBottom: "20px" }}>
						Live view of patient's chronological dietary intake and symptom reporting.
					</p>

					{patientTimeline.length === 0 ? (
						<p style={{ color: "#94a3b8" }}>No data logged today.</p>
					) : (
						<div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
							{patientTimeline.map((event) => (
								<div key={event.id} style={{ display: "flex", gap: "12px", opacity: event.type === "SKIP" ? 0.6 : 1 }}>
									<div style={{ width: "50px", fontSize: "12px", color: "#94a3b8", paddingTop: "4px" }}>{event.timestamp}</div>
									<div style={{ flex: 1, padding: "10px", borderRadius: "6px", backgroundColor: event.alert ? "#fef2f2" : "#f8fafc", border: "1px solid #e2e8f0" }}>
										<div style={{ fontSize: "14px", fontWeight: "bold", color: event.alert ? "#dc2626" : "#0f172a" }}>{event.title}</div>
										<div style={{ fontSize: "13px", color: "#475569", marginTop: "4px" }}>{event.description}</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				<div className="card" style={{ padding: "0", display: "flex", flexDirection: "column", height: "400px" }}>
					<div style={{ padding: "16px", borderBottom: "1px solid #e2e8f0", backgroundColor: "#f8fafc" }}>
						<h3 style={{ margin: 0 }}>Direct Patient Comms</h3>
					</div>

					<div style={{ flex: 1, padding: "16px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
						{messages.length === 0 ? <p style={{ color: "#94a3b8", textAlign: "center" }}>No messages</p> :
							messages.map((msg: any) => {
								const isClinician = msg.sender === "CLINICIAN";
								return (
									<div key={msg.id} style={{ alignSelf: isClinician ? "flex-end" : "flex-start", maxWidth: "80%" }}>
										<div style={{ fontSize: "10px", color: "#94a3b8", marginBottom: "2px", textAlign: isClinician ? "right" : "left" }}>
											{isClinician ? "You" : patientProfile.firstName} • {msg.timestamp}
										</div>
										<div style={{ padding: "10px 14px", borderRadius: "8px", backgroundColor: isClinician ? "#0f172a" : "#f1f5f9", color: isClinician ? "#fff" : "#0f172a" }}>
											{msg.text}
										</div>
									</div>
								);
							})
						}
					</div>

					<form onSubmit={sendClinicianMessage} style={{ padding: "12px", borderTop: "1px solid #e2e8f0", display: "flex", gap: "8px" }}>
						<input type="text" value={inputText} onChange={e => setInputText(e.target.value)} placeholder="Message patient..." style={{ flex: 1, padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
						<button type="submit" style={{ padding: "0 16px", backgroundColor: "#0f172a", color: "#fff", borderRadius: "6px", border: "none", fontWeight: "bold" }}>Send</button>
					</form>
				</div>
			</div>
		</div>
	);
}
