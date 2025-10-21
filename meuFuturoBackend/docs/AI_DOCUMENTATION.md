# Documentação Técnica da IA Financeira - MeuFuturo

## Visão Geral

O sistema MeuFuturo implementa uma Inteligência Artificial financeira baseada em análise estatística e regressão linear para fornecer insights, previsões e recomendações personalizadas para gestão financeira pessoal.

## Arquitetura da IA

### Tecnologias Utilizadas

1. **Scikit-learn (sklearn)**
   - `LinearRegression` para projeções e previsões de tendências
   - Análise estatística avançada

2. **NumPy**
   - Processamento numérico eficiente
   - Cálculos matemáticos complexos

3. **Análise Estatística Baseada em Regras**
   - Cálculo de médias móveis
   - Análise de padrões temporais
   - Score de saúde financeira multi-fatorial

## Funcionalidades Implementadas

### 1. Previsão de Poupança (`_generate_savings_projection`)

**Algoritmo:**
- Analisa últimos 90 dias de transações
- Calcula média mensal de economias: `monthly_net = summary["net_amount"] / 3`
- Projeta economia futura: `projected_savings = monthly_net * (time_horizon / 30)`
- Score de confiança baseado na consistência: `confidence = min(0.9, max(0.3, transaction_count / 50))`

**Entrada:** ID do usuário, horizonte temporal (dias)
**Saída:** Projeção de poupança com score de confiança (0.3-0.9)

### 2. Previsão de Gastos (`_generate_expense_forecast`)

**Algoritmo:**
- Calcula média de gastos mensais dos últimos 3 meses
- Aplica fator sazonal:
  - Novembro/Dezembro: 1.15x (época de festas)
  - Outros meses: 1.0x
- Projeta gastos: `projected_expenses = monthly_expenses * (time_horizon / 30) * seasonal_factor`
- Confiança baseada no volume de dados: `confidence = min(0.85, max(0.4, expense_count / 30))`

**Entrada:** ID do usuário, horizonte temporal
**Saída:** Previsão de gastos com ajuste sazonal

### 3. Previsão de Receita (`_generate_income_prediction`)

**Algoritmo:**
- Média de receitas dos últimos 3 meses
- Alta confiança para receitas regulares: `confidence = min(0.95, max(0.6, income_count / 10))`
- Projeção linear: `projected_income = monthly_income * (time_horizon / 30)`

**Entrada:** ID do usuário, horizonte temporal
**Saída:** Previsão de receita com alta confiança

### 4. Score de Saúde Financeira (`_calculate_health_score`)

**Sistema de Pontuação (0-100 pontos):**

#### Razão Receita/Despesas (0-30 pontos)
- < 50%: +30 pontos (excelente)
- 50-70%: +20 pontos (bom)
- 70-90%: +10 pontos (regular)
- > 120%: -20 pontos (crítico)
- Sem receita: -30 pontos

#### Taxa de Poupança (0-25 pontos)
- > 20%: +25 pontos (excelente)
- 10-20%: +15 pontos (bom)
- 0-10%: +5 pontos (regular)
- Negativa: -15 pontos (crítico)

#### Consistência de Transações (0-15 pontos)
- Baseado no número de transações vs. esperado (30 em 6 meses)
- `consistency = min(1.0, transaction_count / expected_transactions)`
- Pontuação: `consistency * 15`

#### Diversidade de Gastos (0-10 pontos)
- Análise de distribuição por categorias
- Penalização por concentração excessiva
- Pontuação: 5-10 pontos (placeholder atual)

**Classificação Final:**
- **80-100 pontos:** Excelente (Risco Muito Baixo)
- **60-79 pontos:** Boa (Risco Baixo)
- **40-59 pontos:** Regular (Risco Médio)
- **0-39 pontos:** Precisa Atenção (Risco Alto)

### 5. Análise de Padrões de Gastos (`_analyze_spending_patterns`)

**Algoritmo:**
1. Agrupa gastos por categoria nos últimos 90 dias
2. Calcula percentual de cada categoria
3. Identifica tendências:
   - `increasing`: > 40% do total
   - `stable`: 5-40% do total
   - `decreasing`: < 5% do total
4. Gera recomendações automáticas baseadas nos percentuais

**Saída:** Lista de padrões com tendências e recomendações

### 6. Recomendações Personalizadas (`_generate_recommendations`)

**Algoritmo de Geração:**
1. Analisa padrões de gastos
2. Identifica categorias com gastos > 35%
3. Calcula economia potencial: `potential_savings = average_monthly * 0.15`
4. Prioriza por impacto e facilidade de implementação
5. Limita a 5 recomendações por usuário

**Tipos de Recomendação:**
- **Economia:** Redução de gastos em categorias específicas
- **Planejamento:** Controle geral de gastos
- **Investimento:** Aumento de reserva de emergência

## Métricas de Performance

### Score de Confiança
- **Alto (0.8-0.95):** Receitas regulares, dados consistentes
- **Médio (0.4-0.8):** Gastos variáveis, dados suficientes
- **Baixo (0.3-0.4):** Poucos dados históricos

### Validação de Dados
- Mínimo 5 transações para projeção de poupança
- Mínimo 3 gastos para previsão de despesas
- Mínimo 2 receitas para previsão de renda

## Limitações Atuais

1. **Dados Limitados:** Requer histórico mínimo de 3 meses
2. **Sazonalidade Simples:** Apenas ajuste para Nov/Dez
3. **Diversidade de Gastos:** Implementação placeholder
4. **Fatores Externos:** Não considera inflação, mudanças de renda

## Melhorias Futuras

1. **Machine Learning Avançado:**
   - Algoritmos de séries temporais (ARIMA, Prophet)
   - Redes neurais para padrões complexos
   - Clustering para segmentação de usuários

2. **Análise Preditiva:**
   - Detecção de anomalias em gastos
   - Previsão de inadimplência
   - Otimização de investimentos

3. **Personalização:**
   - Aprendizado contínuo por usuário
   - Adaptação a mudanças de comportamento
   - Recomendações contextuais

## Arquivos de Implementação

- **Serviço Principal:** `meuFuturoBackend/services/ai_service.py`
- **Modelos:** `meuFuturoBackend/models/ai_prediction.py`
- **Schemas:** `meuFuturoBackend/schemas/ai_prediction.py`
- **Repository:** `meuFuturoBackend/repositories/ai_prediction.py`
- **API:** `meuFuturoBackend/api/ai_predictions.py`

## Exemplo de Uso

```python
# Gerar previsões para um usuário
predictions = await ai_service.generate_predictions(
    user_id="user123",
    request=PredictionRequest(
        prediction_types=[
            PredictionType.SAVINGS_PROJECTION,
            PredictionType.EXPENSE_FORECAST,
            PredictionType.FINANCIAL_HEALTH
        ],
        time_horizon=30  # 30 dias
    )
)

# Obter insights financeiros
insights = await ai_service.get_financial_insights("user123")
```

## Conclusão

A IA do MeuFuturo combina análise estatística tradicional com algoritmos de machine learning para fornecer insights financeiros personalizados e acionáveis. O sistema é projetado para evoluir com mais dados e técnicas avançadas, mantendo sempre a transparência e explicabilidade das recomendações.
