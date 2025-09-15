"""
AI utility functions and helpers.

Common functions for AI predictions and analysis.
"""

import random
from typing import List, Dict, Any
from datetime import date, timedelta
from decimal import Decimal


def calculate_financial_health_score(
    income: Decimal,
    expenses: Decimal,
    savings_rate: float,
    transaction_count: int,
    time_period_days: int = 180
) -> Dict[str, Any]:
    """
    Calculate a comprehensive financial health score.
    
    Args:
        income: Total income for the period
        expenses: Total expenses for the period
        savings_rate: Savings rate (0.0 to 1.0)
        transaction_count: Number of transactions
        time_period_days: Period in days for analysis
        
    Returns:
        Dictionary with score and analysis details
    """
    score = 50  # Base score
    
    # Income vs Expenses ratio (0-30 points)
    if income > 0:
        expense_ratio = float(expenses / income)
        if expense_ratio < 0.5:
            score += 30
        elif expense_ratio < 0.7:
            score += 20
        elif expense_ratio < 0.9:
            score += 10
        elif expense_ratio > 1.2:
            score -= 20
    
    # Savings rate (0-25 points)
    if savings_rate > 0.2:
        score += 25
    elif savings_rate > 0.1:
        score += 15
    elif savings_rate > 0:
        score += 5
    else:
        score -= 15
    
    # Transaction consistency (0-15 points)
    expected_transactions = (time_period_days / 30) * 10  # Rough estimate
    consistency = min(1.0, transaction_count / expected_transactions)
    score += int(consistency * 15)
    
    # Random factor for demonstration (0-10 points)
    score += random.randint(0, 10)
    
    # Cap score between 0 and 100
    score = max(0, min(100, score))
    
    # Determine risk level and label
    if score >= 80:
        label = "Excelente"
        risk_level = "Muito Baixo"
    elif score >= 60:
        label = "Boa"
        risk_level = "Baixo"
    elif score >= 40:
        label = "Regular"
        risk_level = "Médio"
    else:
        label = "Precisa Atenção"
        risk_level = "Alto"
    
    return {
        "score": score,
        "label": label,
        "risk_level": risk_level,
        "expense_ratio": expense_ratio if income > 0 else 0,
        "savings_rate": savings_rate,
        "consistency_score": consistency,
    }


def generate_spending_recommendations(
    category_percentages: Dict[str, float],
    total_spending: Decimal
) -> List[Dict[str, Any]]:
    """
    Generate spending optimization recommendations.
    
    Args:
        category_percentages: Dictionary of category: percentage pairs
        total_spending: Total spending amount
        
    Returns:
        List of recommendation dictionaries
    """
    recommendations = []
    
    # High spending categories
    for category, percentage in category_percentages.items():
        if percentage > 35 and category.lower() not in ['housing', 'moradia', 'rent']:
            potential_savings = total_spending * Decimal(str(percentage / 100)) * Decimal("0.15")
            
            recommendations.append({
                "title": f"Otimize Gastos com {category}",
                "description": f"Seus gastos com {category} representam {percentage:.1f}% do total. "
                             f"Considere reduzir em 10-15% para economizar cerca de R$ {potential_savings:.2f}.",
                "priority": "high" if percentage > 45 else "medium",
                "category": "Economia",
                "potential_savings": float(potential_savings),
                "implementation_difficulty": "medium",
                "estimated_time": "2-4 semanas",
            })
    
    # Balanced spending recommendation
    if len([p for p in category_percentages.values() if p > 30]) < 2:
        recommendations.append({
            "title": "Gastos Bem Distribuídos",
            "description": "Seus gastos estão bem equilibrados entre categorias. "
                         "Continue monitorando para manter este padrão saudável.",
            "priority": "low",
            "category": "Manutenção",
            "potential_savings": None,
            "implementation_difficulty": "easy",
            "estimated_time": "Contínuo",
        })
    
    return recommendations


def project_savings(
    monthly_income: Decimal,
    monthly_expenses: Decimal,
    months: int,
    scenario: str = "moderate"
) -> Dict[str, Decimal]:
    """
    Project savings for different scenarios.
    
    Args:
        monthly_income: Average monthly income
        monthly_expenses: Average monthly expenses
        months: Number of months to project
        scenario: Scenario type (conservative, moderate, optimistic)
        
    Returns:
        Dictionary with projected savings
    """
    monthly_net = monthly_income - monthly_expenses
    
    # Scenario multipliers
    multipliers = {
        "conservative": Decimal("0.8"),
        "moderate": Decimal("1.0"),
        "optimistic": Decimal("1.2"),
    }
    
    multiplier = multipliers.get(scenario, Decimal("1.0"))
    projected_savings = monthly_net * months * multiplier
    
    return {
        "monthly_net": monthly_net,
        "projected_savings": projected_savings,
        "scenario_multiplier": multiplier,
        "months": months,
    }


def analyze_spending_trends(
    historical_data: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Analyze spending trends from historical data.
    
    Args:
        historical_data: List of historical spending data
        
    Returns:
        Trend analysis dictionary
    """
    if len(historical_data) < 2:
        return {
            "trend": "insufficient_data",
            "change_percentage": 0.0,
            "trend_direction": "stable",
        }
    
    # Simple trend analysis (last vs previous)
    current = historical_data[-1]["amount"]
    previous = historical_data[-2]["amount"]
    
    change_percentage = ((current - previous) / previous) * 100 if previous > 0 else 0
    
    if change_percentage > 10:
        trend_direction = "increasing"
    elif change_percentage < -10:
        trend_direction = "decreasing"
    else:
        trend_direction = "stable"
    
    return {
        "trend": "analyzed",
        "change_percentage": change_percentage,
        "trend_direction": trend_direction,
        "current_amount": current,
        "previous_amount": previous,
    }


def generate_goal_timeline(
    current_amount: Decimal,
    target_amount: Decimal,
    monthly_contribution: Decimal
) -> Dict[str, Any]:
    """
    Generate a timeline to reach a financial goal.
    
    Args:
        current_amount: Current saved amount
        target_amount: Target goal amount
        monthly_contribution: Monthly contribution
        
    Returns:
        Goal timeline analysis
    """
    remaining_amount = target_amount - current_amount
    
    if monthly_contribution <= 0:
        return {
            "months_to_goal": None,
            "completion_date": None,
            "feasible": False,
            "message": "Contribuição mensal deve ser positiva",
        }
    
    months_to_goal = float(remaining_amount / monthly_contribution)
    completion_date = date.today() + timedelta(days=int(months_to_goal * 30))
    
    # Calculate probability of success (simplified)
    if months_to_goal <= 12:
        probability = 90
    elif months_to_goal <= 24:
        probability = 75
    elif months_to_goal <= 36:
        probability = 60
    else:
        probability = 40
    
    return {
        "months_to_goal": months_to_goal,
        "completion_date": completion_date,
        "feasible": True,
        "probability_of_success": probability,
        "remaining_amount": remaining_amount,
        "message": f"Meta alcançável em {months_to_goal:.1f} meses",
    }


def calculate_emergency_fund_target(monthly_expenses: Decimal) -> Decimal:
    """
    Calculate recommended emergency fund target.
    
    Args:
        monthly_expenses: Average monthly expenses
        
    Returns:
        Recommended emergency fund amount (3-6 months of expenses)
    """
    # Standard recommendation: 3-6 months of expenses
    return monthly_expenses * 6


def generate_budget_recommendations(
    income: Decimal,
    current_spending: Dict[str, Decimal]
) -> Dict[str, Decimal]:
    """
    Generate budget recommendations based on the 50/30/20 rule.
    
    Args:
        income: Monthly income
        current_spending: Current spending by category
        
    Returns:
        Recommended budget allocation
    """
    # 50/30/20 rule: 50% needs, 30% wants, 20% savings
    needs_budget = income * Decimal("0.5")
    wants_budget = income * Decimal("0.3")
    savings_budget = income * Decimal("0.2")
    
    return {
        "needs": needs_budget,
        "wants": wants_budget,
        "savings": savings_budget,
        "total": income,
    }
