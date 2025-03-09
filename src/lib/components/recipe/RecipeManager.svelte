<script lang="ts">
  import { recipeStore } from '$lib/stores/recipeStore';
  import type { Recipe } from '$lib/stores/recipeStore';

  export let activeRecipe: Recipe | null;

  let showConfirmDelete = false;
  let showUnsavedWarning = false;
  let recipeName = activeRecipe?.name || '';
  let pendingRecipeId = '';

  $: recipes = $recipeStore.recipes;
  $: unsavedChanges = $recipeStore.unsavedChanges;

  function handleRecipeChange(newRecipeId: string) {
    if (unsavedChanges) {
      pendingRecipeId = newRecipeId;
      showUnsavedWarning = true;
    } else {
      recipeStore.setActiveRecipe(newRecipeId);
    }
  }

  function confirmChange() {
    recipeStore.setActiveRecipe(pendingRecipeId);
    showUnsavedWarning = false;
  }

  function cancelChange() {
    showUnsavedWarning = false;
  }

  function confirmDelete() {
    if (activeRecipe) {
      recipeStore.deleteRecipe(activeRecipe.id);
      showConfirmDelete = false;
    }
  }

</script>

<div class="space-y-4">
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-4">
    <div class="flex justify-between items-center">
      <h2 class="text-lg font-medium">Rezepte</h2>
      {#if activeRecipe}
        <div class="flex gap-2">
          <button
            on:click={() => recipeStore.saveChanges()}
            class="px-4 py-2 {unsavedChanges ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500 hover:bg-gray-600'} text-white rounded flex items-center gap-2"
            title={unsavedChanges ? 'Änderungen speichern' : 'Keine ungespeicherten Änderungen'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
            Speichern
          </button>
          <button
            on:click={() => showConfirmDelete = true}
            class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            Löschen
          </button>
        </div>
      {/if}
    </div>

    <!-- Toolbar mit Rezeptauswahl und Aktionen -->
    <div class="flex items-center gap-4">
      <select
        value={activeRecipe?.id || ''}
        on:change={(e) => handleRecipeChange(e.currentTarget.value)}
        class="flex-1 rounded-md border-gray-300 shadow-sm"
      >
        <option value="">Rezept auswählen...</option>
        {#each recipes as recipe}
          <option value={recipe.id}>{recipe.name} ({recipe.totalOilWeight}g)</option>
        {/each}
      </select>

      {#if activeRecipe}
        <input
          type="text"
          bind:value={recipeName}
          placeholder="Rezeptname"
          class="flex-1 rounded-md border-gray-300 shadow-sm"
          on:change={(e) => recipeStore.updateRecipe(activeRecipe.id, { name: e.target.value })}
        />
      {/if}
    </div>
  </div>

  <!-- Warnung für ungespeicherte Änderungen -->
  {#if showUnsavedWarning}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
        <h3 class="text-lg font-medium mb-4">Ungespeicherte Änderungen</h3>
        <p class="text-gray-600 mb-6">
          Es gibt ungespeicherte Änderungen. Möchten Sie diese verwerfen und das andere Rezept laden?
        </p>
        <div class="flex justify-end gap-4">
          <button
            class="px-4 py-2 text-gray-600 hover:text-gray-800"
            on:click={cancelChange}
          >
            Abbrechen
          </button>
          <button
            class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            on:click={confirmChange}
          >
            Verwerfen
          </button>
          <button
            class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            on:click={() => {
              recipeStore.saveChanges();
              confirmChange();
            }}
          >
            Speichern & Wechseln
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Löschen Bestätigung Dialog -->
  {#if showConfirmDelete}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
        <h3 class="text-lg font-medium mb-4">Rezept löschen</h3>
        <p class="text-gray-600 mb-6">
          Möchten Sie das Rezept "{activeRecipe?.name}" wirklich löschen?
        </p>
        <div class="flex justify-end gap-4">
          <button
            class="px-4 py-2 text-gray-600 hover:text-gray-800"
            on:click={() => showConfirmDelete = false}
          >
            Abbrechen
          </button>
          <button
            class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            on:click={confirmDelete}
          >
            Löschen
          </button>
        </div>
      </div>
    </div>
  {/if}
</div> 