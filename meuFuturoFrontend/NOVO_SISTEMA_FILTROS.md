# Novo Sistema de Listagem e Filtros de Transações

## Visão Geral

Sistema completamente refatorado para listagem e filtros de transações com comportamento manual e paginação.

## Arquivos Criados

### 1. Hook: `use-transactions-new.ts`

- **Localização**: `hooks/use-transactions-new.ts`
- **Responsabilidade**: Gerenciar estado de transações, filtros e paginação
- **Características**:
  - ✅ Filtros atualizados localmente sem requisições automáticas
  - ✅ Função `applyFilters()` para aplicar filtros manualmente
  - ✅ Função `changePage()` que mantém filtros ativos
  - ✅ Função `clearFilters()` para limpar todos os filtros
  - ✅ Validações de filtros (ex: min <= max)
  - ✅ Logs de debug detalhados
  - ✅ Tratamento de erros com toast

### 2. Componente: `transactions-filters-new.tsx`

- **Localização**: `components/transactions/transactions-filters-new.tsx`
- **Responsabilidade**: Interface de filtros
- **Características**:
  - ✅ Campo de busca por texto
  - ✅ Seletor de tipo (Todos/Receitas/Despesas)
  - ✅ Seletor de período (calendário com range)
  - ✅ Seletor de range de valores
  - ✅ Filtros avançados (collapsible): categoria e ordenação
  - ✅ Botão "Filtrar" sempre visível
  - ✅ Botão "Limpar Filtros" (quando há filtros ativos)
  - ✅ Contador de filtros ativos
  - ✅ Estados de loading

### 3. Componente: `transactions-pagination-new.tsx`

- **Localização**: `components/transactions/transactions-pagination-new.tsx`
- **Responsabilidade**: Controles de paginação
- **Características**:
  - ✅ Botões Anterior/Próxima
  - ✅ Números de página clicáveis
  - ✅ Ellipsis (...) para muitas páginas
  - ✅ Informação de items sendo exibidos
  - ✅ Esconde quando só há 1 página
  - ✅ Responsivo (mobile-friendly)
  - ✅ Estados de loading

### 4. Página: `transactions-page-new.tsx`

- **Localização**: `components/transactions/transactions-page-new.tsx`
- **Responsabilidade**: Página principal que integra todos os componentes
- **Características**:
  - ✅ Header com botão de atualizar e nova transação
  - ✅ Integração com filtros
  - ✅ Integração com paginação
  - ✅ Integração com lista de transações
  - ✅ Gerenciamento de modals (criar/editar/excluir/detalhes)
  - ✅ Tratamento de erros

## Como Usar

### 1. Integrar na Aplicação

Substitua o componente atual em `app/transactions/page.tsx`:

```typescript
import { TransactionsPageNew } from "@/components/transactions/transactions-page-new";

export default function TransactionsPage() {
  return <TransactionsPageNew />;
}
```

### 2. Fluxo de Uso

#### Ao Abrir a Página:

1. ✅ Carrega categorias automaticamente
2. ✅ Carrega primeira página de transações (sem filtros)
3. ✅ Exibe loading durante carregamento

#### Ao Selecionar Filtros:

1. ✅ Filtros são atualizados no estado local
2. ✅ **NÃO** faz requisição automaticamente
3. ✅ Contador de filtros ativos é atualizado

#### Ao Clicar "Filtrar":

1. ✅ Valida filtros (ex: min <= max)
2. ✅ Converte filtros para formato da API
3. ✅ Reseta para página 1
4. ✅ Faz requisição única ao backend
5. ✅ Atualiza lista com resultados

#### Ao Navegar Páginas:

1. ✅ Mantém todos os filtros ativos
2. ✅ Muda apenas o número da página
3. ✅ Faz nova requisição

#### Ao Clicar "Limpar Filtros":

1. ✅ Remove todos os filtros
2. ✅ Volta para estado inicial
3. ✅ Recarrega primeira página sem filtros

## Logs de Debug

O sistema inclui logs detalhados para facilitar debugging:

### No Console do Navegador:

```
🚀 Initial load...
📂 Loading categories...
✅ Categories loaded: X items
🔄 Loading transactions with filters: {...}
📥 Response received: {...}
✅ Transactions loaded: X items

🔧 Updating filters (no request): {...}
🎯 Applying filters (making request)...
🔍 Converting filters to API format: {...}
  ✓ Search: "..."
  ✓ Type: income
  ✓ Category ID: "..."
  ✓ Date range: YYYY-MM-DD - YYYY-MM-DD
  ✓ Min amount: 100
  ✓ Max amount: 1000
📤 Final API filters: {...}

📄 Changing to page: 2
⬅️ Previous page clicked
➡️ Next page clicked
🎯 Filtrar button clicked
🗑️ Clearing all filters...
🔄 Refreshing current page...
```

## Validações Implementadas

### 1. Validação de Valores:

- ✅ `min_amount` não pode ser maior que `max_amount`
- ✅ Mostra toast de erro se validação falhar

### 2. Validação de Datas:

- ✅ Datas são formatadas corretamente (YYYY-MM-DD)
- ✅ Validação de período no calendário

### 3. Validação de Estados:

- ✅ Desabilita botões durante loading
- ✅ Previne múltiplas requisições simultâneas

## Estrutura de Estados

### FilterState:

```typescript
{
  search: string; // Busca por texto
  type: "all" | "income" | "expense"; // Tipo de transação
  category: string; // ID da categoria ou 'all'
  dateRange: {
    start: Date | null; // Data de início
    end: Date | null; // Data de fim
  }
  amountRange: {
    min: number | null; // Valor mínimo
    max: number | null; // Valor máximo
  }
  sortBy: string; // Campo de ordenação
  sortOrder: "asc" | "desc"; // Ordem de ordenação
}
```

### PaginationInfo:

```typescript
{
  current_page: number        // Página atual
  page_size: number           // Items por página
  total_items: number         // Total de items
  total_pages: number         // Total de páginas
  has_next: boolean           // Tem próxima página
  has_previous: boolean       // Tem página anterior
  next_page?: number          // Número da próxima página
  previous_page?: number      // Número da página anterior
}
```

## API Integration

### Endpoint:

```
GET /api/v1/financial/transactions
```

### Query Parameters:

```typescript
{
  page: number              // Número da página
  size: number              // Items por página (20)
  transaction_type?: string // 'income' ou 'expense'
  category_id?: string      // UUID da categoria
  start_date?: string       // YYYY-MM-DD
  end_date?: string         // YYYY-MM-DD
  min_amount?: number       // Valor mínimo
  max_amount?: number       // Valor máximo
  search?: string           // Busca por texto
  sort_by?: string          // Campo de ordenação
  sort_order?: string       // 'asc' ou 'desc'
}
```

### Response:

```typescript
{
  items: Transaction[]      // Array de transações
  total: number             // Total de items
  page: number              // Página atual
  size: number              // Items por página
  pages: number             // Total de páginas
  has_next: boolean         // Tem próxima
  has_previous: boolean     // Tem anterior
}
```

## Critérios de Aceitação Atendidos

✅ Ao abrir a página, carrega transações automaticamente  
✅ Ao selecionar filtros, NÃO faz requisição automática  
✅ Ao clicar "Filtrar", faz UMA requisição com TODOS os filtros  
✅ Requisição inclui todos os parâmetros corretos  
✅ Ao aplicar filtros, reseta para página 1  
✅ Ao mudar de página, mantém filtros ativos  
✅ Ao clicar "Limpar Filtros", remove filtros e recarrega  
✅ Mostra indicador de loading  
✅ Paginação funciona corretamente  
✅ Exibe informações de paginação  
✅ Valida filtros antes de enviar  
✅ Tratamento de erros amigável  
✅ Estados vazios tratados

## Próximos Passos

### Para Ativar o Novo Sistema:

1. **Backup dos arquivos antigos** (opcional):

   ```bash
   mv hooks/use-transactions.ts hooks/use-transactions-old.ts
   mv components/transactions/transactions-page.tsx components/transactions/transactions-page-old.tsx
   mv components/transactions/transactions-filters.tsx components/transactions/transactions-filters-old.tsx
   mv components/transactions/transactions-pagination.tsx components/transactions/transactions-pagination-old.tsx
   ```

2. **Renomear arquivos novos**:

   ```bash
   mv hooks/use-transactions-new.ts hooks/use-transactions.ts
   mv components/transactions/transactions-page-new.tsx components/transactions/transactions-page.tsx
   mv components/transactions/transactions-filters-new.tsx components/transactions/transactions-filters.tsx
   mv components/transactions/transactions-pagination-new.tsx components/transactions/transactions-pagination.tsx
   ```

3. **Atualizar imports** na página principal:

   - Em `app/transactions/page.tsx`, use `TransactionsPage` normal

4. **Testar**:
   - Abrir página de transações
   - Selecionar filtros (não deve fazer requisição)
   - Clicar "Filtrar" (deve fazer requisição)
   - Navegar páginas (deve manter filtros)
   - Limpar filtros (deve resetar)

## Troubleshooting

### Problema: Filtros não funcionam

**Solução**: Verifique logs no console e no backend

### Problema: Paginação não aparece

**Solução**: Verifique se há mais de 1 página de resultados

### Problema: Categorias não carregam

**Solução**: Verifique endpoint `/api/v1/financial/categories`

### Problema: Erro de autenticação

**Solução**: Verifique token no localStorage

## Contato

Para dúvidas ou problemas, consulte a documentação ou verifique os logs de debug.

