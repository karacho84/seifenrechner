interface Oil {
  id: string;
  name: string;
  naohSap: number;
  kohSap: number;
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
    id: 'coconut',
    name: 'Kokosöl',
    naohSap: 0.183,
    kohSap: 0.257,
    properties: {
      hardness: 79,
      cleansing: 67,
      conditioning: 10,
      bubbly: 67,
      creamy: 14,
      iodine: 10,
      ins: 258
    }
  },
  {
    id: 'olive',
    name: 'Olivenöl',
    naohSap: 0.134,
    kohSap: 0.188,
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
    id: 'palm',
    name: 'Palmöl',
    naohSap: 0.142,
    kohSap: 0.199,
    properties: {
      hardness: 50,
      cleansing: 0,
      conditioning: 49,
      bubbly: 0,
      creamy: 50,
      iodine: 53,
      ins: 145
    }
  },
  {
    id: 'shea',
    name: 'Sheabutter',
    naohSap: 0.128,
    kohSap: 0.179,
    properties: {
      hardness: 45,
      cleansing: 0,
      conditioning: 54,
      bubbly: 0,
      creamy: 45,
      iodine: 58,
      ins: 116
    }
  },
  {
    id: 'castor',
    name: 'Rizinusöl',
    naohSap: 0.128,
    kohSap: 0.179,
    properties: {
      hardness: 15,
      cleansing: 0,
      conditioning: 85,
      bubbly: 90,
      creamy: 15,
      iodine: 86,
      ins: 95
    }
  },
  {
    id: 'sunflower',
    name: 'Sonnenblumenöl',
    naohSap: 0.134,
    kohSap: 0.188,
    properties: {
      hardness: 10,
      cleansing: 0,
      conditioning: 90,
      bubbly: 0,
      creamy: 10,
      iodine: 133,
      ins: 88
    }
  },
  {
    id: 'almond',
    name: 'Mandelöl',
    naohSap: 0.136,
    kohSap: 0.190,
    properties: {
      hardness: 12,
      cleansing: 0,
      conditioning: 88,
      bubbly: 0,
      creamy: 12,
      iodine: 97,
      ins: 97
    }
  },
  {
    id: 'avocado',
    name: 'Avocadoöl',
    naohSap: 0.133,
    kohSap: 0.186,
    properties: {
      hardness: 23,
      cleansing: 0,
      conditioning: 77,
      bubbly: 0,
      creamy: 23,
      iodine: 86,
      ins: 99
    }
  },
  {
    id: 'babassu',
    name: 'Babassuöl',
    naohSap: 0.175,
    kohSap: 0.245,
    properties: {
      hardness: 70,
      cleansing: 65,
      conditioning: 15,
      bubbly: 65,
      creamy: 15,
      iodine: 15,
      ins: 235
    }
  },
  {
    id: 'cocoa',
    name: 'Kakaobutter',
    naohSap: 0.137,
    kohSap: 0.192,
    properties: {
      hardness: 61,
      cleansing: 0,
      conditioning: 38,
      bubbly: 0,
      creamy: 61,
      iodine: 37,
      ins: 150
    }
  },
  {
    id: 'hemp',
    name: 'Hanföl',
    naohSap: 0.138,
    kohSap: 0.193,
    properties: {
      hardness: 20,
      cleansing: 0,
      conditioning: 80,
      bubbly: 0,
      creamy: 20,
      iodine: 165,
      ins: 48
    }
  },
  {
    id: 'jojoba',
    name: 'Jojobaöl',
    naohSap: 0.069,
    kohSap: 0.097,
    properties: {
      hardness: 10,
      cleansing: 0,
      conditioning: 90,
      bubbly: 0,
      creamy: 10,
      iodine: 80,
      ins: 11
    }
  },
  {
    id: 'macadamia',
    name: 'Macadamiaöl',
    naohSap: 0.139,
    kohSap: 0.195,
    properties: {
      hardness: 18,
      cleansing: 0,
      conditioning: 82,
      bubbly: 0,
      creamy: 18,
      iodine: 76,
      ins: 123
    }
  },
  {
    id: 'ricebran',
    name: 'Reiskleieöl',
    naohSap: 0.128,
    kohSap: 0.179,
    properties: {
      hardness: 25,
      cleansing: 0,
      conditioning: 75,
      bubbly: 0,
      creamy: 25,
      iodine: 105,
      ins: 77
    }
  },
  {
    id: 'traubenkernöl',
    name: 'Traubenkernöl',
    naohSap: 0.134,
    kohSap: 0.190,
    properties: {
      hardness: 0,
      cleansing: 0,
      conditioning: 0,
      bubbly: 0,
      creamy: 0,
      iodine: 100,
      ins: 0
    }
  }
] as const;

export type OilId = typeof oils[number]['id']; 