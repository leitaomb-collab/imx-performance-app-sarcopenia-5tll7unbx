export function calculateAge(birthDate: string): number {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--
  return age
}

export function calculateIMC(weight: number, height: number): number {
  if (!weight || !height) return 0
  return Math.round((weight / (height * height)) * 10) / 10
}

export function getIMCCategory(imc: number): string {
  if (imc < 17) return 'Baixo peso severo'
  if (imc < 18.5) return 'Baixo peso'
  if (imc <= 24.9) return 'Normal'
  if (imc <= 29.9) return 'Sobrepeso'
  return 'Obesidade'
}

export function getIMCColorClass(imc: number): string {
  if (imc >= 18.5 && imc <= 24.9) return 'bg-green-500'
  if ((imc >= 17 && imc < 18.5) || (imc >= 25 && imc <= 29.9)) return 'bg-yellow-500'
  return 'bg-red-500'
}

export function formatGender(gender: string): string {
  if (gender === 'M') return 'Masculino'
  if (gender === 'F') return 'Feminino'
  return gender
}
