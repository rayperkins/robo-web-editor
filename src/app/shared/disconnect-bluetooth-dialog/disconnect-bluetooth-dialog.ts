import { ChangeDetectionStrategy, Component } from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';

@Component({
  selector: 'app-disconnect-bluetooth-dialog',
  imports: [MatDialogActions, MatDialogTitle, MatDialogContent, MatButtonModule],
  templateUrl: './disconnect-bluetooth-dialog.html',
  styleUrl: './disconnect-bluetooth-dialog.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DisconnectBluetoothDialog {

  constructor(
    private dialogRef: MatDialogRef<DisconnectBluetoothDialog>
  ){

  }
  
  disconnect(): any {
    this.dialogRef.close(true);
  }

  cancel() {
    this.dialogRef.close();
  }

}
