import { useState, useEffect } from 'react'
import { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { CATEGORIES } from '../constants/Categories'

// Define types for our hook
export type ShoppingListItem = {
  id: string
  name: string
  category: string
  is_purchased: boolean
  added_at: string
  user_name: string
  list_id: string
  quantity: number
  quantity_unit: string
}

export type GroupedItems = {
  [category: string]: ShoppingListItem[]
}

export type ShoppingList = {
  id: string
  title: string
  items: GroupedItems
  created_at: string
}

export const useShoppingList = (session: Session | null) => {
  const [activeList, setActiveList] = useState<ShoppingList | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch the active shopping list
  const fetchActiveList = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!session) {
        setActiveList(null)
        return
      }

      // Get the active list
      const { data: listData, error: listError } = await supabase
        .from('shopping_lists')
        .select('id, title, created_at')
        .eq('is_active', true)
        .single()

      if (listError) {
        if (listError.code === 'PGRST116') {
          // No active list found, create one
          const { data: newList, error: createError } = await supabase
            .from('shopping_lists')
            .insert({ title: 'Next List', is_active: true })
            .select('id, title, created_at')
            .single()

          if (createError) throw createError

          // Set the newly created list (without items)
          setActiveList({
            id: newList.id,
            title: newList.title,
            created_at: newList.created_at,
            items: {},
          })
          setLoading(false)
          return
        }
        throw listError
      }

      // Get items for the active list
      const { data: itemsData, error: itemsError } = await supabase
        .from('items')
        .select(
          `
          id, 
          name, 
          category, 
          is_purchased, 
          added_at,
          list_id, 
          users:added_by (name),
          quantity,
          quantity_unit
        `,
        )
        .eq('list_id', listData.id)

      if (itemsError) throw itemsError

      // Group items by category
      const groupedItems: GroupedItems = {}

      // Initialize all categories as empty arrays
      CATEGORIES.forEach((category) => {
        groupedItems[category.id] = []
      })

      // Add items to their categories
      itemsData?.forEach((item: any) => {
        // Extract the user name safely
        let userName = 'Unknown'
        if (item.users) {
          // Handle both cases: when users is an object or an array
          if (Array.isArray(item.users) && item.users.length > 0) {
            userName = item.users[0].name || 'Unknown'
          } else if (typeof item.users === 'object') {
            userName = item.users.name || 'Unknown'
          }
        }

        const formattedItem: ShoppingListItem = {
          id: item.id,
          name: item.name,
          category: item.category,
          is_purchased: item.is_purchased,
          added_at: item.added_at,
          user_name: userName,
          list_id: item.list_id,
          quantity: item.quantity,
          quantity_unit: item.quantity_unit,
        }

        // Make sure the category exists, fallback to 'other'
        const categoryId = CATEGORIES.some((c) => c.id === item.category) ? item.category : 'other'

        groupedItems[categoryId].push(formattedItem)
      })

      setActiveList({
        id: listData.id,
        title: listData.title,
        created_at: listData.created_at,
        items: groupedItems,
      })
    } catch (err: any) {
      console.error('Error fetching shopping list:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Add a new item to the shopping list
  const addItem = async (name: string, category: string, quantity: number = 1, quantity_unit: string = 'piece') => {
    if (!session || !activeList) return null

    try {
      const { data, error } = await supabase
        .from('items')
        .insert({
          name,
          category,
          added_by: session.user.id,
          list_id: activeList.id,
          quantity,
          quantity_unit
        })
        .select(
          `
          id, 
          name, 
          category, 
          is_purchased, 
          added_at,
          list_id, 
          users:added_by (name),
          quantity,
          quantity_unit
        `,
        )
        .single()

      if (error) throw error

      // Update local state with the new item
      fetchActiveList()
      return data
    } catch (err: any) {
      console.error('Error adding item:', err)
      setError(err.message)
      return null
    }
  }

  // Toggle the purchased status of an item
  const toggleItemPurchased = async (itemId: string, isPurchased: boolean) => {
    if (!session) return false

    try {
      const { error } = await supabase
        .from('items')
        .update({ is_purchased: !isPurchased })
        .eq('id', itemId)

      if (error) throw error

      // Refresh the list after update
      fetchActiveList()
      return true
    } catch (err: any) {
      console.error('Error toggling item status:', err)
      setError(err.message)
      return false
    }
  }

  // Archive the current active list and create a new one
  const archiveList = async () => {
    if (!session || !activeList) return false

    try {
      // Mark current list as inactive
      const { error: updateError } = await supabase
        .from('shopping_lists')
        .update({ is_active: false })
        .eq('id', activeList.id)

      if (updateError) throw updateError

      // Create a new active list
      const { error: insertError } = await supabase
        .from('shopping_lists')
        .insert({ title: 'Next List', is_active: true })

      if (insertError) throw insertError

      // Refresh the list
      fetchActiveList()
      return true
    } catch (err: any) {
      console.error('Error archiving list:', err)
      setError(err.message)
      return false
    }
  }

  // Setup realtime subscription
  useEffect(() => {
    if (!session) return

    // Fetch initial list
    fetchActiveList()

    // Subscribe to changes in the items table
    const subscription = supabase
      .channel('items_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, () => {
        // Refetch the list on any change
        fetchActiveList()
      })
      .subscribe()

    // Subscribe to changes in the shopping_lists table
    const listSubscription = supabase
      .channel('lists_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shopping_lists' }, () => {
        // Refetch the list on any change
        fetchActiveList()
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
      listSubscription.unsubscribe()
    }
  }, [session])

  return {
    activeList,
    loading,
    error,
    fetchActiveList,
    addItem,
    toggleItemPurchased,
    archiveList,
  }
}
