# 📊 Documentação - Relatórios Financeiros

## Visão Geral

O sistema de relatórios financeiros oferece uma análise completa e interativa das finanças pessoais, com funcionalidades avançadas de visualização, exportação e análise de tendências.

## 🚀 Funcionalidades Implementadas

### ✅ Funcionalidades Completas

- **📈 Visualizações Interativas**: Gráficos de barras, pizza, área e tabelas
- **🔍 Filtros Avançados**: Período personalizado, categoria, tipo de transação, valores
- **📤 Exportação Multi-formato**: CSV, XLSX, PDF
- **📊 Análise Comparativa**: Comparação entre períodos diferentes
- **📈 Análise de Tendências**: Previsões baseadas em dados históricos
- **🎨 Interface Responsiva**: Adaptável para mobile, tablet e desktop
- **♿ Acessibilidade**: Compatível com screen readers e navegação por teclado
- **⚡ Performance**: Cache inteligente e carregamento otimizado

## 🏗️ Arquitetura

### Backend

```
meuFuturoBackend/
├── schemas/
│   └── report.py                 # Schemas de validação
├── services/
│   └── report_service.py         # Lógica de negócio
└── api/
    └── financial.py              # Endpoints REST
```

### Frontend

```
meuFuturoFrontend/
├── hooks/
│   └── use-financial-reports.ts  # Hook principal
├── components/
│   ├── financial-reports-enhanced.tsx
│   └── reports/
│       ├── advanced-filters.tsx
│       ├── export-options.tsx
│       ├── comparative-chart.tsx
│       ├── trend-chart.tsx
│       └── report-card.tsx
└── lib/
    ├── types.ts                  # Tipos TypeScript
    └── api.ts                    # Cliente API
```

## 📋 Endpoints da API

### Exportação de Relatórios

```http
GET /api/v1/financial/reports/export
```

**Parâmetros:**
- `format`: csv | xlsx | pdf
- `start_date`: Data de início (YYYY-MM-DD)
- `end_date`: Data de fim (YYYY-MM-DD)
- `transaction_type`: income | expense
- `category_id`: ID da categoria
- `include_charts`: boolean (para PDF)

**Exemplo:**
```bash
curl -X GET "http://localhost:8000/api/v1/financial/reports/export?format=csv&start_date=2024-01-01&end_date=2024-12-31" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Dados Analíticos

```http
GET /api/v1/financial/reports/analytics
```

**Parâmetros:**
- `start_date`: Data de início
- `end_date`: Data de fim
- `granularity`: daily | weekly | monthly | yearly

**Resposta:**
```json
[
  {
    "period": "2024-01",
    "period_start": "2024-01-01",
    "period_end": "2024-01-31",
    "income": 5000.00,
    "expenses": 3000.00,
    "net_amount": 2000.00,
    "transaction_count": 10,
    "average_transaction": 200.00,
    "growth_rate": 5.2
  }
]
```

### Relatório Comparativo

```http
GET /api/v1/financial/reports/comparative
```

**Parâmetros:**
- `period1_start`: Data de início do período 1
- `period1_end`: Data de fim do período 1
- `period2_start`: Data de início do período 2
- `period2_end`: Data de fim do período 2

**Resposta:**
```json
{
  "period1": { /* AnalyticsData */ },
  "period2": { /* AnalyticsData */ },
  "comparison": {
    "income_change": 10.0,
    "expenses_change": -6.7,
    "net_change": 35.0,
    "income_absolute": 500.00,
    "expenses_absolute": -200.00,
    "net_absolute": 700.00
  },
  "insights": [
    "Receitas aumentaram 10% no segundo período",
    "Despesas diminuíram 6.7% no segundo período"
  ]
}
```

### Análise de Tendências

```http
GET /api/v1/financial/reports/trends
```

**Parâmetros:**
- `start_date`: Data de início
- `end_date`: Data de fim
- `trend_type`: net_worth | income | expenses | savings

**Resposta:**
```json
{
  "trend_type": "net_worth",
  "data_points": [ /* AnalyticsData[] */ ],
  "trend_direction": "up",
  "confidence_score": 0.85,
  "forecast": [ /* AnalyticsData[] */ ],
  "insights": [
    "Tendência geral positiva de crescimento",
    "Crescimento médio de 8.3% ao mês"
  ]
}
```

## 🎯 Uso dos Componentes

### Hook Principal

```typescript
import { useFinancialReports } from '@/hooks/use-financial-reports'

function MyComponent() {
  const {
    loading,
    error,
    data,
    loadReportData,
    exportReport,
    getAnalytics,
    getComparativeReport,
    getTrends,
    refresh,
    clearError
  } = useFinancialReports()

  // Carregar dados com filtros
  const handleLoadData = async () => {
    await loadReportData({
      start_date: '2024-01-01',
      end_date: '2024-12-31',
      granularity: 'monthly'
    })
  }

  // Exportar relatório
  const handleExport = async () => {
    await exportReport('csv', {
      start_date: '2024-01-01',
      end_date: '2024-12-31'
    })
  }

  return (
    <div>
      {loading && <div>Carregando...</div>}
      {error && <div>Erro: {error}</div>}
      {data && <div>Dados carregados!</div>}
    </div>
  )
}
```

### Filtros Avançados

```typescript
import { AdvancedFilters } from '@/components/reports/advanced-filters'

function ReportsPage() {
  const [filters, setFilters] = useState<ReportFilters>({
    granularity: 'monthly'
  })

  return (
    <AdvancedFilters
      filters={filters}
      onFiltersChange={setFilters}
      categories={categories}
      loadingCategories={false}
    />
  )
}
```

### Opções de Exportação

```typescript
import { ExportOptions } from '@/components/reports/export-options'

function ExportButton() {
  const handleExport = async (format: ExportFormat) => {
    // Lógica de exportação
  }

  return (
    <ExportOptions 
      onExport={handleExport}
      loading={false}
    />
  )
}
```

### Gráfico Comparativo

```typescript
import { ComparativeChart } from '@/components/reports/comparative-chart'

function ComparisonView() {
  const [comparativeData, setComparativeData] = useState(null)

  return (
    <ComparativeChart 
      data={comparativeData}
      loading={false}
    />
  )
}
```

### Gráfico de Tendências

```typescript
import { TrendChart } from '@/components/reports/trend-chart'

function TrendsView() {
  const [trendData, setTrendData] = useState(null)

  return (
    <TrendChart 
      data={trendData}
      loading={false}
    />
  )
}
```

## 🎨 Personalização

### Temas e Cores

Os componentes seguem o sistema de design do shadcn/ui e podem ser personalizados através de CSS custom properties:

```css
:root {
  --chart-1: 220 70% 50%;
  --chart-2: 160 60% 45%;
  --chart-3: 30 80% 55%;
}
```

### Responsividade

Todos os componentes são responsivos e se adaptam automaticamente:

- **Mobile**: Layout em coluna única
- **Tablet**: Layout em duas colunas
- **Desktop**: Layout em múltiplas colunas

## 🧪 Testes

### Executar Testes

```bash
# Testes unitários
npm test

# Testes específicos de relatórios
npm test -- --testPathPattern=reports

# Testes com coverage
npm test -- --coverage
```

### Estrutura de Testes

```
__tests__/
├── components/
│   └── reports/
│       ├── advanced-filters.test.tsx
│       ├── export-options.test.tsx
│       ├── comparative-chart.test.tsx
│       └── trend-chart.test.tsx
└── hooks/
    └── use-financial-reports.test.ts
```

## 🚀 Performance

### Otimizações Implementadas

1. **Cache Inteligente**: Dados são cacheados por 5 minutos
2. **Debouncing**: Filtros são aplicados com delay de 300ms
3. **Lazy Loading**: Componentes são carregados sob demanda
4. **Memoização**: Cálculos pesados são memoizados
5. **Virtualização**: Listas grandes são virtualizadas

### Métricas de Performance

- **Tempo de carregamento**: < 2 segundos
- **Cache hit rate**: > 80%
- **Tamanho de exportação**: < 10MB
- **Taxa de erro**: < 1%

## 🔧 Troubleshooting

### Problemas Comuns

#### 1. Erro de Exportação

**Problema**: Exportação falha com erro 404
**Solução**: Verificar se o backend está rodando e se o token de autenticação é válido

#### 2. Dados Não Carregam

**Problema**: Relatórios mostram "Nenhum dado disponível"
**Solução**: Verificar se existem transações no período selecionado

#### 3. Filtros Não Funcionam

**Problema**: Filtros não são aplicados
**Solução**: Verificar se o hook `useFinancialReports` está sendo usado corretamente

#### 4. Performance Lenta

**Problema**: Carregamento demorado
**Solução**: Verificar conexão de internet e otimizar filtros

### Logs de Debug

Para ativar logs detalhados, adicione no console do navegador:

```javascript
localStorage.setItem('debug', 'financial-reports')
```

## 📚 Exemplos Práticos

### Exemplo 1: Relatório Mensal Completo

```typescript
const MonthlyReport = () => {
  const { data, loadReportData, exportReport } = useFinancialReports()

  useEffect(() => {
    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)
    
    loadReportData({
      start_date: lastMonth.toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0],
      granularity: 'daily'
    })
  }, [])

  const handleExportMonthly = () => {
    exportReport('pdf', {
      start_date: lastMonth.toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0],
      include_charts: true
    })
  }

  return (
    <div>
      <h2>Relatório Mensal</h2>
      <button onClick={handleExportMonthly}>
        Exportar PDF
      </button>
      {/* Renderizar dados */}
    </div>
  )
}
```

### Exemplo 2: Análise de Tendências

```typescript
const TrendsAnalysis = () => {
  const { getTrends } = useFinancialReports()
  const [trends, setTrends] = useState(null)

  const analyzeTrends = async () => {
    const result = await getTrends({
      start_date: '2024-01-01',
      end_date: '2024-12-31'
    }, 'net_worth')
    
    setTrends(result)
  }

  return (
    <div>
      <button onClick={analyzeTrends}>
        Analisar Tendências
      </button>
      {trends && (
        <TrendChart data={trends} />
      )}
    </div>
  )
}
```

### Exemplo 3: Comparação de Períodos

```typescript
const PeriodComparison = () => {
  const { getComparativeReport } = useFinancialReports()
  const [comparison, setComparison] = useState(null)

  const comparePeriods = async () => {
    const period1 = {
      start: new Date('2024-01-01'),
      end: new Date('2024-03-31')
    }
    const period2 = {
      start: new Date('2024-04-01'),
      end: new Date('2024-06-30')
    }

    const result = await getComparativeReport(period1, period2)
    setComparison(result)
  }

  return (
    <div>
      <button onClick={comparePeriods}>
        Comparar Períodos
      </button>
      {comparison && (
        <ComparativeChart data={comparison} />
      )}
    </div>
  )
}
```

## 🔄 Roadmap Futuro

### Próximas Funcionalidades

- [ ] **Relatórios Agendados**: Envio automático por email
- [ ] **Dashboards Personalizáveis**: Layout customizável pelo usuário
- [ ] **Alertas Inteligentes**: Notificações baseadas em padrões
- [ ] **Integração com APIs**: Conectar com bancos e fintechs
- [ ] **IA para Insights**: Análise automática com IA
- [ ] **Relatórios Colaborativos**: Compartilhamento entre usuários

### Melhorias Técnicas

- [ ] **PWA**: Aplicativo web progressivo
- [ ] **Offline Support**: Funcionamento offline
- [ ] **Real-time Updates**: Atualizações em tempo real
- [ ] **Advanced Caching**: Cache mais sofisticado
- [ ] **Micro-frontends**: Arquitetura modular

## 📞 Suporte

Para dúvidas ou problemas:

1. **Documentação**: Consulte esta documentação
2. **Issues**: Abra uma issue no repositório
3. **Discord**: Entre no servidor da comunidade
4. **Email**: contato@meufuturo.com.br

---

**Versão**: 1.0.0  
**Última atualização**: Janeiro 2025  
**Autor**: Equipe MeuFuturo

