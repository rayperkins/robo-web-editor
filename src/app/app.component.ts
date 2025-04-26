import {Component} from '@angular/core';
import { BlocklyComponent } from './blockly/blockly.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    imports: [BlocklyComponent]
})
export class AppComponent {
  title = 'blockly-angular-sample';
}
