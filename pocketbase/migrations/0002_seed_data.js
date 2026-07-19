migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    let admin
    try {
      admin = app.findAuthRecordByEmail('_pb_users_auth_', 'leitaomb@uol.com.br')
    } catch (_) {
      admin = new Record(users)
      admin.setEmail('leitaomb@uol.com.br')
      admin.setPassword('Skip@Pass')
      admin.setVerified(true)
      admin.set('name', 'Admin IMX')
      app.save(admin)
    }

    const pacientesCol = app.findCollectionByNameOrId('pacientes')
    let p1, p2
    try {
      p1 = app.findFirstRecordByData('pacientes', 'email', 'joao@example.com')
    } catch (_) {
      p1 = new Record(pacientesCol)
      p1.set('name', 'João Silva')
      p1.set('email', 'joao@example.com')
      p1.set('gender', 'Masculino')
      p1.set('birth_date', '1990-01-01 12:00:00.000Z')
      p1.set('owner', admin.id)
      p1.set('notes', 'Atleta profissional de basquete. Foco em explosão e recuperação.')
      app.save(p1)
    }

    try {
      p2 = app.findFirstRecordByData('pacientes', 'email', 'maria@example.com')
    } catch (_) {
      p2 = new Record(pacientesCol)
      p2.set('name', 'Maria Oliveira')
      p2.set('email', 'maria@example.com')
      p2.set('gender', 'Feminino')
      p2.set('birth_date', '1996-05-15 12:00:00.000Z')
      p2.set('owner', admin.id)
      p2.set('notes', 'Recuperação de LCA. Fase final de transição para o esporte.')
      app.save(p2)
    }

    const avaliacoesCol = app.findCollectionByNameOrId('avaliacoes')
    try {
      app.findFirstRecordByData('avaliacoes', 'paciente', p1.id)
    } catch (_) {
      const dates = [
        '2026-05-01 10:00:00.000Z',
        '2026-06-01 10:00:00.000Z',
        '2026-07-01 10:00:00.000Z',
      ]
      const scores = [40, 42, 45]
      for (let i = 0; i < 3; i++) {
        const a = new Record(avaliacoesCol)
        a.set('paciente', p1.id)
        a.set('tipo', 'Salto Vertical')
        a.set('data', dates[i])
        a.set('metrics', { altura_cm: scores[i], pico_forca: 1500 + i * 50 })
        a.set('owner', admin.id)
        a.set('observacoes', 'Boa evolução progressiva no salto.')
        app.save(a)
      }

      const a2 = new Record(avaliacoesCol)
      a2.set('paciente', p2.id)
      a2.set('tipo', 'Mobilidade')
      a2.set('data', '2026-07-10 09:00:00.000Z')
      a2.set('metrics', { score_tornozelo: 8, score_quadril: 7 })
      a2.set('owner', admin.id)
      a2.set('observacoes', 'Melhoria na amplitude articular.')
      app.save(a2)
    }
  },
  (app) => {
    app
      .db()
      .newQuery(
        "DELETE FROM avaliacoes WHERE owner IN (SELECT id FROM users WHERE email='leitaomb@uol.com.br')",
      )
      .execute()
    app
      .db()
      .newQuery(
        "DELETE FROM pacientes WHERE owner IN (SELECT id FROM users WHERE email='leitaomb@uol.com.br')",
      )
      .execute()
  },
)
