import { StepField, StepSection } from '@/components/assessment/shared'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { PosturalPhotoUploader } from '@/components/assessment/PosturalPhotoUploader'
import type { StepProps } from '@/types/assessment'

export function StepsBody({ form, updateField }: StepProps) {
  const pa = form.posturalAssessment

  const updatePA = (field: keyof typeof pa, value: string | boolean) => {
    updateField('posturalAssessment', { ...pa, [field]: value })
  }

  return (
    <div className="space-y-6">
      <StepSection title="Avaliação Postural">
        <StepField label="Cabeça/Pescoço">
          <Input
            value={pa.head || ''}
            onChange={(e) => updatePA('head', e.target.value)}
            placeholder="Descreva os achados..."
          />
        </StepField>
        <StepField label="Ombros">
          <Input
            value={pa.shoulders || ''}
            onChange={(e) => updatePA('shoulders', e.target.value)}
            placeholder="Descreva os achados..."
          />
        </StepField>
        <StepField label="Coluna">
          <Input
            value={pa.spine || ''}
            onChange={(e) => updatePA('spine', e.target.value)}
            placeholder="Descreva os achados..."
          />
        </StepField>
        <StepField label="Pelve">
          <Input
            value={pa.pelvis || ''}
            onChange={(e) => updatePA('pelvis', e.target.value)}
            placeholder="Descreva os achados..."
          />
        </StepField>
        <StepField label="Joelhos">
          <Input
            value={pa.knees || ''}
            onChange={(e) => updatePA('knees', e.target.value)}
            placeholder="Descreva os achados..."
          />
        </StepField>
        <StepField label="Tornozelos/Pés">
          <Input
            value={pa.feet || ''}
            onChange={(e) => updatePA('feet', e.target.value)}
            placeholder="Descreva os achados..."
          />
        </StepField>
      </StepSection>

      <StepField label="Observações">
        <Textarea
          value={pa.observations || ''}
          onChange={(e) => updatePA('observations', e.target.value)}
          rows={4}
          placeholder="Observações adicionais sobre a avaliação postural..."
        />
      </StepField>

      <PosturalPhotoUploader
        assessmentId={form.id}
        initialPhotos={form.posturalPhotos || []}
        onPhotosChange={(hasPhotos) => {
          updatePA('photosAttached', hasPhotos)
        }}
      />
    </div>
  )
}
