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
                    },
                    {
                        kind: 'block',
                        type: 'action_forward'
                    },{
                        kind: 'block',
                        type: 'action_stop'
                    }
                ]
            }, {
                "kind": "category",
                "name": "Logic",
                "categorystyle": "logic_category",
                "contents": [{
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
                    },
                    // {
                    //     kind: 'block',
                    //     type: 'controls_ifelse',
                    // },
                ]
            }
        ],
    };
}