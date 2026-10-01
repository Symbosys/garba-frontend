import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { State, City } from 'country-state-city';

export interface LocationState {
  selectedStateCode: string;
  selectedStateName: string;
  selectedCity: string;
  setSelectedStateCode: (code: string, explicitName?: string, defaultCity?: string) => void;
  setSelectedCity: (city: string) => void;
  clearCity: () => void;
  setLocation: (code: string, name: string, city?: string) => void;
  resetLocation: () => void;
}

const DEFAULT_STATE_CODE = 'GJ';
const DEFAULT_STATE_NAME = 'Gujarat';
const DEFAULT_CITY = ''; // Default to all cities in Gujarat unless specified

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      selectedStateCode: DEFAULT_STATE_CODE,
      selectedStateName: DEFAULT_STATE_NAME,
      selectedCity: DEFAULT_CITY,

      setSelectedStateCode: (code: string, explicitName?: string, defaultCity?: string) => {
        let stateName = explicitName;
        if (!stateName) {
          const stateObj = State.getStateByCodeAndCountry(code, 'IN');
          stateName = stateObj?.name || code;
        }

        set({
          selectedStateCode: code,
          selectedStateName: stateName,
          selectedCity: defaultCity ?? '',
        });
      },

      setSelectedCity: (city: string) => set({ selectedCity: city || '' }),

      clearCity: () => set({ selectedCity: '' }),

      setLocation: (code: string, name: string, city: string = '') =>
        set({
          selectedStateCode: code,
          selectedStateName: name,
          selectedCity: city,
        }),

      resetLocation: () =>
        set({
          selectedStateCode: DEFAULT_STATE_CODE,
          selectedStateName: DEFAULT_STATE_NAME,
          selectedCity: DEFAULT_CITY,
        }),
    }),
    {
      name: 'garba_global_platform_location',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
