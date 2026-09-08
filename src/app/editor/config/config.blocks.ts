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

        // Actions
        {
            "type": "action_stop",
            "message0": "stop",
            "previousStatement": null,
            "nextStatement": null,
            "colour": 230,
        },
        {
            "type": "action_forward",
            "message0": "set forward %1 mm",
            "args0": [{
                "type": "field_number",
                "name": "DISTANCE",
                "value": 100,
                "min": 1,
                "max": 32767,
                }
            ],
            "previousStatement": null,
            "nextStatement": null,
            "colour": 230,
        },
        {
            "type": "action_backward",
            "message0": "set backward %1 mm",
            "args0": [{
                "type": "field_number",
                "name": "DISTANCE",
                "value": 100,
                "min": 1,
                "max": 32767,
                }
            ],
            "previousStatement": null,
            "nextStatement": null,
            "colour": 230,
        },
        {
            "type": "action_turn",
            "message0": "turn %1 degrees",
            "args0": [{
                "type": "field_number",
                "name": "DEGREES",
                "value": 45,
                "min": -360,
                "max": 360,
                }
            ],
            "previousStatement": null,
            "nextStatement": null,
            "colour": 230,
        },
        {
            "type": "action_speed",
            "message0": "move %1 %",
            "args0": [{
                "type": "field_number",
                "name": "SPEED",
                "value": 100,
                "min": 0,
                "max": 100,
                }
            ],
            "previousStatement": null,
            "nextStatement": null,
            "colour": 230,
        },
        // logic
        {
            'type': 'controls_if_basic',
            'message0': 'if %1 %2 %3',
            'args0': [
                {
                    'type': 'input_value',
                    'name': 'A',
                },
                {
                    'type': 'field_dropdown',
                    'name': 'OP',
                    'options': [
                        ['=', 'EQ'],
                        ['\u2260', 'NEQ'],
                        ['\u200F<', 'LT'],
                        //['\u200F\u2264', 'LTE'],
                        ['\u200F>', 'GT'],
                        //['\u200F\u2265', 'GTE'],
                    ],
                },
                {
                    'type': 'input_value',
                    'name': 'B',
                },
            ],
            'message1': '%{BKY_CONTROLS_IF_MSG_THEN} %1',
            'args1': [
            {
                'type': 'input_statement',
                'name': 'DO0',
            },
            ],
            'inputsInline': true,
            'previousStatement': null,
            'nextStatement': null,
            'style': 'logic_blocks',
        },
        {
            "type": "controls_restart",
            "message0": "Restart",
            "previousStatement": null,
            "nextStatement": null,
            "colour": 230,
        },];
}