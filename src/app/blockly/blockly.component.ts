/**
 * @license
 *
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Blockly Angular Component.
 * @author samelh@google.com (Sam El-Husseini)
 */

import {Component, input, OnInit} from '@angular/core';

import * as Blockly from 'blockly';
import {BlocklyOptions} from 'blockly';
import { OttoDevice } from '../otto/otto.device';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-blockly',
    templateUrl: './blockly.component.html',
    styleUrls: ['./blockly.component.scss'],
    standalone: true,
    imports: [
      MatButtonModule,
      MatIconModule
    ]
})
export class BlocklyComponent implements OnInit {

  // connected otto device (optional)
  connectedDevice = input<OttoDevice|null>(null); 

  constructor() {}

  ngOnInit() {
    const blocklyDiv = document.getElementById('blocklyDiv');
    const toolbox = {
      kind: 'flyoutToolbox',
      contents: [
        {
          kind: 'block',
          type: 'controls_ifelse',
        },
        {
          kind: 'block',
          type: 'logic_compare',
        },
        {
          kind: 'block',
          type: 'logic_operation',
        },
        {
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
        {
          kind: 'block',
          type: 'logic_operation',
        },
        {
          kind: 'block',
          type: 'logic_negate',
        },
        {
          kind: 'block',
          type: 'logic_boolean',
        },
        {
          kind: 'block',
          type: 'logic_null',
          disabled: 'true',
        },
        {
          kind: 'block',
          type: 'logic_ternary',
        },
        {
          kind: 'block',
          type: 'text_charAt',
          inputs: {
            VALUE: {
              block: {
                type: 'variables_get',
                fields: {
                  VAR: {
                    name: 'text',
                  },
                },
              },
            },
          },
        },
      ],
    };

    Blockly.inject(blocklyDiv, {
      readOnly: false,
      media: 'media/',
      trashcan: true,
      move: {
        scrollbars: true,
        drag: true,
        wheel: true,
      },
      toolbox,
    } as BlocklyOptions);
  }

  runProgramClicked() {
    const device = this.connectedDevice();
    if (device != null) {
      const commands = [
        'clear',
        'set0 forward 1',
        'set1 wait 2000',
        'set2 backward 1',
        'set3 wait 2000',
        'set4 jmp 0',
        'start'
      ];

      device.sendCommands(commands);
    }
  }
}
