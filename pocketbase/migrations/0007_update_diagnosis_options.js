migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('assessments')

    var oldField = col.fields.getByName('finalDiagnosis')
    if (oldField) {
      col.fields.remove(oldField)
    }
    col.fields.add(
      new SelectField({
        name: 'finalDiagnosis',
        values: ['normal', 'risco_sarcopenia', 'sarcopenia', 'sarcopenia_grave'],
        maxSelect: 1,
      }),
    )
    app.save(col)

    var records = app.findRecordsByFilter('assessments', 'id != ""', '-created', 0, 0)
    for (var i = 0; i < records.length; i++) {
      var current = records[i].getString('finalDiagnosis')
      if (current === 'sem_sarcopenia' || current === 'nao_avaliado') {
        records[i].set('finalDiagnosis', 'normal')
        app.save(records[i])
      }
    }
  },
  (app) => {
    var col = app.findCollectionByNameOrId('assessments')

    var oldField = col.fields.getByName('finalDiagnosis')
    if (oldField) {
      col.fields.remove(oldField)
    }
    col.fields.add(
      new SelectField({
        name: 'finalDiagnosis',
        values: ['sem_sarcopenia', 'sarcopenia', 'sarcopenia_grave', 'nao_avaliado'],
        maxSelect: 1,
      }),
    )
    app.save(col)
  },
)
