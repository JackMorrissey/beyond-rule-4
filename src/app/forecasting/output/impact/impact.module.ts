import { NgModule } from '@angular/core';
import { ImpactComponent } from './impact.component';
import { SharedModule } from '../../../shared.module';

@NgModule({
    imports: [SharedModule],
    exports: [ImpactComponent],
    declarations: [ImpactComponent],
    providers: []
})

export class ImpactModule { }
