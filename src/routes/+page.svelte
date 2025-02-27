<script lang="ts">
  import "../app.css";
  import { recipeStore } from '$lib/stores/recipeStore'
  import type { Recipe } from '$lib/stores/recipeStore'
  import OilList from '$lib/components/recipe/OilList.svelte'

  const DEFAULT_RECIPE: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'> = {
    name: 'Neues Rezept',
    oils: [],
    lyeType: 'NaOH',
    superFat: 5,
    waterRatio: 2.5,
    notes: ''
  }

  // Store mit $ abonnieren
  $: activeRecipe = $recipeStore.activeRecipe
  
  function handleCreateRecipe() {
    recipeStore.addRecipe(DEFAULT_RECIPE)
  }

  function handleUpdateOil(index: number, amount: number) {
    if (!activeRecipe) return
    const updatedOils = [...activeRecipe.oils]
    updatedOils[index] = { ...updatedOils[index], amount }
    recipeStore.updateRecipe(activeRecipe.id, { oils: updatedOils })
  }

  function handleRemoveOil(index: number) {
    if (!activeRecipe) return
    const updatedOils = activeRecipe.oils.filter((_, i) => i !== index)
    recipeStore.updateRecipe(activeRecipe.id, { oils: updatedOils })
  }

  $: lyeAmount = activeRecipe ? recipeStore.calculateLye(activeRecipe) : 0
  $: totalWeight = activeRecipe ? recipeStore.calculateTotalWeight(activeRecipe) : 0
  $: properties = activeRecipe ? recipeStore.calculateProperties(activeRecipe) : null
</script>

<div class="container mx-auto p-4">
  <!-- Rezeptliste und Aktionen -->
  <div class="mb-4 flex justify-between items-center">
    <div class="flex gap-2">
      <!-- Rezeptauswahl -->
      <select 
        value={activeRecipe?.id}
        on:change={(e) => {
          const recipe = $recipeStore.recipes.find(r => r.id === e.currentTarget.value);
          recipeStore.setActiveRecipe(recipe || null);
        }}
        class="rounded-md border-gray-300 shadow-sm"
      >
        <option value="">Rezept auswählen...</option>
        {#each $recipeStore.recipes as recipe}
          <option value={recipe.id}>{recipe.name}</option>
        {/each}
      </select>

      <!-- Aktionen -->
      <button
        on:click={handleCreateRecipe}
        class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Neu
      </button>
      
      {#if activeRecipe}
        <button
          on:click={() => {
            if (!activeRecipe) return;
            const newRecipe = {
              ...DEFAULT_RECIPE,
              name: `${activeRecipe.name} (Kopie)`
            };
            recipeStore.addRecipe(newRecipe);
          }}
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Kopieren
        </button>
        <button
          on:click={() => {
            if (!activeRecipe) return;
            if (confirm('Rezept wirklich löschen?')) {
              recipeStore.deleteRecipe(activeRecipe.id);
              recipeStore.setActiveRecipe(null);
            }
          }}
          class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Löschen
        </button>
      {/if}
    </div>
  </div>

  <!-- Bestehender Content -->
  {#if !activeRecipe}
    <div class="flex items-center justify-center h-full">
      <p class="text-gray-500">Wähle ein Rezept aus oder erstelle ein neues.</p>
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Linke Spalte: Rezepteingabe -->
      <div class="space-y-4">
        <h2 class="text-2xl font-bold">Rezept bearbeiten</h2>
        
        <!-- Rezeptname -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            bind:value={activeRecipe!.name}
            on:input={() => recipeStore.updateRecipe(activeRecipe!.id, { name: activeRecipe!.name })}
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <!-- Laugenauswahl -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Lauge</label>
          <select
            bind:value={activeRecipe!.lyeType}
            on:change={() => recipeStore.updateRecipe(activeRecipe!.id, { lyeType: activeRecipe!.lyeType })}
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="NaOH">NaOH (Natronlauge)</option>
            <option value="KOH">KOH (Kalilauge)</option>
          </select>
        </div>

        <!-- Überfettung -->
        <div>
          <label class="block text-sm font-medium text-gray-700">
            Überfettung (%)
          </label>
          <input
            type="number"
            min="0"
            max="20"
            bind:value={activeRecipe!.superFat}
            on:input={() => recipeStore.updateRecipe(activeRecipe!.id, { superFat: activeRecipe!.superFat })}
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <!-- Wasser/Lauge Verhältnis -->
        <div>
          <label class="block text-sm font-medium text-gray-700">
            Wasser/Lauge Verhältnis
          </label>
          <input
            type="number"
            min="1"
            max="4"
            step="0.1"
            bind:value={activeRecipe!.waterRatio}
            on:input={() => recipeStore.updateRecipe(activeRecipe!.id, { waterRatio: activeRecipe!.waterRatio })}
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <span class="text-sm text-gray-500">Empfohlen: 2-3 Teile Wasser pro Teil Lauge</span>
        </div>

        <!-- Ölliste -->
        <div>
          <h3 class="text-lg font-medium">Öle</h3>
          <OilList
            recipeOils={$recipeStore.activeRecipe?.oils || []}
            onUpdate={handleUpdateOil}
            onRemove={handleRemoveOil}
            onAdd={(oilId, amount) => {
              if (!$recipeStore.activeRecipe) return;
              const updatedOils = [...$recipeStore.activeRecipe.oils, { oilId, amount }];
              recipeStore.updateRecipe($recipeStore.activeRecipe.id, { oils: updatedOils });
            }}
          />
        </div>
      </div>

      <!-- Rechte Spalte: Berechnungen & Eigenschaften -->
      <div class="space-y-4">
        <h2 class="text-2xl font-bold">Berechnungen</h2>
        
        <!-- Berechnete Werte -->
        <div class="bg-gray-50 p-4 rounded-lg">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <span class="text-sm text-gray-500">Benötigte Lauge</span>
              <p class="text-lg font-medium">{lyeAmount.toFixed(2)}g</p>
            </div>
            <div>
              <span class="text-sm text-gray-500">Benötigtes Wasser</span>
              <p class="text-lg font-medium">{(lyeAmount * activeRecipe!.waterRatio).toFixed(2)}g</p>
            </div>
            <div>
              <span class="text-sm text-gray-500">Öle gesamt</span>
              <p class="text-lg font-medium">
                {activeRecipe!.oils.reduce((sum, oil) => sum + oil.amount, 0).toFixed(2)}g
              </p>
            </div>
            <div>
              <span class="text-sm text-gray-500">Gesamtgewicht</span>
              <p class="text-lg font-medium">{totalWeight.toFixed(2)}g</p>
            </div>
          </div>
        </div>

        <!-- Eigenschaften -->
        {#if properties}
          <div>
            <h3 class="text-lg font-medium">Eigenschaften</h3>
            <div class="mt-2 space-y-2">
              {#each Object.entries(properties) as [key, value]}
                <div class="flex items-center">
                  <span class="w-1/3 text-sm text-gray-500 capitalize">
                    {key}
                  </span>
                  <div class="w-2/3 h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      class="h-full bg-blue-500"
                      style="width: {value}%"
                    />
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>