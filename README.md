# 🛒 Cartmate - Shopping List App

A collaborative shopping list app built with **React Native** and **Supabase**, designed for families to manage groceries efficiently in real time.

---

## ✨ Key Features

- **Real-time Shared List**  
  Collaborate with family members on a single shared shopping list. See who added each item, when it was added, and receive instant notifications for any updates.

- **Always One Active List**  
  Only one active shopping list is visible at any time, ensuring clarity and focus during shopping.

- **List Archiving & Rotation**  
  Once the current list is completed, it gets archived automatically and a new list titled *“Next List”* is generated for future use.

- **Item Categorization**  
  Products are grouped into categories such as:
  - 🥛 Dairy  
  - 🥖 Bakery  
  - 🧼 Household Supplies  
  - 🥩 Meat & Fish  
  - 🥬 Vegetables & Fruits  
  - 🧃 Beverages  
  - ➕ Others (customizable)

- **Mark Items as Purchased**  
  Tap to mark products as bought, with visual feedback for the whole family.

- **Smart Suggestions**  
  Autocomplete and suggest frequently purchased products for faster entry.

---

## 📲 Tech Stack

- **Frontend**: [React Native](https://reactnative.dev/)  
- **Backend / Realtime / Auth / Storage**: [Supabase](https://supabase.com/)

---

## Colors

Primary Color:

#4CAF50 (Green) — Represents freshness, ideal for a food-related app.

Secondary Color:

#FFEB3B (Yellow) — For accents and highlighting interactive elements (like buttons or notifications).

Neutral Colors:

#FFFFFF (White) — Background color for clean, open space.

#F5F5F5 (Light Gray) — For background sections or cards.

#212121 (Dark Gray) — Primary text color for contrast.

#757575 (Medium Gray) — Secondary text or inactive items.

Error / Warning Colors:

#F44336 (Red) — For errors or actions like "remove item."

#FF9800 (Orange) — For warnings or reminders.

Success Color:

#8BC34A (Light Green) — When an item is marked as purchased.



---

## 📐 Wireframes (Text-based)

1. **Home Screen – Active List**
   - 🧑 Username (top right)
   - 📋 List Title: "Next List"
   - 🛍️ Item List (grouped by categories)
     - ✅ [x] Milk (added by Anna, 5 min ago)
     - ⬜ Bread (added by Tom, just now)
   - ➕ Add Item input + Suggestions dropdown
   - 🔔 Notification Bell (for updates)

2. **Add Item Modal**
   - 📝 Input: Product Name
   - 📂 Dropdown: Category
   - 💡 Autocomplete Suggestions (e.g., Milk, Eggs, Butter)
   - ➕ Submit button

3. **History / Archived Lists**
   - 📆 List of past shopping lists
   - 🕒 Timestamp
   - 👁️ View-only mode

---

## 👤 User Stories

### 🧑‍🤝‍🧑 As a Family Member:

- I want to see one unified shopping list that my family shares.
- I want to authorize new members join.
- I want to see who added each item and when.
- I want to be notified when someone adds something new to the list.
- I want to mark items as purchased with one tap.
- I want items to be grouped by categories so shopping is easier.
- I want to see categories marked both with color and with icons.
- I want frequently bought items to be suggested automatically.
- I want to archive the current list once it's done and start a new one.
- I want to confirm the list archivation when the last item on the list is marked as purchased
- I want to be able to archive the list manually when not all the items are marked as purchased

---

## 🧠 Data Model (Simplified)

### `users`
| Field      | Type    | Description        |
|------------|---------|--------------------|
| id         | UUID    | Primary key        |
| name       | String  | User name          |
| email      | String  | Auth email         |

### `shopping_lists`
| Field       | Type      | Description              |
|-------------|-----------|--------------------------|
| id          | UUID      | Primary key              |
| title       | String    | e.g. "Next List"         |
| is_active   | Boolean   | Current list flag        |
| created_at  | Timestamp | List creation time       |

### `items`
| Field        | Type      | Description                         |
|--------------|-----------|-------------------------------------|
| id           | UUID      | Primary key                         |
| name         | String    | Item name                           |
| category     | String    | e.g., "Dairy", "Bakery"             |
| added_by     | UUID      | `users.id`                          |
| added_at     | Timestamp | Time added                          |
| is_purchased | Boolean   | Marked as purchased                 |
| list_id      | UUID      | FK to `shopping_lists.id`           |

---

## 📡 API Design (Supabase RPC + REST)

### `GET /active-list`
> Fetch current active shopping list with grouped items.

```json
{
  "id": "uuid",
  "title": "Next List",
  "items": {
    "Dairy": [ { "name": "Milk", "is_purchased": true, "added_by": "Anna", "added_at": "..." } ],
    "Bakery": [ { "name": "Bread", "is_purchased": false, "added_by": "Tom", "added_at": "..." } ]
  }
}
```

---

### `POST /items`
> Add a new item to the list

```json
{
  "name": "Butter",
  "category": "Dairy",
  "added_by": "user_id"
}
```

---

### `PATCH /items/:id`
> Mark an item as purchased or edit its category/name.

```json
{
  "is_purchased": true
}
```

---

### `POST /lists/archive`
> Archive the current list and create a new one.

```json
{
  "new_title": "Next List"
}
```

---

### `GET /suggestions?query=mil`
> Autocomplete suggestions for items starting with "mil".

```json
[
  { "name": "Milk" },
  { "name": "Millet" }
]
```

---

### `GET /history`
> Get archived shopping lists (summary view).

```json
[
  { "id": "uuid", "title": "March Groceries", "created_at": "2024-03-01" },
  ...
]
```
