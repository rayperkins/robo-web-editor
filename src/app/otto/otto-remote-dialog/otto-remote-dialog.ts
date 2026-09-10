import { ChangeDetectionStrategy, Component, Inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { RobotDevice } from '../robot.device';
import {
  OTTO_FART,
  OTTO_HAPPY,
  OTTO_SAD,
  OTTO_SLEEPING,
  OTTO_SUPER_HAPPY,
} from '../../editor/generator/schema/commands.schema';

@Component({
  selector: 'app-otto-remote-dialog',
  imports: [MatDialogActions, MatDialogTitle, MatCardModule, MatIconModule, MatDialogContent, MatButtonModule],
  templateUrl: './otto-remote-dialog.html',
  styleUrl: './otto-remote-dialog.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OttoRemoteDialog {
  readonly isSendingCommand = signal(false);
  readonly commands = {
    forward: 'heading 0|distance 50|move 1000',
    backward: 'heading 0|distance -50|move 1000',
    left: 'heading -90|move 1000',
    right: 'heading 90|move 1000',
    stop: 'stop',
    happy: OTTO_HAPPY,
    superHappy: OTTO_SUPER_HAPPY,
    sad: OTTO_SAD,
    sleeping: OTTO_SLEEPING,
    fart: OTTO_FART,
  } as const;

  constructor(
    private dialogRef: MatDialogRef<OttoRemoteDialog>,
    @Inject(MAT_DIALOG_DATA) private ottoDevice: RobotDevice
  ) {}

  close() {
    this.dialogRef.close();
  }

  sendCommand(command: string) {
    if (this.ottoDevice !== null) {
      this.isSendingCommand.set(true);// = true;
      const commands = command.split('|');
      this.ottoDevice.sendCommands(commands).subscribe({
        next: () => this.isSendingCommand.set(false),
        error: () => this.isSendingCommand.set(false),
      });
    }
  }

}
