export class EditorConfigToolbox {
    static definitions: any = {
        kind: 'categoryToolbox',
        contents: [{
                "kind": "category",
                "name": "Actions",
                //"categorystyle": "logic_category",
                "colour": 190,
                "contents": [{
                        kind: 'block',
                        type: 'action_wait'
                    },{
                        kind: 'block',
                        type: 'action_backward'
                    },{
                        kind: 'block',
                        type: 'action_forward'
                    },{
                        kind: 'block',
                        type: 'action_turnleft'
                    },{
                        kind: 'block',
                        type: 'action_turnright'
                    },{
                        kind: 'block',
                        type: 'action_stop'
                    },{
                        kind: 'block',
                        type: 'action_victory'
                    }
                ]
            }, {
                "kind": "category",
                "name": "Logic",
                "categorystyle": "logic_category",
                "contents": [{
                        kind: 'block',
                        type: 'math_number',
                    },{
                        kind: 'block',
                        type: 'variables_get',
                    },{
                        kind: 'block',
                        type: 'variables_set',
                    },{
                        kind: 'block',
                        type: 'variables_set',
                    },{
                        kind: 'block',
                        type: 'controls_restart',
                    },{
                        kind: 'block',
                        type: 'controls_repeat_ext',
                        inputs: {
                            TIMES: {
                                shadow: {
                                    type: 'math_number',
                                    fields: {
                                        NUM: 10,
                                    },
                                },
                            },
                        },
                    },{
                        kind: 'block',
                        type: 'controls_if_basic',
                        inputs: {
                            A: {
                                shadow: {
                                    type: 'math_number',
                                    fields: {
                                        NUM: 1,
                                    },
                                },
                            },
                            B: {
                                shadow: {
                                    type: 'math_number',
                                    fields: {
                                        NUM: 1,
                                    },
                                },
                            },
                        },
                    },
                ]
            }
        ],
    };
}