import { Component, effect, inject, Injector, OnInit } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';

import { JsonPipe } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AppStore, FILTER_KEY } from './app.store';

import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { first } from 'lodash';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    MatSidenavModule,
    MatDatepickerModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    JsonPipe,
    MatInputModule,
    MatSelectModule,
  ],

  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers: [provideNativeDateAdapter(), AppStore],
})
export class AppComponent implements OnInit {
  title = 'user-management';

  readonly store = inject(AppStore);

  searchTerm = new Subject<string>();

  filterForm: FormGroup = new FormGroup({});

  isReady = false;

  constructor(private injector: Injector, private formBuilder: FormBuilder) {
    this.searchTerm.pipe(debounceTime(1000)).subscribe((text) => {
      console.log(text);
      this.store.updateFilter({ text });
    });
  }

  ngOnInit(): void {
    const { text, start, end, select } = this.store.filter();
    const firstOption = first(this.store.foods());

    this.filterForm = this.formBuilder.group({
      text: new FormControl<string | null>(text || null),
      start: new FormControl(start ? new Date(start).toISOString() : null),
      end: new FormControl(start ? new Date(end).toISOString() : null),
      select: new FormControl<null>(select || firstOption, Validators.required),
    });

    this.listenFilterChanges();
  }

  listenFilterChanges(): void {
    effect(
      () => {
        const filterValue = this.store.filter();
        this.onSubmit(filterValue);
      },
      { injector: this.injector }
    );
  }

  onInput = (event: string) => {
    this.searchTerm.next(event);
  };

  onSelectChanged = (select: any) => {
    console.log(select);
    this.control('text')?.reset();
    this.store.updateFilter({ select, text: null });
  };

  onDateChanged = (event: any) => {
    const startControl = this.control('start');
    const endControl = this.control('end');

    const { value: startValue } = startControl;
    const { value: endValue } = endControl;
    if (!endValue) endControl.setValue(startValue);
    this.store.updateFilter({
      start: startValue,
      end: this.control('end').value,
    });
  };

  onSubmit = (condition: any) => {
    localStorage.setItem(FILTER_KEY, JSON.stringify(condition));
  };

  control = (key: string) => {
    return this.filterForm.controls[key];
  };

  get searchPlaceholder(): string {
    const selectControl = this.control('select');
    return selectControl ? selectControl.value : '';
  }
}
