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
import { RobotDevice } from '../../otto/robot.device';

@Component({
  selector: 'app-olibot-remote-dialog',
  imports: [MatDialogActions, MatDialogTitle, MatCardModule, MatIconModule, MatDialogContent, MatButtonModule],
  templateUrl: './olibot-remote-dialog.html',
  styleUrl: './olibot-remote-dialog.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OlibotRemoteDialog {
  readonly isSendingCommand = signal(false);
  readonly commands = {
    forward: 'heading 0|distance 100|move 100',
    backward: 'heading 180|distance 100|move 100',
    left: 'heading -45|move 100',
    right: 'heading 45|move 100',
    stop: 'stop',
    speed30: 'speed 30',
    speed60: 'speed 60',
    speed100: 'speed 100',
  } as const;

  constructor(
    private dialogRef: MatDialogRef<OlibotRemoteDialog>,
    @Inject(MAT_DIALOG_DATA) private robotDevice: RobotDevice
  ) {}

  close() {
    this.dialogRef.close();
  }

  sendCommand(command: string) {
    if (this.robotDevice !== null) {
      this.isSendingCommand.set(true);
      const commands = command.split('|');
      this.robotDevice.sendCommands(commands).subscribe({
        next: () => {
          this.isSendingCommand.set(false);
        },
        error: () => this.isSendingCommand.set(false),
      });
    }
  }
}
