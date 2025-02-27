interface Oil {
  id: string;
  name: string;
  sapNaoh: number;
  sapKoh: number;
  properties: {
    hardness: number;
    cleansing: number;
    conditioning: number;
    bubbly: number;
    creamy: number;
    iodine: number;
    ins: number;
  }
}

export const oils = [
  {
    id: 'coconut-oil',
    name: 'Kokosöl',
    sapNaoh: 0.183,
    sapKoh: 0.257,
    properties: {
      hardness: 79,
      cleansing: 67,
      conditioning: 10,
      bubbly: 67,
      creamy: 10,
      iodine: 10,
      ins: 258
    }
  },
  {
    id: 'olive-oil',
    name: 'Olivenöl',
    sapNaoh: 0.134,
    sapKoh: 0.188,
    properties: {
      hardness: 17,
      cleansing: 0,
      conditioning: 82,
      bubbly: 0,
      creamy: 17,
      iodine: 85,
      ins: 105
    }
  },
  {
    id: 'palm-oil',
    name: 'Palmöl',
    sapNaoh: 0.142,
    sapKoh: 0.199,
    properties: {
      hardness: 50,
      cleansing: 0,
      conditioning: 49,
      bubbly: 0,
      creamy: 50,
      iodine: 53,
      ins: 145
    }
  }
] as const;

export type OilId = typeof oils[number]['id']; 