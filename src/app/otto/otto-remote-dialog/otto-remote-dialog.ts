import { ChangeDetectionStrategy, Component, Inject, input, signal } from '@angular/core';
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

  constructor(
    private dialogRef: MatDialogRef<OttoRemoteDialog>,
    @Inject(MAT_DIALOG_DATA) private ottoDevice: RobotDevice
  ){

  }

  close() {
    this.dialogRef.close();
  }

  sendCommand(command: string) {
    if(this.ottoDevice !== null) {
      this.isSendingCommand.set(true);// = true;
      this.ottoDevice
        .sendCommand(command)
        .subscribe({next: result => {
          this.isSendingCommand.set(false);
        }, error: () => this.isSendingCommand.set(false)});
    }
  }

}
