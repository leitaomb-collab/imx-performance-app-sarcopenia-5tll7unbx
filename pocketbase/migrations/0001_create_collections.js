migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    if (!users.fields.getByName('role')) {
      users.fields.add(
        new SelectField({ name: 'role', values: ['medico', 'avaliador'], maxSelect: 1 }),
      )
    }
    users.listRule = null
    users.deleteRule = null
    app.save(users)

    let patients
    try {
      patients = app.findCollectionByNameOrId('patients')
    } catch (_) {
      patients = new Collection({
        name: 'patients',
        type: 'base',
        listRule: "@request.auth.id != '' && createdBy = @request.auth.id",
        viewRule: "@request.auth.id != '' && createdBy = @request.auth.id",
        createRule: "@request.auth.id != '' && createdBy = @request.auth.id",
        updateRule: "@request.auth.id != '' && createdBy = @request.auth.id",
        deleteRule: "@request.auth.id != '' && createdBy = @request.auth.id",
        fields: [
          { name: 'name', type: 'text', required: true },
          { name: 'birthDate', type: 'date', required: true },
          { name: 'gender', type: 'select', values: ['M', 'F'], required: true, maxSelect: 1 },
          { name: 'weight', type: 'number' },
          { name: 'height', type: 'number' },
          { name: 'chronicMedications', type: 'editor' },
          { name: 'notes', type: 'text' },
          {
            name: 'createdBy',
            type: 'relation',
            collectionId: '_pb_users_auth_',
            required: true,
            cascadeDelete: true,
            maxSelect: 1,
          },
          { name: 'embedding', type: 'vector', dimensions: 1536 },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: ['CREATE INDEX idx_patients_createdBy ON patients (createdBy)'],
      })
      app.save(patients)
    }

    try {
      app.findCollectionByNameOrId('assessments')
    } catch (_) {
      const assessments = new Collection({
        name: 'assessments',
        type: 'base',
        listRule: "@request.auth.id != '' && evaluatorId = @request.auth.id",
        viewRule: "@request.auth.id != '' && evaluatorId = @request.auth.id",
        createRule: "@request.auth.id != '' && evaluatorId = @request.auth.id",
        updateRule: "@request.auth.id != '' && evaluatorId = @request.auth.id",
        deleteRule: "@request.auth.id != '' && evaluatorId = @request.auth.id",
        fields: [
          {
            name: 'patientId',
            type: 'relation',
            collectionId: patients.id,
            required: true,
            cascadeDelete: true,
            maxSelect: 1,
          },
          {
            name: 'evaluatorId',
            type: 'relation',
            collectionId: '_pb_users_auth_',
            required: true,
            maxSelect: 1,
          },
          { name: 'assessmentDate', type: 'date', required: true },
          { name: 'status', type: 'select', values: ['rascunho', 'concluida'], maxSelect: 1 },
          {
            name: 'finalDiagnosis',
            type: 'select',
            values: ['sem_sarcopenia', 'sarcopenia', 'sarcopenia_grave', 'nao_avaliado'],
            maxSelect: 1,
          },
          { name: 'reassessmentMonths', type: 'number', onlyInt: true },
          { name: 'clinicalSummary', type: 'editor' },
          { name: 'vitals', type: 'json' },
          { name: 'bodyComposition', type: 'json' },
          { name: 'anthropometry', type: 'json' },
          { name: 'posturalAssessment', type: 'json' },
          { name: 'muscleStrength', type: 'json' },
          { name: 'balanceAssessment', type: 'json' },
          { name: 'respiratoryStrength', type: 'json' },
          { name: 'spirometry', type: 'json' },
          { name: 'sarcopeniaScreening', type: 'json' },
          { name: 'ewgsop2Analysis', type: 'json' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_assessments_patientId ON assessments (patientId)',
          'CREATE INDEX idx_assessments_evaluatorId ON assessments (evaluatorId)',
        ],
      })
      app.save(assessments)
    }
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('assessments'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('patients'))
    } catch (_) {}
  },
)
