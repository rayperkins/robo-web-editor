import { MotionCommandDefinition } from './motion.schema';
import { StateFieldDefinition, StateFlagBit } from './state.schema';

export interface RobotSchema {
    readonly id: string;
    readonly name: string;
    readonly headerFileName: string;
    readonly description: string;
    readonly motionCommands: readonly MotionCommandDefinition[];
    readonly stateFields: readonly StateFieldDefinition[];
    readonly stateFlagBits: readonly StateFlagBit[];
    readonly stateByteLength: number;
}
