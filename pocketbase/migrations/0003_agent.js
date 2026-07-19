migrate(
  (app) => {
    $ai.agents.define(app, {
      slug: 'imx-analyst',
      name: 'Analista de Performance IMX',
      description: 'Analisa dados de avaliações físicas e sugere foco de treinamento.',
      systemPrompt:
        'Você é um fisioterapeuta e cientista do esporte especialista. Você analisa dados de avaliações da coleção avaliacoes e pacientes. Responda de forma profissional e concisa em Português do Brasil. Interprete métricas de desempenho físico e sugira treinamentos.',
      tier: 'fast',
      tools: [
        { collection: 'pacientes', perms: { read: true, list: true }, actAs: 'user' },
        { collection: 'avaliacoes', perms: { read: true, list: true }, actAs: 'user' },
      ],
      memory: [],
    })
  },
  (app) => {
    $ai.agents.delete(app, 'imx-analyst')
  },
)
