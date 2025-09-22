"use client"

import { useState } from 'react'

export function SimpleFiltersTest() {
  const [search, setSearch] = useState('')
  const [type, setType] = useState('all')

  return (
    <div className="p-4 bg-white rounded-lg shadow border">
      <h3 className="text-lg font-semibold mb-4">Teste Ultra-Simples de Filtros</h3>
      
      <div className="space-y-4">
        {/* Input simples */}
        <div>
          <label className="block text-sm font-medium mb-2">Busca:</label>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              console.log('🔍 SimpleFiltersTest: Search changed to:', e.target.value)
              setSearch(e.target.value)
            }}
            placeholder="Digite para buscar..."
            className="w-full p-2 border border-gray-300 rounded-md"
            style={{ 
              pointerEvents: 'auto',
              cursor: 'text',
              opacity: 1
            }}
          />
          <p className="text-xs text-gray-500 mt-1">Valor atual: "{search}"</p>
        </div>

        {/* Select simples */}
        <div>
          <label className="block text-sm font-medium mb-2">Tipo:</label>
          <select
            value={type}
            onChange={(e) => {
              console.log('🔍 SimpleFiltersTest: Type changed to:', e.target.value)
              setType(e.target.value)
            }}
            className="w-full p-2 border border-gray-300 rounded-md"
            style={{ 
              pointerEvents: 'auto',
              cursor: 'pointer',
              opacity: 1
            }}
          >
            <option value="all">Todos</option>
            <option value="income">Receitas</option>
            <option value="expense">Despesas</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">Valor atual: "{type}"</p>
        </div>

        {/* Button simples */}
        <div>
          <button
            onClick={() => {
              console.log('🔍 SimpleFiltersTest: Button clicked')
              alert('Botão funciona!')
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            style={{ 
              pointerEvents: 'auto',
              cursor: 'pointer',
              opacity: 1
            }}
          >
            Testar Clique
          </button>
        </div>
      </div>

      {/* Estado atual */}
      <div className="mt-4 p-2 bg-gray-100 rounded">
        <h4 className="font-medium">Estado Atual:</h4>
        <pre className="text-sm">{JSON.stringify({ search, type }, null, 2)}</pre>
      </div>
    </div>
  )
}
