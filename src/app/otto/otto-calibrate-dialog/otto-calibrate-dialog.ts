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
import { RobotDevice } from '../robot.device';
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
  readonly isDeviceBusy = signal(false);
  readonly sensorDistance = signal(0);

  readonly leftLegControl: FormControl<number>;
  readonly leftFootControl: FormControl<number>;
  readonly rightLegControl: FormControl<number>;
  readonly rightFootControl: FormControl<number>;

  constructor(
    private dialogRef: MatDialogRef<OttoCalibrateDialog>,
    @Inject(MAT_DIALOG_DATA) private connectedDevice: RobotDevice
  ){
    this.sensorDistance.set(connectedDevice.state?.sensorDistance ?? 0);
    this.leftLegControl = new FormControl<number>(connectedDevice.state?.trimLeftLeg ?? 90);
    this.leftFootControl = new FormControl<number>(connectedDevice.state?.trimLeftFoot ?? 90);
    this.rightLegControl = new FormControl<number>(connectedDevice.state?.trimRightLeg ?? 90);
    this.rightFootControl = new FormControl<number>(connectedDevice.state?.trimRightFoot ?? 90);
  }

  close() {
    this.dialogRef.close();
  }

  formatSliderLabel(value: number): string {
    return `${value}`;
  }

  updateCalibration() {
    const commandText = `C${this.leftLegControl.value + 90}a${this.rightLegControl.value + 90}b${this.leftFootControl.value + 90}c${this.rightFootControl.value + 90}d`;
    this.sendCommand(commandText);
  }

  refresh() {
    this.isDeviceBusy.set(true);// = true;
    this.connectedDevice.updateState().subscribe({
        next: (value) => {
          this.isDeviceBusy.set(false);
          this.sensorDistance.set(value.sensorDistance);
        },
        error: () => this.isDeviceBusy.set(false)
    });
  }

  saveCalibration(): any {
    this.isDeviceBusy.set(true);// = true;
      this.connectedDevice
        .sendCommand("save_calibration")
        .subscribe({next: result => {
          this.isDeviceBusy.set(false);
          this.dialogRef.close(true);
        }, error: () => this.isDeviceBusy.set(false)});
  }

  sendCommand(command: string) {
    if(this.connectedDevice !== null) {
      this.isDeviceBusy.set(true);// = true;
      this.connectedDevice
        .sendCommand(command)
        .subscribe({next: result => {
          this.isDeviceBusy.set(false);
        }, error: () => this.isDeviceBusy.set(false)});
    }
  }

}
