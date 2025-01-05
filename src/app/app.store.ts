import {
  patchState,
  signalStore,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';

export const FILTER_KEY = 'FILTER_KEY';

type AppState = {
  filter: {
    text: string;
    start: string;
    end: string;
    select: string;
  };

  foods: any[];
};

const initialState: AppState = {
  filter: {
    text: '',
    start: '',
    end: '',
    select: '',
  },
  foods: [{ value: 'Steak' }, { value: 'Pizza' }, { value: 'Tacos' }],
};

export const AppStore = signalStore(
  withState(initialState),

  withMethods((store) => ({
    updateFilter(query: Object): void {
      patchState(store, (state) => ({ filter: { ...state.filter, ...query } }));
    },
  })),

  withHooks({
    onInit(store) {
      const savedFilter = localStorage.getItem(FILTER_KEY);

      if (savedFilter) {
        const { text, start, end, select } = JSON.parse(savedFilter);
        store.updateFilter({
          text,
          start,
          end,
          select,
        });
      }
    },
  })
);
