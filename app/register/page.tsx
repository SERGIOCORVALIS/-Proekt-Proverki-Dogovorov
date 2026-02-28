'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Logo } from '@/components/ui/Logo'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { register } = useAuth()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Имя обязательно'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email обязателен'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Некорректный email'
    }

    if (!formData.password) {
      newErrors.password = 'Пароль обязателен'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Пароль должен содержать минимум 6 символов'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      await register(formData.email, formData.password, formData.fullName)
    } catch (error) {
      // Error is handled in the hook
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Logo size="lg" animated={true} />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Регистрация
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Или{' '}
            <Link
              href="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              войдите в существующий аккаунт
            </Link>
          </p>
        </div>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900">
              Создайте новый аккаунт
            </h3>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <Input
                label="Полное имя"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                error={errors.fullName}
                required
                placeholder="Иван Иванов"
              />

              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                required
                placeholder="your@email.com"
              />

              <Input
                label="Пароль"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                required
                placeholder="••••••••"
                helperText="Минимум 6 символов"
              />

              <Input
                label="Подтвердите пароль"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                required
                placeholder="••••••••"
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full"
              >
                Зарегистрироваться
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
