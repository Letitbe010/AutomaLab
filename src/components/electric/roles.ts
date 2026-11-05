/** Engine-facing data for the electric components (no React). */

/** How the engine treats each electric type (src/engine/electric). */
export type ElectricRole =
  | { kind: 'terminal'; potential: '+' | '-' }
  | {
      kind: 'contact';
      normally: 'open' | 'closed';
      /** manual: held while pressed; toggle: keeps its state (switch, emergency stop). */
      actuator: 'manual' | 'toggle' | 'relay' | 'sensor';
    }
  | { kind: 'load'; load: 'relay' | 'solenoid' | 'lamp' | 'buzzer' }
  | { kind: 'junction' }
  /** PLC block: inputs read +24 V, outputs source +24 V (SPEC §5.4). */
  | { kind: 'plc' };

export const ELECTRIC_ROLES: Record<string, ElectricRole> = {
  'el.plus': { kind: 'terminal', potential: '+' },
  'el.minus': { kind: 'terminal', potential: '-' },
  'el.junction': { kind: 'junction' },
  'plc.cpu1214c': { kind: 'plc' },
  'el.button.no': { kind: 'contact', normally: 'open', actuator: 'manual' },
  'el.button.nc': { kind: 'contact', normally: 'closed', actuator: 'manual' },
  'el.switch.no': { kind: 'contact', normally: 'open', actuator: 'toggle' },
  'el.estop': { kind: 'contact', normally: 'closed', actuator: 'toggle' },
  'el.relay.no': { kind: 'contact', normally: 'open', actuator: 'relay' },
  'el.relay.nc': { kind: 'contact', normally: 'closed', actuator: 'relay' },
  'el.limit.no': { kind: 'contact', normally: 'open', actuator: 'sensor' },
  'el.limit.nc': { kind: 'contact', normally: 'closed', actuator: 'sensor' },
  'el.reed': { kind: 'contact', normally: 'open', actuator: 'sensor' },
  'el.relay.coil': { kind: 'load', load: 'relay' },
  'el.solenoid': { kind: 'load', load: 'solenoid' },
  'el.lamp': { kind: 'load', load: 'lamp' },
  'el.buzzer': { kind: 'load', load: 'buzzer' },
};

/** Electric sensors bound to a cylinder position (like roller valves). */
export const ELECTRIC_SENSOR_TYPES = new Set(['el.limit.no', 'el.limit.nc', 'el.reed']);
