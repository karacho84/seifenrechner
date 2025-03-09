import { writable } from 'svelte/store'
import type { Writable } from 'svelte/store'
import { oils } from '$lib/data/oils'

export interface Oil {
  id: string
  name: string
  sapNaoh: number // Verseifungszahl für NaOH
  sapKoh: number  // Verseifungszahl für KOH
  properties: {
    hardness: number    // 0-100
    cleansing: number   // 0-100
    conditioning: number // 0-100
    bubbly: number      // 0-100
    creamy: number      // 0-100
    iodine: number      // Jodzahl
    ins: number         // INS Wert
  }
}

export interface Recipe {
  id: string
  name: string
  totalOilWeight: number  // Neue Eigenschaft für die Gesamtfettmenge
  oils: {
    oilId: string
    percentage: number    // Statt amount verwenden wir jetzt percentage (0-100)
  }[]
  lyeType: 'NaOH' | 'KOH'
  superFat: number
  waterRatio: number
  notes: string
  createdAt: Date
  updatedAt: Date
}

const STORAGE_KEY = 'seifenrechner_recipes';

function loadFromStorage(): { recipes: Recipe[]; activeRecipe: Recipe | null; unsavedChanges: boolean } {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { recipes: [], activeRecipe: null, unsavedChanges: false };

    const data = JSON.parse(stored);
    const recipes = data.recipes.map((recipe: any) => ({
      ...recipe,
      createdAt: new Date(recipe.createdAt),
      updatedAt: new Date(recipe.updatedAt)
    }));
    
    const activeRecipe = data.activeRecipe 
      ? {
          ...data.activeRecipe,
          createdAt: new Date(data.activeRecipe.createdAt),
          updatedAt: new Date(data.activeRecipe.updatedAt)
        }
      : null;

    return { recipes, activeRecipe, unsavedChanges: false };
  } catch (e) {
    console.error('Fehler beim Laden der Rezepte:', e);
    return { recipes: [], activeRecipe: null, unsavedChanges: false };
  }
}

function createRecipeStore() {
  const { subscribe, set, update } = writable<{
    recipes: Recipe[];
    activeRecipe: Recipe | null;
    unsavedChanges: boolean;
  }>(loadFromStorage());

  const store = {
    subscribe,
    addRecipe: (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>) => {
      update(state => {
        const newRecipe: Recipe = {
          ...recipe,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date()
        };
        return {
          ...state,
          recipes: [...state.recipes, newRecipe],
          activeRecipe: newRecipe,
          unsavedChanges: true
        };
      });
    },
    updateRecipe: (id: string, updates: Partial<Recipe>) => {
      update(state => {
        const recipeIndex = state.recipes.findIndex(recipe => recipe.id === id);
        if (recipeIndex === -1) return state; // Rezept nicht gefunden

        const currentRecipe = state.recipes[recipeIndex];
        const updatedRecipe = { ...currentRecipe, ...updates, updatedAt: new Date() };
        
        // Protokolliere die Änderungen
        console.log(`Aktualisiere Rezept: ${currentRecipe.name}`);
        console.log('Aktuelle Werte:', currentRecipe);
        console.log('Neue Werte:', updatedRecipe);

        const updatedRecipes = state.recipes.map(recipe =>
          recipe.id === id
            ? updatedRecipe
            : recipe
        );

        return {
          ...state,
          recipes: updatedRecipes,
          activeRecipe: updatedRecipes.find(r => r.id === id) || state.activeRecipe,
          unsavedChanges: true
        };
      });
    },
    saveChanges: () => {
      update(state => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({
            recipes: state.recipes,
            activeRecipe: state.activeRecipe
          }));
          return { ...state, unsavedChanges: false };
        } catch (error) {
          console.error('Failed to save to localStorage:', error);
          return state;
        }
      });
    },
    deleteRecipe: (id: string) => {
      update(state => {
        const newState = {
          recipes: state.recipes.filter(recipe => recipe.id !== id),
          activeRecipe: state.activeRecipe?.id === id ? null : state.activeRecipe,
          unsavedChanges: true
        };
        return newState;
      });
    },
    setActiveRecipe: (id: string) => {
      update(state => {
        if (state.unsavedChanges) {
          // Verwerfe Änderungen
          const savedState = loadFromStorage();
          return {
            ...savedState,
            activeRecipe: savedState.recipes.find(r => r.id === id) || null
          };
        }
        return {
          ...state,
          activeRecipe: state.recipes.find(r => r.id === id) || null
        };
      });
    },

    calculateLye: (recipe: Recipe): number => {
      const totalLye = recipe.oils.reduce((sum, oil) => {
        const oilData = oils.find(o => o.id === oil.oilId);
        if (!oilData) return sum;
        
        const oilWeight = (oil.percentage / 100) * recipe.totalOilWeight;
        const lyeSap = recipe.lyeType === 'NaOH' ? oilData.naohSap : oilData.kohSap;
        return sum + (oilWeight * lyeSap);
      }, 0);

      return totalLye * (1 - recipe.superFat / 100);
    },

    calculateProperties: (recipe: Recipe) => {
      const totalWeight = recipe.oils.reduce((sum, oil) => sum + oil.percentage, 0);
      if (totalWeight === 0) return {
        hardness: 0,
        cleansing: 0,
        conditioning: 0,
        bubbly: 0,
        creamy: 0,
        iodine: 0,
        ins: 0
      };

      return recipe.oils.reduce((props, oil) => {
        const oilData = oils.find(o => o.id === oil.oilId);
        if (!oilData) return props;

        const factor = oil.percentage / totalWeight;
        return {
          hardness: props.hardness + oilData.properties.hardness * factor,
          cleansing: props.cleansing + oilData.properties.cleansing * factor,
          conditioning: props.conditioning + oilData.properties.conditioning * factor,
          bubbly: props.bubbly + oilData.properties.bubbly * factor,
          creamy: props.creamy + oilData.properties.creamy * factor,
          iodine: props.iodine + oilData.properties.iodine * factor,
          ins: props.ins + oilData.properties.ins * factor
        };
      }, {
        hardness: 0,
        cleansing: 0,
        conditioning: 0,
        bubbly: 0,
        creamy: 0,
        iodine: 0,
        ins: 0
      });
    },

    calculateTotalWeight: (recipe: Recipe): number => {
      const lyeAmount = store.calculateLye(recipe);
      const waterAmount = lyeAmount * recipe.waterRatio;
      return recipe.totalOilWeight + lyeAmount + waterAmount;
    }
  }

  return store;
}

export const recipeStore = createRecipeStore()
