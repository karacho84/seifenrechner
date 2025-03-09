<script lang="ts">
  import "../app.css";
  import { recipeStore } from '$lib/stores/recipeStore'
  import type { Recipe } from '$lib/stores/recipeStore'
  import OilList from '$lib/components/recipe/OilList.svelte'
  import RecipeCalculations from '$lib/components/recipe/RecipeCalculations.svelte'
  import RecipeManager from '$lib/components/recipe/RecipeManager.svelte'

  const DEFAULT_RECIPE: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'> = {
    name: 'Neues Rezept',
    totalOilWeight: 500, // Standardwert für Gesamtfettmenge
    oils: [],
    lyeType: 'NaOH',
    superFat: 5,
    waterRatio: 2.5,
    notes: ''
  }

  // Definiere die Laugenarten
  const lyeTypes = [
    { value: 'NaOH', label: 'Natriumhydroxid (NaOH)' },
    { value: 'KOH', label: 'Kaliumhydroxid (KOH)' }
  ]

  // Store mit $ abonnieren
  $: activeRecipe = $recipeStore.activeRecipe
  
  function handleCreateRecipe() {
    recipeStore.addRecipe(DEFAULT_RECIPE)
  }

  function handleUpdateOil(index: number, newPercentage: number) {
    if (!activeRecipe) return;
    const updatedOils = [...activeRecipe.oils];
    updatedOils[index] = { ...updatedOils[index], percentage: newPercentage }; // Aktualisiere den Prozentsatz
    console.log(`Aktualisiere Öl ${updatedOils[index].oilId} auf ${newPercentage}%`); // Protokolliere die Aktualisierung
    recipeStore.updateRecipe(activeRecipe.id, { oils: updatedOils });
  }

  function handleRemoveOil(index: number) {
    if (!activeRecipe) return
    const updatedOils = activeRecipe.oils.filter((_, i) => i !== index)
    recipeStore.updateRecipe(activeRecipe.id, { oils: updatedOils })
  }

  function handleAddOil(oilId: string, percentage: number) {
    if (!activeRecipe) return
    const updatedOils = [...activeRecipe.oils, { oilId, percentage }]
    recipeStore.updateRecipe(activeRecipe.id, { oils: updatedOils })
  }

  function handleUpdateTotalWeight(weight: number) {
    if (!activeRecipe) return
    recipeStore.updateRecipe(activeRecipe.id, { totalOilWeight: weight })
  }

  function handleLyeTypeChange(event: Event) {
    if (!activeRecipe) return
    const selectedLyeType = (event.target as HTMLSelectElement).value
    recipeStore.updateRecipe(activeRecipe.id, { lyeType: selectedLyeType })
  }

  $: lyeAmount = activeRecipe ? recipeStore.calculateLye(activeRecipe) : 0
  $: totalWeight = activeRecipe ? recipeStore.calculateTotalWeight(activeRecipe) : 0
  $: properties = activeRecipe ? recipeStore.calculateProperties(activeRecipe) : null
</script>

<main class="container mx-auto p-4 bg-white dark:bg-gray-900 text-black dark:text-white">
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Linke Spalte: Rezeptverwaltung und Eingabe -->
    <div class="space-y-6">
      <!-- Recipe Manager -->
      <RecipeManager {activeRecipe} />

      {#if activeRecipe}
        <select
          bind:value={activeRecipe!.lyeType as "NaOH" | "KOH"}
          on:change={() => recipeStore.updateRecipe(activeRecipe!.id, { lyeType: activeRecipe!.lyeType })}
          class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="NaOH">NaOH (Natronlauge)</option>
          <option value="KOH">KOH (Kalilauge)</option>
        </select>
      {/if}

      {#if !activeRecipe}
        <button
          on:click={handleCreateRecipe}
          class="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Neues Rezept erstellen
        </button>
      {:else}
        <div class="space-y-6">
          <!-- Grundeinstellungen -->
          <div class="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white rounded-lg shadow p-4 space-y-4">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-400">
                Gesamtfettmenge
              </label>
              <div class="flex items-center gap-2">
                <input
                  type="number"
                  min="100"
                  max="10000"
                  step="10"
                  class="w-32 rounded-md border-gray-300 shadow-sm"
                  value={activeRecipe.totalOilWeight}
                  on:input={(e) => {
                    const value = parseFloat(e.currentTarget.value);
                    if (value >= 100) {
                      handleUpdateTotalWeight(value);
                    }
                  }}
                />
                <span class="text-sm text-gray-500">g</span>
              </div>
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-400">
                Überfettung
              </label>
              <div class="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="20"
                  step="1"
                  class="w-32 rounded-md border-gray-300 shadow-sm"
                  value={activeRecipe.superFat}
                  on:input={(e) => recipeStore.updateRecipe(activeRecipe.id, { superFat: parseFloat(e.currentTarget.value) || 0 })}
                />
                <span class="text-sm text-gray-500">%</span>
              </div>
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-400">
                Wassermenge (Verhältnis zur Lauge)
              </label>
              <div class="flex items-center gap-2">
                <span class="text-sm text-gray-500">1 :</span>
                <input
                  type="number"
                  min="1.5"
                  max="3"
                  step="0.1"
                  class="w-32 rounded-md border-gray-300 shadow-sm"
                  value={activeRecipe.waterRatio}
                  on:input={(e) => recipeStore.updateRecipe(activeRecipe.id, { waterRatio: parseFloat(e.currentTarget.value) || 2.5 })}
                />
              </div>
            </div>

            <!-- Beschreibungseingabefeld -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-400">
                Beschreibung
              </label>
              <textarea
                rows="3"
                class="w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-800 dark:text-white"
                placeholder="Gib eine Beschreibung für das Rezept ein..."
                bind:value={activeRecipe.notes}
                on:input={(e) => recipeStore.updateRecipe(activeRecipe.id, { notes: e.currentTarget.value })}
              ></textarea>
            </div>
          </div>

          <!-- Ölliste -->
          <div class="dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white rounded-lg shadow p-4 space-y-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-400">
              Öle
            </label>
            <OilList
              recipeOils={activeRecipe.oils}
              totalOilWeight={activeRecipe.totalOilWeight}
              onUpdate={handleUpdateOil}
              onRemove={handleRemoveOil}
              onAdd={handleAddOil}
            />
          </div>
        </div>
      {/if}
    </div>

    <!-- Rechte Spalte: Berechnungen und Eigenschaften -->
    <div>
      {#if activeRecipe}
        <RecipeCalculations 
          recipe={activeRecipe} 
          onAddOil={handleAddOil}
          onUpdate={handleUpdateOil}
          onRemove={handleRemoveOil}
        />
      {:else}
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center text-gray-500 dark:text-gray-300">
          Bitte erstellen oder wählen Sie ein Rezept aus
        </div>
      {/if}
    </div>
  </div>
</main>