<script lang="ts">
  import { oils } from "$lib/data/oils";
  import type { Recipe } from "$lib/stores/recipeStore";
  import { calculateTotalPercentage, formatPercentage } from "$lib/utils";

  export let recipeOils: Recipe["oils"];
  export let onUpdate: (index: number, percentage: number) => void;
  export let onRemove: (index: number) => void;
  export let onAdd: (oilId: string, percentage: number) => void;
  export let totalOilWeight: number;

  let selectedOilId = oils[0].id;
  let newPercentage = 0;

  $: totalPercentage = calculateTotalPercentage(recipeOils);
  $: remainingPercentage = 100 - totalPercentage;
  $: isValid = totalPercentage <= 100;

  function calculateGrams(percentage: number): number {
    return (percentage / 100) * totalOilWeight;
  }

  function handleSubmit(e: Event) {
    e.preventDefault();
    if (newPercentage <= 0) return;
    if (totalPercentage + newPercentage > 100) return;
    if (recipeOils.some((oil) => oil.oilId === selectedOilId)) {
      alert("Dieses Öl ist bereits in der Liste!");
      return;
    }
    onAdd(selectedOilId, newPercentage);
    newPercentage = 0;
  }

  function distributePercentages() {
    const totalPercentage = recipeOils.reduce((sum, oil) => sum + oil.percentage, 0);
    
    // Protokolliere die aktuellen Werte
    console.log('Aktuelle Öle:', recipeOils);
    console.log('Gesamtprozentsatz:', totalPercentage);
    
    // Überprüfen, ob die Gesamtmenge größer als 0 ist
    if (totalPercentage === 0) return;

    const factor = 100 / totalPercentage; // Berechne den Faktor, um auf 100% zu kommen

    recipeOils.forEach((oil, index) => {
      const newPercentage = oil.percentage * factor; // Berechne den neuen Anteil
      console.log(`Neuer Prozentsatz für ${oil.oilId}: ${newPercentage}`); // Protokolliere den neuen Prozentsatz
      onUpdate(index, newPercentage); // Aktualisiere den Anteil für jedes Öl
    });
  }
</script>

<div class="space-y-4">
  <!-- Öl hinzufügen -->
  <form on:submit={handleSubmit} class="flex gap-2">
    <select
      bind:value={selectedOilId}
      class="flex-1 rounded-md border-gray-300 shadow-sm"
    >
      {#each oils as oil}
        <option value={oil.id}>{oil.name}</option>
      {/each}
    </select>
    <input
      type="number"
      bind:value={newPercentage}
      min="0"
      max={remainingPercentage}
      step="0.1"
      placeholder="Prozent"
      class="w-24 rounded-md border-gray-300 shadow-sm"
    />
    <button
      type="submit"
      disabled={totalPercentage >= 100}
      class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
    >
      Hinzufügen
    </button>
  </form>

  <!-- Ölliste -->
  <div class="space-y-2">
    {#each recipeOils as { oilId }, index}
      <div class="flex items-center gap-2">
        <span class="flex-1">{oils.find((o) => o.id === oilId)?.name}</span>
        <input
          type="number"
          min="0"
          max="100"
          step="0.1"
          placeholder="Prozent"
          bind:value={recipeOils[index].percentage}
          on:input={(e) => {
            const newValue = parseFloat(e.currentTarget.value) || 0;
            const otherOilsPercentage = totalPercentage - (recipeOils[index].percentage || 0);
            if (otherOilsPercentage + newValue <= 100) {
              onUpdate(index, newValue);
            }
          }}
          class="w-24 rounded-md border-gray-300 shadow-sm"
        />
        <span class="text-sm text-gray-500">%</span>
        <span class="text-sm text-gray-500">
          ({calculateGrams(recipeOils[index].percentage).toFixed(1)}g)
        </span>
        <button
          on:click={() => onRemove(index)}
          class="p-1 text-red-500 hover:text-red-600"
        >
          ✕
        </button>
      </div>
    {/each}

    <!-- Gesamtprozent und Validierung -->
    <div class="pt-2 border-t">
      <div class="flex justify-between items-center">
        <span class="text-sm text-gray-500">Gesamtprozent:</span>
        <span class="font-medium" class:text-red-500={!isValid}>
          {formatPercentage(totalPercentage)}
          <span class="text-sm text-gray-500">
            ({calculateGrams(totalPercentage).toFixed(1)}g)
          </span>
        </span>
      </div>
      {#if !isValid}
        <p class="text-sm text-red-500 mt-1">
          Die Summe der Prozente darf 100% nicht überschreiten!
        </p>
      {:else if totalPercentage < 100}
        <p class="text-sm text-blue-500 mt-1">
          Noch {formatPercentage(remainingPercentage)} verfügbar ({calculateGrams(
            remainingPercentage,
          ).toFixed(1)}g)
        </p>
      {/if}
    </div>
    <!-- Button zum Verteilen der Prozentmengen -->
    <button
      on:click={distributePercentages}
      class="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
      disabled={recipeOils.length === 0 || totalPercentage >= 100}
    >
      Prozentmengen gleichmäßig verteilen
    </button>
  </div>
</div>
