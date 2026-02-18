import { useEffect } from 'react'
import { useToast } from '@/context/ToastContext'
import { setToastHelper } from '@/context/AppContext'

// This component bridges ToastContext to AppContext
export function ToastBridge() {
  const { addToast } = useToast()
  
  useEffect(() => {
    setToastHelper(addToast)
    return () => setToastHelper(null)
  }, [addToast])
  
  return null
}
