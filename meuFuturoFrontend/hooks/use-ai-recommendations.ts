/**
 * Hook for personalized AI recommendations
 * Fetches and manages AI-generated recommendations
 */

import { useState, useEffect, useCallback } from 'react'
import { apiService } from '@/lib/api'
import { PersonalizedRecommendation } from './use-advanced-ai-dashboard'

interface UseAIRecommendationsReturn {
  recommendations: PersonalizedRecommendation[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  submitFeedback: (recommendationId: string, rating: number, wasHelpful: boolean, wasImplemented?: boolean, comments?: string) => Promise<void>
}

export const useAIRecommendations = (maxCount: number = 5): UseAIRecommendationsReturn => {
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRecommendations = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiService.get<PersonalizedRecommendation[]>(
        `/ai-predictions/recommendations/personalized?max_count=${maxCount}`
      )

      if (response.error) {
        setError(response.error)
        return
      }

      setRecommendations(response.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar recomendações')
      console.error('Error fetching recommendations:', err)
    } finally {
      setLoading(false)
    }
  }, [maxCount])

  const submitFeedback = useCallback(async (
    recommendationId: string,
    rating: number,
    wasHelpful: boolean,
    wasImplemented?: boolean,
    comments?: string
  ) => {
    try {
      const feedback = {
        feedback_type: 'recommendation',
        item_id: recommendationId,
        rating,
        was_helpful: wasHelpful,
        was_implemented: wasImplemented,
        comments,
      }

      const response = await apiService.post('/ai-predictions/feedback', feedback)

      if (response.error) {
        console.error('Error submitting feedback:', response.error)
      }
    } catch (err) {
      console.error('Error submitting feedback:', err)
    }
  }, [])

  useEffect(() => {
    fetchRecommendations()
  }, [fetchRecommendations])

  return {
    recommendations,
    loading,
    error,
    refresh: fetchRecommendations,
    submitFeedback,
  }
}

