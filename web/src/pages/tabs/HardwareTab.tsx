import { useState, useEffect } from "react";

type HotspotProps = {
  positionClass: string;
  label: string;
  onHover: (label: string) => void;
};

export default function HardwareTab() {
  const [scanning, setScanning] = useState(true);
  const [activeModule, setActiveModule] = useState("AWAITING_INPUT...");
  const [logs, setLogs] = useState<string[]>([
    "INITIALIZING HARDWARE LINK...",
    "ESTABLISHING SECURE CONNECTION...",
  ]);
  const [imgSrc, setImgSrc] = useState("/schematic.jpg");

  useEffect(() => {
    const timer1 = setTimeout(
      () => setLogs((prev) => [...prev, "CALIBRATING OPTICAL ARRAY... OK"]),
      800
    );
    const timer2 = setTimeout(
      () => setLogs((prev) => [...prev, "SYNCING BIO-SENSORS... OK"]),
      1600
    );
    const timer3 = setTimeout(() => {
      setLogs((prev) => [...prev, "DIAGNOSTIC COMPLETE. SYSTEM ONLINE."]);
      setScanning(false);
    }, 2500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div className="hardware-grid">
      <div className="card">
        <h3>Phase 2: Wearable AI Hardware Vision</h3>
        <p>
          Interactive conceptual blueprint for 24/7 autonomous macro and biometric monitoring.
        </p>

        <div className="hardware-viewer">
          {scanning && <div className="hardware-scanline" aria-hidden="true" />}

          <img
            src={imgSrc}
            alt="Hardware Schematic"
            className={scanning ? "hardware-image hardware-image-scanning" : "hardware-image"}
            onError={() => {
              if (imgSrc !== "/schematics.png") {
                setImgSrc("/schematics.png");
              }
            }}
          />

          {!scanning && (
            <>
              <Hotspot
                positionClass="hardware-hotspot-pos-1"
                label="DUAL RGB/THERMAL OPTICAL ARRAY"
                onHover={setActiveModule}
              />
              <Hotspot
                positionClass="hardware-hotspot-pos-2"
                label="ONBOARD AI NPU (NEURAL PROCESSING UNIT)"
                onHover={setActiveModule}
              />
              <Hotspot
                positionClass="hardware-hotspot-pos-3"
                label="CONTINUOUS BIO-SENSOR (GLUCOSE/PPG)"
                onHover={setActiveModule}
              />
              <Hotspot
                positionClass="hardware-hotspot-pos-4"
                label="BIO-COMPATIBLE HYPOALLERGENIC SHELL"
                onHover={setActiveModule}
              />
            </>
          )}
        </div>
      </div>

      <div className="card hardware-terminal">
        <h4 className="hardware-terminal-title">&gt; TERMINAL_OUTPUT</h4>
        {logs.map((log, i) => (
          <div key={i} className="hardware-log-line">{`> ${log}`}</div>
        ))}
        {!scanning && (
          <div className="hardware-focused-module">
            {`> FOCUSED_MODULE: [ ${activeModule} ]`}
          </div>
        )}
      </div>
    </div>
  );
}

function Hotspot({ positionClass, label, onHover }: HotspotProps) {
  return (
    <button
      type="button"
      onMouseEnter={() => onHover(label)}
      onMouseLeave={() => onHover("AWAITING_INPUT...")}
      onFocus={() => onHover(label)}
      onBlur={() => onHover("AWAITING_INPUT...")}
      className={`hardware-hotspot ${positionClass}`}
      aria-label={label}
    >
      <span className="hardware-hotspot-inner" />
    </button>
  );
}