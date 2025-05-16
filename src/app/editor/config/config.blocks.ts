import { BlockDefinition } from "blockly/core/blocks";

export class EditorConfigBlocks {
    static definitions: any[] = [
        // Operations
        {
            "type": "action_wait",
            "message0": "wait %1 seconds",
            "args0": [{
                "type": "field_number",
                "name": "SECONDS",
                "value": 1,
                "min": 0,
                "max": 30,
                }
            ],
            "previousStatement": null,
            "nextStatement": null,
            "colour": 230,
        },

        // Motion
        {
            "type": "action_stop",
            "message0": "stop",
            "previousStatement": null,
            "nextStatement": null,
            "colour": 230,
        },{
            "type": "action_forward",
            "message0": "walk forward %1 steps",
            "args0": [{
                "type": "field_number",
                "name": "STEPS",
                "value": 1,
                "min": 1,
                "max": 10,
                }
            ],
            "previousStatement": null,
            "nextStatement": null,
            "colour": 230,
        },{
            "type": "action_backward",
            "message0": "walk backward %1 steps",
            "args0": [{
                "type": "field_number",
                "name": "STEPS",
                "value": 1,
                "min": 1,
                "max": 10,
                }
            ],
            "previousStatement": null,
            "nextStatement": null,
            "colour": 230,
        }, {
            "type": "action_turnleft",
            "message0": "turn left %1 steps",
            "args0": [{
                "type": "field_number",
                "name": "STEPS",
                "value": 1,
                "min": 1,
                "max": 10,
                }
            ],
            "previousStatement": null,
            "nextStatement": null,
            "colour": 230,
        }, {
            "type": "action_turnright",
            "message0": "turn right %1 steps",
            "args0": [{
                "type": "field_number",
                "name": "STEPS",
                "value": 1,
                "min": 1,
                "max": 10,
                }
            ],
            "previousStatement": null,
            "nextStatement": null,
            "colour": 230,
        }];
}