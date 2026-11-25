import { INITIAL_SEARCH_FORM, type SearchFormState } from '@/features/booking/lib/searchForm';
import { searchFormReducer, type SearchFormAction } from '@/features/booking/lib/searchFormReducer';
import { createStore } from '@/lib/createStore';

/**
 * The phone search form. It is the website's search form state and reducer, kept in a store so
 * it survives switching tabs and going to the results screen and back.
 */
export const phoneSearchStore = createStore<SearchFormState>(INITIAL_SEARCH_FORM, {
  persistKey: 'vela.phone.search',
});

export function dispatchSearch(action: SearchFormAction): void {
  phoneSearchStore.setState((state) => searchFormReducer(state, action));
}

export function usePhoneSearch(): SearchFormState {
  return phoneSearchStore.useStore((state) => state);
}
