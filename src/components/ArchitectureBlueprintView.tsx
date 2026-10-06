import React, { useState } from 'react';
import {
  ARCHITECTURE_LAYERS,
  TECH_STACK_SUMMARY,
  ArchitectureLayerSpec,
} from '../data/farmData';
import { Check, Copy, ArrowRight, Terminal } from 'lucide-react';

interface ArchitectureBlueprintViewProps {
  initialSection?: 'architecture' | 'techstack';
}

export const ArchitectureBlueprintView: React.FC<ArchitectureBlueprintViewProps> = ({
  initialSection = 'architecture',
}) => {
  const [selectedLayerId, setSelectedLayerId] = useState<string>(ARCHITECTURE_LAYERS[0].id);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedFullDoc, setCopiedFullDoc] = useState(false);
  const [activeSubView, setActiveSubView] = useState<'both' | 'architecture' | 'techstack'>(
    initialSection === 'techstack' ? 'techstack' : 'both'
  );

  const activeLayer: ArchitectureLayerSpec =
    ARCHITECTURE_LAYERS.find((l) => l.id === selectedLayerId) || ARCHITECTURE_LAYERS[0];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeLayer.codeArtifact);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 1800);
  };

  const handleCopyFullSpecification = () => {
    const markdownSpec = `# TerraPulse Agronomy — Full-Stack Architecture & Tech Stack Specification

## 1. End-to-End Architecture Overview
${ARCHITECTURE_LAYERS.map(
  (l) => `### ${l.stepNumber}. ${l.layerName}
- **Role**: ${l.subtitle}
- **Protocols & Standards**: ${l.protocolsAndStandards}
- **Latency / SLA**: ${l.latencySla}
- **Core Components**: ${l.primaryComponents.join(', ')}
- **Summary**: ${l.description}
`
).join('\n')}

## 2. Production Tech Stack Summary
${TECH_STACK_SUMMARY.map(
  (t) => `- **${t.domain}**: ${t.recommendedStack} (${t.estimatedMonthlyCostPer1000Acres}) — ${t.ruralAgJustification}`
).join('\n')}
`;
    navigator.clipboard.writeText(markdownSpec);
    setCopiedFullDoc(true);
    setTimeout(() => setCopiedFullDoc(false), 2000);
  };

  return (
    <div className="space-y-10">
      {/* Header & View Controls */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-[#DCE3DC]">
        <div className="space-y-2 max-w-3xl">
          <div className="flex items-center gap-2 text-xs text-[#4A5D50] font-mono">
            <span>System Blueprint</span>
            <span aria-hidden="true">·</span>
            <span>5-Tier IoT & ML Pipeline</span>
            <span aria-hidden="true">·</span>
            <span>Rural Fault-Tolerant Topology</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#111C16] tracking-tight">
            Frontend, Backend & IoT System Architecture
          </h1>
          <p className="text-sm sm:text-base text-[#3D4F43] leading-relaxed">
            Production reference blueprint connecting in-field multi-depth soil moisture probes,
            hyper-local FAO-56 weather & crop yield models, and sub-5-second cellular SMS irrigation
            alerts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center p-1 bg-[#EAEFE9] rounded-lg border border-[#DCE3DC]">
            <button
              type="button"
              onClick={() => setActiveSubView('both')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                activeSubView === 'both'
                  ? 'bg-white text-[#111C16] shadow-xs'
                  : 'text-[#4A5D50] hover:text-[#111C16]'
              }`}
            >
              Complete Blueprint
            </button>
            <button
              type="button"
              onClick={() => setActiveSubView('architecture')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                activeSubView === 'architecture'
                  ? 'bg-white text-[#111C16] shadow-xs'
                  : 'text-[#4A5D50] hover:text-[#111C16]'
              }`}
            >
              Architecture Layers
            </button>
            <button
              type="button"
              onClick={() => setActiveSubView('techstack')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                activeSubView === 'techstack'
                  ? 'bg-white text-[#111C16] shadow-xs'
                  : 'text-[#4A5D50] hover:text-[#111C16]'
              }`}
            >
              Tech Stack Matrix
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopyFullSpecification}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-[#166534] hover:bg-[#14532D] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            {copiedFullDoc ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedFullDoc ? 'Copied Markdown Spec' : 'Copy Full Spec (MD)'}</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: Interactive 5-Layer Architecture Pipeline */}
      {(activeSubView === 'both' || activeSubView === 'architecture') && (
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-[#111C16]">
              01. End-to-End Data Flow & Layer Explorer
            </h2>
            <p className="text-xs text-[#4A5D50]">
              Select any architectural tier below to inspect its protocols, failure recovery, and
              reference implementation.
            </p>
          </div>

          {/* Interactive Pipeline Stepper */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {ARCHITECTURE_LAYERS.map((layer, index) => {
              const isSelected = layer.id === selectedLayerId;
              return (
                <button
                  key={layer.id}
                  type="button"
                  onClick={() => setSelectedLayerId(layer.id)}
                  className={`text-left p-4 rounded-lg border transition-colors cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#111C16] text-white border-[#111C16]'
                      : 'bg-white text-[#111C16] border-[#DCE3DC] hover:border-[#8AA090]'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className={isSelected ? 'text-[#86EFAC]' : 'text-[#166534]'}>
                        Tier {layer.stepNumber}
                      </span>
                      {index < ARCHITECTURE_LAYERS.length - 1 && (
                        <ArrowRight
                          className={`w-3.5 h-3.5 hidden md:block ${
                            isSelected ? 'text-[#86EFAC]' : 'text-[#8AA090]'
                          }`}
                        />
                      )}
                    </div>
                    <div className="font-semibold text-sm leading-snug">{layer.layerName}</div>
                  </div>
                  <div
                    className={`mt-4 pt-3 border-t text-[11px] font-mono tabular-nums ${
                      isSelected
                        ? 'border-white/15 text-neutral-300'
                        : 'border-[#EAEFE9] text-[#4A5D50]'
                    }`}
                  >
                    {layer.latencySla.split('·')[0].trim()}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Layer Deep-Dive Inspection Panel */}
          <div className="bg-white rounded-lg border border-[#DCE3DC] p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left 7 Cols: Architectural Specifications */}
              <div className="lg:col-span-7 space-y-6">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#166534]">
                    <span>Tier {activeLayer.stepNumber} Specification</span>
                    <span aria-hidden="true">·</span>
                    <span>{activeLayer.protocolsAndStandards}</span>
                  </div>
                  <h3 className="font-display text-xl sm:text-2xl font-semibold text-[#111C16]">
                    {activeLayer.layerName}
                  </h3>
                  <p className="text-sm text-[#3D4F43] leading-relaxed">
                    {activeLayer.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#EAEFE9] space-y-3">
                  <h4 className="text-xs font-semibold text-[#111C16]">
                    Core Production Subsystems
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {activeLayer.primaryComponents.map((comp) => (
                      <div
                        key={comp}
                        className="px-3.5 py-2.5 bg-[#F8FAF7] border border-[#DCE3DC] rounded-md text-xs font-medium text-[#111C16]"
                      >
                        {comp}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#EAEFE9] space-y-3">
                  <h4 className="text-xs font-semibold text-[#111C16]">
                    Resilience & Domain Engineering Decisions
                  </h4>
                  <ul className="space-y-2.5 text-xs sm:text-sm text-[#3D4F43]">
                    {activeLayer.engineeringDetails.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                        <span className="font-mono text-xs font-semibold text-[#166534] select-none mt-0.5">
                          0{idx + 1}.
                        </span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-[#EAEFE9] flex flex-wrap items-center justify-between gap-4 text-xs text-[#4A5D50] font-mono tabular-nums">
                  <span>Target SLA: {activeLayer.latencySla}</span>
                  <span>Data Contract: Verified End-to-End</span>
                </div>
              </div>

              {/* Right 5 Cols: Production Code / Schema Artifact */}
              <div className="lg:col-span-5 flex flex-col justify-between bg-[#0F1712] text-neutral-100 rounded-lg p-5 border border-[#1E2E24]">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2 text-xs font-mono text-[#86EFAC]">
                      <Terminal className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{activeLayer.codeArtifactTitle}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono text-neutral-200 bg-white/10 hover:bg-white/15 rounded transition-colors whitespace-nowrap cursor-pointer"
                    >
                      {copiedCode ? (
                        <>
                          <Check className="w-3 h-3 text-[#86EFAC]" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Snippet</span>
                        </>
                      )}
                    </button>
                  </div>

                  <pre className="text-[11px] sm:text-xs font-mono text-neutral-200 overflow-x-auto leading-relaxed py-1">
                    <code>{activeLayer.codeArtifact}</code>
                  </pre>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-neutral-400">
                  <span>Language: {activeLayer.codeArtifactLanguage}</span>
                  <span>Production Reference Pattern</span>
                </div>
              </div>
            </div>
          </div>

          {/* Frontend vs Backend Responsibility Split */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-[#DCE3DC] p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#EAEFE9] pb-3">
                <h3 className="text-base font-semibold text-[#111C16]">
                  Frontend Architecture (Farmer Field PWA & Office Console)
                </h3>
                <span className="text-xs font-mono text-[#166534]">React 19 + IndexedDB</span>
              </div>
              <div className="space-y-3 text-xs sm:text-sm text-[#3D4F43] leading-relaxed">
                <p>
                  <strong className="text-[#111C16] font-semibold">
                    Offline-First Data Synchronization:
                  </strong>{' '}
                  Uses TanStack Query persisted to IndexedDB alongside a Workbox Service Worker.
                  Farmers driving across dead-zone parcels can still inspect the last 7 days of
                  15cm/30cm/60cm soil moisture curves and irrigation prescriptions.
                </p>
                <p>
                  <strong className="text-[#111C16] font-semibold">
                    Real-Time Stream & Optimistic Actuation:
                  </strong>{' '}
                  Subscribes to Server-Sent Events (SSE) for live probe uplinks. When a farmer taps
                  &ldquo;Irrigate Sector&rdquo; or adjusts a MAD depletion threshold, optimistic UI
                  state updates immediately and queues via Background Sync if offline.
                </p>
                <p>
                  <strong className="text-[#111C16] font-semibold">
                    High-Contrast Sunlight Ergonomics:
                  </strong>{' '}
                  Uses semantic state pairings (explicit text labels alongside high-contrast color
                  tokens) and oversized &ge; 44px touch targets for gloved operation on
                  cab-mounted tablets or phones.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-[#DCE3DC] p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#EAEFE9] pb-3">
                <h3 className="text-base font-semibold text-[#111C16]">
                  Backend Architecture (IoT Ingestion, FAO-56 & SMS Engine)
                </h3>
                <span className="text-xs font-mono text-[#166534]">
                  Node.js + FastAPI + TimescaleDB
                </span>
              </div>
              <div className="space-y-3 text-xs sm:text-sm text-[#3D4F43] leading-relaxed">
                <p>
                  <strong className="text-[#111C16] font-semibold">
                    Decoupled Event-Driven Pipeline:
                  </strong>{' '}
                  LoRaWAN gateways forward binary packets over MQTT to stateless Node.js ingestion
                  workers. Workers decode readings, validate sensor battery/RSSI health, and write
                  to TimescaleDB hypertables.
                </p>
                <p>
                  <strong className="text-[#111C16] font-semibold">
                    Physics-Guided ML Yield Service:
                  </strong>{' '}
                  A scheduled Python FastAPI worker merges Open-Meteo/NOAA hourly forecasts with
                  parcel soil physics (Field Capacity, Wilting Point, $K_c$, $K_y$) to run FAO-56
                  water balance and LightGBM yield inference.
                </p>
                <p>
                  <strong className="text-[#111C16] font-semibold">
                    Multi-Channel Alert Dispatcher:
                  </strong>{' '}
                  Evaluates root-zone VWC against MAD thresholds with a 6-hour hysteresis lock and
                  upcoming rain suppression, dispatching priority SMS/WhatsApp messages via Twilio
                  and handling inbound `START` valve reply webhooks.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 2: Tech Stack Summary Matrix */}
      {(activeSubView === 'both' || activeSubView === 'techstack') && (
        <section className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-[#111C16]">
              02. Production Tech Stack Summary & Rural Cost Breakdown
            </h2>
            <span className="text-xs font-mono text-[#4A5D50] tabular-nums">
              Estimated Cloud + Cellular OpEx: ~$253 / mo per 1,000 irrigated acres
            </span>
          </div>

          <div className="bg-white rounded-lg border border-[#DCE3DC] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#DCE3DC] bg-[#F8FAF7] text-xs font-semibold text-[#3D4F43]">
                    <th className="py-3.5 px-4">System Layer</th>
                    <th className="py-3.5 px-4">Recommended Production Stack</th>
                    <th className="py-3.5 px-4">Viable Alternatives</th>
                    <th className="py-3.5 px-4">Why Chosen for Precision Agriculture</th>
                    <th className="py-3.5 px-4 text-right">Est. Cost / 1,000 ac</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAEFE9] text-xs sm:text-sm">
                  {TECH_STACK_SUMMARY.map((item) => (
                    <tr key={item.domain} className="hover:bg-[#F8FAF7]/80 transition-colors">
                      <td className="py-4 px-4 font-semibold text-[#111C16] whitespace-nowrap align-top">
                        {item.domain}
                      </td>
                      <td className="py-4 px-4 font-mono text-xs text-[#166534] font-medium align-top">
                        {item.recommendedStack}
                      </td>
                      <td className="py-4 px-4 text-xs text-[#4A5D50] align-top">
                        {item.alternatives}
                      </td>
                      <td className="py-4 px-4 text-xs text-[#3D4F43] leading-relaxed max-w-md align-top">
                        {item.ruralAgJustification}
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-xs text-[#111C16] tabular-nums whitespace-nowrap align-top">
                        {item.estimatedMonthlyCostPer1000Acres}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
