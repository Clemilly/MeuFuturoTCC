"use client"

import { useState, useEffect } from 'react'
import { apiService } from '@/lib/api'

export default function TestApiPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testCategories = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log('🔍 DEBUG: Testing categories API...')
      const response = await apiService.getCategories(true, true)
      console.log('🔍 DEBUG: Categories API response:', response)
      
      if (response.error) {
        setError(`Erro na API: ${response.error}`)
      } else {
        setCategories(response.data || [])
      }
    } catch (err) {
      console.error('🔍 DEBUG: Categories API error:', err)
      setError(`Erro: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  const testTransactions = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log('🔍 DEBUG: Testing transactions API...')
      
      // Teste 1: Todas as transações
      const allResponse = await apiService.getTransactions({
        page: 1,
        size: 10
      })
      console.log('🔍 DEBUG: All transactions response:', allResponse)
      
      // Teste 2: Apenas despesas
      const expenseResponse = await apiService.getTransactions({
        page: 1,
        size: 10,
        transaction_type: 'expense'
      })
      console.log('🔍 DEBUG: Expense transactions response:', expenseResponse)
      
      // Teste 3: Apenas receitas
      const incomeResponse = await apiService.getTransactions({
        page: 1,
        size: 10,
        transaction_type: 'income'
      })
      console.log('🔍 DEBUG: Income transactions response:', incomeResponse)
      
      if (expenseResponse.error) {
        setError(`Erro na API: ${expenseResponse.error}`)
      } else {
        setTransactions(expenseResponse.data?.items || [])
      }
    } catch (err) {
      console.error('🔍 DEBUG: Transactions API error:', err)
      setError(`Erro: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Teste da API</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Test Categories */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Teste de Categorias</h2>
            <button
              onClick={testCategories}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Carregando...' : 'Testar Categorias'}
            </button>
            
            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            
            <div className="mt-4">
              <h3 className="font-medium">Categorias encontradas: {categories.length}</h3>
              <div className="mt-2 max-h-40 overflow-y-auto">
                {categories.map((cat, index) => (
                  <div key={index} className="text-sm p-2 border-b">
                    <span className="font-medium">{cat.name}</span>
                    <span className="ml-2 text-gray-500">({cat.type})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Test Transactions */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Teste de Transações (Despesas)</h2>
            <button
              onClick={testTransactions}
              disabled={loading}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? 'Carregando...' : 'Testar Transações'}
            </button>
            
            <div className="mt-4">
              <h3 className="font-medium">Transações encontradas: {transactions.length}</h3>
              <div className="mt-2 max-h-40 overflow-y-auto">
                {transactions.map((trans, index) => (
                  <div key={index} className="text-sm p-2 border-b">
                    <span className="font-medium">{trans.description}</span>
                    <span className="ml-2 text-gray-500">({trans.type})</span>
                    <span className="ml-2 text-gray-500">R$ {trans.amount}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Verifique o console para logs detalhados dos testes
              </div>
            </div>
          </div>
        </div>

        {/* Raw Data */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Dados Brutos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium">Categorias:</h3>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                {JSON.stringify(categories, null, 2)}
              </pre>
            </div>
            <div>
              <h3 className="font-medium">Transações:</h3>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                {JSON.stringify(transactions, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
