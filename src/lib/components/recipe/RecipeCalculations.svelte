<script lang="ts">
  import type { Recipe } from '$lib/stores/recipeStore';
  import { recipeStore } from '$lib/stores/recipeStore';
  import { formatPercentage } from '$lib/utils';
  import { oils } from '$lib/data/oils';

  export let recipe: Recipe;
  export let onAddOil: (oilId: string, percentage: number) => void;
  export let onUpdate: (index: number, percentage: number) => void;
  export let onRemove: (index: number) => void;

  $: lyeAmount = recipeStore.calculateLye(recipe);
  $: waterAmount = lyeAmount * recipe.waterRatio;
  $: totalWeight = recipe.totalOilWeight + lyeAmount + waterAmount;
  $: properties = recipeStore.calculateProperties(recipe);
  $: totalPercentage = recipe.oils.reduce((sum, oil) => sum + oil.percentage, 0);
  $: canAddMore = totalPercentage < 100;

  const propertyLabels = {
    hardness: 'Härte',
    cleansing: 'Reinigung',
    conditioning: 'Pflege',
    bubbly: 'Schaumbildung',
    creamy: 'Cremigkeit',
    iodine: 'Iodzahl',
    ins: 'INS'
  };

  // Empfohlene Bereiche für Eigenschaften
  const propertyRanges = {
    hardness: { min: 35, max: 45 },
    cleansing: { min: 12, max: 22 },
    conditioning: { min: 44, max: 69 },
    bubbly: { min: 14, max: 46 },
    creamy: { min: 16, max: 48 },
    iodine: { min: 41, max: 70 },
    ins: { min: 136, max: 165 }
  };

  const propertyInfo = {
    hardness: {
      label: 'Härte',
      description: 'Beeinflusst die Festigkeit der Seife\n' +
        '• Zu niedrig (<35%): Seife wird zu weich, löst sich schnell auf\n' +
        '• Optimal (35-45%): Gute Haltbarkeit und Formstabilität\n' +
        '• Zu hoch (>45%): Seife wird spröde, kann rissig werden'
    },
    cleansing: {
      label: 'Reinigung',
      description: 'Bestimmt die Reinigungskraft\n' +
        '• Zu niedrig (<12%): Reinigt nicht ausreichend\n' +
        '• Optimal (12-22%): Gute Reinigung ohne Austrocknung\n' +
        '• Zu hoch (>22%): Kann die Haut zu stark entfetten'
    },
    conditioning: {
      label: 'Pflege',
      description: 'Zeigt die rückfettende Wirkung\n' +
        '• Zu niedrig (<44%): Seife trocknet die Haut aus\n' +
        '• Optimal (44-69%): Gute Hautpflege\n' +
        '• Zu hoch (>69%): Seife wird zu weich, wenig Schaum'
    },
    bubbly: {
      label: 'Schaumbildung',
      description: 'Beschreibt die Schaumqualität\n' +
        '• Zu niedrig (<14%): Wenig Schaum\n' +
        '• Optimal (14-46%): Gute, stabile Schaumbildung\n' +
        '• Zu hoch (>46%): Instabiler, großblasiger Schaum'
    },
    creamy: {
      label: 'Cremigkeit',
      description: 'Beeinflusst die Schaumtextur\n' +
        '• Zu niedrig (<16%): Wenig cremiger Schaum\n' +
        '• Optimal (16-48%): Angenehm cremiger Schaum\n' +
        '• Zu hoch (>48%): Kann die Seife zu weich machen'
    },
    iodine: {
      label: 'Iodzahl',
      description: 'Misst den Grad der Ungesättigtheit\n' +
        '• Zu niedrig (<41): Seife könnte zu hart sein\n' +
        '• Optimal (41-70): Gute Balance\n' +
        '• Zu hoch (>70): Seife könnte schneller ranzig werden'
    },
    ins: {
      label: 'INS',
      description: 'Indikator für Seifenqualität (Verseifungszahl - Iodzahl)\n' +
        '• Zu niedrig (<136): Seife könnte zu weich sein\n' +
        '• Optimal (136-165): Ausgewogene Eigenschaften\n' +
        '• Zu hoch (>165): Seife könnte zu hart/spröde sein'
    }
  } as const;

  function getPropertyColor(value: number, property: string): string {
    const range = propertyRanges[property as keyof typeof propertyRanges];
    if (!range) return 'text-gray-700';

    if (value < range.min) return 'text-blue-500';
    if (value > range.max) return 'text-red-500';
    return 'text-green-500';
  }

  function recommendOil(property: keyof typeof propertyLabels): { oilId: string, percentage: number, isExisting: boolean } | null {
    if (!canAddMore) return null;

    // Finde das beste Öl für diese Eigenschaft, unabhängig vom aktuellen Wert
    const oilScores = oils.map(oil => {
      const existingOil = recipe.oils.find(r => r.oilId === oil.id);
      return {
        oil,
        score: oil.properties[property],
        isExisting: !!existingOil,
        currentPercentage: existingOil?.percentage || 0
      };
    });

    const bestOil = oilScores.sort((a, b) => b.score - a.score)[0];
    if (!bestOil) return null;

    // Empfohlene Menge berechnen
    let recommendedPercentage: number;
    const remainingPercentage = 100 - totalPercentage;
    
    if (bestOil.isExisting) {
      recommendedPercentage = Math.min(
        remainingPercentage,
        Math.max(5, remainingPercentage * 0.1)
      );
    } else {
      recommendedPercentage = Math.min(
        remainingPercentage,
        Math.max(5, remainingPercentage * 0.2)
      );
    }

    return {
      oilId: bestOil.oil.id,
      percentage: Math.round(recommendedPercentage * 10) / 10,
      isExisting: bestOil.isExisting
    };
  }

  function handleRecommendation(property: keyof typeof propertyLabels) {
    const recommendation = recommendOil(property);
    if (!recommendation) return;

    if (recommendation.isExisting) {
      // Finde den Index des existierenden Öls
      const index = recipe.oils.findIndex(oil => oil.oilId === recommendation.oilId);
      if (index !== -1) {
        // Erhöhe die Menge des existierenden Öls
        const newPercentage = recipe.oils[index].percentage + recommendation.percentage;
        onUpdate(index, newPercentage);
      }
    } else {
      // Füge neues Öl hinzu
      onAddOil(recommendation.oilId, recommendation.percentage);
    }
  }

  function findWorstOil(property: keyof typeof propertyLabels): { oilId: string, index: number, currentPercentage: number } | null {
    if (recipe.oils.length === 0) return null;

    // Finde das Öl mit dem höchsten Wert für diese Eigenschaft
    return recipe.oils
      .map((oil, index) => {
        const oilData = oils.find(o => o.id === oil.oilId);
        if (!oilData) return { score: 0, index, oilId: oil.oilId, currentPercentage: oil.percentage };
        
        return {
          score: oilData.properties[property],
          index,
          oilId: oil.oilId,
          currentPercentage: oil.percentage
        };
      })
      .sort((a, b) => b.score - a.score)[0];
  }

  function handleRemoveWorstOil(property: keyof typeof propertyLabels) {
    const worst = findWorstOil(property);
    if (!worst) return;

    if (worst.currentPercentage <= 5) {
      // Wenn weniger als 5% übrig sind, komplett entfernen
      onRemove(worst.index);
    } else {
      // Sonst um 5% reduzieren
      const newPercentage = Math.max(0, worst.currentPercentage - 5);
      onUpdate(worst.index, newPercentage);
    }
  }
</script>

<div class="space-y-6">
  <!-- Mengenberechnung -->
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-3">
    <h3 class="font-medium text-lg text-black dark:text-white">Mengenberechnung</h3>
    <div class="grid grid-cols-2 gap-4">
      <div>
        <span class="text-sm text-gray-500">Öle gesamt:</span>
        <div class="font-medium">{recipe.totalOilWeight.toFixed(1)}g</div>
      </div>
      <div>
        <span class="text-sm text-gray-500">Lauge ({recipe.lyeType}):</span>
        <div class="font-medium">{lyeAmount.toFixed(1)}g</div>
      </div>
      <div>
        <span class="text-sm text-gray-500">Wasser (1:{recipe.waterRatio}):</span>
        <div class="font-medium">{waterAmount.toFixed(1)}g</div>
      </div>
      <div>
        <span class="text-sm text-gray-500">Gesamtgewicht:</span>
        <div class="font-medium">{totalWeight.toFixed(1)}g</div>
      </div>
    </div>
  </div>

  <!-- Eigenschaften -->
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-3">
    <h3 class="font-medium text-lg">Eigenschaften</h3>
    <div class="grid grid-cols-2 gap-4">
      {#each Object.entries(properties) as [key, value]}
        {@const property = key as keyof typeof propertyInfo}
        {@const recommendation = recommendOil(property)}
        {@const worstOil = findWorstOil(property)}
        <div class="flex items-center justify-between group relative">
          <div>
            <span class="text-sm text-gray-500 cursor-help">
              {propertyInfo[property].label}:
            </span>
            <div class="font-medium {getPropertyColor(value, property)}">
              {value.toFixed(1)}
              {key === 'iodine' || key === 'ins' ? '' : '%'}
            </div>
            <!-- Tooltip -->
            <div class="invisible group-hover:visible absolute left-0 bottom-full mb-2 p-2 bg-gray-800 text-white text-sm rounded-lg whitespace-pre-line z-10 w-64">
              {propertyInfo[property].description}
            </div>
          </div>
          
          <div class="flex gap-1">
            {#if worstOil && recipe.oils.length > 1}
              <button
                on:click={() => handleRemoveWorstOil(property)}
                class="p-1 text-red-500 hover:text-red-600 group/btn relative"
                title={`Reduziere ${oils.find(o => o.id === worstOil.oilId)?.name}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clip-rule="evenodd" />
                </svg>
              </button>
            {/if}
            {#if canAddMore && recommendation}
              <button
                on:click={() => handleRecommendation(property)}
                class="p-1 text-blue-500 hover:text-blue-600 group/btn relative"
                title={`${recommendation.isExisting ? 'Erhöhe' : 'Füge'} ${oils.find(o => o.id === recommendation.oilId)?.name} um ${recommendation.percentage}% hinzu`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                </svg>
              </button>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Zusatzinformationen -->
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-3">
    <h3 class="font-medium text-lg">Zusatzinformationen</h3>
    <div class="space-y-2">
      <div>
        <span class="text-sm text-gray-500">Überfettung:</span>
        <div class="font-medium">{formatPercentage(recipe.superFat)}</div>
      </div>
      <div>
        <span class="text-sm text-gray-500">Wassermenge relativ zur Lauge:</span>
        <div class="font-medium">1:{recipe.waterRatio}</div>
      </div>
    </div>
  </div>
</div> 