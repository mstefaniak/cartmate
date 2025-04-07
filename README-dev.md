# Cartmate - Developer Guide

## 🚀 What's Been Setup

We've set up the Cartmate shopping list app with the following components:

1. **React Native (Expo) Project** - The base scaffolding for the mobile app
2. **Supabase Integration** - Configuration for authentication, database, and realtime features 
3. **Database Schema** - SQL schema for users, shopping lists, and items with proper relationships
4. **Row Level Security** - Policies to ensure data privacy and access control
5. **Authentication Component** - Basic login/signup functionality
6. **Shopping List Hook** - Custom hook to manage shopping list operations
7. **Constants** - Color theme and product categories
8. **Type Definitions** - TypeScript types for database entities

## 🛠️ Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- A Supabase account (https://supabase.com/)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Install Supabase dependencies:
   ```bash
   npm install @supabase/supabase-js @react-native-async-storage/async-storage react-native-url-polyfill
   ```

### Setting up Supabase

1. Create a new Supabase project from your dashboard
2. Go to Project Settings > API to get your project URL and anon key
3. Create a `.env` file in the project root with the following variables:
   ```
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   ```

### Setting up the Database Schema

1. Navigate to the SQL Editor in your Supabase dashboard
2. Copy the SQL code from `scripts/supabase-schema.sql`
3. Run the SQL script to create all necessary tables, policies, and triggers

### Setup Row Level Security (RLS)

The SQL script sets up the following RLS policies:

- Users can only view/update their own user data
- All authenticated users can view, create, and update shopping lists and items

### Running the Application

1. Start the development server:
   ```bash
   npx expo start
   ```
2. Follow the instructions in the terminal to open the app on your device or emulator

## 📦 Project Structure

```
cartmate/
├── app/ - Expo Router app directory
├── assets/ - Static assets
├── components/ - Reusable components
│   └── Auth.tsx - Authentication component
├── constants/ - App constants
│   ├── Colors.ts - Color theme
│   └── Categories.ts - Product categories
├── hooks/ - Custom React hooks
│   └── useShoppingList.ts - Shopping list operations
├── lib/ - Utility files
│   ├── supabase.ts - Supabase client configuration
│   └── database.types.ts - TypeScript types for Supabase schema
└── scripts/ - Utilities for project setup
    └── supabase-schema.sql - SQL script for database setup
```

## 🔄 Data Flow with Supabase

### Authentication Flow

1. User signs up/logs in via Auth component
2. Supabase JWT tokens are stored in AsyncStorage
3. Session is managed using supabase.auth.onAuthStateChange()

### Data Operations

#### Fetching the active shopping list:
```typescript
const { data, error } = await supabase
  .from('shopping_lists')
  .select(`
    id, 
    title,
    items (
      id,
      name,
      category,
      is_purchased,
      added_at,
      users (name)
    )
  `)
  .eq('is_active', true)
  .single();
```

#### Adding a new item:
```typescript
const { data, error } = await supabase
  .from('items')
  .insert({
    name: 'Milk',
    category: 'dairy',
    added_by: user.id,
    list_id: activeListId
  });
```

#### Marking an item as purchased:
```typescript
const { data, error } = await supabase
  .from('items')
  .update({ is_purchased: true })
  .eq('id', itemId);
```

## 🛠️ Supabase Realtime Subscriptions

In components that need realtime updates, set up subscriptions:

```typescript
useEffect(() => {
  const subscription = supabase
    .channel('items_changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'items' },
      (payload) => {
        // Handle realtime update
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, []);
``` 