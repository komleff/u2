export const SIZE = ["snub","small","medium","heavy","capital"];
export const TYPE = [
  "shuttle","fighter","interceptor","gunship","bomber","dropship","courier",
  "freighter","exploration","passenger","miner","tanker","salvager","repair",
  "recon","corvette","frigate","destroyer","carrier","dreadnought"
];
export const STEALTH = ["standard","stealth"];
export const PRESET = ["Balanced","Sport","Rally","Muscle","F1","Industrial","Truck","Warship","Liner","Recon"];

export const sizeType = (size, type) => `${size} ${type}`;

const DEFAULT_ASSIST = {
  preset: "Balanced",
  handling_style: "Balanced",
  speed_limiter_ratio: 0.85,
  handling: {
    stab_gain: 0.9,
    stab_damping: 1.2,
    slip_threshold_deg: 8,
    slip_limit_deg: 12,
    slip_correction_gain: 1.1,
    nose_follow_input: 0.35,
    anticipation_gain: 0.1,
    oversteer_bias: 0,
    bias: 0,
    responsiveness: 0.9,
    slip_target_max: 12,
    traction_control: 0.4,
    cap_main_coupled: 0.75,
    lat_authority: 0.85,
    turn_authority: 0.75,
    turn_assist: 0.35,
    traction_floor: 0.3,
    traction_speed_ref: 320,
    nose_align_gain: 0.15
  },
  jerk: { forward_mps3: 160, lateral_mps3: 130, angular_rps3: 0.25 },
  brake: { g_sustain: 4.5, g_boost: 6.5, boost_duration_s: 3.5, boost_cooldown_s: 15 }
};

const cloneAssistDefaults = () => JSON.parse(JSON.stringify(DEFAULT_ASSIST));

export function buildEmptyConfig({
  id = (crypto?.randomUUID?.() || String(Date.now())),
  name = "New Ship",
  _version = "0.6.4",
  author = ""
} = {}) {
  const mass_t = 60;
  const forward_mps2 = 70;
  const lateral_mps2 = 50;
  
  return {
    meta: { id, name, version: "0.6.4", author },
    classification: { size: "small", type: "fighter", size_type: "small fighter", stealth: "standard", variant: "" },
    geometry: {
      length_m: 20,
      width_m: 14,
      height_m: 5,
      hull_radius_m: Number((Math.hypot(20, 14) / 2).toFixed(2))
    },
    mass: { dry_t: mass_t },
    inertia_opt: { Ixx: null, Iyy: null, Izz: null },
    signatures: { IR: 3, EM: 3, CS: 3 },
    performance: {
      accel_profile: {
        forward_mps2: forward_mps2,
        backward_mps2: 30,
        lateral_mps2: lateral_mps2,
        vertical_mps2: 40
      },
      angular_dps: { pitch: 80, yaw: 70, roll: 110 },
      angular_accel_opt: { pitch: null, yaw: null, roll: null }
    },
    propulsion: {
      main_drive: {
        max_thrust_kN: mass_t * forward_mps2,
        sustained_thrust_kN: mass_t * forward_mps2 * 0.75,
        max_power_MW: 25
      },
      rcs: {
        forward_kN: mass_t * forward_mps2 * 0.3,
        backward_kN: mass_t * 30,
        lateral_kN: mass_t * lateral_mps2,
        vertical_kN: mass_t * 40,
        pitch_kNm: 360,
        yaw_kNm: 320,
        roll_kNm: 550
      }
    },
    power_opt: { reactor_MW: null, cooling_MW: null },
    payload: { cargo_scu: 0, crew: "1" },
    hardpoints_opt: { fixed: [], gimbals: [], turrets: [], missiles: [] },
    weapons: { summary: "" },
    assist: cloneAssistDefaults(),
    tags: ["small", "fighter"],
    media: {
      sprite: { name: "", dataUrl: "", path: "", width: null, height: null }
    },
    notes_opt: "",
    legacy_v053: {}
  };
}
