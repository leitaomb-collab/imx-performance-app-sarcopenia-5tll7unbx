migrate(
  (app) => {
    let pacientes
    try {
      pacientes = app.findCollectionByNameOrId('pacientes')
    } catch (_) {
      try {
        pacientes = app.findCollectionByNameOrId('Pacientes')
      } catch (__) {
        pacientes = new Collection({
          name: 'pacientes',
          type: 'base',
          listRule: "@request.auth.id != '' && owner = @request.auth.id",
          viewRule: "@request.auth.id != '' && owner = @request.auth.id",
          createRule: "@request.auth.id != '' && owner = @request.auth.id",
          updateRule: "@request.auth.id != '' && owner = @request.auth.id",
          deleteRule: "@request.auth.id != '' && owner = @request.auth.id",
          fields: [
            { name: 'name', type: 'text', required: true },
            { name: 'birth_date', type: 'date' },
            { name: 'gender', type: 'select', values: ['Masculino', 'Feminino', 'Outro'] },
            { name: 'email', type: 'email' },
            { name: 'phone', type: 'text' },
            { name: 'notes', type: 'text' },
            {
              name: 'owner',
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
          indexes: ['CREATE INDEX idx_pacientes_owner ON pacientes (owner)'],
        })
        app.save(pacientes)
      }
    }

    let avaliacoes
    try {
      avaliacoes = app.findCollectionByNameOrId('avaliacoes')
    } catch (_) {
      try {
        avaliacoes = app.findCollectionByNameOrId('Avaliacoes')
      } catch (__) {
        avaliacoes = new Collection({
          name: 'avaliacoes',
          type: 'base',
          listRule: "@request.auth.id != '' && owner = @request.auth.id",
          viewRule: "@request.auth.id != '' && owner = @request.auth.id",
          createRule: "@request.auth.id != '' && owner = @request.auth.id",
          updateRule: "@request.auth.id != '' && owner = @request.auth.id",
          deleteRule: "@request.auth.id != '' && owner = @request.auth.id",
          fields: [
            {
              name: 'paciente',
              type: 'relation',
              collectionId: pacientes.id,
              required: true,
              cascadeDelete: true,
              maxSelect: 1,
            },
            {
              name: 'tipo',
              type: 'select',
              values: ['Salto Vertical', 'Força Isométrica', 'Mobilidade', 'Outro'],
              required: true,
            },
            { name: 'data', type: 'date', required: true },
            { name: 'metrics', type: 'json' },
            { name: 'observacoes', type: 'text' },
            {
              name: 'owner',
              type: 'relation',
              collectionId: '_pb_users_auth_',
              required: true,
              cascadeDelete: true,
              maxSelect: 1,
            },
            { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
            { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
          ],
          indexes: [
            'CREATE INDEX idx_avaliacoes_paciente ON avaliacoes (paciente)',
            'CREATE INDEX idx_avaliacoes_owner ON avaliacoes (owner)',
          ],
        })
        app.save(avaliacoes)
      }
    }
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('avaliacoes'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('pacientes'))
    } catch (_) {}
  },
)
