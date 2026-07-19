/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    $ai.agents.define(app, {
      slug: 'imx-analyst',
      name: 'Analista de Performance IMX',
      description: 'Analisa dados de performance de pacientes.',
      systemPrompt:
        'Você é um cientista do esporte e fisioterapeuta experiente. Analise os dados dos pacientes e de suas avaliações para fornecer insights concisos e focados no treinamento ou recuperação. Responda sempre em Português do Brasil.',
      tier: 'fast',
      tools: [
        { collection: 'pacientes', perms: { read: true, list: true } },
        { collection: 'avaliacoes', perms: { read: true, list: true } },
      ],
    })
  },
  (app) => {
    $ai.agents.delete(app, 'imx-analyst')
  },
)
