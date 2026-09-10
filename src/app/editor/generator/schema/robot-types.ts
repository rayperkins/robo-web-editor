import { MotionCommandDefinition } from './motion.schema';
import { StateFieldDefinition, StateFlagBit } from './state.schema';
import { RobotCommandDefinition } from './commands.schema';

export interface RobotSchema {
    readonly id: string;
    readonly name: string;
    readonly headerFileName: string;
    readonly description: string;
    readonly motionCommands: readonly MotionCommandDefinition[];
    readonly stateFields: readonly StateFieldDefinition[];
    readonly stateFlagBits: readonly StateFlagBit[];
    readonly stateByteLength: number;
    readonly calibrationFields: readonly StateFieldDefinition[];
    readonly calibrationByteLength: number;
    readonly commands: readonly RobotCommandDefinition[];
}
