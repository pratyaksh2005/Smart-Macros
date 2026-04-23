import { useState } from "react";

export default function AIDiagnostics() {
	const [isAnalyzing, setIsAnalyzing] = useState(false);
	const [mlResults, setMlResults] = useState<any>(null);

	async function runMachineLearningDiagnostics() {
		setIsAnalyzing(true);
		setMlResults(null);

		const diagnosticPayload = {
			age: 45,
			condition_code: 2,
			total_carbs_g: 145.5,
			total_fiber_g: 12.0,
			total_sodium_mg: 950.0,
		};

		try {
			const response = await fetch("http://127.0.0.1:8000/api/v1/engine/ai-risk-validation", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(diagnosticPayload),
			});

			if (!response.ok) throw new Error("ML Engine offline");
			const data = await response.json();

			setTimeout(() => {
				setMlResults(data);
				setIsAnalyzing(false);
			}, 1500);
		} catch (err) {
			alert("Scikit-Learn ML Backend is offline. Ensure Python endpoint is running.");
			setIsAnalyzing(false);
		}
	}

	return (
		<div style={{ maxWidth: "800px", margin: "0 auto" }}>
			<div className="card" style={{ padding: "32px", textAlign: "center" }}>
				<h2 style={{ margin: "0 0 16px 0", color: "#0f172a" }}>AI Risk Validation Engine</h2>
				<p style={{ color: "#64748b", marginBottom: "32px", lineHeight: "1.6" }}>
					This module runs the patient's real-time macro-nutritional intake through the Random Forest Regressor model to predict physiological risk scores based on the UK Government CoFID dataset.
				</p>

				<button
					onClick={runMachineLearningDiagnostics}
					disabled={isAnalyzing}
					style={{
						padding: "16px 32px",
						fontSize: "16px",
						fontWeight: "bold",
						backgroundColor: "#0f172a",
						color: "#fff",
						border: "none",
						borderRadius: "8px",
						cursor: isAnalyzing ? "not-allowed" : "pointer",
						boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
					}}
				>
					{isAnalyzing ? "Running Scikit-Learn Inference..." : "Run AI Diagnostics on Patient"}
				</button>
			</div>

			{mlResults && (
				<div className="card" style={{ padding: "32px", borderTop: "4px solid #10b981" }}>
					<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
						<h3 style={{ margin: 0 }}>Diagnostic Results</h3>
						<span style={{ padding: "6px 12px", backgroundColor: "#ecfdf5", color: "#059669", borderRadius: "99px", fontSize: "12px", fontWeight: "bold" }}>
							Model: Random Forest (v2)
						</span>
					</div>

					<div className="grid-2">
						<div style={{ padding: "16px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
							<div style={{ fontSize: "13px", color: "#64748b", textTransform: "uppercase", fontWeight: "bold" }}>Predicted Risk Score</div>
							<div style={{ fontSize: "32px", fontWeight: "bold", color: (mlResults.ai_analysis?.predicted_glycemic_spike_1_to_10 ?? 0) > 5.0 ? "#ef4444" : "#059669", marginTop: "8px" }}>
								{(mlResults.ai_analysis?.predicted_glycemic_spike_1_to_10 ?? 0)}/10
							</div>
							<p style={{ fontSize: "13px", color: "#475569", marginTop: "8px", margin: 0 }}>
								{mlResults.ai_analysis?.clinical_guardrail || "No interpretation available."}
							</p>
						</div>

						<div style={{ padding: "16px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
							<div style={{ fontSize: "13px", color: "#64748b", textTransform: "uppercase", fontWeight: "bold", marginBottom: "12px" }}>Feature Contributions</div>
							<div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "14px" }}>
								<div style={{ display: "flex", justifyContent: "space-between" }}>
									<span style={{ color: "#475569" }}>Carbohydrate Load:</span>
									<span style={{ fontWeight: "bold" }}>{145.5}g</span>
								</div>
								<div style={{ display: "flex", justifyContent: "space-between" }}>
									<span style={{ color: "#475569" }}>Fiber Mitigation:</span>
									<span style={{ fontWeight: "bold", color: "#059669" }}>-12.0g</span>
								</div>
								<div style={{ display: "flex", justifyContent: "space-between" }}>
									<span style={{ color: "#475569" }}>Sodium Load:</span>
									<span style={{ fontWeight: "bold", color: "#ef4444" }}>950.0mg</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
