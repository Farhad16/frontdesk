export interface ICatalogOption {
  key: string
  labelKey: string
  emoji?: string
}
export interface ICatalogModifier {
  key: string
  labelKey: string
  options: ICatalogOption[]
  optional?: boolean
}
export interface ICatalogItem {
  key: string
  labelKey: string
  emoji?: string
  modifiers?: ICatalogModifier[]
  quantity?: boolean
  allowAddOns?: boolean
}
export interface ICatalogCategory {
  key: string
  labelKey: string
  emoji?: string
  items?: ICatalogItem[]
  freeText?: boolean
}
export type ICatalog = ICatalogCategory[]

export interface ICatalogSection {
  key: string
  labelKey: string
  emoji?: string
  items: ICatalogItem[]
}

const sugarModifier: ICatalogModifier = {
  key: 'sugar',
  labelKey: 'mod.sugar',
  options: [
    {key: 'none', labelKey: 'sugar.none', emoji: '🚫'},
    {key: 'little', labelKey: 'sugar.little'},
    {key: 'moderate', labelKey: 'sugar.moderate'},
    {key: 'usual', labelKey: 'sugar.usual'},
  ],
}
const mixModifier: ICatalogModifier = {
  key: 'mix',
  labelKey: 'mod.mix',
  optional: true,
  options: [
    {key: 'none', labelKey: 'mix.none'},
    {key: 'ginger', labelKey: 'mix.ginger', emoji: '🫚'},
    {key: 'lemon', labelKey: 'mix.lemon', emoji: '🍋'},
    {key: 'both', labelKey: 'mix.both'},
  ],
}
const milkModifier: ICatalogModifier = {
  key: 'milk',
  labelKey: 'mod.milk',
  options: [
    {key: 'withMilk', labelKey: 'milk.with', emoji: '🥛'},
    {key: 'withoutMilk', labelKey: 'milk.without'},
  ],
}
const coffeeStyleModifier: ICatalogModifier = {
  key: 'coffeeStyle',
  labelKey: 'mod.coffeeStyle',
  options: [
    {key: 'black', labelKey: 'coffee.black'},
    {key: 'white', labelKey: 'coffee.white', emoji: '🥛'},
  ],
}

export const REQUESTS_CATALOG: ICatalog = [
  {
    key: 'drinks',
    labelKey: 'cat.drinks',
    emoji: '🥤',
    items: [
      {key: 'water', labelKey: 'item.water', emoji: '💧', quantity: true},
      {
        key: 'tea',
        labelKey: 'item.tea',
        emoji: '☕',
        quantity: true,
        modifiers: [milkModifier, sugarModifier, mixModifier],
      },
      {
        key: 'coffee',
        labelKey: 'item.coffee',
        emoji: '☕',
        quantity: true,
        modifiers: [coffeeStyleModifier, sugarModifier],
      },
      {key: 'juice', labelKey: 'item.juice', emoji: '🧃', quantity: true},
      {key: 'cold', labelKey: 'item.cold', emoji: '🥤', quantity: true},
    ],
  },
  {
    key: 'snacks',
    labelKey: 'cat.snacks',
    emoji: '🍿',
    items: [
      {key: 'biscuit', labelKey: 'item.biscuit', emoji: '🍪', quantity: true},
      {key: 'toast', labelKey: 'item.toast', emoji: '🍞', quantity: true},
      {key: 'chanachur', labelKey: 'item.chanachur', emoji: '🥜', quantity: true, allowAddOns: true},
    ],
  },
  {key: 'assistance', labelKey: 'cat.assistance', emoji: '🔧', freeText: true},
]

export const BREAKFAST_CATALOG: ICatalog = [
  {
    key: 'breakfast',
    labelKey: 'cat.breakfast',
    emoji: '🍳',
    items: [
      {
        key: 'paratha',
        labelKey: 'item.paratha',
        emoji: '🫓',
        quantity: true,
        modifiers: [
          {
            key: 'oil',
            labelKey: 'mod.oil',
            options: [
              {key: 'oilFree', labelKey: 'oil.free'},
              {key: 'withOil', labelKey: 'oil.with'},
            ],
          },
          {
            key: 'side',
            labelKey: 'mod.side',
            options: [
              {key: 'veg', labelKey: 'side.veg'},
              {key: 'vegDal', labelKey: 'side.vegDal'},
              {key: 'dal', labelKey: 'side.dal'},
            ],
          },
          {
            key: 'egg',
            labelKey: 'mod.egg',
            optional: true,
            options: [
              {key: 'poach', labelKey: 'egg.poach', emoji: '🍳'},
              {key: 'omelette', labelKey: 'egg.omelette', emoji: '🍳'},
            ],
          },
        ],
      },
      {key: 'ruti', labelKey: 'item.ruti', emoji: '🫓', quantity: true},
    ],
  },
]
