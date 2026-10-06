export interface DepthProbeReading {
  depthCm: number;
  label: string;
  vwcPercent: number;
  matricPotentialKpa: number;
  soilTempC: number;
  ecDsM: number;
}

export interface FieldParcel {
  id: string;
  name: string;
  regionName: string;
  lat: number;
  lon: number;
  acreage: number;
  soilTexture: string;
  cropKey: 'corn' | 'soybeans' | 'wheat' | 'almonds';
  cropStage: string;
  plantingDate: string;
  fieldCapacityVwc: number;
  wiltingPointVwc: number;
  madPercent: number; // Management Allowed Depletion % of Total Available Water
  madThresholdVwc: number;
  rootZoneVwc: number;
  probes: DepthProbeReading[];
  sensorNodeId: string;
  loraRssiDbm: number;
  batteryVolts: number;
  valveStatus: 'Closed' | 'Irrigating (Drip/Pivot)';
  lastUpdated: string;
}

export const INITIAL_FIELD_PARCELS: FieldParcel[] = [
  {
    id: 'PLOT-NORTH-01',
    name: 'North Ridge Silt Loam',
    regionName: 'Story County, IA',
    lat: 42.0308,
    lon: -93.6319,
    acreage: 84,
    soilTexture: 'Clarion-Nicollet Silt Loam',
    cropKey: 'corn',
    cropStage: 'R1 Silking / Pollination (High Water Sensitivity)',
    plantingDate: 'Apr 24, 2026',
    fieldCapacityVwc: 34.0,
    wiltingPointVwc: 13.5,
    madPercent: 45,
    madThresholdVwc: 24.8,
    rootZoneVwc: 18.4,
    sensorNodeId: 'LORA-IA-014A',
    loraRssiDbm: -84,
    batteryVolts: 3.62,
    valveStatus: 'Closed',
    lastUpdated: '4 mins ago',
    probes: [
      {
        depthCm: 15,
        label: 'Shallow Root Zone (15 cm)',
        vwcPercent: 16.2,
        matricPotentialKpa: -74,
        soilTempC: 23.4,
        ecDsM: 0.84,
      },
      {
        depthCm: 30,
        label: 'Primary Active Root Zone (30 cm)',
        vwcPercent: 18.4,
        matricPotentialKpa: -58,
        soilTempC: 21.6,
        ecDsM: 0.92,
      },
      {
        depthCm: 60,
        label: 'Deep Subsoil Reserve (60 cm)',
        vwcPercent: 20.6,
        matricPotentialKpa: -41,
        soilTempC: 19.8,
        ecDsM: 1.05,
      },
    ],
  },
  {
    id: 'PLOT-WEST-03',
    name: 'West Terrace Sandy Loam',
    regionName: 'Riley County, KS',
    lat: 39.1836,
    lon: -96.5717,
    acreage: 52,
    soilTexture: 'eudora Fine Sandy Loam',
    cropKey: 'wheat',
    cropStage: 'Feekes 10.5 Heading & Grain Fill',
    plantingDate: 'Oct 12, 2025',
    fieldCapacityVwc: 26.0,
    wiltingPointVwc: 10.0,
    madPercent: 50,
    madThresholdVwc: 18.0,
    rootZoneVwc: 16.8,
    sensorNodeId: 'LORA-KS-089C',
    loraRssiDbm: -91,
    batteryVolts: 3.58,
    valveStatus: 'Closed',
    lastUpdated: '9 mins ago',
    probes: [
      {
        depthCm: 15,
        label: 'Shallow Root Zone (15 cm)',
        vwcPercent: 15.1,
        matricPotentialKpa: -62,
        soilTempC: 24.8,
        ecDsM: 0.65,
      },
      {
        depthCm: 30,
        label: 'Primary Active Root Zone (30 cm)',
        vwcPercent: 16.8,
        matricPotentialKpa: -49,
        soilTempC: 22.9,
        ecDsM: 0.71,
      },
      {
        depthCm: 60,
        label: 'Deep Subsoil Reserve (60 cm)',
        vwcPercent: 18.5,
        matricPotentialKpa: -36,
        soilTempC: 20.4,
        ecDsM: 0.78,
      },
    ],
  },
  {
    id: 'PLOT-VALLEY-02',
    name: 'Valley Bottom Silty Clay',
    regionName: 'Boone County, IA',
    lat: 42.0597,
    lon: -93.8802,
    acreage: 120,
    soilTexture: 'Webster Silty Clay Loam',
    cropKey: 'soybeans',
    cropStage: 'R3 Beginning Pod Development',
    plantingDate: 'May 06, 2026',
    fieldCapacityVwc: 38.0,
    wiltingPointVwc: 17.0,
    madPercent: 50,
    madThresholdVwc: 27.5,
    rootZoneVwc: 31.4,
    sensorNodeId: 'LORA-IA-022B',
    loraRssiDbm: -77,
    batteryVolts: 3.68,
    valveStatus: 'Closed',
    lastUpdated: '2 mins ago',
    probes: [
      {
        depthCm: 15,
        label: 'Shallow Root Zone (15 cm)',
        vwcPercent: 29.8,
        matricPotentialKpa: -24,
        soilTempC: 21.9,
        ecDsM: 1.12,
      },
      {
        depthCm: 30,
        label: 'Primary Active Root Zone (30 cm)',
        vwcPercent: 31.4,
        matricPotentialKpa: -19,
        soilTempC: 20.5,
        ecDsM: 1.18,
      },
      {
        depthCm: 60,
        label: 'Deep Subsoil Reserve (60 cm)',
        vwcPercent: 33.0,
        matricPotentialKpa: -14,
        soilTempC: 18.9,
        ecDsM: 1.24,
      },
    ],
  },
  {
    id: 'PLOT-ORCHARD-04',
    name: 'San Joaquin Drip Block B4',
    regionName: 'Fresno County, CA',
    lat: 36.7378,
    lon: -119.7871,
    acreage: 65,
    soilTexture: 'Hanford Coarse Sandy Loam',
    cropKey: 'almonds',
    cropStage: 'Kernel Fill / Pre-Hull Split',
    plantingDate: 'Perennial (Yr 7)',
    fieldCapacityVwc: 28.5,
    wiltingPointVwc: 11.5,
    madPercent: 40,
    madThresholdVwc: 21.7,
    rootZoneVwc: 24.2,
    sensorNodeId: 'LORA-CA-104D',
    loraRssiDbm: -79,
    batteryVolts: 3.65,
    valveStatus: 'Closed',
    lastUpdated: '6 mins ago',
    probes: [
      {
        depthCm: 15,
        label: 'Drip Emitter Zone (15 cm)',
        vwcPercent: 24.9,
        matricPotentialKpa: -21,
        soilTempC: 26.2,
        ecDsM: 1.35,
      },
      {
        depthCm: 30,
        label: 'Primary Feeder Roots (30 cm)',
        vwcPercent: 24.2,
        matricPotentialKpa: -26,
        soilTempC: 24.7,
        ecDsM: 1.28,
      },
      {
        depthCm: 60,
        label: 'Deep Anchor Zone (60 cm)',
        vwcPercent: 23.5,
        matricPotentialKpa: -31,
        soilTempC: 22.8,
        ecDsM: 1.19,
      },
    ],
  },
];

export interface ArchitectureLayerSpec {
  id: string;
  stepNumber: string;
  layerName: string;
  subtitle: string;
  primaryComponents: string[];
  protocolsAndStandards: string;
  latencySla: string;
  description: string;
  engineeringDetails: string[];
  codeArtifactTitle: string;
  codeArtifactLanguage: string;
  codeArtifact: string;
}

export const ARCHITECTURE_LAYERS: ArchitectureLayerSpec[] = [
  {
    id: 'edge-iot',
    stepNumber: '01',
    layerName: 'Edge Soil Sensing & LoRaWAN Telemetry Layer',
    subtitle: 'Multi-depth TDR probes + solar LoRaWAN field nodes operating across 10–15 km rural range',
    primaryComponents: [
      'METER TEROS-12 / Acclima TDR-315N (VWC %, Temp, EC)',
      'STM32WLE5 Ultra-Low-Power LoRaWAN End-Node (Class A)',
      'Kerlink Wirnet iStation Solar LoRaWAN Gateway (LTE-M / Starlink Backhaul)',
      '12V Latching Solenoid Valve Controller (Class C Downlink)',
    ],
    protocolsAndStandards: 'SDI-12 Sensor Bus · LoRaWAN US915/EU868 · CayenneLPP Binary Payload',
    latencySla: '15-min uplink cadence · 8-year LiSOCl2 battery life',
    description:
      'In-field sensors measure Volumetric Water Content (VWC %), soil temperature, and bulk electrical conductivity at 15 cm, 30 cm, and 60 cm depths to capture active root water uptake. Probes communicate over SDI-12 to a weatherproof LoRaWAN transmitter that uplinks 14-byte binary packets to a farm gateway without requiring cellular coverage at each plot.',
    engineeringDetails: [
      'Dielectric permittivity calibration adjusted for soil texture (silt loam vs. sandy loam) using Topp equation.',
      'Local edge ring-buffer stores 14 days of readings in SPI flash if cellular backhaul drops during severe storms.',
      'Downlink Class C multicast window enables remote actuation of drip/pivot latching solenoid valves directly from SMS reply.',
    ],
    codeArtifactTitle: 'LoRaWAN Binary Decoder (ChirpStack / AWS IoT Core)',
    codeArtifactLanguage: 'typescript',
    codeArtifact: `// 14-Byte LoRaWAN Uplink Payload Decoder for Multi-Depth Soil Probe
export function decodeSoilProbeUplink(bytes: Uint8Array) {
  const view = new DataView(bytes.buffer);
  return {
    vwc15cm: Number((view.getUint16(0, false) / 100).toFixed(2)), // e.g., 16.20 %
    vwc30cm: Number((view.getUint16(2, false) / 100).toFixed(2)), // e.g., 18.40 %
    vwc60cm: Number((view.getUint16(4, false) / 100).toFixed(2)), // e.g., 20.60 %
    matricKpa: view.getInt16(6, false) / 10,                      // e.g., -58.0 kPa
    soilTempC: view.getInt16(8, false) / 100,                     // e.g., 21.60 °C
    ecDsM: view.getUint16(10, false) / 100,                       // e.g., 0.92 dS/m
    batteryMv: view.getUint16(12, false),                         // e.g., 3620 mV
  };
}`,
  },
  {
    id: 'ingestion-timeseries',
    stepNumber: '02',
    layerName: 'Backend Ingestion, Stream Processing & Time-Series Storage',
    subtitle: 'MQTT broker, anomaly filtering, and TimescaleDB + PostGIS geospatial hypertables',
    primaryComponents: [
      'EMQX / AWS IoT Core MQTT Broker (TLS 1.3 mTLS)',
      'Node.js / Fastify Ingestion Workers + BullMQ / Redis Streams',
      'TimescaleDB (PostgreSQL 16) for High-Compression Time-Series',
      'PostGIS Extension for Field Parcel Polygons & Soil SSURGO Zones',
    ],
    protocolsAndStandards: 'MQTT v5.0 · PostgreSQL 16 / TimescaleDB · PostGIS GeoJSON',
    latencySla: '< 250 ms ingestion-to-query · 94% columnar compression',
    description:
      'Uplink packets arrive at the MQTT broker and are ingested by stateless worker nodes. Readings pass through a Savitzky-Golay smoothing filter to strip transient air-gap spikes, join with PostGIS parcel metadata (Field Capacity, Wilting Point, Root Depth), and persist in TimescaleDB hypertables.',
    engineeringDetails: [
      'Continuous aggregates automatically pre-compute hourly and daily root-zone weighted VWC averages (25% 15cm + 50% 30cm + 25% 60cm).',
      'PostGIS spatial joins link each probe coordinate to USDA NRCS SSURGO soil polygons to auto-populate Field Capacity and Wilting Point.',
      'Idempotent deduplication via (sensor_node_id, recorded_at) composite key prevents duplicate processing on LoRa retries.',
    ],
    codeArtifactTitle: 'TimescaleDB Hypertable + PostGIS Schema',
    codeArtifactLanguage: 'sql',
    codeArtifact: `CREATE EXTENSION IF NOT EXISTS timescaledb;
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE field_parcels (
  parcel_id UUID PRIMARY KEY,
  farmer_id UUID NOT NULL,
  name TEXT NOT NULL,
  boundary GEOGRAPHY(POLYGON, 4326) NOT NULL,
  crop_type TEXT NOT NULL,
  field_capacity_vwc NUMERIC(4,1) NOT NULL,
  wilting_point_vwc NUMERIC(4,1) NOT NULL,
  mad_percent NUMERIC(4,1) DEFAULT 45.0
);

CREATE TABLE soil_telemetry (
  recorded_at TIMESTAMPTZ NOT NULL,
  parcel_id UUID REFERENCES field_parcels(parcel_id),
  vwc_root_zone NUMERIC(5,2) NOT NULL,
  matric_kpa NUMERIC(6,1),
  soil_temp_c NUMERIC(4,1),
  ec_dsm NUMERIC(4,2),
  UNIQUE (parcel_id, recorded_at)
);

SELECT create_hypertable('soil_telemetry', by_range('recorded_at', INTERVAL '7 days'));`,
  },
  {
    id: 'weather-ml-engine',
    stepNumber: '03',
    layerName: 'Local Weather Fusion & ML Crop Yield Prediction Engine',
    subtitle: 'FAO-56 Penman-Monteith evapotranspiration balance coupled with LightGBM yield forecasting',
    primaryComponents: [
      'Open-Meteo / NOAA HRRR 3km Gridded Weather Ingestion Service',
      'FAO-56 Penman-Monteith Crop Water Balance Engine (ET0 · Kc · Ks)',
      'Python FastAPI Microservice running LightGBM + SHAP Yield Predictor',
      'Sentinel-2 NDVI Satellite Canopy Index Calibration (10m Resolution)',
    ],
    protocolsAndStandards: 'gRPC / REST · FAO-56 Standard · ONNX Runtime / LightGBM',
    latencySla: 'Hourly forecast refresh · ±4.2% RMSE yield accuracy at R1 stage',
    description:
      'Every hour, the backend pulls localized hyper-local weather forecasts (solar radiation, vapor pressure deficit, wind speed, precipitation, and reference evapotranspiration ET0). It computes daily root-zone depletion forward 7 days and feeds cumulative water stress (Ks), Growing Degree Days (GDD), and soil EC into a gradient-boosted yield model.',
    engineeringDetails: [
      'Computes exact water stress coefficient Ks = (TAW - Dr) / (TAW - RAW) per growth stage (vegetative, flowering, grain fill).',
      'Applies FAO-56 Doorenbos & Kassam yield response equation: 1 - (Ya / Ym) = Ky * (1 - ETa / ETc) blended with LightGBM non-linear heat-stress interactions.',
      'Outputs counterfactual comparison: Projected Yield WITHOUT Irrigation vs. Projected Yield WITH Recommended Irrigation (in bu/ac and $ revenue protected).',
    ],
    codeArtifactTitle: 'FAO-56 + Gradient Boosted Yield Forecasting Pipeline',
    codeArtifactLanguage: 'python',
    codeArtifact: `def predict_crop_yield_and_irrigation(parcel, telemetry, weather_7d, lgbm_model):
    taw_mm = (parcel.fc_vwc - parcel.pwp_vwc) / 100.0 * parcel.root_depth_mm
    raw_mm = taw_mm * (parcel.mad_percent / 100.0)
    current_depletion_mm = (parcel.fc_vwc - telemetry.vwc_root_zone) / 100.0 * parcel.root_depth_mm

    # Water Stress Coefficient Ks (1.0 = no stress, < 1.0 = stomatal closure & yield penalty)
    ks = 1.0 if current_depletion_mm <= raw_mm else max(
        0.0, (taw_mm - current_depletion_mm) / (taw_mm - raw_mm)
    )
    etc_7d = sum(day.et0_mm * parcel.kc_stage for day in weather_7d)
    net_irrigation_mm = max(0.0, current_depletion_mm + etc_7d - sum(d.rain_mm * 0.82 for d in weather_7d) - raw_mm)

    features = [ks, etc_7d, telemetry.soil_temp_c, telemetry.ec_dsm, weather_7d[0].vpd_kpa, parcel.gdd_accum]
    predicted_yield_bu_ac = lgbm_model.predict([features])[0]
    return {"ks": ks, "irrigation_mm": round(net_irrigation_mm, 1), "yield_bu_ac": round(predicted_yield_bu_ac, 1)}`,
  },
  {
    id: 'mobile-alert-dispatch',
    stepNumber: '04',
    layerName: 'Direct-to-Phone Alerting & Two-Way Valve Actuation Engine',
    subtitle: 'Multi-channel SMS, WhatsApp, and Push notifications with hysteresis & quiet-hour guards',
    primaryComponents: [
      'Deterministic Threshold & Forecast Rule Evaluator (Redis State Machine)',
      'Twilio Programmable Messaging API (SMS + WhatsApp Business)',
      'Firebase Cloud Messaging (FCM) + Web Push VAPID Service Worker',
      'Inbound SMS Webhook Parser (Reply "START B1" to open field valve)',
    ],
    protocolsAndStandards: 'Twilio Webhook HMAC-SHA1 · RFC 8030 Web Push · E.164 Numbering',
    latencySla: '< 4.5 seconds from threshold breach to farmer handset delivery',
    description:
      'Farmers working on tractors or in low-bandwidth zones rely on direct SMS and push alerts rather than constantly checking dashboards. When root-zone VWC drops below the Management Allowed Depletion (MAD) threshold—or is projected to breach within 24 hours without rain—the alert dispatcher formats a concise prescription and sends it straight to their phone.',
    engineeringDetails: [
      'Hysteresis dead-band (+1.5% VWC recovery required before re-arming) and 6-hour cooldown prevent alert fatigue from minor sensor oscillations.',
      'Pre-rain suppression rule automatically holds irrigation alerts if NOAA/Open-Meteo forecasts > 12 mm precipitation (> 75% probability) within 18 hours.',
      'Two-way SMS webhook allows farmers without mobile data to reply "START B1" via standard cellular SMS to trigger the LoRaWAN solenoid valve.',
    ],
    codeArtifactTitle: 'Alert Rule Evaluator & Twilio SMS Dispatch Service',
    codeArtifactLanguage: 'typescript',
    codeArtifact: `export async function evaluateAndDispatchPlotAlert(plot: PlotState, forecast: WeatherForecast) {
  const isBelowMad = plot.currentVwc < plot.madThresholdVwc;
  const rainIncoming = forecast.next24hPrecipMm >= 10 && forecast.precipProb >= 0.70;

  if (isBelowMad && !rainIncoming && !plot.alertCooldownActive) {
    const smsBody = \`[TerraPulse] URGENT: \${plot.name} moisture at \${plot.currentVwc}% VWC (Target: \${plot.madThresholdVwc}%). Apply \${forecast.irrigationMm}mm (\${forecast.runtimeMin}m) to protect \${forecast.yieldSaved} bu/ac. Reply START \${plot.valveCode} to irrigate.\`;

    const receipt = await twilioClient.messages.create({
      to: plot.farmerPhoneE164,
      from: process.env.TWILIO_SENDER_NUMBER,
      body: smsBody,
      statusCallback: \`\${process.env.APP_URL}/api/webhooks/twilio-status\`,
    });
    await markAlertDispatched(plot.id, receipt.sid);
  }
}`,
  },
  {
    id: 'frontend-pwa',
    stepNumber: '05',
    layerName: 'Frontend Architecture: Offline-First Field PWA & Telemetry Console',
    subtitle: 'React 19 + TypeScript + TanStack Query + IndexedDB persistence for patchy rural connectivity',
    primaryComponents: [
      'React 19 + TypeScript + Tailwind CSS Precision Agronomy Workspace',
      'TanStack Query v5 + IndexedDB PersistClient (Offline Field Read/Write)',
      'SVG Multi-Depth Soil Horizon Profiler & 7-Day Moisture Trajectory Canvas',
      'Service Worker with Background Sync for Queued Valve Commands',
    ],
    protocolsAndStandards: 'PWA Service Worker · IndexedDB · Server-Sent Events (SSE) / WebSockets',
    latencySla: '< 1.2s First Contentful Paint on 3G · 100% offline parcel inspection',
    description:
      'Designed specifically for sunlight readability in the field and full desktop analytical depth in the farm office. The React SPA caches the latest 7 days of soil telemetry, parcel boundaries, and irrigation prescriptions in IndexedDB so the farmer can inspect any field even when cellular service drops to zero.',
    engineeringDetails: [
      'State management separates high-frequency sensor streams (SSE / TanStack Query cache) from local simulation and prescription controls.',
      'High-contrast semantic color tokens paired with explicit textual state labels ensure readability under direct midday sunlight.',
      'Optimistic UI updates with Background Sync queue manual irrigation triggers offline and replay them automatically upon reconnection.',
    ],
    codeArtifactTitle: 'Offline-Resilient Telemetry Hook (TanStack Query + IndexedDB)',
    codeArtifactLanguage: 'typescript',
    codeArtifact: `export function useFieldTelemetryAndYield(parcelId: string, soilParams: SoilParams) {
  return useQuery({
    queryKey: ['parcel-yield-telemetry', parcelId, soilParams],
    queryFn: async () => {
      const res = await fetch(\`/api/weather-yield?\${new URLSearchParams(soilParams as any)}\`);
      if (!res.ok) throw new Error('Network unavailable — serving cached field telemetry');
      return res.json();
    },
    staleTime: 1000 * 60 * 15, // 15-min LoRaWAN sensor cadence
    gcTime: 1000 * 60 * 60 * 24 * 7, // Persist 7 days in IndexedDB for offline field use
    retry: 2,
  });
}`,
  },
];

export interface TechStackCategory {
  domain: string;
  recommendedStack: string;
  alternatives: string;
  ruralAgJustification: string;
  estimatedMonthlyCostPer1000Acres: string;
}

export const TECH_STACK_SUMMARY: TechStackCategory[] = [
  {
    domain: '1. Edge Soil Hardware & Radio',
    recommendedStack: 'TEROS-12 SDI-12 Probes + STM32WLE5 LoRaWAN Nodes + Solar Gateway',
    alternatives: 'NB-IoT / LTE-M Cellular Probes, Sentek Drill & Drop',
    ruralAgJustification:
      'LoRaWAN operates in unlicensed sub-GHz spectrum (915 MHz / 868 MHz), penetrating dense mature corn canopies up to 12 km on a single gateway with zero per-sensor cellular SIM fees.',
    estimatedMonthlyCostPer1000Acres: '$45 / mo (Gateway LTE/Starlink backhaul amortized)',
  },
  {
    domain: '2. Frontend Web & Mobile App',
    recommendedStack: 'React 19, TypeScript, Vite, Tailwind CSS, TanStack Query + IndexedDB PWA',
    alternatives: 'React Native + Expo, Next.js, Flutter',
    ruralAgJustification:
      'An installable Offline-First PWA shares a single TypeScript codebase across the farm office desktop and the farmer’s iOS/Android phone, working offline in dead zones via Service Worker caching.',
    estimatedMonthlyCostPer1000Acres: '$0 – $20 / mo (Edge CDN hosting)',
  },
  {
    domain: '3. Backend API & Ingestion',
    recommendedStack: 'Node.js (Express / Fastify) + Python FastAPI (ML Worker) + EMQX MQTT',
    alternatives: 'Go + ChirpStack, AWS IoT Core + Lambda',
    ruralAgJustification:
      'Node.js handles real-time WebSocket/SSE telemetry and Twilio webhooks with low overhead, while Python FastAPI provides native access to SciPy, FAO-56 agronomy packages, and LightGBM.',
    estimatedMonthlyCostPer1000Acres: '$65 / mo (2x Container instances + MQTT broker)',
  },
  {
    domain: '4. Database & Geospatial Store',
    recommendedStack: 'PostgreSQL 16 + TimescaleDB (Hypertables) + PostGIS + Redis',
    alternatives: 'InfluxDB + MongoDB, AWS Timestream + DynamoDB',
    ruralAgJustification:
      'Combines relational farm records, PostGIS field polygon boundaries, and high-compression time-series sensor logs inside a single ACID-compliant PostgreSQL instance.',
    estimatedMonthlyCostPer1000Acres: '$90 / mo (Managed Timescale / Cloud SQL)',
  },
  {
    domain: '5. Weather & Yield ML Pipeline',
    recommendedStack: 'Open-Meteo / NOAA HRRR API + FAO-56 Water Balance + LightGBM / ONNX',
    alternatives: 'Tomorrow.io API, PyTorch LSTM / Temporal Fusion Transformer',
    ruralAgJustification:
      'Hybrid physics-guided ML (FAO-56 crop coefficients + LightGBM tabular trees) outperforms black-box neural networks on small-to-medium farm datasets and explains exact bu/ac yield loss drivers.',
    estimatedMonthlyCostPer1000Acres: '$35 / mo (Weather API + scheduled inference)',
  },
  {
    domain: '6. Mobile Alerting & Actuation',
    recommendedStack: 'Twilio Programmable SMS & WhatsApp API + Web Push (VAPID / FCM)',
    alternatives: 'AWS SNS, Vonage SMS, Telegram Bot API',
    ruralAgJustification:
      'SMS reaches farmers on 2G/voice-only rural towers when mobile data fails. Two-way SMS webhooks allow replying "START B1" to trigger irrigation without loading an app.',
    estimatedMonthlyCostPer1000Acres: '$18 / mo (~1,500 SMS segments + WhatsApp alerts)',
  },
];
