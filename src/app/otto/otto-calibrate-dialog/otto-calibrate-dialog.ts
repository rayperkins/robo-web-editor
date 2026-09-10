import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { RobotDevice } from '../robot.device';
import { Subscription } from 'rxjs';
import { RobotStatus } from '../../editor/generator/schema/state.schema';
import {
  CALIBRATE,
  OTTO_LEFTFOOT_TRIM,
  OTTO_LEFTLEG_TRIM,
  OTTO_HOME,
  OTTO_RIGHTFOOT_TRIM,
  OTTO_RIGHTLEG_TRIM,
  ROBOT_NAME_SUFFIX,
  SAVE_CALIBRATION,
} from '../../editor/generator/schema/commands.schema';

@Component({
  selector: 'app-otto-calibrate-dialog',
  imports: [MatDialogActions, ReactiveFormsModule, MatDialogTitle, MatCardModule, MatIconModule, MatSliderModule, MatProgressBarModule, MatDialogContent, MatButtonModule, MatInputModule, MatFormFieldModule],
  templateUrl: './otto-calibrate-dialog.html',
  styleUrl: './otto-calibrate-dialog.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OttoCalibrateDialog implements OnDestroy {
  readonly isDeviceBusy = signal(false);
  readonly isCalibrating = signal(false);
  readonly calibrationProgress = signal(0);
  readonly sensorDistance = signal(0);
  readonly leftLegControl: FormControl<number>;
  readonly leftFootControl: FormControl<number>;
  readonly rightLegControl: FormControl<number>;
  readonly rightFootControl: FormControl<number>;
  readonly nameSuffixControl: FormControl<string>;
  readonly leftLegTrimCommand = OTTO_LEFTLEG_TRIM;
  readonly rightLegTrimCommand = OTTO_RIGHTLEG_TRIM;
  readonly leftFootTrimCommand = OTTO_LEFTFOOT_TRIM;
  readonly rightFootTrimCommand = OTTO_RIGHTFOOT_TRIM;
  private calibrationDebounce?: ReturnType<typeof setTimeout>;
  private readonly pendingTrimCommands = new Map<string, number>();
  private readonly stateSubscription: Subscription;
  constructor(
    private dialogRef: MatDialogRef<OttoCalibrateDialog>,
    @Inject(MAT_DIALOG_DATA) private connectedDevice: RobotDevice,
    private changeDetectorRef: ChangeDetectorRef
  ){
    this.sensorDistance.set(connectedDevice.state?.sensorDistance ?? 0);
    this.leftLegControl = new FormControl<number>(connectedDevice.state?.trimLeftLeg ?? 0, { nonNullable: true });
    this.leftFootControl = new FormControl<number>(connectedDevice.state?.trimLeftFoot ?? 0, { nonNullable: true });
    this.rightLegControl = new FormControl<number>(connectedDevice.state?.trimRightLeg ?? 0, { nonNullable: true });
    this.rightFootControl = new FormControl<number>(connectedDevice.state?.trimRightFoot ?? 0, { nonNullable: true });
    this.nameSuffixControl = new FormControl<string>(this.getNameSuffix(), {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^[A-Z0-9]{3}$/)],
    });
    this.stateSubscription = connectedDevice.stateChanges.subscribe(state => {
      const calibrating = state.robotStatus === RobotStatus.CalibrationRunning;
      this.isCalibrating.set(calibrating);
      if (calibrating) {
        this.calibrationProgress.set(Math.max(0, Math.min(100, state.currentStep)));
      }
    });
    this.refresh();
  }

  close() {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    this.stateSubscription.unsubscribe();
    if (this.calibrationDebounce !== undefined) {
      clearTimeout(this.calibrationDebounce);
    }
  }

  formatSliderLabel(value: number): string {
    return `${value}`;
  }

  updateCalibration(command: string, value: number) {
    this.pendingTrimCommands.set(command, value);
    if (this.calibrationDebounce !== undefined) {
      clearTimeout(this.calibrationDebounce);
    }
    this.calibrationDebounce = setTimeout(() => this.sendCalibrationCommands(), 300);
  }

  private sendCalibrationCommands() {
    const trimCommands = Array.from(this.pendingTrimCommands.entries())
      .map(([command, value]) => `${command} ${value}`);
    this.pendingTrimCommands.clear();
    if (trimCommands.length === 0) {
      return;
    }
    this.isDeviceBusy.set(true);
    this.connectedDevice.sendCommands([...trimCommands, OTTO_HOME]).subscribe({
      complete: () => this.isDeviceBusy.set(false),
      error: () => this.isDeviceBusy.set(false),
    });
  }

  calibrate() {
    this.sendCommand(CALIBRATE);
  }

  refresh() {
    this.isDeviceBusy.set(true);// = true;
    this.connectedDevice.updateCalibration().subscribe({
        next: calibration => {
          this.isDeviceBusy.set(false);
          this.sensorDistance.set(calibration.sensorDistance);
          if (calibration.trimLeftLeg !== undefined) this.leftLegControl.setValue(calibration.trimLeftLeg);
          if (calibration.trimLeftFoot !== undefined) this.leftFootControl.setValue(calibration.trimLeftFoot);
          if (calibration.trimRightLeg !== undefined) this.rightLegControl.setValue(calibration.trimRightLeg);
          if (calibration.trimRightFoot !== undefined) this.rightFootControl.setValue(calibration.trimRightFoot);
          this.changeDetectorRef.markForCheck();
        },
        error: () => this.isDeviceBusy.set(false)
    });
  }

  saveCalibration() {
    const suffix = this.nameSuffixControl.value.toUpperCase();
    this.nameSuffixControl.setValue(suffix);
    if (this.nameSuffixControl.invalid) {
      this.nameSuffixControl.markAsTouched();
      return;
    }
    this.isDeviceBusy.set(true);
    this.connectedDevice.sendCommands([`${ROBOT_NAME_SUFFIX} ${suffix}`, SAVE_CALIBRATION]).subscribe({
      complete: () => {
        this.isDeviceBusy.set(false);
        this.dialogRef.close(true);
      },
      error: () => this.isDeviceBusy.set(false),
    });
  }

  normalizeNameSuffix() {
    this.nameSuffixControl.setValue(this.nameSuffixControl.value.toUpperCase(), { emitEvent: false });
  }

  private getNameSuffix(): string {
    const prefix = this.connectedDevice.robotType === 'olibot' ? 'OLIB' : 'OTTO';
    const suffix = this.connectedDevice.name.toUpperCase().slice(prefix.length).replace(/^[^A-Z0-9]+/, '');
    return suffix.slice(0, 3);
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
