import { describe, expect, it } from 'vitest';
import { CodeGenerator } from './generator';

function block(fields: Record<string, unknown>): any {
    return {
        getFieldValue: (name: string) => fields[name],
    };
}

describe('CodeGenerator Olibot motion instructions', () => {
    const generator = new CodeGenerator();

    it('compiles forward motion into a positive distance setpoint', () => {
        expect(generator.forBlock_action_forward(block({ DISTANCE: 1000 }), generator)).toBe(
            'distance 1000\n'
        );
    });

    it('compiles backward motion into a negative distance setpoint', () => {
        expect(generator.forBlock_action_backward(block({ DISTANCE: 1000 }), generator)).toBe(
            'distance -1000\n'
        );
    });

    it('compiles the move block into a speed command', () => {
        expect(generator.forBlock_action_speed(block({ SPEED: 60 }), generator)).toBe('move 60\n');
    });

    it('compiles wait using the interpreter duration convention', () => {
        expect(generator.forBlock_action_wait(block({ SECONDS: 1 }), generator)).toBe('wait 1000\n');
    });
});
