import React, { useState } from 'react';
import { FieldParcel } from '../data/farmData';
import { DispatchedAlertRecord } from '../../server';
import { Send, Smartphone, CheckCircle2, AlertTriangle, Search } from 'lucide-react';

interface PhoneAlertCenterProps {
  parcels: FieldParcel[];
  selectedParcel: FieldParcel;
  alerts: DispatchedAlertRecord[];
  irrigationNeededMm: number;
  valveRuntimeMinutes: number;
  yieldSavedLabel: string;
  onDispatchAlert: (payload: {
    plotId: string;
    plotName: string;
    phone: string;
    channel: 'SMS' | 'WhatsApp' | 'Push Notification';
    measuredVwc: number;
    thresholdVwc: number;
    irrigationNeededMm: number;
    valveRuntimeMinutes: number;
    yieldProtected: string;
  }) => Promise<void>;
  onToggleValve: (parcelId: string) => void;
}

export const PhoneAlertCenter: React.FC<PhoneAlertCenterProps> = ({
  parcels,
  selectedParcel,
  alerts,
  irrigationNeededMm,
  valveRuntimeMinutes,
  yieldSavedLabel,
  onDispatchAlert,
  onToggleValve,
}) => {
  const [phoneInput, setPhoneInput] = useState('+1 (515) 892-4419');
  const [channel, setChannel] = useState<'SMS' | 'WhatsApp' | 'Push Notification'>('SMS');
  const [rainSuppressionMm, setRainSuppressionMm] = useState(10);
  const [hysteresisHours, setHysteresisHours] = useState(6);
  const [isSending, setIsSending] = useState(false);
  const [filterChannel, setFilterChannel] = useState<'All' | 'SMS' | 'WhatsApp' | 'Push Notification'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [smsReplyStatus, setSmsReplyStatus] = useState<string | null>(null);

  const effectiveIrrigationMm = irrigationNeededMm > 0 ? irrigationNeededMm : 18.5;
  const effectiveRuntimeMin = valveRuntimeMinutes > 0 ? valveRuntimeMinutes : 148;

  const previewMessage = `[TerraPulse] ${
    selectedParcel.rootZoneVwc < selectedParcel.madThresholdVwc
      ? 'URGENT IRRIGATION'
      : 'FIELD ADVISORY'
  }: ${selectedParcel.name} root-zone moisture at ${selectedParcel.rootZoneVwc.toFixed(
    1
  )}% VWC (Target MAD: ${selectedParcel.madThresholdVwc.toFixed(
    1
  )}%). Apply ${effectiveIrrigationMm.toFixed(1)}mm (${Math.floor(
    effectiveRuntimeMin / 60
  )}h ${effectiveRuntimeMin % 60}m runtime) to protect ${yieldSavedLabel} projected yield. Reply START to actuate solenoid valve.`;

  const handleSendAlertNow = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    try {
      await onDispatchAlert({
        plotId: selectedParcel.id,
        plotName: `${selectedParcel.name} (${selectedParcel.acreage} ac)`,
        phone: phoneInput,
        channel,
        measuredVwc: selectedParcel.rootZoneVwc,
        thresholdVwc: selectedParcel.madThresholdVwc,
        irrigationNeededMm: effectiveIrrigationMm,
        valveRuntimeMinutes: effectiveRuntimeMin,
        yieldProtected: yieldSavedLabel,
      });

      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`TerraPulse ${channel} Dispatched`, {
          body: previewMessage,
        });
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleSimulateSmsReply = () => {
    onToggleValve(selectedParcel.id);
    setSmsReplyStatus(
      selectedParcel.valveStatus === 'Closed'
        ? `Inbound SMS "START" verified — Class C LoRaWAN downlink opened solenoid valve on ${selectedParcel.name}.`
        : `Inbound SMS "STOP" verified — Solenoid valve closed on ${selectedParcel.name}.`
    );
    setTimeout(() => setSmsReplyStatus(null), 5000);
  };

  const filteredAlerts = alerts.filter((a) => {
    const matchesChannel = filterChannel === 'All' || a.channel === filterChannel;
    const matchesSearch =
      searchQuery.trim() === '' ||
      a.plotName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.messageBody.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.phone.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesChannel && matchesSearch;
  });

  const criticalParcelsCount = parcels.filter((p) => p.rootZoneVwc < p.madThresholdVwc).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-6 border-b border-[#DCE3DC]">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 text-xs text-[#4A5D50] font-mono">
            <span>Direct-to-Phone Dispatch Engine</span>
            <span aria-hidden="true">·</span>
            <span>Twilio SMS & WhatsApp Gateway</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{criticalParcelsCount} Plots Below MAD Threshold</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#111C16] tracking-tight">
            Automated Mobile Irrigation Alerts & Valve Actuation
          </h1>
          <p className="text-sm text-[#3D4F43] leading-relaxed">
            Configure threshold triggers that push actionable irrigation prescriptions directly to
            farmer handsets over cellular SMS, WhatsApp, or Web Push when root-zone moisture drops
            below Management Allowed Depletion (MAD).
          </p>
        </div>
      </div>

      {/* Main Two-Column Configuration + Phone Handset Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 7 Cols: Rule Engine & Manual Dispatch Form */}
        <form
          onSubmit={handleSendAlertNow}
          className="lg:col-span-7 bg-white rounded-lg border border-[#DCE3DC] p-6 space-y-6"
        >
          <div className="flex items-center justify-between border-b border-[#EAEFE9] pb-4">
            <div>
              <h2 className="text-base font-semibold text-[#111C16]">
                01. Subscriber & Threshold Rule Configuration
              </h2>
              <p className="text-xs text-[#4A5D50] mt-0.5">
                Active target plot: <strong className="text-[#111C16]">{selectedParcel.name}</strong>{' '}
                ({selectedParcel.sensorNodeId})
              </p>
            </div>
            <div className="text-xs font-mono tabular-nums text-[#166534]">
              SLA: &lt; 4.5s Delivery
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label
                htmlFor="farmer-phone"
                className="block text-xs font-semibold text-[#111C16]"
              >
                Farmer Mobile Number (E.164 / US)
              </label>
              <input
                id="farmer-phone"
                type="tel"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                className="w-full px-3.5 py-2 text-sm font-mono tabular-nums bg-[#F8FAF7] border border-[#DCE3DC] rounded-lg focus:outline-none focus:border-[#166534]"
                placeholder="+1 (515) 892-4419"
                required
              />
              <p className="text-[11px] text-[#4A5D50]">
                Receives instant depletion alerts and supports two-way SMS valve commands.
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="block text-xs font-semibold text-[#111C16]">
                Primary Delivery Channel
              </span>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#EAEFE9] rounded-lg border border-[#DCE3DC]">
                {(['SMS', 'WhatsApp', 'Push Notification'] as const).map((ch) => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => setChannel(ch)}
                    className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap truncate cursor-pointer ${
                      channel === ch
                        ? 'bg-white text-[#111C16] shadow-xs'
                        : 'text-[#4A5D50] hover:text-[#111C16]'
                    }`}
                  >
                    {ch === 'Push Notification' ? 'Web Push' : ch}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-[#4A5D50]">
                SMS recommended for rural fields with 2G-only cellular signal.
              </p>
            </div>
          </div>

          {/* Smart Guardrail Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-[#EAEFE9]">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="rain-guard" className="font-semibold text-[#111C16]">
                  Pre-Rain Alert Suppression
                </label>
                <span className="font-mono tabular-nums text-[#166534] font-semibold">
                  &ge; {rainSuppressionMm} mm / 24h
                </span>
              </div>
              <input
                id="rain-guard"
                type="range"
                min={4}
                max={25}
                step={1}
                value={rainSuppressionMm}
                onChange={(e) => setRainSuppressionMm(Number(e.target.value))}
                className="w-full accent-[#166534] cursor-pointer"
              />
              <p className="text-[11px] text-[#4A5D50]">
                Holds irrigation alerts if local forecast predicts &ge; {rainSuppressionMm}mm rain
                within 24 hours.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="cooldown-guard" className="font-semibold text-[#111C16]">
                  Hysteresis Cooldown Window
                </label>
                <span className="font-mono tabular-nums text-[#166534] font-semibold">
                  {hysteresisHours} hours
                </span>
              </div>
              <input
                id="cooldown-guard"
                type="range"
                min={1}
                max={24}
                step={1}
                value={hysteresisHours}
                onChange={(e) => setHysteresisHours(Number(e.target.value))}
                className="w-full accent-[#166534] cursor-pointer"
              />
              <p className="text-[11px] text-[#4A5D50]">
                Prevents duplicate notifications while soil wetting front percolates to 30cm probe.
              </p>
            </div>
          </div>

          {/* Plot Status Summary Bar */}
          <div className="p-4 bg-[#F8FAF7] rounded-lg border border-[#DCE3DC] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold">
                {selectedParcel.rootZoneVwc < selectedParcel.madThresholdVwc ? (
                  <>
                    <AlertTriangle className="w-4 h-4 text-[#B91C1C] shrink-0" />
                    <span className="text-[#B91C1C]">
                      Threshold Breached: {selectedParcel.rootZoneVwc.toFixed(1)}% VWC is below{' '}
                      {selectedParcel.madThresholdVwc.toFixed(1)}% MAD trigger
                    </span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#166534] shrink-0" />
                    <span className="text-[#166534]">
                      Moisture Adequate: {selectedParcel.rootZoneVwc.toFixed(1)}% VWC (Trigger:{' '}
                      {selectedParcel.madThresholdVwc.toFixed(1)}%)
                    </span>
                  </>
                )}
              </div>
              <div className="text-xs text-[#4A5D50] font-mono tabular-nums">
                Prescription: {effectiveIrrigationMm.toFixed(1)} mm · Runtime: {effectiveRuntimeMin}{' '}
                mins · Valve: {selectedParcel.valveStatus}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#166534] hover:bg-[#14532D] disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSending ? 'Dispatching...' : `Dispatch ${channel} Alert Now`}</span>
            </button>
          </div>
        </form>

        {/* Right 5 Cols: Farmer Handset Live SMS Preview & Two-Way Actuation */}
        <div className="lg:col-span-5 bg-[#111C16] text-white rounded-lg p-6 border border-[#1E2E24] flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-xs font-mono text-[#86EFAC]">
                <Smartphone className="w-4 h-4" />
                <span>Farmer Handset Payload Preview ({channel})</span>
              </div>
              <span className="text-xs font-mono text-neutral-400 tabular-nums">{phoneInput}</span>
            </div>

            {/* Simulated SMS Conversation Thread */}
            <div className="space-y-3 py-2">
              <div className="text-[11px] font-mono text-neutral-400 text-center tabular-nums">
                Today · Automated Agronomic Dispatch
              </div>

              <div className="bg-[#1B2B22] border border-[#2D4436] rounded-lg p-4 text-xs sm:text-sm text-neutral-100 leading-relaxed font-mono">
                {previewMessage}
              </div>

              {smsReplyStatus && (
                <div className="bg-[#166534]/30 border border-[#86EFAC]/40 rounded-lg p-3 text-xs text-[#86EFAC] font-mono leading-relaxed">
                  {smsReplyStatus}
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 space-y-3">
            <div className="flex items-center justify-between text-xs text-neutral-300">
              <span>Two-Way SMS Solenoid Actuation</span>
              <span className="font-mono text-[#86EFAC] tabular-nums">
                Valve Status: {selectedParcel.valveStatus}
              </span>
            </div>
            <button
              type="button"
              onClick={handleSimulateSmsReply}
              className="w-full py-2.5 px-4 text-xs font-semibold text-[#111C16] bg-[#86EFAC] hover:bg-[#4ADE80] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              {selectedParcel.valveStatus === 'Closed'
                ? 'Simulate Farmer Replying "START" via SMS (Open Valve)'
                : 'Simulate Farmer Replying "STOP" via SMS (Close Valve)'}
            </button>
          </div>
        </div>
      </div>

      {/* Dispatched Mobile Alert History Table */}
      <section className="bg-white rounded-lg border border-[#DCE3DC] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EAEFE9]">
          <div>
            <h2 className="text-base font-semibold text-[#111C16]">
              02. Dispatched Mobile Alert Log ({filteredAlerts.length})
            </h2>
            <p className="text-xs text-[#4A5D50]">
              Real-time carrier receipts and irrigation prescriptions transmitted to field personnel.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#4A5D50] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search plot or phone..."
                className="pl-8 pr-3 py-1.5 text-xs bg-[#F8FAF7] border border-[#DCE3DC] rounded-lg focus:outline-none focus:border-[#166534]"
              />
            </div>

            <div className="flex items-center p-1 bg-[#EAEFE9] rounded-lg border border-[#DCE3DC]">
              {(['All', 'SMS', 'WhatsApp', 'Push Notification'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFilterChannel(tab)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    filterChannel === tab
                      ? 'bg-white text-[#111C16] shadow-xs'
                      : 'text-[#4A5D50] hover:text-[#111C16]'
                  }`}
                >
                  {tab === 'Push Notification' ? 'Push' : tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredAlerts.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <p className="text-sm text-[#4A5D50]">
              No mobile alerts match the current filter criteria.
            </p>
            <button
              type="button"
              onClick={() => {
                setFilterChannel('All');
                setSearchQuery('');
              }}
              className="px-4 py-2 text-xs font-medium text-[#166534] border border-[#166534] rounded-lg hover:bg-[#166534]/5 transition-colors cursor-pointer"
            >
              Reset Alert Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#DCE3DC] text-xs font-semibold text-[#3D4F43] bg-[#F8FAF7]">
                  <th className="py-3 px-4">Alert ID & Time</th>
                  <th className="py-3 px-4">Field Parcel</th>
                  <th className="py-3 px-4">Recipient & Channel</th>
                  <th className="py-3 px-4 text-right">Measured vs MAD</th>
                  <th className="py-3 px-4 text-right">Prescription</th>
                  <th className="py-3 px-4">Message Payload & Carrier Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAEFE9] text-xs">
                {filteredAlerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-[#F8FAF7]/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono tabular-nums whitespace-nowrap align-top">
                      <div className="font-semibold text-[#111C16]">{alert.id}</div>
                      <div className="text-[#4A5D50]">
                        {new Date(alert.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 align-top">
                      <div className="font-semibold text-[#111C16]">{alert.plotName}</div>
                      <div
                        className={`text-[11px] font-medium mt-0.5 ${
                          alert.severity === 'Critical Depletion'
                            ? 'text-[#B91C1C]'
                            : 'text-[#B45309]'
                        }`}
                      >
                        {alert.severity}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono tabular-nums whitespace-nowrap align-top">
                      <div className="text-[#111C16]">{alert.phone}</div>
                      <div className="text-[#4A5D50]">
                        {alert.channel} · {alert.gatewaySid.slice(0, 10)}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums whitespace-nowrap align-top">
                      <div className="font-semibold text-[#B91C1C]">
                        {alert.measuredVwc.toFixed(1)}% VWC
                      </div>
                      <div className="text-[#4A5D50]">
                        Target: {alert.thresholdVwc.toFixed(1)}%
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums whitespace-nowrap align-top">
                      <div className="font-semibold text-[#166534]">
                        +{alert.irrigationNeededMm.toFixed(1)} mm
                      </div>
                      <div className="text-[#4A5D50]">{alert.valveRuntimeMinutes} min cycle</div>
                    </td>
                    <td className="py-3.5 px-4 max-w-md align-top">
                      <div className="text-[#111C16] font-mono text-[11px] leading-relaxed">
                        {alert.messageBody}
                      </div>
                      <div className="text-[11px] text-[#166534] font-medium mt-1">
                        Status: {alert.deliveryStatus}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
