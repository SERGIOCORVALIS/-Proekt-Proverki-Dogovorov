'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { FileText, Shield, Zap, Users, Scale, Gavel, BookOpen, CheckCircle } from 'lucide-react'
import { Logo, LogoWithText } from '@/components/ui/Logo'

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600"></div>
            <Scale className="h-6 w-6 text-primary-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="text-primary-600 font-medium">Загрузка системы...</p>
        </div>
      </div>
    )
  }

  useEffect(() => {
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600 mx-auto mb-4"></div>
          <p className="text-primary-600 font-medium">Перенаправление в личный кабинет...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-primary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
              <LogoWithText size="md" textClassName="text-2xl" />
            </div>
            <div className="flex space-x-4">
              <Button
                variant="secondary"
                onClick={() => router.push('/login')}
                className="hover:scale-105 transition-transform duration-200"
              >
                Войти
              </Button>
              <Button
                variant="primary"
                onClick={() => router.push('/register')}
                className="hover:scale-105 transition-transform duration-200 shadow-lg hover:shadow-xl"
              >
                Регистрация
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className={`transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="mb-8">
              <Logo size="lg" animated={true} className="mx-auto" />
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl mb-6">
              <span className={`inline-block transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
                Анализ юридических документов
              </span>
              <br />
              <span className={`inline-block transition-all duration-700 delay-400 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-800">
                  с ИИ
                </span>
              </span>
            </h1>
            
            <p className={`mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl transition-all duration-700 delay-600 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              Автоматически выявляйте риски и нестандартные формулировки в договорах. 
              Экономьте время и снижайте юридические риски.
            </p>
            
            <div className={`mt-8 max-w-md mx-auto sm:flex sm:justify-center transition-all duration-700 delay-800 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <Button
                size="lg"
                variant="primary"
                onClick={() => router.push('/register')}
                className="relative overflow-hidden group shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                <span className="relative z-10">Начать анализ</span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary-700 to-primary-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              </Button>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <Card className={`p-6 text-center hover:shadow-xl transition-all duration-500 cursor-pointer group hover:-translate-y-2 border-primary-100 hover:border-primary-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{transitionDelay: '200ms'}}>
              <div className="relative">
                <div className="absolute inset-0 bg-primary-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <FileText className="h-12 w-12 text-primary-600 mx-auto mb-4 relative z-10 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2 group-hover:text-primary-600 transition-colors duration-300">
                Загрузка документов
              </h3>
              <p className="text-gray-500 mb-2">
                Поддержка форматов DOCX, PDF, DOC, RTF, TXT
              </p>
              <p className="text-sm text-gray-400">
                Просто перетащите файл или выберите его через интерфейс. Максимальный размер файла - 400MB. Поддерживаются договоры, соглашения и другие юридические документы в различных форматах.
              </p>
            </Card>

            <Card className={`p-6 text-center hover:shadow-xl transition-all duration-500 cursor-pointer group hover:-translate-y-2 border-primary-100 hover:border-primary-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{transitionDelay: '400ms'}}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Zap className="h-12 w-12 text-primary-600 mx-auto mb-4 relative z-10 group-hover:scale-110 transition-transform duration-300 animate-pulse" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2 group-hover:text-primary-600 transition-colors duration-300">
                Быстрый анализ
              </h3>
              <p className="text-gray-500 mb-2">
                ИИ анализ за несколько секунд
              </p>
              <p className="text-sm text-gray-400">
                Наша система использует передовые алгоритмы машинного обучения для быстрого извлечения текста и анализа документов. Результаты готовы в течение 30-60 секунд.
              </p>
            </Card>

            <Card className={`p-6 text-center hover:shadow-xl transition-all duration-500 cursor-pointer group hover:-translate-y-2 border-primary-100 hover:border-primary-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{transitionDelay: '600ms'}}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-red-100 to-pink-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Shield className="h-12 w-12 text-primary-600 mx-auto mb-4 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                <CheckCircle className="h-4 w-4 text-green-500 absolute top-0 right-0 animate-pulse" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2 group-hover:text-primary-600 transition-colors duration-300">
                Выявление рисков
              </h3>
              <p className="text-gray-500 mb-2">
                Автоматическое определение уровней риска
              </p>
              <p className="text-sm text-gray-400">
                Система анализирует документы на предмет потенциальных рисков: высокие (критические формулировки), средние (потенциальные проблемы) и низкие (рекомендации по улучшению).
              </p>
            </Card>

            <Card className={`p-6 text-center hover:shadow-xl transition-all duration-500 cursor-pointer group hover:-translate-y-2 border-primary-100 hover:border-primary-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{transitionDelay: '800ms'}}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Users className="h-12 w-12 text-primary-600 mx-auto mb-4 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                <Gavel className="h-4 w-4 text-primary-400 absolute -bottom-1 -right-1 group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2 group-hover:text-primary-600 transition-colors duration-300">
                Для юристов
              </h3>
              <p className="text-gray-500 mb-2">
                Специализированные правила анализа
              </p>
              <p className="text-sm text-gray-400">
                Разработанная база правил включает проверку на односторонние отказы, несоразмерные штрафы, неограниченную ответственность и другие типичные риски в договорах.
              </p>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
