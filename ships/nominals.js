// U2 Nominals v0.7.4 (decoupled) — no SCM/Vmax; uses accel + strafe + omega caps; propulsion derived
// Auto-generated
export const NOMINALS_VERSION = "0.7.4";
export const NOMINALS_MODE = "decoupled";

export const NOMINALS = {
  "snub shuttle": {
    "classification": {
      "size": "snub",
      "type": "shuttle",
      "stealth": "standard"
    },
    "geometry": {
      "length_m": 9,
      "width_m": 7,
      "height_m": 3
    },
    "mass": {
      "dry_t": 8
    },
    "signatures": {
      "IR": 2,
      "EM": 2,
      "CS": 2
    },
    "performance": {
      "accel_fwd_mps2": 50,
      "strafe_mps2": {
        "x": 45,
        "y": 45,
        "z": 45
      },
      "omega_cap_dps": {
        "pitch": 80,
        "yaw": 80,
        "roll": 120
      }
    },
    "payload": {
      "cargo_scu": 0,
      "crew": "1"
    },
    "weapons": {
      "summary": "2×S1"
    },
    "propulsion": {
      "main_thrust_MN": 0.4,
      "rcs_budget_MN": 0.12
    },
    "preset": "Balanced"
  },
  "small fighter": {
    "classification": {
      "size": "small",
      "type": "fighter",
      "stealth": "standard"
    },
    "geometry": {
      "length_m": 18,
      "width_m": 13,
      "height_m": 4
    },
    "mass": {
      "dry_t": 55
    },
    "signatures": {
      "IR": 2,
      "EM": 2,
      "CS": 2
    },
    "performance": {
      "accel_fwd_mps2": 80,
      "strafe_mps2": {
        "x": 80,
        "y": 80,
        "z": 80
      },
      "omega_cap_dps": {
        "pitch": 90,
        "yaw": 75,
        "roll": 120
      }
    },
    "payload": {
      "cargo_scu": 0,
      "crew": "1"
    },
    "weapons": {
      "summary": "2–3×S3 + missiles"
    },
    "propulsion": {
      "main_thrust_MN": 4.4,
      "rcs_budget_MN": 1.32
    },
    "preset": "Sport"
  },
  "small interceptor": {
    "classification": {
      "size": "small",
      "type": "interceptor",
      "stealth": "standard"
    },
    "geometry": {
      "length_m": 20,
      "width_m": 14,
      "height_m": 4
    },
    "mass": {
      "dry_t": 45
    },
    "signatures": {
      "IR": 2,
      "EM": 2,
      "CS": 1
    },
    "performance": {
      "accel_fwd_mps2": 90,
      "strafe_mps2": {
        "x": 85,
        "y": 85,
        "z": 85
      },
      "omega_cap_dps": {
        "pitch": 95,
        "yaw": 80,
        "roll": 130
      }
    },
    "payload": {
      "cargo_scu": 0,
      "crew": "1"
    },
    "weapons": {
      "summary": "2×S3 + 6×S1–S2 missiles"
    },
    "propulsion": {
      "main_thrust_MN": 4.05,
      "rcs_budget_MN": 1.21
    },
    "preset": "Rally"
  },
  "small sport": {
    "classification": {
      "size": "small",
      "type": "sport",
      "stealth": "standard"
    },
    "geometry": {
      "length_m": 16,
      "width_m": 10,
      "height_m": 3.5
    },
    "mass": {
      "dry_t": 30
    },
    "signatures": {
      "IR": 2,
      "EM": 2,
      "CS": 1
    },
    "performance": {
      "accel_fwd_mps2": 90,
      "strafe_mps2": {
        "x": 90,
        "y": 85,
        "z": 90
      },
      "omega_cap_dps": {
        "pitch": 110,
        "yaw": 95,
        "roll": 150
      }
    },
    "payload": {
      "cargo_scu": 0,
      "crew": "1"
    },
    "weapons": {
      "summary": "light guns"
    },
    "propulsion": {
      "main_thrust_MN": 2.7,
      "rcs_budget_MN": 0.81
    },
    "preset": "Sport"
  },
  "small courier": {
    "classification": {
      "size": "small",
      "type": "courier",
      "stealth": "standard"
    },
    "geometry": {
      "length_m": 24,
      "width_m": 16,
      "height_m": 6
    },
    "mass": {
      "dry_t": 70
    },
    "signatures": {
      "IR": 2,
      "EM": 2,
      "CS": 2
    },
    "performance": {
      "accel_fwd_mps2": 70,
      "strafe_mps2": {
        "x": 70,
        "y": 70,
        "z": 70
      },
      "omega_cap_dps": {
        "pitch": 85,
        "yaw": 70,
        "roll": 110
      }
    },
    "payload": {
      "cargo_scu": 16,
      "crew": "1–2"
    },
    "weapons": {
      "summary": "light defensive"
    },
    "propulsion": {
      "main_thrust_MN": 4.9,
      "rcs_budget_MN": 1.47
    },
    "preset": "F1"
  },
  "small freighter": {
    "classification": {
      "size": "small",
      "type": "freighter",
      "stealth": "standard"
    },
    "geometry": {
      "length_m": 30,
      "width_m": 26,
      "height_m": 8
    },
    "mass": {
      "dry_t": 80
    },
    "signatures": {
      "IR": 3,
      "EM": 3,
      "CS": 3
    },
    "performance": {
      "accel_fwd_mps2": 35,
      "strafe_mps2": {
        "x": 35,
        "y": 35,
        "z": 35
      },
      "omega_cap_dps": {
        "pitch": 40,
        "yaw": 35,
        "roll": 75
      }
    },
    "payload": {
      "cargo_scu": 60,
      "crew": "2–3"
    },
    "weapons": {
      "summary": "2×S2–S3 defense"
    },
    "propulsion": {
      "main_thrust_MN": 2.8,
      "rcs_budget_MN": 0.84
    },
    "preset": "Truck"
  },
  "small miner": {
    "classification": {
      "size": "small",
      "type": "miner",
      "stealth": "standard"
    },
    "geometry": {
      "length_m": 24,
      "width_m": 18,
      "height_m": 7
    },
    "mass": {
      "dry_t": 60
    },
    "signatures": {
      "IR": 3,
      "EM": 3,
      "CS": 3
    },
    "performance": {
      "accel_fwd_mps2": 40,
      "strafe_mps2": {
        "x": 45,
        "y": 45,
        "z": 45
      },
      "omega_cap_dps": {
        "pitch": 55,
        "yaw": 45,
        "roll": 85
      }
    },
    "payload": {
      "cargo_scu": 32,
      "crew": "1"
    },
    "weapons": {
      "summary": "mining S1"
    },
    "propulsion": {
      "main_thrust_MN": 2.4,
      "rcs_budget_MN": 0.72
    },
    "preset": "Industrial"
  },
  "small passenger": {
    "classification": {
      "size": "small",
      "type": "passenger",
      "stealth": "standard"
    },
    "geometry": {
      "length_m": 24,
      "width_m": 16,
      "height_m": 10
    },
    "mass": {
      "dry_t": 150
    },
    "signatures": {
      "IR": 3,
      "EM": 3,
      "CS": 4
    },
    "performance": {
      "accel_fwd_mps2": 20,
      "strafe_mps2": {
        "x": 20,
        "y": 20,
        "z": 20
      },
      "omega_cap_dps": {
        "pitch": 20,
        "yaw": 15,
        "roll": 25
      }
    },
    "payload": {
      "cargo_scu": 50,
      "crew": "6–10"
    },
    "weapons": {
      "summary": "defense"
    },
    "propulsion": {
      "main_thrust_MN": 3.0,
      "rcs_budget_MN": 0.9
    },
    "preset": "Liner"
  },
  "small tanker": {
    "classification": {
      "size": "small",
      "type": "tanker",
      "stealth": "standard"
    },
    "geometry": {
      "length_m": 24,
      "width_m": 14,
      "height_m": 9
    },
    "mass": {
      "dry_t": 120
    },
    "signatures": {
      "IR": 4,
      "EM": 5,
      "CS": 4
    },
    "performance": {
      "accel_fwd_mps2": 22,
      "strafe_mps2": {
        "x": 22,
        "y": 22,
        "z": 22
      },
      "omega_cap_dps": {
        "pitch": 25,
        "yaw": 18,
        "roll": 30
      }
    },
    "payload": {
      "cargo_scu": 200,
      "crew": "4–6"
    },
    "weapons": {
      "summary": "defense"
    },
    "propulsion": {
      "main_thrust_MN": 2.64,
      "rcs_budget_MN": 0.79
    },
    "preset": "Truck"
  },
  "medium fighter": {
    "classification": {
      "size": "medium",
      "type": "fighter",
      "stealth": "standard"
    },
    "geometry": {
      "length_m": 24,
      "width_m": 16,
      "height_m": 5
    },
    "mass": {
      "dry_t": 80
    },
    "signatures": {
      "IR": 3,
      "EM": 3,
      "CS": 3
    },
    "performance": {
      "accel_fwd_mps2": 70,
      "strafe_mps2": {
        "x": 70,
        "y": 70,
        "z": 70
      },
      "omega_cap_dps": {
        "pitch": 105,
        "yaw": 95,
        "roll": 140
      }
    },
    "payload": {
      "cargo_scu": 0,
      "crew": "1"
    },
    "weapons": {
      "summary": "3–4×S3/4, missiles"
    },
    "propulsion": {
      "main_thrust_MN": 5.6,
      "rcs_budget_MN": 1.68
    },
    "preset": "Sport"
  },
  "medium gunship": {
    "classification": {
      "size": "medium",
      "type": "gunship",
      "stealth": "standard"
    },
    "geometry": {
      "length_m": 45,
      "width_m": 30,
      "height_m": 10
    },
    "mass": {
      "dry_t": 180
    },
    "signatures": {
      "IR": 3,
      "EM": 3,
      "CS": 3
    },
    "performance": {
      "accel_fwd_mps2": 40,
      "strafe_mps2": {
        "x": 45,
        "y": 45,
        "z": 45
      },
      "omega_cap_dps": {
        "pitch": 40,
        "yaw": 35,
        "roll": 75
      }
    },
    "payload": {
      "cargo_scu": 8,
      "crew": "2–4"
    },
    "weapons": {
      "summary": "1–2×S4–S5 turrets, missiles"
    },
    "propulsion": {
      "main_thrust_MN": 7.2,
      "rcs_budget_MN": 2.16
    },
    "preset": "Warship"
  },
  "medium bomber": {
    "classification": {
      "size": "medium",
      "type": "bomber",
      "stealth": "standard"
    },
    "geometry": {
      "length_m": 70,
      "width_m": 35,
      "height_m": 14
    },
    "mass": {
      "dry_t": 200
    },
    "signatures": {
      "IR": 3,
      "EM": 2,
      "CS": 3
    },
    "performance": {
      "accel_fwd_mps2": 35,
      "strafe_mps2": {
        "x": 35,
        "y": 35,
        "z": 35
      },
      "omega_cap_dps": {
        "pitch": 30,
        "yaw": 25,
        "roll": 60
      }
    },
    "payload": {
      "cargo_scu": 8,
      "crew": "2–6"
    },
    "weapons": {
      "summary": "torpedoes S7–S9 + turrets"
    },
    "propulsion": {
      "main_thrust_MN": 7.0,
      "rcs_budget_MN": 2.1
    },
    "preset": "Warship"
  },
  "medium dropship": {
    "classification": {
      "size": "medium",
      "type": "dropship",
      "stealth": "standard"
    },
    "geometry": {
      "length_m": 38,
      "width_m": 28,
      "height_m": 10
    },
    "mass": {
      "dry_t": 160
    },
    "signatures": {
      "IR": 3,
      "EM": 3,
      "CS": 3
    },
    "performance": {
      "accel_fwd_mps2": 40,
      "strafe_mps2": {
        "x": 45,
        "y": 45,
        "z": 45
      },
      "omega_cap_dps": {
        "pitch": 45,
        "yaw": 40,
        "roll": 80
      }
    },
    "payload": {
      "cargo_scu": 20,
      "crew": "2–4"
    },
    "weapons": {
      "summary": "1–2×S3–S4 turrets"
    },
    "propulsion": {
      "main_thrust_MN": 6.4,
      "rcs_budget_MN": 1.92
    },
    "preset": "Truck"
  },
  "medium freighter": {
    "classification": {
      "size": "medium",
      "type": "freighter",
      "stealth": "standard"
    },
    "geometry": {
      "length_m": 50,
      "width_m": 32,
      "height_m": 14
    },
    "mass": {
      "dry_t": 200
    },
    "signatures": {
      "IR": 3,
      "EM": 3,
      "CS": 3
    },
    "performance": {
      "accel_fwd_mps2": 30,
      "strafe_mps2": {
        "x": 30,
        "y": 30,
        "z": 30
      },
      "omega_cap_dps": {
        "pitch": 35,
        "yaw": 30,
        "roll": 65
      }
    },
    "payload": {
      "cargo_scu": 120,
      "crew": "3–4"
    },
    "weapons": {
      "summary": "2–3 turrets S2–S3"
    },
    "propulsion": {
      "main_thrust_MN": 6.0,
      "rcs_budget_MN": 1.8
    },
    "preset": "Truck"
  },
  "medium miner": {
    "classification": {
      "size": "medium",
      "type": "miner",
      "stealth": "standard"
    },
    "geometry": {
      "length_m": 38,
      "width_m": 30,
      "height_m": 12
    },
    "mass": {
      "dry_t": 160
    },
    "signatures": {
      "IR": 3,
      "EM": 3,
      "CS": 3
    },
    "performance": {
      "accel_fwd_mps2": 35,
      "strafe_mps2": {
        "x": 40,
        "y": 40,
        "z": 40
      },
      "omega_cap_dps": {
        "pitch": 45,
        "yaw": 40,
        "roll": 75
      }
    },
    "payload": {
      "cargo_scu": 96,
      "crew": "2–3"
    },
    "weapons": {
      "summary": "3×mining S2"
    },
    "propulsion": {
      "main_thrust_MN": 5.6,
      "rcs_budget_MN": 1.68
    },
    "preset": "Industrial"
  },
  "medium passenger": {
    "classification": {
      "size": "medium",
      "type": "passenger",
      "stealth": "standard"
    },
    "geometry": {
      "length_m": 60,
      "width_m": 25,
      "height_m": 15
    },
    "mass": {
      "dry_t": 300
    },
    "signatures": {
      "IR": 3,
      "EM": 3,
      "CS": 4
    },
    "performance": {
      "accel_fwd_mps2": 18,
      "strafe_mps2": {
        "x": 18,
        "y": 18,
        "z": 18
      },
      "omega_cap_dps": {
        "pitch": 18,
        "yaw": 12,
        "roll": 20
      }
    },
    "payload": {
      "cargo_scu": 120,
      "crew": "8–20"
    },
    "weapons": {
      "summary": "defense"
    },
    "propulsion": {
      "main_thrust_MN": 5.4,
      "rcs_budget_MN": 1.62
    },
    "preset": "Liner"
  },
  "medium tanker": {
    "classification": {
      "size": "medium",
      "type": "tanker",
      "stealth": "standard"
    },
    "geometry": {
      "length_m": 60,
      "width_m": 30,
      "height_m": 15
    },
    "mass": {
      "dry_t": 400
    },
    "signatures": {
      "IR": 4,
      "EM": 5,
      "CS": 4
    },
    "performance": {
      "accel_fwd_mps2": 22,
      "strafe_mps2": {
        "x": 22,
        "y": 22,
        "z": 22
      },
      "omega_cap_dps": {
        "pitch": 25,
        "yaw": 18,
        "roll": 30
      }
    },
    "payload": {
      "cargo_scu": 400,
      "crew": "6–10"
    },
    "weapons": {
      "summary": "defense"
    },
    "propulsion": {
      "main_thrust_MN": 8.8,
      "rcs_budget_MN": 2.64
    },
    "preset": "Truck"
  },
  "medium salvager": {
    "classification": {
      "size": "medium",
      "type": "salvager",
      "stealth": "standard"
    },
    "geometry": {
      "length_m": 60,
      "width_m": 30,
      "height_m": 15
    },
    "mass": {
      "dry_t": 300
    },
    "signatures": {
      "IR": 4,
      "EM": 4,
      "CS": 4
    },
    "performance": {
      "accel_fwd_mps2": 22,
      "strafe_mps2": {
        "x": 22,
        "y": 22,
        "z": 22
      },
      "omega_cap_dps": {
        "pitch": 24,
        "yaw": 18,
        "roll": 28
      }
    },
    "payload": {
      "cargo_scu": 200,
      "crew": "4–8"
    },
    "weapons": {
      "summary": "beams + defense"
    },
    "propulsion": {
      "main_thrust_MN": 6.6,
      "rcs_budget_MN": 1.98
    },
    "preset": "Industrial"
  },
  "medium repair": {
    "classification": {
      "size": "medium",
      "type": "repair",
      "stealth": "standard"
    },
    "geometry": {
      "length_m": 40,
      "width_m": 28,
      "height_m": 12
    },
    "mass": {
      "dry_t": 150
    },
    "signatures": {
      "IR": 3,
      "EM": 3,
      "CS": 3
    },
    "performance": {
      "accel_fwd_mps2": 32,
      "strafe_mps2": {
        "x": 48,
        "y": 48,
        "z": 48
      },
      "omega_cap_dps": {
        "pitch": 55,
        "yaw": 45,
        "roll": 85
      }
    },
    "payload": {
      "cargo_scu": 80,
      "crew": "2–4"
    },
    "weapons": {
      "summary": "drones + defense"
    },
    "propulsion": {
      "main_thrust_MN": 4.8,
      "rcs_budget_MN": 1.44
    },
    "preset": "Industrial"
  },
  "heavy fighter": {
    "classification": {
      "size": "heavy",
      "type": "fighter",
      "stealth": "standard"
    },
    "geometry": {
      "length_m": 38,
      "width_m": 25,
      "height_m": 8
    },
    "mass": {
      "dry_t": 110
    },
    "signatures": {
      "IR": 3,
      "EM": 3,
      "CS": 3
    },
    "performance": {
      "accel_fwd_mps2": 50,
      "strafe_mps2": {
        "x": 55,
        "y": 55,
        "z": 55
      },
      "omega_cap_dps": {
        "pitch": 44,
        "yaw": 38,
        "roll": 124
      }
    },
    "payload": {
      "cargo_scu": 0,
      "crew": "1–2"
    },
    "weapons": {
      "summary": "nose S5 + turrets"
    },
    "propulsion": {
      "main_thrust_MN": 5.5,
      "rcs_budget_MN": 1.1
    },
    "preset": "Sport"
  },
  "heavy freighter": {
    "classification": {
      "size": "heavy",
      "type": "freighter",
      "stealth": "standard"
    },
    "geometry": {
      "length_m": 110,
      "width_m": 50,
      "height_m": 20
    },
    "mass": {
      "dry_t": 450
    },
    "signatures": {
      "IR": 4,
      "EM": 4,
      "CS": 4
    },
    "performance": {
      "accel_fwd_mps2": 25,
      "strafe_mps2": {
        "x": 25,
        "y": 25,
        "z": 25
      },
      "omega_cap_dps": {
        "pitch": 25,
        "yaw": 16,
        "roll": 25
      }
    },
    "payload": {
      "cargo_scu": 500,
      "crew": "4–6"
    },
    "weapons": {
      "summary": "4–6 turrets"
    },
    "propulsion": {
      "main_thrust_MN": 11.25,
      "rcs_budget_MN": 2.25
    },
    "preset": "Truck"
  },
  "heavy tanker": {
    "classification": {
      "size": "heavy",
      "type": "tanker",
      "stealth": "standard"
    },
    "geometry": {
      "length_m": 110,
      "width_m": 50,
      "height_m": 25
    },
    "mass": {
      "dry_t": 800
    },
    "signatures": {
      "IR": 4,
      "EM": 5,
      "CS": 4
    },
    "performance": {
      "accel_fwd_mps2": 22,
      "strafe_mps2": {
        "x": 22,
        "y": 22,
        "z": 22
      },
      "omega_cap_dps": {
        "pitch": 25,
        "yaw": 18,
        "roll": 30
      }
    },
    "payload": {
      "cargo_scu": 800,
      "crew": "8–14"
    },
    "weapons": {
      "summary": "defense"
    },
    "propulsion": {
      "main_thrust_MN": 17.6,
      "rcs_budget_MN": 3.52
    },
    "preset": "Truck"
  },
  "heavy miner": {
    "classification": {
      "size": "heavy",
      "type": "miner",
      "stealth": "standard"
    },
    "geometry": {
      "length_m": 100,
      "width_m": 50,
      "height_m": 30
    },
    "mass": {
      "dry_t": 600
    },
    "signatures": {
      "IR": 4,
      "EM": 4,
      "CS": 4
    },
    "performance": {
      "accel_fwd_mps2": 22,
      "strafe_mps2": {
        "x": 22,
        "y": 22,
        "z": 22
      },
      "omega_cap_dps": {
        "pitch": 20,
        "yaw": 12,
        "roll": 20
      }
    },
    "payload": {
      "cargo_scu": 600,
      "crew": "6–12"
    },
    "weapons": {
      "summary": "industrial RIO"
    },
    "propulsion": {
      "main_thrust_MN": 13.2,
      "rcs_budget_MN": 2.64
    },
    "preset": "Industrial"
  },
  "heavy salvager": {
    "classification": {
      "size": "heavy",
      "type": "salvager",
      "stealth": "standard"
    },
    "geometry": {
      "length_m": 100,
      "width_m": 60,
      "height_m": 30
    },
    "mass": {
      "dry_t": 600
    },
    "signatures": {
      "IR": 4,
      "EM": 4,
      "CS": 4
    },
    "performance": {
      "accel_fwd_mps2": 22,
      "strafe_mps2": {
        "x": 22,
        "y": 22,
        "z": 22
      },
      "omega_cap_dps": {
        "pitch": 22,
        "yaw": 15,
        "roll": 28
      }
    },
    "payload": {
      "cargo_scu": 400,
      "crew": "6–12"
    },
    "weapons": {
      "summary": "beams + defense"
    },
    "propulsion": {
      "main_thrust_MN": 13.2,
      "rcs_budget_MN": 2.64
    },
    "preset": "Industrial"
  },
  "heavy passenger": {
    "classification": {
      "size": "heavy",
      "type": "passenger",
      "stealth": "standard"
    },
    "geometry": {
      "length_m": 110,
      "width_m": 35,
      "height_m": 20
    },
    "mass": {
      "dry_t": 900
    },
    "signatures": {
      "IR": 3,
      "EM": 3,
      "CS": 4
    },
    "performance": {
      "accel_fwd_mps2": 15,
      "strafe_mps2": {
        "x": 15,
        "y": 15,
        "z": 15
      },
      "omega_cap_dps": {
        "pitch": 10,
        "yaw": 10,
        "roll": 15
      }
    },
    "payload": {
      "cargo_scu": 200,
      "crew": "12–30"
    },
    "weapons": {
      "summary": "defense batteries"
    },
    "propulsion": {
      "main_thrust_MN": 13.5,
      "rcs_budget_MN": 2.7
    },
    "preset": "Liner"
  },
  "heavy exploration": {
    "classification": {
      "size": "heavy",
      "type": "exploration",
      "stealth": "standard"
    },
    "geometry": {
      "length_m": 110,
      "width_m": 50,
      "height_m": 28
    },
    "mass": {
      "dry_t": 480
    },
    "signatures": {
      "IR": 3,
      "EM": 3,
      "CS": 3
    },
    "performance": {
      "accel_fwd_mps2": 28,
      "strafe_mps2": {
        "x": 30,
        "y": 30,
        "z": 30
      },
      "omega_cap_dps": {
        "pitch": 30,
        "yaw": 16,
        "roll": 30
      }
    },
    "payload": {
      "cargo_scu": 456,
      "crew": "4–6"
    },
    "weapons": {
      "summary": "3–5 turrets, medbay"
    },
    "propulsion": {
      "main_thrust_MN": 13.44,
      "rcs_budget_MN": 2.69
    },
    "preset": "Balanced"
  },
  "capital corvette": {
    "classification": {
      "size": "capital",
      "type": "corvette",
      "stealth": "standard"
    },
    "geometry": {
      "length_m": 155,
      "width_m": 82,
      "height_m": 35
    },
    "mass": {
      "dry_t": 2000
    },
    "signatures": {
      "IR": 4,
      "EM": 4,
      "CS": 4
    },
    "performance": {
      "accel_fwd_mps2": 10,
      "strafe_mps2": {
        "x": 10,
        "y": 10,
        "z": 15
      },
      "omega_cap_dps": {
        "pitch": 18,
        "yaw": 18,
        "roll": 28
      }
    },
    "payload": {
      "cargo_scu": 500,
      "crew": "12–24"
    },
    "weapons": {
      "summary": "torpedoes + batteries"
    },
    "propulsion": {
      "main_thrust_MN": 20.0,
      "rcs_budget_MN": 4.0
    },
    "preset": "Warship"
  },
  "capital frigate": {
    "classification": {
      "size": "capital",
      "type": "frigate",
      "stealth": "standard"
    },
    "geometry": {
      "length_m": 245,
      "width_m": 116,
      "height_m": 40
    },
    "mass": {
      "dry_t": 8000
    },
    "signatures": {
      "IR": 4,
      "EM": 4,
      "CS": 5
    },
    "performance": {
      "accel_fwd_mps2": 6,
      "strafe_mps2": {
        "x": 6,
        "y": 6,
        "z": 10
      },
      "omega_cap_dps": {
        "pitch": 12,
        "yaw": 12,
        "roll": 18
      }
    },
    "payload": {
      "cargo_scu": 1200,
      "crew": "30–80"
    },
    "weapons": {
      "summary": "6–10 turrets, S10 gun"
    },
    "propulsion": {
      "main_thrust_MN": 48.0,
      "rcs_budget_MN": 9.6
    },
    "preset": "Warship"
  },
  "capital destroyer": {
    "classification": {
      "size": "capital",
      "type": "destroyer",
      "stealth": "standard"
    },
    "geometry": {
      "length_m": 345,
      "width_m": 148,
      "height_m": 65
    },
    "mass": {
      "dry_t": 16000
    },
    "signatures": {
      "IR": 5,
      "EM": 5,
      "CS": 5
    },
    "performance": {
      "accel_fwd_mps2": 5,
      "strafe_mps2": {
        "x": 5,
        "y": 5,
        "z": 8
      },
      "omega_cap_dps": {
        "pitch": 10,
        "yaw": 10,
        "roll": 15
      }
    },
    "payload": {
      "cargo_scu": 3000,
      "crew": "60–200"
    },
    "weapons": {
      "summary": "heavy batteries + torpedoes"
    },
    "propulsion": {
      "main_thrust_MN": 80.0,
      "rcs_budget_MN": 16.0
    },
    "preset": "Warship"
  },
  "capital carrier": {
    "classification": {
      "size": "capital",
      "type": "carrier",
      "stealth": "standard"
    },
    "geometry": {
      "length_m": 270,
      "width_m": 104,
      "height_m": 64
    },
    "mass": {
      "dry_t": 12000
    },
    "signatures": {
      "IR": 5,
      "EM": 5,
      "CS": 5
    },
    "performance": {
      "accel_fwd_mps2": 5,
      "strafe_mps2": {
        "x": 5,
        "y": 5,
        "z": 8
      },
      "omega_cap_dps": {
        "pitch": 9,
        "yaw": 9,
        "roll": 14
      }
    },
    "payload": {
      "cargo_scu": 4000,
      "crew": "50–150"
    },
    "weapons": {
      "summary": "6–10 turrets, hangars"
    },
    "propulsion": {
      "main_thrust_MN": 60.0,
      "rcs_budget_MN": 12.0
    },
    "preset": "Warship"
  },
  "capital dreadnought": {
    "classification": {
      "size": "capital",
      "type": "dreadnought",
      "stealth": "standard"
    },
    "geometry": {
      "length_m": 600,
      "width_m": 200,
      "height_m": 100
    },
    "mass": {
      "dry_t": 50000
    },
    "signatures": {
      "IR": 5,
      "EM": 5,
      "CS": 5
    },
    "performance": {
      "accel_fwd_mps2": 4,
      "strafe_mps2": {
        "x": 4,
        "y": 4,
        "z": 6
      },
      "omega_cap_dps": {
        "pitch": 6,
        "yaw": 6,
        "roll": 10
      }
    },
    "payload": {
      "cargo_scu": 10000,
      "crew": "200–800"
    },
    "weapons": {
      "summary": "capital batteries"
    },
    "propulsion": {
      "main_thrust_MN": 200.0,
      "rcs_budget_MN": 40.0
    },
    "preset": "Warship"
  },
  "capital freighter": {
    "classification": {
      "size": "capital",
      "type": "freighter",
      "stealth": "standard"
    },
    "geometry": {
      "length_m": 180,
      "width_m": 60,
      "height_m": 30
    },
    "mass": {
      "dry_t": 1200
    },
    "signatures": {
      "IR": 4,
      "EM": 4,
      "CS": 5
    },
    "performance": {
      "accel_fwd_mps2": 15,
      "strafe_mps2": {
        "x": 15,
        "y": 15,
        "z": 15
      },
      "omega_cap_dps": {
        "pitch": 20,
        "yaw": 12,
        "roll": 20
      }
    },
    "payload": {
      "cargo_scu": 2000,
      "crew": "6–12"
    },
    "weapons": {
      "summary": "defense batteries"
    },
    "propulsion": {
      "main_thrust_MN": 18.0,
      "rcs_budget_MN": 3.6
    },
    "preset": "Truck"
  },
  "capital miner": {
    "classification": {
      "size": "capital",
      "type": "miner",
      "stealth": "standard"
    },
    "geometry": {
      "length_m": 180,
      "width_m": 70,
      "height_m": 40
    },
    "mass": {
      "dry_t": 1200
    },
    "signatures": {
      "IR": 4,
      "EM": 4,
      "CS": 4
    },
    "performance": {
      "accel_fwd_mps2": 20,
      "strafe_mps2": {
        "x": 20,
        "y": 20,
        "z": 20
      },
      "omega_cap_dps": {
        "pitch": 20,
        "yaw": 12,
        "roll": 20
      }
    },
    "payload": {
      "cargo_scu": 1200,
      "crew": "12–24"
    },
    "weapons": {
      "summary": "industrial RIO"
    },
    "propulsion": {
      "main_thrust_MN": 24.0,
      "rcs_budget_MN": 4.8
    },
    "preset": "Industrial"
  },
  "capital tanker": {
    "classification": {
      "size": "capital",
      "type": "tanker",
      "stealth": "standard"
    },
    "geometry": {
      "length_m": 180,
      "width_m": 70,
      "height_m": 30
    },
    "mass": {
      "dry_t": 1200
    },
    "signatures": {
      "IR": 4,
      "EM": 5,
      "CS": 4
    },
    "performance": {
      "accel_fwd_mps2": 22,
      "strafe_mps2": {
        "x": 22,
        "y": 22,
        "z": 22
      },
      "omega_cap_dps": {
        "pitch": 25,
        "yaw": 18,
        "roll": 30
      }
    },
    "payload": {
      "cargo_scu": 1600,
      "crew": "12–20"
    },
    "weapons": {
      "summary": "defense"
    },
    "propulsion": {
      "main_thrust_MN": 26.4,
      "rcs_budget_MN": 5.28
    },
    "preset": "Truck"
  }
};

const RCS_RATIO = { snub:0.30, small:0.30, medium:0.30, heavy:0.20, capital:0.20 };

export function finalizeNominals(entry){
  const m = entry?.mass?.dry_t ?? 0;
  const a = entry?.performance?.accel_fwd_mps2 ?? 0;
  const main = Math.round((m*a)/10)/100; // t*m/s² -> N -> MN (approx)
  const ratio = RCS_RATIO[entry?.classification?.size] ?? 0.30;
  const rcs = Math.round(main*ratio*100)/100;
  return {
    ...entry,
    propulsion: entry.propulsion ?? { main_thrust_MN: main, rcs_budget_MN: rcs }
  };
}

export function getNominals(size, type, isStealth=false){
  const key = `${size} ${type}`;
  let base = NOMINALS[key];
  if (!base) return null;
  let out = JSON.parse(JSON.stringify(base));
  if (isStealth) {
    out.classification.stealth = "stealth";
    // simple stealth signature reduction
    out.signatures = {
      IR: Math.max(1, (out.signatures.IR ?? 2) - 1),
      EM: Math.max(1, (out.signatures.EM ?? 2) - 1),
      CS: Math.max(1, (out.signatures.CS ?? 2) - 1),
    };
  }
  return finalizeNominals(out);
}

export function applyNominals(ship, mode='fill-empty'){
  const isStealth = ship?.classification?.stealth === 'stealth';
  const tpl = getNominals(ship?.classification?.size, ship?.classification?.type, isStealth);
  if (!tpl) return ship;
  const merge = (dst, src) => {
    for (const k of Object.keys(src)){
      if (typeof src[k] === 'object' && src[k] && !Array.isArray(src[k])){
        dst[k] = merge(dst[k]??{}, src[k]);
      } else {
        if (mode==='overwrite' || dst[k]===undefined || dst[k]===null || dst[k]==='') dst[k] = src[k];
      }
    }
    return dst;
  };
  const out = JSON.parse(JSON.stringify(ship));
  merge(out, tpl);
  return out;
};
