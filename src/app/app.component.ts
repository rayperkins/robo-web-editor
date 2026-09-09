import {Component, inject} from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { EditorComponent } from './editor/editor.component';
import { RobotService } from './otto/robot.service';
import { RobotDevice } from './otto/robot.device';
import { DisconnectBluetoothDialog} from './shared/disconnect-bluetooth-dialog/disconnect-bluetooth-dialog';
import { OttoRemoteDialog } from './otto/otto-remote-dialog/otto-remote-dialog';
import { OttoCalibrateDialog } from './otto/otto-calibrate-dialog/otto-calibrate-dialog';
import { OlibotRemoteDialog } from './olibot/olibot-remote-dialog/olibot-remote-dialog';
import { OlibotCalibrateDialog } from './olibot/olibot-calibrate-dialog/olibot-calibrate-dialog';
import { ProgramError } from './editor/generator/schema/state.schema';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    imports: [
      MatToolbarModule,
      MatButtonModule,
      MatIconModule,
      MatSidenavModule,
      MatListModule,
      EditorComponent
    ]
})
export class AppComponent {

    title = 'blockly-angular-sample';
    private breakpointObserver = inject(BreakpointObserver);
        
    public isConnecting$ = new BehaviorSubject<boolean>(false);
    public connectedDevice?: RobotDevice;
    readonly ProgramError = ProgramError;

    constructor(
        private dialog: MatDialog,
        private robotService: RobotService,
    ) {

    }

    isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
        .pipe(
        map(result => result.matches),
        shareReplay()
        );

    get hasProgramError(): boolean {
        const state = this.connectedDevice?.state;
        return state?.programError !== undefined
            && state.programError !== ProgramError.None
            && state.programId === this.connectedDevice?.currentRunProgramId;
    }

    get programErrorDescription(): string {
        const state = this.connectedDevice?.state;
        if (!state || state.programError === ProgramError.None
            || state.programId !== this.connectedDevice?.currentRunProgramId) {
            return '';
        }

        const error = state.programError === ProgramError.MotionTimeout
            ? 'Motion timeout'
            : 'Runtime failure';
        return `${error} at instruction ${state.currentInstructionIndex}`;
    }

    bluetoothConnectionClicked() {
        if(this.connectedDevice) {
            this.dialog
                .open(DisconnectBluetoothDialog)
                .afterClosed()
                .subscribe({next: result => {
                    if(result !== undefined) {
                        this.connectedDevice.disconnect();
                        this.connectedDevice = null;
                    }
                }});
        }
        else {
            this.isConnecting$.next(true);
            this.robotService.discover().subscribe({next: (device) =>
            {
                device.connect().subscribe({next: (isConnected) => {
                    this.isConnecting$.next(false);
                    if(isConnected) {
                        console.log('connected!!!');

                        this.connectedDevice = device;

                        this.connectedDevice.updateState().subscribe({

                            next: (value) => console.log("state updated!!!", value)
                        });
                    }
                }, error: () => this.isConnecting$.next(false)});

            }, error: () => this.isConnecting$.next(false)});
        }
    }

    openCalibrateClicked() {
        if(this.connectedDevice) {
            const dialogRef = this.connectedDevice.robotType === 'olibot'
                ? this.dialog.open(OlibotCalibrateDialog, { data: this.connectedDevice })
                : this.dialog.open(OttoCalibrateDialog, { data: this.connectedDevice });

            dialogRef.afterClosed().subscribe({next: result => {
                if(result !== undefined) {
                    this.connectedDevice.disconnect();
                    this.connectedDevice = null;
                }
            }});
        }
    }

    openRemoteClicked() {
        if(this.connectedDevice) {
            const dialogRef = this.connectedDevice.robotType === 'olibot'
                ? this.dialog.open(OlibotRemoteDialog, { data: this.connectedDevice })
                : this.dialog.open(OttoRemoteDialog, { data: this.connectedDevice });

            dialogRef.afterClosed().subscribe({next: result => {
                if(result !== undefined) {
                    this.connectedDevice.disconnect();
                    this.connectedDevice = null;
                }
            }});
        }
    }
}
