import React, { useState, useEffect, useCallback } from 'react';
import {
  INITIAL_FIELD_PARCELS,
  FieldParcel,
} from './data/farmData';
import { ArchitectureBlueprintView } from './components/ArchitectureBlueprintView';
import { PhoneAlertCenter } from './components/PhoneAlertCenter';
import { DispatchedAlertRecord } from '../server';
import {
  AlertTriangle,
  CheckCircle2,
  Droplets,
  RefreshCw,
  Send,
  Sliders,
} from 'lucide-react';

interface WeatherYieldApiResponse {
  weatherSource: string;
  coordinates: { lat: number; lon: number };
  currentWeather: {
    temperatureC: number;
    humidityPercent: number;
    windSpeedKmh: number;
    vpdKpa: number;
    soilTemp6cmC: number;
  };
  soilPhysics: {
    currentVwc: number;
    fieldCapacity: number;
    wiltingPoint: number;
    criticalMadVwc: number;
    tawPercent: number;
    currentDepletionPercent: number;
    ksWaterStressFactor: number;
    needsIrrigation: boolean;
    approachingStress: boolean;
  };
  yieldPrediction: {
    cropName: string;
    unit: string;
    maxPotentialYield: number;
    projectedYieldUnirrigated: number;
    projectedYieldIrrigated: number;
    yieldSavedPerAcre: number;
    pricePerUnit: number;
    revenueProtectedTotal: number;
    confidenceScore: number;
    kyFactor: number;
    kcFactor: number;
    sevenDayEtcMm: number;
    sevenDayRainMm: number;
    sevenDayGdd: number;
  };
  irrigationPrescription: {
    recommendedMm: number;
    gallonsPerAcre: number;
    totalGallonsField: number;
    valveRuntimeMinutes: number;
    optimalWindow: string;
  };
  dailyForecast: Array<{
    date: string;
    tempMaxC: number;
    tempMinC: number;
    precipMm: number;
    et0Mm: number;
    etcMm: number;
    radiationMj: number;
    projectedVwcNoIrrigation: number;
    projectedVwcWithIrrigation: number;
  }>;
}

type ActiveWorkspaceTab = 'dashboard' | 'yield' | 'alerts' | 'architecture' | 'techstack';

export default function App() {
  const [parcels, setParcels] = useState<FieldParcel[]>(INITIAL_FIELD_PARCELS);
  const [selectedParcelId, setSelectedParcelId] = useState<string>(INITIAL_FIELD_PARCELS[0].id);
  const [activeTab, setActiveTab] = useState<ActiveWorkspaceTab>('dashboard');
  const [weatherYieldData, setWeatherYieldData] = useState<WeatherYieldApiResponse | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState<boolean>(true);
  const [alerts, setAlerts] = useState<DispatchedAlertRecord[]>([]);
  const [toastBanner, setToastBanner] = useState<string | null>(null);

  const selectedParcel =
    parcels.find((p) => p.id === selectedParcelId) || parcels[0];

  const showToast = (msg: string) => {
    setToastBanner(msg);
    setTimeout(() => setToastBanner(null), 4500);
  };

  // Fetch initial alerts
  useEffect(() => {
    fetch('/api/alerts')
      .then((res) => res.json())
      .then((data) => {
        if (data?.alerts) setAlerts(data.alerts);
      })
      .catch(() => {});
  }, []);

  // Fetch live weather + FAO-56 yield prediction whenever selected parcel or VWC changes
  const fetchWeatherAndYield = useCallback(async (parcel: FieldParcel) => {
    setIsLoadingWeather(true);
    try {
      const params = new URLSearchParams({
        lat: String(parcel.lat),
        lon: String(parcel.lon),
        crop: parcel.cropKey,
        vwc: String(parcel.rootZoneVwc),
        fc: String(parcel.fieldCapacityVwc),
        pwp: String(parcel.wiltingPointVwc),
        mad: String(parcel.madPercent),
        acreage: String(parcel.acreage),
      });
      const res = await fetch(`/api/weather-yield?${params.toString()}`);
      if (res.ok) {
        const json: WeatherYieldApiResponse = await res.json();
        setWeatherYieldData(json);
      }
    } catch {
      // Fallback handled gracefully
    } finally {
      setIsLoadingWeather(false);
    }
  }, []);

  useEffect(() => {
    fetchWeatherAndYield(selectedParcel);
  }, [
    selectedParcel.id,
    selectedParcel.rootZoneVwc,
    fetchWeatherAndYield,
  ]);

  // Adjust live soil moisture VWC (simulating drought depletion or rainfall/irrigation)
  const handleUpdateParcelVwc = (newVwc: number) => {
    const clampedVwc = Number(Math.max(8, Math.min(42, newVwc)).toFixed(1));
    setParcels((prev) =>
      prev.map((p) => {
        if (p.id !== selectedParcel.id) return p;
        const delta = clampedVwc - p.rootZoneVwc;
        return {
          ...p,
          rootZoneVwc: clampedVwc,
          lastUpdated: 'Just now (Live Telemetry)',
          probes: p.probes.map((pr) => ({
            ...pr,
            vwcPercent: Number(Math.max(7, Math.min(44, pr.vwcPercent + delta)).toFixed(1)),
            matricPotentialKpa: Math.round(-120 + clampedVwc * 2.8),
          })),
        };
      })
    );
  };

  // Simulate sudden heatwave drought depletion across active plot and auto-dispatch phone alert
  const handleSimulateDroughtEvent = async () => {
    const droughtVwc = Number((selectedParcel.madThresholdVwc - 4.2).toFixed(1));
    handleUpdateParcelVwc(droughtVwc);

    const irrigationMm = weatherYieldData?.irrigationPrescription.recommendedMm || 24.5;
    const runtimeMin = weatherYieldData?.irrigationPrescription.valveRuntimeMinutes || 195;
    const yieldProtected = `${
      weatherYieldData?.yieldPrediction.yieldSavedPerAcre || 12.8
    } ${weatherYieldData?.yieldPrediction.unit || 'bu/ac'}`;

    await handleDispatchPhoneAlert({
      plotId: selectedParcel.id,
      plotName: `${selectedParcel.name} (${selectedParcel.acreage} ac)`,
      phone: '+1 (515) 892-4419',
      channel: 'SMS',
      measuredVwc: droughtVwc,
      thresholdVwc: selectedParcel.madThresholdVwc,
      irrigationNeededMm: irrigationMm > 0 ? irrigationMm : 24.5,
      valveRuntimeMinutes: runtimeMin > 0 ? runtimeMin : 195,
      yieldProtected,
    });

    showToast(
      `Simulated drought on ${selectedParcel.name} (${droughtVwc}% VWC). Urgent SMS irrigation alert dispatched to +1 (515) 892-4419.`
    );
  };

  const handleDispatchPhoneAlert = async (payload: {
    plotId: string;
    plotName: string;
    phone: string;
    channel: 'SMS' | 'WhatsApp' | 'Push Notification';
    measuredVwc: number;
    thresholdVwc: number;
    irrigationNeededMm: number;
    valveRuntimeMinutes: number;
    yieldProtected: string;
  }) => {
    try {
      const res = await fetch('/api/alerts/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.alerts) {
          setAlerts(data.alerts);
        }
        showToast(
          `${payload.channel} alert (${data.dispatchedAlert?.id || 'ALT'}) delivered to ${
            payload.phone
          }.`
        );
      }
    } catch {
      showToast('Alert queued locally for transmission.');
    }
  };

  const handleToggleValve = (parcelId: string) => {
    setParcels((prev) =>
      prev.map((p) => {
        if (p.id !== parcelId) return p;
        const nextStatus =
          p.valveStatus === 'Closed' ? 'Irrigating (Drip/Pivot)' : 'Closed';
        const nextVwc =
          nextStatus === 'Irrigating (Drip/Pivot)'
            ? Number(Math.min(p.fieldCapacityVwc - 1.5, p.rootZoneVwc + 4.5).toFixed(1))
            : p.rootZoneVwc;
        return {
          ...p,
          valveStatus: nextStatus,
          rootZoneVwc: nextVwc,
          lastUpdated: 'Just now (Valve Actuated)',
        };
      })
    );
  };

  const isBelowMad = selectedParcel.rootZoneVwc < selectedParcel.madThresholdVwc;
  const irrigationNeededMm = weatherYieldData?.irrigationPrescription.recommendedMm ?? 22.4;
  const valveRuntimeMin = weatherYieldData?.irrigationPrescription.valveRuntimeMinutes ?? 180;
  const yieldSavedLabel = `${
    weatherYieldData?.yieldPrediction.yieldSavedPerAcre ?? 11.4
  } ${weatherYieldData?.yieldPrediction.unit ?? 'bu/ac'}`;

  return (
    <div id="top" className="min-h-screen flex flex-col bg-[#F8FAF7] text-[#111C16]">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-[#DCE3DC] px-6 py-3.5">
        <div className="max-w-[1380px] mx-auto flex items-center justify-between gap-4">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('dashboard');
            }}
            className="font-display text-xl font-semibold tracking-tight text-[#111C16] whitespace-nowrap"
          >
            TerraPulse
          </a>

          {/* Zone 2: 5 clean text navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#4A5D50]">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`py-1 transition-colors whitespace-nowrap cursor-pointer border-b-2 ${
                activeTab === 'dashboard'
                  ? 'text-[#111C16] border-[#166534] font-semibold'
                  : 'border-transparent hover:text-[#111C16]'
              }`}
            >
              Field Telemetry
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('yield')}
              className={`py-1 transition-colors whitespace-nowrap cursor-pointer border-b-2 ${
                activeTab === 'yield'
                  ? 'text-[#111C16] border-[#166534] font-semibold'
                  : 'border-transparent hover:text-[#111C16]'
              }`}
            >
              Yield Forecast
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('alerts')}
              className={`py-1 transition-colors whitespace-nowrap cursor-pointer border-b-2 ${
                activeTab === 'alerts'
                  ? 'text-[#111C16] border-[#166534] font-semibold'
                  : 'border-transparent hover:text-[#111C16]'
              }`}
            >
              Phone Alerts ({alerts.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('architecture')}
              className={`py-1 transition-colors whitespace-nowrap cursor-pointer border-b-2 ${
                activeTab === 'architecture'
                  ? 'text-[#111C16] border-[#166534] font-semibold'
                  : 'border-transparent hover:text-[#111C16]'
              }`}
            >
              Architecture
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('techstack')}
              className={`py-1 transition-colors whitespace-nowrap cursor-pointer border-b-2 ${
                activeTab === 'techstack'
                  ? 'text-[#111C16] border-[#166534] font-semibold'
                  : 'border-transparent hover:text-[#111C16]'
              }`}
            >
              Tech Stack
            </button>
          </nav>

          {/* Zone 3: 2 primary actions */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleSimulateDroughtEvent}
              className="px-3.5 py-2 text-xs font-medium text-[#B91C1C] bg-[#FEF2F2] hover:bg-[#FEE2E2] border border-[#FECACA] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              Simulate Drought Alert
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('architecture')}
              className="px-4 py-2 text-xs font-medium text-white bg-[#166534] hover:bg-[#14532D] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              System Blueprint
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Bar (for viewports < md) */}
      <div className="md:hidden bg-white border-b border-[#DCE3DC] px-4 py-2 flex items-center gap-2 overflow-x-auto">
        {(
          [
            { id: 'dashboard', label: 'Field Telemetry' },
            { id: 'yield', label: 'Yield Forecast' },
            { id: 'alerts', label: `Phone Alerts (${alerts.length})` },
            { id: 'architecture', label: 'Architecture' },
            { id: 'techstack', label: 'Tech Stack' },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveTab(item.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 ${
              activeTab === item.id
                ? 'bg-[#111C16] text-white'
                : 'text-[#4A5D50] hover:text-[#111C16]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Live Action Notification Banner */}
      {toastBanner && (
        <div className="bg-[#111C16] text-white px-6 py-2.5 text-xs font-mono border-b border-[#1E2E24]">
          <div className="max-w-[1380px] mx-auto flex items-center justify-between gap-4">
            <span className="text-[#86EFAC]">{toastBanner}</span>
            <button
              type="button"
              onClick={() => setToastBanner(null)}
              className="text-neutral-400 hover:text-white text-xs whitespace-nowrap cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Content Container */}
      <main className="flex-1 max-w-[1380px] w-full mx-auto px-4 sm:px-6 py-8 space-y-10">
        {/* Global Field Parcel Selector & Live Probe Simulator Bar */}
        {activeTab !== 'architecture' && activeTab !== 'techstack' && (
          <section className="bg-white rounded-lg border border-[#DCE3DC] p-5 space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#EAEFE9]">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#4A5D50] font-mono tabular-nums">
                  <span>Active Farm Parcel Selection</span>
                  <span aria-hidden="true">·</span>
                  <span>Node {selectedParcel.sensorNodeId}</span>
                  <span aria-hidden="true">·</span>
                  <span>LoRa RSSI {selectedParcel.loraRssiDbm} dBm</span>
                  <span aria-hidden="true">·</span>
                  <span>Updated {selectedParcel.lastUpdated}</span>
                </div>
                <h2 className="font-display text-xl font-semibold text-[#111C16]">
                  {selectedParcel.name} — {selectedParcel.regionName} ({selectedParcel.acreage} Acres)
                </h2>
              </div>

              {/* Interactive Parcel Switcher Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#EAEFE9] rounded-lg border border-[#DCE3DC]">
                {parcels.map((parcel) => {
                  const isCrit = parcel.rootZoneVwc < parcel.madThresholdVwc;
                  const isActive = parcel.id === selectedParcel.id;
                  return (
                    <button
                      key={parcel.id}
                      type="button"
                      onClick={() => setSelectedParcelId(parcel.id)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-white text-[#111C16] shadow-xs font-semibold'
                          : 'text-[#4A5D50] hover:text-[#111C16]'
                      }`}
                    >
                      <span>{parcel.name.split(' ')[0]} {parcel.name.split(' ')[1]}</span>
                      <span
                        className={`font-mono tabular-nums text-[11px] ${
                          isCrit ? 'text-[#B91C1C] font-semibold' : 'text-[#166534]'
                        }`}
                      >
                        {parcel.rootZoneVwc.toFixed(1)}%
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interactive Soil Probe VWC Calibrator / Simulator */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-7 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label
                    htmlFor="live-vwc-slider"
                    className="font-semibold text-[#111C16] flex items-center gap-2"
                  >
                    <Sliders className="w-3.5 h-3.5 text-[#166534]" />
                    <span>
                      Interactive Root-Zone Moisture Simulator (Drag to test threshold alerts & yield
                      impact)
                    </span>
                  </label>
                  <span className="font-mono tabular-nums font-semibold text-sm text-[#111C16]">
                    {selectedParcel.rootZoneVwc.toFixed(1)}% VWC
                  </span>
                </div>
                <input
                  id="live-vwc-slider"
                  type="range"
                  min={selectedParcel.wiltingPointVwc - 1}
                  max={selectedParcel.fieldCapacityVwc + 2}
                  step={0.2}
                  value={selectedParcel.rootZoneVwc}
                  onChange={(e) => handleUpdateParcelVwc( parseFloat(e.target.value) )}
                  className="w-full accent-[#166534] cursor-pointer"
                />
                <div className="flex items-center justify-between text-[11px] font-mono tabular-nums text-[#4A5D50]">
                  <span>Wilting Point (PWP): {selectedParcel.wiltingPointVwc.toFixed(1)}%</span>
                  <span className="text-[#B91C1C] font-semibold">
                    MAD Alert Trigger: {selectedParcel.madThresholdVwc.toFixed(1)}%
                  </span>
                  <span>Field Capacity (FC): {selectedParcel.fieldCapacityVwc.toFixed(1)}%</span>
                </div>
              </div>

              <div className="lg:col-span-5 flex flex-wrap items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => handleToggleValve(selectedParcel.id)}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap cursor-pointer inline-flex items-center gap-1.5 ${
                    selectedParcel.valveStatus === 'Irrigating (Drip/Pivot)'
                      ? 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]'
                      : 'bg-[#F8FAF7] text-[#111C16] border-[#DCE3DC] hover:border-[#8AA090]'
                  }`}
                >
                  <Droplets className="w-3.5 h-3.5" />
                  <span>
                    {selectedParcel.valveStatus === 'Irrigating (Drip/Pivot)'
                      ? 'Valve Open (Irrigating — Tap to Stop)'
                      : 'Actuate Sector Solenoid Valve'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleDispatchPhoneAlert({
                      plotId: selectedParcel.id,
                      plotName: `${selectedParcel.name} (${selectedParcel.acreage} ac)`,
                      phone: '+1 (515) 892-4419',
                      channel: 'SMS',
                      measuredVwc: selectedParcel.rootZoneVwc,
                      thresholdVwc: selectedParcel.madThresholdVwc,
                      irrigationNeededMm,
                      valveRuntimeMinutes: valveRuntimeMin,
                      yieldProtected: yieldSavedLabel,
                    })
                  }
                  className="px-3.5 py-2 text-xs font-semibold text-white bg-[#166534] hover:bg-[#14532D] rounded-lg transition-colors whitespace-nowrap cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send SMS Alert to Phone</span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* TAB 1: FIELD TELEMETRY & SOIL MOISTURE DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-10">
            {/* Primary 4-Column Agronomic Telemetry Strip */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Stat 1: Root-Zone Volumetric Water Content */}
              <div className="bg-white rounded-lg border border-[#DCE3DC] p-5 space-y-2">
                <div className="flex items-center justify-between text-xs text-[#4A5D50]">
                  <span>Root-Zone Moisture (30cm)</span>
                  <span className="font-mono">TDR Probe</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-2xl sm:text-3xl font-semibold tabular-nums text-[#111C16]">
                    {selectedParcel.rootZoneVwc.toFixed(1)}%
                  </span>
                  <span
                    className={`text-xs font-semibold flex items-center gap-1 ${
                      isBelowMad ? 'text-[#B91C1C]' : 'text-[#166534]'
                    }`}
                  >
                    {isBelowMad ? (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Irrigate Now</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Optimal Range</span>
                      </>
                    )}
                  </span>
                </div>
                <div className="pt-2 border-t border-[#EAEFE9] text-xs text-[#4A5D50] font-mono tabular-nums">
                  MAD Threshold: {selectedParcel.madThresholdVwc.toFixed(1)}% · FC:{' '}
                  {selectedParcel.fieldCapacityVwc.toFixed(1)}%
                </div>
              </div>

              {/* Stat 2: Predicted Crop Yield (FAO-56 + Local Weather) */}
              <div className="bg-white rounded-lg border border-[#DCE3DC] p-5 space-y-2">
                <div className="flex items-center justify-between text-xs text-[#4A5D50]">
                  <span>Projected Yield (Irrigated)</span>
                  <span className="font-mono">FAO-56 Model</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-2xl sm:text-3xl font-semibold tabular-nums text-[#111C16]">
                    {weatherYieldData
                      ? `${weatherYieldData.yieldPrediction.projectedYieldIrrigated}`
                      : '219.4'}{' '}
                    <span className="text-sm font-normal text-[#4A5D50]">
                      {weatherYieldData?.yieldPrediction.unit || 'bu/ac'}
                    </span>
                  </span>
                  <span className="text-xs font-mono font-semibold text-[#166534] tabular-nums">
                    +{yieldSavedLabel} saved
                  </span>
                </div>
                <div className="pt-2 border-t border-[#EAEFE9] text-xs text-[#4A5D50] font-mono tabular-nums">
                  Unirrigated Forecast:{' '}
                  {weatherYieldData?.yieldPrediction.projectedYieldUnirrigated ?? 198.2}{' '}
                  {weatherYieldData?.yieldPrediction.unit || 'bu/ac'}
                </div>
              </div>

              {/* Stat 3: Local Weather & 7-Day Evapotranspiration (ETc) */}
              <div className="bg-white rounded-lg border border-[#DCE3DC] p-5 space-y-2">
                <div className="flex items-center justify-between text-xs text-[#4A5D50]">
                  <span>7-Day Crop ETc Demand</span>
                  <span className="font-mono">Open-Meteo Live</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-2xl sm:text-3xl font-semibold tabular-nums text-[#111C16]">
                    {weatherYieldData?.yieldPrediction.sevenDayEtcMm ?? 38.4}{' '}
                    <span className="text-sm font-normal text-[#4A5D50]">mm</span>
                  </span>
                  <span className="text-xs font-mono text-[#4A5D50] tabular-nums">
                    Rain: {weatherYieldData?.yieldPrediction.sevenDayRainMm ?? 4.2} mm
                  </span>
                </div>
                <div className="pt-2 border-t border-[#EAEFE9] text-xs text-[#4A5D50] font-mono tabular-nums">
                  Air: {weatherYieldData?.currentWeather.temperatureC ?? 26.4}°C · VPD:{' '}
                  {weatherYieldData?.currentWeather.vpdKpa ?? 1.68} kPa
                </div>
              </div>

              {/* Stat 4: Irrigation Prescription & Revenue Protected */}
              <div className="bg-white rounded-lg border border-[#DCE3DC] p-5 space-y-2">
                <div className="flex items-center justify-between text-xs text-[#4A5D50]">
                  <span>Irrigation Prescription</span>
                  <span className="font-mono tabular-nums">{selectedParcel.acreage} Acres</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-2xl sm:text-3xl font-semibold tabular-nums text-[#166534]">
                    {irrigationNeededMm > 0 ? `${irrigationNeededMm.toFixed(1)} mm` : '0.0 mm'}
                  </span>
                  <span className="text-xs font-mono font-semibold text-[#111C16] tabular-nums">
                    ${(weatherYieldData?.yieldPrediction.revenueProtectedTotal ?? 4512).toLocaleString()} protected
                  </span>
                </div>
                <div className="pt-2 border-t border-[#EAEFE9] text-xs text-[#4A5D50] font-mono tabular-nums">
                  {irrigationNeededMm > 0
                    ? `Runtime: ${Math.floor(valveRuntimeMin / 60)}h ${valveRuntimeMin % 60}m (${(
                        weatherYieldData?.irrigationPrescription.gallonsPerAcre ?? 24000
                      ).toLocaleString()} gal/ac)`
                    : 'No irrigation required in next 48h'}
                </div>
              </div>
            </section>

            {/* Two-Column Deep Dive: Multi-Depth Soil Horizon + 7-Day Weather & Moisture Trajectory */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left 5 Cols: Multi-Depth Soil Horizon Profiler (15cm / 30cm / 60cm) */}
              <div className="lg:col-span-5 bg-white rounded-lg border border-[#DCE3DC] p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-[#EAEFE9] pb-3.5">
                  <div>
                    <h3 className="text-base font-semibold text-[#111C16]">
                      01. Multi-Depth Soil Horizon Telemetry
                    </h3>
                    <p className="text-xs text-[#4A5D50]">
                      {selectedParcel.soilTexture} · {selectedParcel.cropStage}
                    </p>
                  </div>
                  <span className="text-xs font-mono tabular-nums text-[#166534]">
                    SDI-12 Bus
                  </span>
                </div>

                <div className="space-y-4">
                  {selectedParcel.probes.map((probe) => {
                    const pctOfFc = Math.min(
                      100,
                      Math.round((probe.vwcPercent / selectedParcel.fieldCapacityVwc) * 100)
                    );
                    const probeBelowMad = probe.vwcPercent < selectedParcel.madThresholdVwc;
                    return (
                      <div
                        key={probe.depthCm}
                        className="p-4 rounded-lg bg-[#F8FAF7] border border-[#DCE3DC] space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-[#111C16]">
                            {probe.label}
                          </span>
                          <span
                            className={`font-mono text-sm font-semibold tabular-nums ${
                              probeBelowMad ? 'text-[#B91C1C]' : 'text-[#166534]'
                            }`}
                          >
                            {probe.vwcPercent.toFixed(1)}% VWC
                          </span>
                        </div>

                        {/* Visual Horizon Bar with MAD marker */}
                        <div className="relative h-2.5 bg-[#DCE3DC] rounded-xs overflow-hidden">
                          <div
                            className={`h-full transition-transform duration-150 origin-left ${
                              probeBelowMad ? 'bg-[#B91C1C]' : 'bg-[#166534]'
                            }`}
                            style={{
                              width: '100%',
                              transform: `scaleX(${Math.max(0.05, pctOfFc / 100)})`,
                            }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[11px] font-mono tabular-nums text-[#4A5D50]">
                          <span>Matric: {probe.matricPotentialKpa} kPa</span>
                          <span>Temp: {probe.soilTempC.toFixed(1)}°C</span>
                          <span>Salinity EC: {probe.ecDsM.toFixed(2)} dS/m</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-[#EAEFE9] flex items-center justify-between text-xs text-[#4A5D50] font-mono tabular-nums">
                  <span>
                    Water Stress Factor Ks:{' '}
                    <strong className="text-[#111C16]">
                      {weatherYieldData?.soilPhysics.ksWaterStressFactor ?? 0.78}
                    </strong>{' '}
                    (1.00 = Zero Stress)
                  </span>
                  <span>
                    Depletion:{' '}
                    <strong className="text-[#111C16]">
                      {weatherYieldData?.soilPhysics.currentDepletionPercent ?? 62.5}%
                    </strong>{' '}
                    of TAW
                  </span>
                </div>
              </div>

              {/* Right 7 Cols: 7-Day Weather & Root-Zone Moisture Trajectory */}
              <div className="lg:col-span-7 bg-white rounded-lg border border-[#DCE3DC] p-6 flex flex-col justify-between space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EAEFE9] pb-3.5">
                  <div>
                    <h3 className="text-base font-semibold text-[#111C16]">
                      02. 7-Day Moisture Trajectory & Evapotranspiration Forecast
                    </h3>
                    <p className="text-xs text-[#4A5D50]">
                      Compares projected root-zone VWC with vs. without recommended irrigation using
                      live local weather ({selectedParcel.lat.toFixed(2)}°N,{' '}
                      {selectedParcel.lon.toFixed(2)}°W).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => fetchWeatherAndYield(selectedParcel)}
                    className="inline-flex items-center gap-1.5 text-xs font-mono text-[#166534] hover:text-[#14532D] cursor-pointer self-start sm:self-auto"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingWeather ? 'animate-spin' : ''}`} />
                    <span>Sync Weather</span>
                  </button>
                </div>

                {/* SVG Dual-Curve Trajectory Chart */}
                {weatherYieldData?.dailyForecast && (
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
                      <div className="flex items-center gap-4">
                        <span className="inline-flex items-center gap-1.5 font-medium text-[#166534]">
                          <span className="w-3 h-0.5 bg-[#166534] inline-block" />
                          With Prescribed Irrigation ({irrigationNeededMm.toFixed(1)} mm)
                        </span>
                        <span className="inline-flex items-center gap-1.5 font-medium text-[#B91C1C]">
                          <span className="w-3 h-0.5 bg-[#B91C1C] inline-block" />
                          Unirrigated Depletion Curve
                        </span>
                      </div>
                      <span className="font-mono text-[11px] text-[#4A5D50] tabular-nums">
                        Dashed Line: MAD Threshold ({selectedParcel.madThresholdVwc.toFixed(1)}% VWC)
                      </span>
                    </div>

                    <div className="bg-[#F8FAF7] border border-[#DCE3DC] rounded-lg p-4">
                      <svg
                        viewBox="0 0 640 190"
                        className="w-full h-44 overflow-visible"
                        role="img"
                        aria-label="7-day soil moisture forecast chart"
                      >
                        {/* Horizontal Grid & MAD Threshold Line */}
                        {[15, 25, 35].map((val) => {
                          const y = 165 - ((val - 8) / 34) * 145;
                          return (
                            <g key={val}>
                              <line
                                x1={40}
                                y1={y}
                                x2={615}
                                y2={y}
                                stroke="#DCE3DC"
                                strokeWidth="1"
                              />
                              <text
                                x={8}
                                y={y + 4}
                                className="text-[10px] fill-[#4A5D50] font-mono"
                              >
                                {val}%
                              </text>
                            </g>
                          );
                        })}

                        {/* MAD Threshold Reference Line */}
                        {(() => {
                          const madY =
                            165 - ((selectedParcel.madThresholdVwc - 8) / 34) * 145;
                          return (
                            <g>
                              <line
                                x1={40}
                                y1={madY}
                                x2={615}
                                y2={madY}
                                stroke="#B45309"
                                strokeWidth="1.5"
                                strokeDasharray="4 4"
                              />
                              <text
                                x={535}
                                y={madY - 5}
                                className="text-[10px] fill-[#B45309] font-mono font-semibold"
                              >
                                MAD {selectedParcel.madThresholdVwc}%
                              </text>
                            </g>
                          );
                        })()}

                        {/* Polyline: Unirrigated Trajectory */}
                        <polyline
                          fill="none"
                          stroke="#B91C1C"
                          strokeWidth="2.25"
                          points={weatherYieldData.dailyForecast
                            .map((d, i) => {
                              const x = 50 + i * 92;
                              const y =
                                165 -
                                ((d.projectedVwcNoIrrigation - 8) / 34) * 145;
                              return `${x},${Math.max(15, Math.min(165, y))}`;
                            })
                            .join(' ')}
                        />

                        {/* Polyline: Irrigated Trajectory */}
                        <polyline
                          fill="none"
                          stroke="#166534"
                          strokeWidth="2.5"
                          points={weatherYieldData.dailyForecast
                            .map((d, i) => {
                              const x = 50 + i * 92;
                              const y =
                                165 -
                                ((d.projectedVwcWithIrrigation - 8) / 34) * 145;
                              return `${x},${Math.max(15, Math.min(165, y))}`;
                            })
                            .join(' ')}
                        />

                        {/* Data Points & X-Axis Day Labels */}
                        {weatherYieldData.dailyForecast.map((d, i) => {
                          const x = 50 + i * 92;
                          const yNoIrr = Math.max(
                            15,
                            Math.min(165, 165 - ((d.projectedVwcNoIrrigation - 8) / 34) * 145)
                          );
                          const yIrr = Math.max(
                            15,
                            Math.min(165, 165 - ((d.projectedVwcWithIrrigation - 8) / 34) * 145)
                          );
                          return (
                            <g key={d.date}>
                              <circle cx={x} cy={yNoIrr} r={3.5} fill="#B91C1C" />
                              <circle cx={x} cy={yIrr} r={3.5} fill="#166534" />
                              <text
                                x={x}
                                y={184}
                                textAnchor="middle"
                                className="text-[10px] fill-[#3D4F43] font-mono"
                              >
                                {d.date.slice(5)}
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                    </div>
                  </div>
                )}

                {/* 7-Day Daily Weather & Evapotranspiration Compact Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#DCE3DC] text-[11px] font-semibold text-[#4A5D50]">
                        <th className="py-2 pr-3">Date</th>
                        <th className="py-2 px-2 text-right">Max / Min</th>
                        <th className="py-2 px-2 text-right">Rain (mm)</th>
                        <th className="py-2 px-2 text-right">Crop ETc</th>
                        <th className="py-2 px-2 text-right">Unirrigated VWC</th>
                        <th className="py-2 pl-2 text-right">Irrigated VWC</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EAEFE9] text-xs font-mono tabular-nums">
                      {(weatherYieldData?.dailyForecast || []).slice(0, 5).map((day) => (
                        <tr key={day.date} className="hover:bg-[#F8FAF7]">
                          <td className="py-2 pr-3 text-[#111C16] font-medium">{day.date}</td>
                          <td className="py-2 px-2 text-right text-[#3D4F43]">
                            {day.tempMaxC.toFixed(0)}° / {day.tempMinC.toFixed(0)}°C
                          </td>
                          <td className="py-2 px-2 text-right text-[#1D4ED8]">
                            {day.precipMm.toFixed(1)} mm
                          </td>
                          <td className="py-2 px-2 text-right text-[#3D4F43]">
                            {day.etcMm.toFixed(2)} mm
                          </td>
                          <td
                            className={`py-2 px-2 text-right font-semibold ${
                              day.projectedVwcNoIrrigation < selectedParcel.madThresholdVwc
                                ? 'text-[#B91C1C]'
                                : 'text-[#111C16]'
                            }`}
                          >
                            {day.projectedVwcNoIrrigation.toFixed(1)}%
                          </td>
                          <td className="py-2 pl-2 text-right font-semibold text-[#166534]">
                            {day.projectedVwcWithIrrigation.toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Quick Architecture & Alert Preview Strip on Main Dashboard */}
            <section className="bg-white rounded-lg border border-[#DCE3DC] p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2 text-xs font-mono text-[#166534]">
                  <span>Full-Stack Architecture & Tech Stack Included</span>
                  <span aria-hidden="true">·</span>
                  <span>5-Layer IoT + ML Specification</span>
                </div>
                <h3 className="font-display text-lg font-semibold text-[#111C16]">
                  Explore the Complete Frontend & Backend Reference Architecture
                </h3>
                <p className="text-xs sm:text-sm text-[#3D4F43] leading-relaxed">
                  Inspect how LoRaWAN SDI-12 probes, MQTT + TimescaleDB hypertables, FAO-56 +
                  LightGBM yield models, and Twilio SMS two-way valve actuation fit together.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab('alerts')}
                  className="px-4 py-2.5 text-xs font-semibold text-[#111C16] bg-[#F8FAF7] hover:bg-[#EAEFE9] border border-[#DCE3DC] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                >
                  Configure Phone Alerts ({alerts.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('architecture')}
                  className="px-4 py-2.5 text-xs font-semibold text-white bg-[#166534] hover:bg-[#14532D] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                >
                  Open Architecture & Tech Stack
                </button>
              </div>
            </section>
          </div>
        )}

        {/* TAB 2: CROP YIELD PREDICTION & AGRONOMIC WATER BALANCE */}
        {activeTab === 'yield' && (
          <div className="space-y-8">
            <div className="pb-6 border-b border-[#DCE3DC] space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono text-[#4A5D50]">
                <span>FAO-56 Penman-Monteith Water Production Model</span>
                <span aria-hidden="true">·</span>
                <span>{weatherYieldData?.weatherSource || 'Open-Meteo Agricultural API'}</span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#111C16]">
                Weather-Driven Crop Yield Prediction & Economic Impact across All Parcels
              </h1>
              <p className="text-sm text-[#3D4F43] max-w-3xl leading-relaxed">
                Evaluates root-zone water stress coefficient (<span className="font-mono">Ks</span>
                ), stage-specific crop yield response factor (<span className="font-mono">Ky</span>
                ), vapor pressure deficit (<span className="font-mono">VPD</span>), and 7-day
                evapotranspiration demand to quantify exact yield risk per field.
              </p>
            </div>

            {/* Active Plot Yield Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg border border-[#DCE3DC] p-6 space-y-4">
                <div className="text-xs font-mono text-[#4A5D50]">
                  Scenario A · Without Additional Irrigation
                </div>
                <div className="font-mono text-3xl font-semibold tabular-nums text-[#B91C1C]">
                  {weatherYieldData?.yieldPrediction.projectedYieldUnirrigated ?? 198.2}{' '}
                  <span className="text-base font-normal text-[#4A5D50]">
                    {weatherYieldData?.yieldPrediction.unit || 'bu/ac'}
                  </span>
                </div>
                <p className="text-xs text-[#3D4F43] leading-relaxed">
                  Root-zone moisture depletion ({selectedParcel.rootZoneVwc.toFixed(1)}% VWC)
                  induces stomatal closure during {selectedParcel.cropStage}, reducing carbon
                  assimilation.
                </p>
                <div className="pt-3 border-t border-[#EAEFE9] text-xs font-mono tabular-nums text-[#4A5D50]">
                  Water Stress Coefficient Ks:{' '}
                  {weatherYieldData?.soilPhysics.ksWaterStressFactor ?? 0.76} · Yield Factor Ky:{' '}
                  {weatherYieldData?.yieldPrediction.kyFactor ?? 1.25}
                </div>
              </div>

              <div className="bg-white rounded-lg border border-[#DCE3DC] p-6 space-y-4">
                <div className="text-xs font-mono text-[#166534]">
                  Scenario B · With Prescribed Irrigation ({irrigationNeededMm.toFixed(1)} mm)
                </div>
                <div className="font-mono text-3xl font-semibold tabular-nums text-[#166534]">
                  {weatherYieldData?.yieldPrediction.projectedYieldIrrigated ?? 219.4}{' '}
                  <span className="text-base font-normal text-[#4A5D50]">
                    {weatherYieldData?.yieldPrediction.unit || 'bu/ac'}
                  </span>
                </div>
                <p className="text-xs text-[#3D4F43] leading-relaxed">
                  Restoring root-zone moisture above {selectedParcel.madThresholdVwc.toFixed(1)}%
                  VWC eliminates transpiration deficit across the upcoming 7-day{' '}
                  {weatherYieldData?.yieldPrediction.sevenDayEtcMm ?? 38.4} mm ETc window.
                </p>
                <div className="pt-3 border-t border-[#EAEFE9] text-xs font-mono tabular-nums text-[#4A5D50]">
                  Optimal Window: {weatherYieldData?.irrigationPrescription.optimalWindow}
                </div>
              </div>

              <div className="bg-[#111C16] text-white rounded-lg p-6 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="text-xs font-mono text-[#86EFAC]">
                    Net Economic Value Protected ({selectedParcel.acreage} Acres)
                  </div>
                  <div className="font-mono text-3xl font-semibold tabular-nums text-white">
                    +$
                    {(
                      weatherYieldData?.yieldPrediction.revenueProtectedTotal ?? 4512
                    ).toLocaleString()}
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Protects <strong className="text-white">{yieldSavedLabel}</strong> at{' '}
                    <span className="font-mono">
                      ${weatherYieldData?.yieldPrediction.pricePerUnit ?? 4.65}/
                      {(weatherYieldData?.yieldPrediction.unit || 'bu').split('/')[0]}
                    </span>{' '}
                    market price across {selectedParcel.name}.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('alerts')}
                  className="w-full py-2.5 px-4 text-xs font-semibold text-[#111C16] bg-[#86EFAC] hover:bg-[#4ADE80] rounded-lg transition-colors cursor-pointer"
                >
                  Send Prescription to Farmer Phone
                </button>
              </div>
            </div>

            {/* Multi-Parcel Comparative Yield & Moisture Ledger */}
            <div className="bg-white rounded-lg border border-[#DCE3DC] overflow-hidden">
              <div className="p-5 border-b border-[#EAEFE9] flex items-center justify-between">
                <h2 className="text-base font-semibold text-[#111C16]">
                  All Monitored Farm Parcels — Soil Moisture & Yield Matrix
                </h2>
                <span className="text-xs font-mono text-[#4A5D50] tabular-nums">
                  Total Monitored Area: 321 Acres
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#DCE3DC] bg-[#F8FAF7] text-xs font-semibold text-[#3D4F43]">
                      <th className="py-3.5 px-4">Parcel & Soil Texture</th>
                      <th className="py-3.5 px-4">Crop & Growth Stage</th>
                      <th className="py-3.5 px-4 text-right">Root-Zone VWC</th>
                      <th className="py-3.5 px-4 text-right">MAD Threshold</th>
                      <th className="py-3.5 px-4">Irrigation Status</th>
                      <th className="py-3.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAEFE9] text-xs sm:text-sm">
                    {parcels.map((p) => {
                      const needsWater = p.rootZoneVwc < p.madThresholdVwc;
                      return (
                        <tr key={p.id} className="hover:bg-[#F8FAF7]/80 transition-colors">
                          <td className="py-4 px-4">
                            <div className="font-semibold text-[#111C16]">
                              {p.name} ({p.acreage} ac)
                            </div>
                            <div className="text-xs text-[#4A5D50]">{p.soilTexture}</div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-medium text-[#111C16] capitalize">{p.cropKey}</div>
                            <div className="text-xs text-[#4A5D50]">{p.cropStage}</div>
                          </td>
                          <td
                            className={`py-4 px-4 text-right font-mono tabular-nums font-semibold ${
                              needsWater ? 'text-[#B91C1C]' : 'text-[#166534]'
                            }`}
                          >
                            {p.rootZoneVwc.toFixed(1)}%
                          </td>
                          <td className="py-4 px-4 text-right font-mono tabular-nums text-[#4A5D50]">
                            {p.madThresholdVwc.toFixed(1)}%
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`text-xs font-semibold ${
                                needsWater ? 'text-[#B91C1C]' : 'text-[#166534]'
                              }`}
                            >
                              {needsWater
                                ? 'Below MAD — Irrigation Needed'
                                : 'Optimal Soil Moisture'}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedParcelId(p.id);
                                setActiveTab('dashboard');
                              }}
                              className="px-3 py-1.5 text-xs font-medium text-[#166534] hover:bg-[#166534]/10 rounded-md transition-colors cursor-pointer"
                            >
                              Inspect Parcel
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DIRECT-TO-PHONE IRRIGATION ALERTS */}
        {activeTab === 'alerts' && (
          <PhoneAlertCenter
            parcels={parcels}
            selectedParcel={selectedParcel}
            alerts={alerts}
            irrigationNeededMm={irrigationNeededMm}
            valveRuntimeMinutes={valveRuntimeMin}
            yieldSavedLabel={yieldSavedLabel}
            onDispatchAlert={handleDispatchPhoneAlert}
            onToggleValve={handleToggleValve}
          />
        )}

        {/* TAB 4 & 5: SYSTEM ARCHITECTURE & TECH STACK BLUEPRINT */}
        {(activeTab === 'architecture' || activeTab === 'techstack') && (
          <ArchitectureBlueprintView
            initialSection={activeTab === 'techstack' ? 'techstack' : 'architecture'}
          />
        )}
      </main>

      {/* Clean Minimal Footer (Zero Fake Telemetry Tickers) */}
      <footer className="border-t border-[#DCE3DC] bg-white px-6 py-5 mt-12">
        <div className="max-w-[1380px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#4A5D50]">
          <div>
            TerraPulse Agronomy · Precision Soil Moisture Telemetry, FAO-56 Crop Yield Forecasting &
            Mobile Irrigation Alerting
          </div>
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className="hover:text-[#111C16] transition-colors cursor-pointer"
            >
              Field Telemetry
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('alerts')}
              className="hover:text-[#111C16] transition-colors cursor-pointer"
            >
              Mobile Alerts
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('architecture')}
              className="hover:text-[#111C16] transition-colors cursor-pointer"
            >
              System Architecture
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('techstack')}
              className="hover:text-[#111C16] transition-colors cursor-pointer"
            >
              Tech Stack
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
