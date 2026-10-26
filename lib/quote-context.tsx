'use client'

import React, { createContext, useContext, useReducer, useEffect } from 'react'
import type { QuoteItem } from './types'

interface QuoteState {
  items: QuoteItem[]
}

type QuoteAction =
  | { type: 'ADD_ITEM'; payload: Omit<QuoteItem, 'quantity' | 'lineNote'> }
  | { type: 'REMOVE_ITEM'; productId: string }
  | { type: 'UPDATE_QUANTITY'; productId: string; quantity: number }
  | { type: 'UPDATE_LINE_NOTE'; productId: string; lineNote: string }
  | { type: 'CLEAR' }
  | { type: 'HYDRATE'; items: QuoteItem[] }

function quoteReducer(state: QuoteState, action: QuoteAction): QuoteState {
  switch (action.type) {
    case 'HYDRATE':
      return { items: action.items }

    case 'ADD_ITEM': {
      const existing = state.items.find(i => i.productId === action.payload.productId)
      if (existing) {
        return {
          items: state.items.map(i =>
            i.productId === action.payload.productId
              ? { ...i, quantity: i.quantity + 1 }
              : i
          )
        }
      }
      return {
        items: [...state.items, { ...action.payload, quantity: 1, lineNote: '' }]
      }
    }

    case 'REMOVE_ITEM':
      return { items: state.items.filter(i => i.productId !== action.productId) }

    case 'UPDATE_QUANTITY': {
      if (action.quantity <= 0) {
        return { items: state.items.filter(i => i.productId !== action.productId) }
      }
      return {
        items: state.items.map(i =>
          i.productId === action.productId ? { ...i, quantity: action.quantity } : i
        )
      }
    }

    case 'UPDATE_LINE_NOTE':
      return {
        items: state.items.map(i =>
          i.productId === action.productId ? { ...i, lineNote: action.lineNote } : i
        )
      }

    case 'CLEAR':
      return { items: [] }

    default:
      return state
  }
}

interface QuoteContextValue {
  items: QuoteItem[]
  count: number
  addItem: (item: Omit<QuoteItem, 'quantity' | 'lineNote'>) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  updateLineNote: (productId: string, lineNote: string) => void
  clearQuote: () => void
}

const QuoteContext = createContext<QuoteContextValue | null>(null)

const STORAGE_KEY = 'ecoshift_quote'

export function QuoteProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(quoteReducer, { items: [] })

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const items = JSON.parse(raw) as QuoteItem[]
        dispatch({ type: 'HYDRATE', items })
      }
    } catch { /* corrupted storage */ }
  }, [])

  // Persist to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items))
    } catch { /* storage full */ }
  }, [state.items])

  const value: QuoteContextValue = {
    items: state.items,
    count: state.items.length,
    addItem: (item) => dispatch({ type: 'ADD_ITEM', payload: item }),
    removeItem: (productId) => dispatch({ type: 'REMOVE_ITEM', productId }),
    updateQuantity: (productId, quantity) => dispatch({ type: 'UPDATE_QUANTITY', productId, quantity }),
    updateLineNote: (productId, lineNote) => dispatch({ type: 'UPDATE_LINE_NOTE', productId, lineNote }),
    clearQuote: () => dispatch({ type: 'CLEAR' })
  }

  return <QuoteContext.Provider value={value}>{children}</QuoteContext.Provider>
}

export function useQuote() {
  const ctx = useContext(QuoteContext)
  if (!ctx) throw new Error('useQuote must be used within QuoteProvider')
  return ctx
}
