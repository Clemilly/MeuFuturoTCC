# 🚀 GUIA RÁPIDO - IA FINANCEIRA

## ⚡ Início Rápido

### 1. Iniciar o Sistema

**Backend:**

```bash
cd meuFuturoBackend
python -m uvicorn main:app --reload
```

**Frontend:**

```bash
cd meuFuturoFrontend
npm run dev
```

**Acessar:**

- Frontend: http://localhost:3000
- IA Financeira: http://localhost:3000/ai-insights

---

## 📍 Navegação

### Dashboard Principal

1. Faça login no sistema
2. Clique em "Inteligência Financeira" no menu
3. Você verá 5 abas:
   - 🎯 **Dashboard** - Visão geral
   - 📊 **Padrões** - Análise comportamental
   - 💡 **Recomendações** - Sugestões de IA
   - 🎮 **Simulador** - Teste cenários
   - 📈 **Relatórios** - Análise mensal

---

## 🎯 Funcionalidades por Aba

### ABA 1: Dashboard

**O que você vê:**

- Score de saúde financeira (0-100)
- Nível de risco
- Tendência mensal
- Taxa de poupança
- Métricas avançadas
- Gráficos de gastos
- Anomalias detectadas
- Recomendações rápidas

**Como usar:**

- Visualize seu score no topo
- Explore as métricas avançadas
- Veja anomalias em gastos
- Clique nas recomendações para detalhes

---

### ABA 2: Padrões

**O que você vê:**

- Score de compras impulsivas
- Gastos por dia da semana
- Padrões sazonais
- Anomalias detalhadas
- Insights comportamentais
- Correlações entre categorias

**Como usar:**

- Identifique seus dias de maior gasto
- Prepare-se para picos sazonais
- Revise anomalias e confirme se foram planejadas
- Leia os insights sobre seu comportamento

---

### ABA 3: Recomendações

**O que você vê:**

- Cards de recomendações personalizadas
- Prioridade (urgent, high, medium, low)
- Impacto potencial em R$
- Confiança da IA (%)
- Dificuldade de implementação

**Como usar:**

1. Leia as recomendações
2. Clique em "Ver Detalhes" para passos
3. Implemente as sugestões
4. Marque como "Concluir" quando feito
5. Dê feedback para melhorar a IA

**Dica:** Comece pelas recomendações "easy" + "high impact"

---

### ABA 4: Simulador

**O que você vê:**

- Controles de simulação (sliders)
- Presets de cenários comuns
- Gráficos de projeção
- Comparação de cenários
- Metas alcançáveis

**Como usar:**

1. Escolha um preset OU ajuste manualmente:
   - Renda: -50% a +100%
   - Despesas: -50% a +50%
   - Poupança: 0% a +50%
   - Tempo: 3 a 120 meses
2. Clique em "Executar Simulação"
3. Analise os resultados
4. Veja quais metas você alcançaria
5. Compare com seu cenário atual

**Cenários Prontos:**

- "E se eu economizasse 10% mais?"
- "E se eu conseguisse um aumento de 20%?"
- "E se eu reduzisse gastos em 15%?"

---

### ABA 5: Relatórios

**O que você vê:**

- Resumo executivo do mês
- Métricas financeiras
- Conquistas (🏆)
- Áreas para melhoria
- Key insights
- Predição para próximo mês
- Progresso de metas

**Como usar:**

1. Selecione o mês no dropdown
2. Leia o resumo executivo
3. Comemore suas conquistas
4. Trabalhe nas áreas de melhoria
5. Prepare-se para o próximo mês baseado nas predições
6. (Futuro) Clique em download para PDF

---

## 💡 Dicas de Uso

### Para Máximo Aproveitamento

1. **Registre transações regularmente**

   - Quanto mais dados, melhores as análises
   - Registre diariamente para padrões precisos

2. **Defina metas financeiras**

   - As recomendações ficam mais precisas
   - O simulador mostra metas alcançáveis

3. **Use o simulador antes de decisões**

   - Mudança de emprego? Simule!
   - Quer economizar mais? Veja o impacto!
   - Planeje grandes compras

4. **Implemente recomendações**

   - Comece pelas fáceis
   - Marque como concluídas
   - Dê feedback para melhorar

5. **Revise relatórios mensalmente**
   - Compare seu progresso
   - Ajuste estratégias
   - Comemore conquistas

---

## 🎨 Entendendo as Cores

### Health Score

- 🟢 80-100: Excelente
- 🔵 60-79: Boa
- 🟡 40-59: Regular
- 🟠 20-39: Fraca
- 🔴 0-19: Crítica

### Nível de Risco

- 🟢 Muito Baixo
- 🔵 Baixo
- 🟡 Médio
- 🟠 Alto
- 🔴 Muito Alto

### Prioridade de Recomendações

- 🔴 Urgent: Atenção imediata
- 🟠 High: Alta prioridade
- 🟡 Medium: Prioridade média
- 🟢 Low: Quando possível

---

## 🔢 Métricas Explicadas

### Score de Saúde Financeira (0-100)

Avalia sua situação financeira geral baseado em:

- Receita vs Despesas
- Taxa de poupança
- Consistência
- Diversificação

### Taxa de Poupança

```
(Receita - Despesas) / Receita × 100
```

**Ideal:** 20% ou mais

### Score de Liquidez (0-100)

Capacidade de cobrir despesas inesperadas

### Score de Diversificação (0-100)

Quão distribuídos estão seus gastos entre categorias

### Índice de Estabilidade (0-1)

Consistência de seu saldo mensal

### Score de Compras Impulsivas (0-100)

Tendência a fazer compras não planejadas

- **< 30:** Baixa (bom!)
- **30-60:** Moderada
- **> 60:** Alta (atenção!)

---

## 🎯 Casos de Uso Comuns

### 1. "Quero economizar mais"

**Caminho:**

1. Vá em **Recomendações**
2. Filtre por categoria "Economia"
3. Implemente as sugestões
4. Use o **Simulador** para ver impacto
5. Acompanhe no **Dashboard**

### 2. "Não sei onde estou gastando muito"

**Caminho:**

1. Vá em **Dashboard** > aba "Patterns"
2. Veja gráfico de gastos por categoria
3. Vá em **Padrões** para detalhes
4. Identifique anomalias
5. Leia insights comportamentais

### 3. "Vou mudar de emprego"

**Caminho:**

1. Vá em **Simulador**
2. Ajuste "Renda" com a diferença
3. Execute simulação
4. Veja se alcança suas metas
5. Tome decisão informada

### 4. "Quero entender meu mês"

**Caminho:**

1. Vá em **Relatórios**
2. Selecione o mês
3. Leia resumo executivo
4. Veja conquistas e melhorias
5. Prepare-se para próximo mês

### 5. "Tenho gastos estranhos"

**Caminho:**

1. Vá em **Padrões** > aba "Anomalias"
2. Revise transações detectadas
3. Confirme se foram planejadas
4. Leia sugestões da IA
5. Ajuste comportamento se necessário

---

## 🚨 Troubleshooting

### "Não vejo dados no Dashboard"

**Solução:** Registre mais transações. A IA precisa de pelo menos 10-15 transações para análises básicas.

### "Recomendações não aparecem"

**Solução:**

1. Verifique se tem transações registradas
2. Defina metas financeiras
3. Aguarde alguns dias de uso

### "Simulação não funciona"

**Solução:**

1. Certifique-se de ter histórico de transações
2. Verifique se os valores estão nos limites
3. Tente um preset primeiro

### "Relatório mensal está vazio"

**Solução:**

1. Selecione um mês com transações
2. Certifique-se de ter pelo menos 5 transações no mês
3. Aguarde alguns segundos para processar

---

## 📱 Responsividade

### Desktop (1920x1080+)

- 4 colunas de cards
- Gráficos grandes
- Todas as funcionalidades visíveis

### Tablet (768x1024)

- 2 colunas de cards
- Gráficos médios
- Tabs horizontais

### Mobile (375x667)

- 1 coluna
- Gráficos compactos
- Tabs com scroll horizontal

---

## 🎓 Aprenda Mais

### Recursos Adicionais

- **API Docs:** http://localhost:8000/docs
- **Implementação:** `IMPLEMENTACAO_IA_FINANCEIRA_COMPLETA.md`
- **Prompt Original:** `PROMPT_IA_FINANCEIRA_COMPLETO.md`

### Conceitos de IA Usados

- Regressão Linear
- Análise de Séries Temporais
- Detecção de Anomalias
- Análise de Padrões
- Sistema de Recomendação

---

## ✨ Próximas Features

Planejadas para futuras versões:

- 📄 Export de relatórios em PDF
- 🔔 Notificações push de alertas
- 🌐 Compartilhamento de relatórios
- 📊 Comparação com benchmarks de mercado
- 🤖 Chatbot de IA financeira
- 📈 Previsões de investimentos

---

## 💬 Feedback

Ajude a melhorar a IA:

- Marque recomendações como úteis ou não
- Indique se implementou sugestões
- Deixe comentários sobre insights
- Reporte bugs ou sugestões

---

**Versão:** 1.0.0  
**Atualizado:** 02/10/2025  
**Status:** ✅ Totalmente Funcional

---

## 🎉 Comece Agora!

1. Inicie o sistema
2. Faça login
3. Vá para "Inteligência Financeira"
4. Explore as 5 abas
5. Tome decisões financeiras mais inteligentes!

**Dúvidas?** Consulte `IMPLEMENTACAO_IA_FINANCEIRA_COMPLETA.md` para detalhes técnicos.




