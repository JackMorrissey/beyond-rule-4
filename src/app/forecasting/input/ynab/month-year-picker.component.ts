import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCalendar, faChevronLeft, faChevronRight, faTimes } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-month-year-picker',
  standalone: true,
  imports: [CommonModule, NgbDropdownModule, FontAwesomeModule],
  templateUrl: './month-year-picker.component.html'
})
export class MonthYearPickerComponent {
  faCalendar = faCalendar;
  faLeft = faChevronLeft;
  faRight = faChevronRight;
  faClear = faTimes;

  @Input() selectedMonth: number | null = null; 
  @Input() selectedYear: number | null = null;
  @Input() placeholder: string = 'Select Month/Year';
  
  @Output() dateChange = new EventEmitter<{ month: number, year: number } | null>();

  months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Helper to ensure we have a year to display in the dropdown even if input is null
  get displayYear(): number {
    return this.selectedYear ?? new Date().getFullYear();
  }

  changeYear(offset: number) {
    this.selectedYear = this.displayYear + offset;
    // If a month is already selected, emit the change
    if (this.selectedMonth !== null) {
      this.emitChange();
    }
  }

  onYearInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = parseInt(input.value, 10);
    
    if (!isNaN(value) && value > 0) {
      this.selectedYear = value;
      if (this.selectedMonth !== null) {
        this.emitChange();
      }
    }
  }

  selectMonth(index: number) {
    this.selectedMonth = index;
    // If selecting a month for the first time and year is null, set to current year
    if (this.selectedYear === null) {
      this.selectedYear = new Date().getFullYear();
    }
    this.emitChange();
  }

  clear(event: MouseEvent) {
    event.stopPropagation(); // Don't open the dropdown when clearing
    this.selectedMonth = null;
    this.selectedYear = null;
    this.dateChange.emit(null);
  }

  private emitChange() {
    if (this.selectedMonth !== null && this.selectedYear !== null) {
      this.dateChange.emit({ month: this.selectedMonth, year: this.selectedYear });
    }
  }
}