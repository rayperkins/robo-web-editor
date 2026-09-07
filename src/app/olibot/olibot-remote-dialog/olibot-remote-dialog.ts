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
      this.robotDevice.sendCommand(command).subscribe({
        next: () => {
          this.isSendingCommand.set(false);
        },
        error: () => this.isSendingCommand.set(false),
      });
    }
  }
}
