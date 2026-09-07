import { ChangeDetectionStrategy, Component, Inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { RobotDevice } from '../../otto/robot.device';

@Component({
  selector: 'app-olibot-calibrate-dialog',
  imports: [
    MatDialogActions,
    ReactiveFormsModule,
    MatDialogTitle,
    MatCardModule,
    MatIconModule,
    MatSliderModule,
    MatDialogContent,
    MatButtonModule,
  ],
  templateUrl: './olibot-calibrate-dialog.html',
  styleUrl: './olibot-calibrate-dialog.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OlibotCalibrateDialog {
  readonly isDeviceBusy = signal(false);
  readonly sensorDistance = signal(0);

  readonly motorBiasControl: FormControl<number>;
  readonly distanceCalibrationControl: FormControl<number>;

  constructor(
    private dialogRef: MatDialogRef<OlibotCalibrateDialog>,
    @Inject(MAT_DIALOG_DATA) private connectedDevice: RobotDevice
  ) {
    this.sensorDistance.set(connectedDevice.state?.sensorDistance ?? 0);
    this.motorBiasControl = new FormControl<number>(connectedDevice.state?.motorBias ?? 0, { nonNullable: true });
    this.distanceCalibrationControl = new FormControl<number>(
      connectedDevice.state?.distanceCalibration ?? 100,
      { nonNullable: true }
    );
  }

  close() {
    this.dialogRef.close();
  }

  formatBiasLabel(value: number): string {
    return `${value}`;
  }

  updateBias() {
    const bias = this.motorBiasControl.value;
    this.sendCommand(`bias ${bias}`);
  }

  updateDistanceCalibration() {
    const cal = this.distanceCalibrationControl.value;
    this.sendCommand(`dist_cal ${cal}`);
  }

  refresh() {
    this.isDeviceBusy.set(true);
    this.connectedDevice.updateState().subscribe({
      next: (value) => {
        this.isDeviceBusy.set(false);
        this.sensorDistance.set(value.sensorDistance);
        if (value.motorBias !== undefined) {
          this.motorBiasControl.setValue(value.motorBias);
        }
        if (value.distanceCalibration !== undefined) {
          this.distanceCalibrationControl.setValue(value.distanceCalibration);
        }
      },
      error: () => this.isDeviceBusy.set(false),
    });
  }

  testForward() {
    this.sendCommand('forward 100');
  }

  testBackward() {
    this.sendCommand('backward 100');
  }

  testTurnLeft() {
    this.sendCommand('turn -45');
  }

  testTurnRight() {
    this.sendCommand('turn 45');
  }

  testStop() {
    this.sendCommand('stop');
  }

  saveCalibration(): void {
    this.isDeviceBusy.set(true);
    this.connectedDevice.sendCommand('save_calibration').subscribe({
      next: () => {
        this.isDeviceBusy.set(false);
        this.dialogRef.close(true);
      },
      error: () => this.isDeviceBusy.set(false),
    });
  }

  sendCommand(command: string) {
    if (this.connectedDevice !== null) {
      this.isDeviceBusy.set(true);
      this.connectedDevice.sendCommand(command).subscribe({
        next: () => {
          this.isDeviceBusy.set(false);
        },
        error: () => this.isDeviceBusy.set(false),
      });
    }
  }
}
