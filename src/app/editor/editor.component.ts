/**
 * @fileoverview Code editor using Blockly from Google.
 */

import {Component, input, OnInit} from '@angular/core';

import * as Blockly from 'blockly';
import {BlocklyOptions} from 'blockly';
import { RobotDevice } from '../otto/robot.device';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { EditorConfigBlocks } from './config/config.blocks';
import { EditorConfigToolbox } from './config/config.toolbox';
import { CodeGenerator } from './generator/generator';

@Component({
    selector: 'app-editor',
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.scss'],
    standalone: true,
    imports: [
      MatButtonModule,
      MatIconModule
    ]
})
export class EditorComponent implements OnInit {

  // connected otto device (optional)
  connectedDevice = input<RobotDevice | null>(null); 
  codeGenerator: CodeGenerator = new CodeGenerator();
  codeWorkspace?: Blockly.Workspace;

  constructor() {

  }

  ngOnInit() {
    const blocklyDiv = document.getElementById('blocklyDiv');
    const blocks = Blockly.common.createBlockDefinitionsFromJsonArray(EditorConfigBlocks.definitions);
    const theme = Blockly.Theme.defineTheme('editorTheme', {
      base: Blockly.Themes.Classic,
      name: 'editorTheme',
      componentStyles: {
          //workspaceBackgroundColour: '#1e1e1e',
          //toolboxBackgroundColour: '#1e1e1e',
          toolboxForegroundColour: '#000',
          // flyoutBackgroundColour: '#252526',
          // flyoutForegroundColour: '#ccc',
          // flyoutOpacity: 1,
          // scrollbarColour: '#797979',
          // insertionMarkerColour: '#fff',
          // insertionMarkerOpacity: 0.3,
          // scrollbarOpacity: 0.4,
          // cursorColour: '#d0d0d0'
      }
    });

    Blockly.common.defineBlocks(blocks);
    this.codeWorkspace = Blockly.inject(blocklyDiv, {
      readOnly: false,
      media: 'media/',
      trashcan: true,
      theme: theme,
      move: {
        scrollbars: true,
        drag: true,
        wheel: true,
      },
      toolbox: EditorConfigToolbox.definitions,
    } as BlocklyOptions);

    this.codeGenerator.setWorkspaceDefaults(this.codeWorkspace);
  }

  testCodeClicked() {
    const commands = ['clear', ...this.codeGenerator.workspaceToSetCommands(this.codeWorkspace), 'start'];
    console.log(commands);
  }

  runProgramClicked() {
    const device = this.connectedDevice();
    if (device != null) {
      // const commands = [
      //   'clear',
      //   'set0 forward 1',
      //   'set1 wait 2000',
      //   'set2 backward 1',
      //   'set3 wait 2000',
      //   'set4 jmp 0',
      //   'start'
      // ];

      const commands = ['clear', ...this.codeGenerator.workspaceToSetCommands(this.codeWorkspace), 'start'];
      //const commands = ['set0 victory', 'start'];
      console.log(commands);
      device.sendCommands(commands);
    }
  }
}
