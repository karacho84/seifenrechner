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
  oils: {
    oilId: string
    amount: number
  }[]
  lyeType: 'NaOH' | 'KOH'
  superFat: number
  waterRatio: number
  notes: string
  createdAt: Date
  updatedAt: Date
}

function createRecipeStore() {
  const { subscribe, update } = writable<{
    recipes: Recipe[]
    activeRecipe: Recipe | null
  }>({
    recipes: [],
    activeRecipe: null
  });

  return {
    subscribe,
    
    addRecipe: (newRecipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>) => update(store => {
      const recipe = {
        ...newRecipe,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      return {
        ...store,
        recipes: [...store.recipes, recipe],
        activeRecipe: recipe  // Setze das neue Rezept als aktiv
      };
    }),

    updateRecipe: (id: string, updatedRecipe: Partial<Recipe>) => update(store => {
      const updatedRecipes = store.recipes.map(recipe => 
        recipe.id === id 
          ? { ...recipe, ...updatedRecipe, updatedAt: new Date() }
          : recipe
      );
      
      // Aktualisiere auch das aktive Rezept
      const updatedActiveRecipe = store.activeRecipe?.id === id
        ? { ...store.activeRecipe, ...updatedRecipe, updatedAt: new Date() }
        : store.activeRecipe;

      return {
        recipes: updatedRecipes,
        activeRecipe: updatedActiveRecipe
      };
    }),

    deleteRecipe: (id: string) => update(store => ({
      ...store,
      recipes: store.recipes.filter(recipe => recipe.id !== id)
    })),

    setActiveRecipe: (recipe: Recipe | null) => update(store => ({
      ...store,
      activeRecipe: recipe
    })),

    calculateLye: (recipe: Recipe): number => {
      // Berechne die benötigte Laugenmenge für jedes Öl
      const totalLye = recipe.oils.reduce((sum, { oilId, amount }) => {
        const oil = oils.find(o => o.id === oilId);
        if (!oil) return sum;
        
        // Wähle die richtige Verseifungszahl (NaOH oder KOH)
        const sapValue = recipe.lyeType === 'NaOH' ? oil.sapNaoh : oil.sapKoh;
        
        // Berechne Laugenmenge für dieses Öl
        return sum + (amount * sapValue);
      }, 0);

      // Berücksichtige die Überfettung
      return totalLye * (1 - (recipe.superFat / 100));
    },

    calculateTotalWeight: (recipe: Recipe): number => {
      const lyeAmount = recipeStore.calculateLye(recipe);
      const waterAmount = lyeAmount * recipe.waterRatio;
      const oilsAmount = recipe.oils.reduce((sum, { amount }) => sum + amount, 0);
      
      return lyeAmount + waterAmount + oilsAmount;
    },

    calculateProperties: (recipe: Recipe): Oil['properties'] => {
      // Gesamtgewicht aller Öle
      const totalOilWeight = recipe.oils.reduce((sum, { amount }) => sum + amount, 0);
      if (totalOilWeight === 0) return {
        hardness: 0,
        cleansing: 0,
        conditioning: 0,
        bubbly: 0,
        creamy: 0,
        iodine: 0,
        ins: 0
      };

      // Berechne gewichteten Durchschnitt für jede Eigenschaft
      return recipe.oils.reduce((props, { oilId, amount }) => {
        const oil = oils.find(o => o.id === oilId);
        if (!oil) return props;

        // Prozentualer Anteil dieses Öls
        const percentage = amount / totalOilWeight;

        // Addiere gewichtete Eigenschaften
        return {
          hardness: props.hardness + (oil.properties.hardness * percentage),
          cleansing: props.cleansing + (oil.properties.cleansing * percentage),
          conditioning: props.conditioning + (oil.properties.conditioning * percentage),
          bubbly: props.bubbly + (oil.properties.bubbly * percentage),
          creamy: props.creamy + (oil.properties.creamy * percentage),
          iodine: props.iodine + (oil.properties.iodine * percentage),
          ins: props.ins + (oil.properties.ins * percentage)
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
    }
  }
}

export const recipeStore = createRecipeStore()
