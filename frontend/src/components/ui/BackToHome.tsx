// src/components/BackToHome.tsx
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

export default function BackToHome() {
  const navigate = useNavigate()

  return (
    <div className="mb-4">
      <Button
        variant="default"
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
        onClick={() => navigate('/')}
      >
        Voltar ao Dashboard
      </Button>
    </div>
  )
}