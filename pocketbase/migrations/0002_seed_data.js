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
      admin.set('role', 'medico')
      app.save(admin)
    }
    if (!admin.get('role')) {
      admin.set('role', 'medico')
      app.save(admin)
    }

    const patientsCol = app.findCollectionByNameOrId('patients')

    let p1
    try {
      p1 = app.findFirstRecordByData('patients', 'name', 'João Silva')
    } catch (_) {
      p1 = new Record(patientsCol)
      p1.set('name', 'João Silva')
      p1.set('birthDate', '1990-01-01 12:00:00.000Z')
      p1.set('gender', 'M')
      p1.set('weight', 80)
      p1.set('height', 1.75)
      p1.set('createdBy', admin.id)
      p1.set('notes', 'Atleta profissional de basquete. Foco em explosão e recuperação.')
      app.save(p1)
    }

    let p2
    try {
      p2 = app.findFirstRecordByData('patients', 'name', 'Maria Oliveira')
    } catch (_) {
      p2 = new Record(patientsCol)
      p2.set('name', 'Maria Oliveira')
      p2.set('birthDate', '1996-05-15 12:00:00.000Z')
      p2.set('gender', 'F')
      p2.set('weight', 62)
      p2.set('height', 1.62)
      p2.set('createdBy', admin.id)
      p2.set('notes', 'Recuperação de LCA. Fase final de transição para o esporte.')
      app.save(p2)
    }

    const assessmentsCol = app.findCollectionByNameOrId('assessments')

    try {
      app.findFirstRecordByData('assessments', 'patientId', p1.id)
    } catch (_) {
      const dates = [
        '2026-05-01 10:00:00.000Z',
        '2026-06-01 10:00:00.000Z',
        '2026-07-01 10:00:00.000Z',
      ]
      const handgrips = [38, 41, 44]
      for (let i = 0; i < 3; i++) {
        const a = new Record(assessmentsCol)
        a.set('patientId', p1.id)
        a.set('evaluatorId', admin.id)
        a.set('assessmentDate', dates[i])
        a.set('status', 'concluida')
        a.set('finalDiagnosis', 'sem_sarcopenia')
        a.set('reassessmentMonths', 6)
        a.set('vitals', {
          heartRate: 70 + i * 2,
          bloodPressureSystolic: 120,
          bloodPressureDiastolic: 80,
          oxygenSaturation: 98,
        })
        a.set('anthropometry', {
          weight: 80,
          height: 1.75,
          armCircumference: 32,
          calfCircumference: 38,
        })
        a.set('muscleStrength', {
          handgripRight: handgrips[i],
          handgripLeft: handgrips[i] - 2,
        })
        a.set('sarcopeniaScreening', {
          strength: 0,
          assistanceWalking: 0,
          riseChair: 0,
          climbStairs: 0,
          falls: 0,
          totalScore: 0,
          risk: 'baixo',
        })
        a.set('ewgsop2Analysis', { muscleStrengthLow: false, diagnosis: 'sem_sarcopenia' })
        a.set('clinicalSummary', 'Boa evolução progressiva. Sem sinais de sarcopenia.')
        app.save(a)
      }

      const a2 = new Record(assessmentsCol)
      a2.set('patientId', p2.id)
      a2.set('evaluatorId', admin.id)
      a2.set('assessmentDate', '2026-07-10 09:00:00.000Z')
      a2.set('status', 'concluida')
      a2.set('finalDiagnosis', 'sarcopenia')
      a2.set('reassessmentMonths', 3)
      a2.set('vitals', { heartRate: 75, bloodPressureSystolic: 118, bloodPressureDiastolic: 78 })
      a2.set('anthropometry', { weight: 62, height: 1.62, calfCircumference: 31 })
      a2.set('muscleStrength', { handgripRight: 15, handgripLeft: 14 })
      a2.set('sarcopeniaScreening', {
        strength: 1,
        assistanceWalking: 0,
        riseChair: 1,
        climbStairs: 1,
        falls: 0,
        totalScore: 3,
        risk: 'moderado',
      })
      a2.set('ewgsop2Analysis', { muscleStrengthLow: true, diagnosis: 'sarcopenia' })
      a2.set(
        'clinicalSummary',
        'Sinais iniciais de sarcopenia. Recomenda-se intervenção nutricional.',
      )
      app.save(a2)
    }
  },
  (app) => {
    app
      .db()
      .newQuery(
        "DELETE FROM assessments WHERE evaluatorId IN (SELECT id FROM users WHERE email='leitaomb@uol.com.br')",
      )
      .execute()
    app
      .db()
      .newQuery(
        "DELETE FROM patients WHERE createdBy IN (SELECT id FROM users WHERE email='leitaomb@uol.com.br')",
      )
      .execute()
  },
)
