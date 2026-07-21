import { Check } from 'lucide-react'

export function DialogSuccessState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-4 animate-success-check">
      <div className="rounded-full bg-green-500/10 p-3">
        <Check className="h-8 w-8 text-green-500" />
      </div>
      <p className="text-lg font-medium">{message}</p>
    </div>
  )
}
