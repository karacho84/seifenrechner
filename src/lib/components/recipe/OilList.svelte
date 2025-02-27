<script lang="ts">
  import { oils } from '$lib/data/oils'
  import type { Recipe } from '$lib/stores/recipeStore'

  export let recipeOils: Recipe['oils']
  export let onUpdate: (index: number, amount: number) => void
  export let onRemove: (index: number) => void
  export let onAdd: (oilId: string, amount: number) => void

  let selectedOilId = oils[0].id
  let newAmount = 0
</script>

<div class="space-y-4">
  <!-- Öl hinzufügen -->
  <div class="flex gap-2">
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
      bind:value={newAmount}
      min="0"
      placeholder="Gramm"
      class="w-24 rounded-md border-gray-300 shadow-sm"
    />
    <button
      on:click={() => {
        onAdd(selectedOilId, newAmount)
        newAmount = 0
      }}
      class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      Hinzufügen
    </button>
  </div>

  <!-- Ölliste -->
  <div class="space-y-2">
    {#each recipeOils as { oilId, amount }, index}
      <div class="flex items-center gap-2">
        <span class="flex-1">{oils.find(o => o.id === oilId)?.name}</span>
        <input
          type="number"
          min="0"
          step="1"
          placeholder="Menge in g"
          bind:value={amount}
          on:input={(e) => onUpdate(index, parseFloat(e.currentTarget.value) || 0)}
          class="w-24 rounded-md border-gray-300 shadow-sm"
        />
        <span class="text-sm text-gray-500">g</span>
        <button
          on:click={() => onRemove(index)}
          class="p-1 text-red-500 hover:text-red-600"
        >
          ✕
        </button>
      </div>
    {/each}
    
    <!-- Gesamtmenge der Öle -->
    <div class="pt-2 border-t">
      <span class="text-sm text-gray-500">Gesamtmenge Öle:</span>
      <span class="font-medium">
        {recipeOils.reduce((sum, oil) => sum + oil.amount, 0).toFixed(2)}g
      </span>
    </div>
  </div>
</div> 