import { describe, expect, it } from 'vitest';
import { CodeGenerator } from './generator';

function block(fields: Record<string, unknown>): any {
    return {
        getFieldValue: (name: string) => fields[name],
    };
}

describe('CodeGenerator Olibot motion instructions', () => {
    const generator = new CodeGenerator();

    it('compiles forward motion into heading, distance, and move setpoints', () => {
        expect(generator.forBlock_action_forward(block({ DISTANCE: 1000 }), generator)).toBe(
            'heading 0\ndistance 1000\nmove 100\n'
        );
    });

    it('compiles backward motion without multiple motion arguments', () => {
        expect(generator.forBlock_action_backward(block({ DISTANCE: 1000 }), generator)).toBe(
            'heading 180\ndistance 1000\nmove 100\n'
        );
    });

    it('compiles wait using the interpreter duration convention', () => {
        expect(generator.forBlock_action_wait(block({ SECONDS: 1 }), generator)).toBe('wait 1000\n');
    });
});
