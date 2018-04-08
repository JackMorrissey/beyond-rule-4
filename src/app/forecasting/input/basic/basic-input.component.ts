import { Component, OnInit, OnChanges, SimpleChanges, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { fromEvent } from 'rxjs/observable/fromEvent';

import { CalculateInput } from '../../models/calculate-input.model';

@Component({
  selector: 'app-basic-input',
  templateUrl: 'basic-input.component.html'
})

export class BasicInputComponent implements OnInit, OnChanges {
  @Input() calculateInput: CalculateInput;
  @Output() calculateInputChange = new EventEmitter<CalculateInput>();

  basicInputForm: FormGroup;

  private currentFormValues = '';

  constructor(private formBuilder: FormBuilder) {
  }

  ngOnInit() {
    this.onFormChanges();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes.calculateInput && changes.calculateInput.currentValue) {
      this.basicInputForm = this.formBuilder.group(Object.assign({}, changes.calculateInput.currentValue));
    }
  }

  onFormChanges(): void {
    this.basicInputForm.valueChanges.subscribe(val => {
      if (this.basicInputForm.valid) {
        const formValues = JSON.stringify(val);
        if (this.currentFormValues === formValues) {
          return;
        }
        this.currentFormValues = formValues;
        this.calculateInputChange.emit(new CalculateInput(val));
      }
    });
  }
}
