import { useState, useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { Auth } from '../components/Auth'

export default function App() {
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
        <View style={styles.content}>
          <Text style={styles.welcomeText}>Welcome, {session.user.email}!</Text>
          <Text style={styles.regularText}>Your shopping lists will appear here.</Text>
          <Text
            style={styles.signOutText}
            onPress={() => supabase.auth.signOut()}
          >
            Sign Out
          </Text>
        </View>
      ) : (
        <Auth />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 15,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#212121',
  },
  regularText: {
    fontSize: 16,
    color: '#757575',
    marginBottom: 20,
  },
  signOutText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
  },
})
