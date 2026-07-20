migrate(
  (app) => {
    const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
    const patientsCol = app.findCollectionByNameOrId('patients')
    const assessmentsCol = app.findCollectionByNameOrId('assessments')

    const notifications = new Collection({
      name: 'notifications',
      type: 'base',
      listRule: "@request.auth.id != '' && userId = @request.auth.id",
      viewRule: "@request.auth.id != '' && userId = @request.auth.id",
      createRule: null,
      updateRule: "@request.auth.id != '' && userId = @request.auth.id",
      deleteRule: "@request.auth.id != '' && userId = @request.auth.id",
      fields: [
        {
          name: 'userId',
          type: 'relation',
          collectionId: usersCol.id,
          required: true,
          maxSelect: 1,
        },
        {
          name: 'patientId',
          type: 'relation',
          collectionId: patientsCol.id,
          required: true,
          maxSelect: 1,
        },
        {
          name: 'assessmentId',
          type: 'relation',
          collectionId: assessmentsCol.id,
          required: true,
          maxSelect: 1,
        },
        { name: 'type', type: 'select', values: ['overdue', 'upcoming'], maxSelect: 1 },
        { name: 'message', type: 'text' },
        { name: 'reassessmentDate', type: 'date' },
        { name: 'isRead', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_notifications_userId ON notifications (userId)',
        'CREATE INDEX idx_notifications_assessmentId_type ON notifications (assessmentId, type)',
      ],
    })
    app.save(notifications)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('notifications'))
    } catch (_) {}
  },
)
