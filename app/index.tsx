import { useState, useEffect, useMemo } from 'react'
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity,
  ActivityIndicator,
  SectionList,
  Alert
} from 'react-native'
import { Session } from '@supabase/supabase-js'
import { supabase } from '@lib/supabase'
import { Auth } from '@components/Auth'
import ListItem from '@components/ShoppingListItem'
import CategoryHeader from '@components/CategoryHeader'
import AddItemForm from '@components/AddItemForm'
import { useShoppingList } from '@hooks/useShoppingList'
import { CATEGORIES } from '@constants/Categories'
import { Colors } from '@/constants/Colors'

// This is the main app component that will be exported as default
export default function Index() {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>🛒 CartMate</Text>
      </View>

      {session && session.user ? (
        <ActiveListScreen session={session} />
      ) : (
        <Auth />
      )}
    </View>
  )
}

function ActiveListScreen({ session }: { session: Session }) {
  const { 
    activeList, 
    loading, 
    error, 
    fetchActiveList, 
    addItem, 
    toggleItemPurchased,
    archiveList
  } = useShoppingList(session)

  const sections = useMemo(() => {
    if (!activeList) return []

    return CATEGORIES.map(category => ({
      title: category.name,
      data: activeList.items[category.id] || [],
      category,
    })).filter(section => section.data.length > 0)
  }, [activeList])

  const allItemsCount = useMemo(() => {
    if (!activeList) return 0
    
    return Object.values(activeList.items).reduce(
      (count, items) => count + items.length, 
      0
    )
  }, [activeList])

  const purchasedItemsCount = useMemo(() => {
    if (!activeList) return 0
    
    return Object.values(activeList.items).reduce(
      (count, items) => count + items.filter(item => item.is_purchased).length, 
      0
    )
  }, [activeList])

  const handleArchiveList = () => {
    if (purchasedItemsCount < allItemsCount) {
      Alert.alert(
        'Archive Incomplete List?',
        'Not all items have been purchased. Are you sure you want to archive this list?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Archive', 
            style: 'destructive',
            onPress: () => archiveList()
          }
        ]
      )
    } else {
      archiveList()
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading shopping list...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchActiveList}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (!activeList) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>No active shopping list found</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchActiveList}>
          <Text style={styles.retryButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.listContainer}>
      <View style={styles.listHeader}>
        <View>
          <Text style={styles.listTitle}>{activeList.title}</Text>
          <Text style={styles.listInfo}>
            {purchasedItemsCount} of {allItemsCount} items purchased
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.archiveButton}
          onPress={handleArchiveList}
        >
          <Text style={styles.archiveButtonText}>Archive</Text>
        </TouchableOpacity>
      </View>

      {allItemsCount === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            Your shopping list is empty. Add some items below!
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ListItem 
              item={item} 
              onTogglePurchased={toggleItemPurchased} 
            />
          )}
          renderSectionHeader={({ section }) => (
            <CategoryHeader 
              category={section.category} 
              itemCount={section.data.length} 
            />
          )}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={styles.scrollContent}
        />
      )}

      <AddItemForm onAddItem={addItem} />
      
      <TouchableOpacity 
        style={styles.signOutButton}
        onPress={() => supabase.auth.signOut()}
      >
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.mediumGray,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.white,
    fontWeight: '600',
  },
  listContainer: {
    flex: 1,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  listTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.darkGray,
  },
  listInfo: {
    fontSize: 14,
    color: Colors.mediumGray,
    marginTop: 4,
  },
  archiveButton: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  archiveButtonText: {
    color: Colors.darkGray,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.mediumGray,
    textAlign: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
  },
  signOutButton: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
  },
  signOutText: {
    color: Colors.mediumGray,
    fontWeight: '600',
  },
}) 