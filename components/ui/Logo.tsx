import React from 'react'
import { Scale, Gavel, BookOpen } from 'lucide-react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
  className?: string
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  animated = true, 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  const iconSizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-6 w-6'
  }

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Анимированный фон */}
      {animated && (
        <div className="absolute inset-0 bg-primary-600 rounded-full animate-pulse opacity-20"></div>
      )}
      
      {/* Основной контейнер */}
      <div className={`relative ${sizeClasses[size]} bg-gradient-to-br from-primary-600 to-primary-800 rounded-full flex items-center justify-center shadow-lg`}>
        {/* Весы правосудия */}
        <Scale 
          className={`${sizeClasses[size]} text-white relative z-10 ${animated ? 'animate-bounce' : ''}`} 
          style={{ animationDuration: '2s' }}
        />
        
        {/* Молоток судьи */}
        <Gavel 
          className={`${iconSizeClasses[size]} text-primary-200 absolute -bottom-1 -right-1 ${animated ? 'animate-pulse' : ''}`} 
          style={{ animationDuration: '1.5s' }}
        />
        
        {/* Книга законов */}
        <BookOpen 
          className={`${iconSizeClasses[size]} text-primary-300 absolute -top-1 -left-1 ${animated ? 'animate-pulse' : ''}`} 
          style={{ animationDuration: '1.8s' }}
        />
        
        {/* Блестящий эффект */}
        {animated && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 rounded-full animate-pulse"></div>
        )}
      </div>
      
      {/* Дополнительные световые эффекты */}
      {animated && (
        <>
          <div className="absolute -inset-1 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full blur-sm opacity-30 animate-pulse"></div>
          <div className="absolute -inset-2 bg-gradient-to-r from-primary-300 to-primary-500 rounded-full blur-md opacity-20 animate-pulse"></div>
        </>
      )}
    </div>
  )
}

interface LogoWithTextProps extends LogoProps {
  showText?: boolean
  textClassName?: string
}

export const LogoWithText: React.FC<LogoWithTextProps> = ({ 
  showText = true, 
  textClassName = '',
  ...logoProps 
}) => {
  return (
    <div className="flex items-center space-x-3 group cursor-pointer">
      <Logo {...logoProps} />
      {showText && (
        <div className="group-hover:text-primary-600 transition-colors duration-300">
          <h1 className={`font-bold text-gray-900 ${textClassName}`}>
            LegalDoc Analyzer
          </h1>
          <p className="text-xs text-gray-500 -mt-1">
            Система анализа документов
          </p>
        </div>
      )}
    </div>
  )
}
