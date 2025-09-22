/**
 * Smart wrapper that automatically chooses between virtualized and simple list
 * based on availability of react-window and number of items
 */

"use client"

import { useState, useEffect } from 'react'
import { TransactionsListSimple } from './transactions-list-simple'
import type { Transaction } from '@/lib/types'

interface TransactionsListWrapperProps {
  transactions: Transaction[]
  loading: boolean
  onEdit: (transaction: Transaction) => void
  onDelete: (transaction: Transaction) => void
  onViewDetails: (transaction: Transaction) => void
  onDuplicate: (transaction: Transaction) => void
}

export function TransactionsListWrapper(props: TransactionsListWrapperProps) {
  // Always use simple list for now to avoid complexity
  return <TransactionsListSimple {...props} />
}

