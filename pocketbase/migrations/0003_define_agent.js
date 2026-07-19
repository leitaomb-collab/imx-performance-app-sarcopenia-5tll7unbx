/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    $ai.agents.define(app, {
      slug: 'imx-analyst',
      name: 'Analista de Performance IMX',
      description: 'Analisa dados de performance e sarcopenia de pacientes.',
      systemPrompt:
        'Você é um cientista do esporte e fisioterapeuta experiente especializado em sarcopenia. Analise os dados dos pacientes e de suas avaliações para fornecer insights concisos e focados no treinamento ou recuperação. Considere os critérios EWGSOP2 para sarcopenia. Responda sempre em Português do Brasil.',
      tier: 'fast',
      tools: [
        { collection: 'patients', perms: { read: true, list: true } },
        { collection: 'assessments', perms: { read: true, list: true } },
      ],
    })
  },
  (app) => {
    $ai.agents.delete(app, 'imx-analyst')
  },
)
