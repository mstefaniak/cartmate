export type Category = {
  id: string;
  name: string;
  emoji: string;
  color: string;
};

export const CATEGORIES: Category[] = [
  {
    id: 'dairy',
    name: 'Dairy',
    emoji: '🥛',
    color: '#D7CCC8', // Light brown
  },
  {
    id: 'bakery',
    name: 'Bakery',
    emoji: '🥖',
    color: '#FFECB3', // Light yellow
  },
  {
    id: 'household',
    name: 'Household Supplies',
    emoji: '🧼',
    color: '#B3E5FC', // Light blue
  },
  {
    id: 'meat',
    name: 'Meat & Fish',
    emoji: '🥩',
    color: '#FFCDD2', // Light red
  },
  {
    id: 'produce',
    name: 'Vegetables & Fruits',
    emoji: '🥬',
    color: '#C8E6C9', // Light green
  },
  {
    id: 'beverages',
    name: 'Beverages',
    emoji: '🧃',
    color: '#BBDEFB', // Another light blue
  },
  {
    id: 'other',
    name: 'Others',
    emoji: '➕',
    color: '#E1BEE7', // Light purple
  },
]; 