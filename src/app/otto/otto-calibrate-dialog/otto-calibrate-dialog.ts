import { ChangeDetectionStrategy, Component, Inject, input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule} from '@angular/material/slider';
import { ReactiveFormsModule  } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { OttoDevice } from '../otto.device';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-otto-calibrate-dialog',
  imports: [MatDialogActions, ReactiveFormsModule, MatDialogTitle, MatCardModule, MatIconModule, MatSliderModule, MatDialogContent, MatButtonModule],
  templateUrl: './otto-calibrate-dialog.html',
  styleUrl: './otto-calibrate-dialog.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OttoCalibrateDialog {
  readonly isSendingCommand = signal(false);
  readonly leftLegControl: FormControl<number> = new FormControl<number>(90);
  readonly leftFootControl: FormControl<number> = new FormControl<number>(90);
  readonly rightLegControl: FormControl<number> = new FormControl<number>(90);
  readonly rightFootControl: FormControl<number> = new FormControl<number>(90);

  constructor(
    private dialogRef: MatDialogRef<OttoCalibrateDialog>,
    @Inject(MAT_DIALOG_DATA) private ottoDevice: OttoDevice
  ){

  }

  close() {
    this.dialogRef.close();
  }

  formatSliderLabel(value: number): string {
    return `${value}`;
  }

  updateCalibration() {
    const commandText = `C${this.leftLegControl.value}a${this.rightLegControl.value}b${this.leftFootControl.value}c${this.rightFootControl.value}d`;
    this.sendCommand(commandText);
  }

  saveCalibration(): any {
    this.isSendingCommand.set(true);// = true;
      this.ottoDevice
        .sendCommand("save_calibration")
        .subscribe({next: result => {
          this.isSendingCommand.set(false);
          this.dialogRef.close(true);
        }, error: () => this.isSendingCommand.set(false)});
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
