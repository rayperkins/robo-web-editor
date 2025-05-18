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
            this.dialog
                .open(OttoCalibrateDialog, {
                    data: this.connectedDevice
                })
                .afterClosed()
                .subscribe({next: result => {
                    if(result !== undefined) {
                        this.connectedDevice.disconnect();
                        this.connectedDevice = null;
                    }
                }});
        }
    }

    openRemoteClicked() {
        if(this.connectedDevice) {
            this.dialog
                .open(OttoRemoteDialog, {
                    data: this.connectedDevice
                })
                .afterClosed()
                .subscribe({next: result => {
                    if(result !== undefined) {
                        this.connectedDevice.disconnect();
                        this.connectedDevice = null;
                    }
                }});
        }
    }
}
