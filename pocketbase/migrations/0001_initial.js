migrate(
  (app) => {
    // pacientes
    const pacientes = new Collection({
      name: 'pacientes',
      type: 'base',
      listRule: "@request.auth.id != '' && owner = @request.auth.id",
      viewRule: "@request.auth.id != '' && owner = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && owner = @request.auth.id",
      deleteRule: "@request.auth.id != '' && owner = @request.auth.id",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'birth_date', type: 'date' },
        {
          name: 'gender',
          type: 'select',
          values: ['Masculino', 'Feminino', 'Outro'],
          maxSelect: 1,
        },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'text' },
        {
          name: 'owner',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'vector', type: 'vector', dimensions: 1536, distance: 'cosine' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(pacientes)

    // avaliacoes
    const avaliacoes = new Collection({
      name: 'avaliacoes',
      type: 'base',
      listRule: "@request.auth.id != '' && owner = @request.auth.id",
      viewRule: "@request.auth.id != '' && owner = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && owner = @request.auth.id",
      deleteRule: "@request.auth.id != '' && owner = @request.auth.id",
      fields: [
        {
          name: 'paciente',
          type: 'relation',
          required: true,
          collectionId: pacientes.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'tipo', type: 'text', required: true },
        { name: 'data', type: 'date', required: true },
        { name: 'metrics', type: 'json' },
        { name: 'observacoes', type: 'text' },
        {
          name: 'owner',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(avaliacoes)
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('avaliacoes'))
    app.delete(app.findCollectionByNameOrId('pacientes'))
  },
)
