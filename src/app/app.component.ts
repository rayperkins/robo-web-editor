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
import { BlocklyComponent } from './blockly/blockly.component';
import { OttoService } from './otto/otto.service';
import { OttoDevice } from './otto/otto.device';
import { DisconnectBluetoothDialog} from './shared/disconnect-bluetooth-dialog/disconnect-bluetooth-dialog';
import { OttoRemoteDialog } from './otto/otto-remote-dialog/otto-remote-dialog';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    imports: [
      MatToolbarModule,
      MatButtonModule,
      MatSidenavModule,
      MatListModule,
      MatIconModule,
      AsyncPipe,
      BlocklyComponent
    ]
})
export class AppComponent {

    title = 'blockly-angular-sample';
    private breakpointObserver = inject(BreakpointObserver);
        
    public isConnecting$ = new BehaviorSubject<boolean>(false);
    public connectedDevice?: OttoDevice;
    
    constructor(
        private dialog: MatDialog,
        private ottoService: OttoService,
    ) {

    }

    isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
        .pipe(
        map(result => result.matches),
        shareReplay()
        );

    bluetoothConnectClicked() {
        this.isConnecting$.next(true);
        this.ottoService.discover().subscribe({next: (device) =>
        {
            device.connect().subscribe({next: (isConnected) => {
                this.isConnecting$.next(false);
                if(isConnected) {
                    console.log('connected!!!');

                    this.connectedDevice = device;
                    // this.connectedDevice.sendCommand('victory').subscribe({
                    //     next: () => console.log('command sent!')
                    // });
                }
            }, error: () => this.isConnecting$.next(false)});

        }, error: () => this.isConnecting$.next(false)});
    }

    bluetoothDisconnectClicked() {
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
