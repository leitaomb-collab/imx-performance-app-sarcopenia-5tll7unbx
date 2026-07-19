migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    let adminUser
    try {
      adminUser = app.findAuthRecordByEmail('_pb_users_auth_', 'leitaomb@uol.com.br')
    } catch (_) {
      adminUser = new Record(users)
      adminUser.setEmail('leitaomb@uol.com.br')
      adminUser.setPassword('Skip@Pass')
      adminUser.setVerified(true)
      adminUser.set('name', 'Admin IMX')
      app.save(adminUser)
    }

    const pacientes = app.findCollectionByNameOrId('pacientes')

    let p1
    try {
      p1 = app.findFirstRecordByData('pacientes', 'email', 'joao.atleta@example.com')
    } catch (_) {
      p1 = new Record(pacientes)
      p1.set('name', 'João Silva')
      p1.set('birth_date', '1990-05-15 12:00:00.000Z')
      p1.set('gender', 'Masculino')
      p1.set('email', 'joao.atleta@example.com')
      p1.set('phone', '11999999999')
      p1.set('owner', adminUser.id)
      app.save(p1)
    }

    let p2
    try {
      p2 = app.findFirstRecordByData('pacientes', 'email', 'maria.rec@example.com')
    } catch (_) {
      p2 = new Record(pacientes)
      p2.set('name', 'Maria Oliveira')
      p2.set('birth_date', '1996-08-20 12:00:00.000Z')
      p2.set('gender', 'Feminino')
      p2.set('email', 'maria.rec@example.com')
      p2.set('phone', '11988888888')
      p2.set('owner', adminUser.id)
      app.save(p2)
    }

    const avaliacoes = app.findCollectionByNameOrId('avaliacoes')

    try {
      app.findFirstRecordByData('avaliacoes', 'observacoes', 'Avaliação inicial 1')
    } catch (_) {
      const a1 = new Record(avaliacoes)
      a1.set('paciente', p1.id)
      a1.set('tipo', 'Salto Vertical')
      a1.set('data', '2023-01-10 12:00:00.000Z')
      a1.set('metrics', { force: 120, height: 45 })
      a1.set('observacoes', 'Avaliação inicial 1')
      a1.set('owner', adminUser.id)
      app.save(a1)

      const a2 = new Record(avaliacoes)
      a2.set('paciente', p1.id)
      a2.set('tipo', 'Salto Vertical')
      a2.set('data', '2023-02-10 12:00:00.000Z')
      a2.set('metrics', { force: 135, height: 48 })
      a2.set('observacoes', 'Avaliação acompanhamento 1')
      a2.set('owner', adminUser.id)
      app.save(a2)

      const a3 = new Record(avaliacoes)
      a3.set('paciente', p1.id)
      a3.set('tipo', 'Salto Vertical')
      a3.set('data', '2023-03-10 12:00:00.000Z')
      a3.set('metrics', { force: 142, height: 52 })
      a3.set('observacoes', 'Avaliação final fase 1')
      a3.set('owner', adminUser.id)
      app.save(a3)
    }
  },
  (app) => {},
)
