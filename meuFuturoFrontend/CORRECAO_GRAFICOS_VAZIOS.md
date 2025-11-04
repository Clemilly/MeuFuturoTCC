# 🔧 CORREÇÃO: Gráficos Vazios na Aba de Relatórios

## 🚨 PROBLEMA IDENTIFICADO

Os gráficos estavam vazios porque:

1. **Root Cause**: O hook `use-reports-filters.ts` iniciava com `dateRange.start` e `dateRange.end` como `null`
2. **Comportamento do Backend**: Quando não recebe filtros de data, o backend usa apenas o **mês atual** como período default (linha 297-299 de `report_service.py`)
3. **Resultado**: Se o usuário não tem transações no mês atual, os gráficos ficam vazios

## ✅ SOLUÇÃO IMPLEMENTADA

Modificado `hooks/reports/use-reports-filters.ts` para:

### 1️⃣ Range de Datas Default (Últimos 6 Meses)

```typescript
// Helper function to get default date range (last 6 months)
const getDefaultDateRange = () => {
  const end = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - 6);
  return { start, end };
};

const initialFilters: ReportFilters = {
  dateRange: getDefaultDateRange(), // ✅ Agora inicia com últimos 6 meses
  period: "monthly",
  categories: [],
  transactionTypes: ["income", "expense"],
  comparisonPeriod: false,
  minAmount: null,
  maxAmount: null,
};
```

### 2️⃣ Clear Filters Atualizado

```typescript
const clearFilters = useCallback(() => {
  console.log("🗑️ Clearing report filters");
  setFilters({
    dateRange: getDefaultDateRange(), // ✅ Gera novo range ao limpar
    period: "monthly",
    categories: [],
    transactionTypes: ["income", "expense"],
    comparisonPeriod: false,
    minAmount: null,
    maxAmount: null,
  });
}, []);
```

### 3️⃣ Active Filters Count Corrigido

```typescript
const activeFiltersCount = useMemo(() => {
  const defaultRange = getDefaultDateRange();
  let count = 0;

  // ✅ Só conta se for diferente do range default
  const hasCustomDateRange =
    (filters.dateRange.start &&
      filters.dateRange.start.getTime() !== defaultRange.start.getTime()) ||
    (filters.dateRange.end &&
      filters.dateRange.end.getTime() !== defaultRange.end.getTime());

  if (hasCustomDateRange) count++;
  // ... resto dos filtros
  return count;
}, [filters]);
```

## 🧪 COMO TESTAR

### Teste 1: Carregamento Inicial

1. Abra a aba de **Relatórios**
2. Verifique no console: `📊 Loading report data with filters:`
3. **Esperado**: O filtro deve mostrar um range de 6 meses nos campos de data
4. **Esperado**: Os gráficos devem carregar com dados (se houver transações nos últimos 6 meses)

### Teste 2: Verificar Dados no Console

```javascript
// Abra o DevTools Console e procure por:
✅ Report data loaded: { monthlyComparison: [...], trends: [...], ... }
```

### Teste 3: Filtro de Datas

1. Altere as datas manualmente
2. Clique em **"Filtrar"**
3. **Esperado**: Gráficos devem atualizar com novo período

### Teste 4: Limpar Filtros

1. Modifique algum filtro
2. Clique em **"Limpar filtros"** (X)
3. **Esperado**: Deve voltar para últimos 6 meses

### Teste 5: Contador de Filtros Ativos

1. Com filtros default (últimos 6 meses): **0 filtros ativos**
2. Altere data: deve mostrar **"1 filtro ativo"**
3. **Esperado**: Range default não é contado como filtro ativo

## 📊 ESTRUTURA DE DADOS

### Backend retorna (via `/api/v1/financial/reports/analytics`):

```json
[
  {
    "period": "2025-04",
    "period_start": "2025-04-01",
    "period_end": "2025-04-30",
    "income": 5000.0,
    "expenses": 3200.0,
    "net_amount": 1800.0,
    "transaction_count": 45,
    "average_transaction": 111.11,
    "growth_rate": null
  }
  // ... mais períodos
]
```

### Frontend mapeia para `MonthlyComparisonData`:

```typescript
{
  month: "2025-04",
  income: 5000,
  expense: 3200,
  balance: 1800
}
```

## 🔍 SE OS GRÁFICOS AINDA ESTIVEREM VAZIOS

Verifique:

1. **Há transações no banco?**

   - Acesse a aba de Transações
   - Veja se há transações nos últimos 6 meses

2. **Backend está rodando?**

   - Console deve mostrar requisição para `/api/v1/financial/reports/analytics`
   - Não deve haver erro 500 ou 404

3. **Token de autenticação válido?**

   - Se houver erro 401, faça logout/login novamente

4. **Console de debug:**

   ```javascript
   📊 Loading report data with filters: {
     dateRange: { start: Date, end: Date },
     period: 'monthly'
   }
   ✅ Report data loaded: { monthlyComparison: [...] }
   ```

5. **Se `monthlyComparison` está vazio `[]`:**
   - Significa que não há transações no período
   - Crie algumas transações de teste na aba Transações
   - Volte para Relatórios e clique em "Atualizar"

## 🎯 RESULTADO ESPERADO

- ✅ Gráficos carregam automaticamente com dados dos últimos 6 meses
- ✅ Interface mostra range de datas nos filtros
- ✅ Cards de resumo mostram totais corretos
- ✅ Gráfico mensal com barras verdes (receitas) e vermelhas (despesas)
- ✅ Gráfico de tendências com insights automáticos
- ✅ Nenhum erro no console

## 📝 ARQUIVOS MODIFICADOS

- ✅ `hooks/reports/use-reports-filters.ts` (91 linhas, +20 linhas)

---

**FIM DA DOCUMENTAÇÃO DE CORREÇÃO**





