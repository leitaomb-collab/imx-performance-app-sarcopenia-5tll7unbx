migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('assessments')

    if (!col.fields.getByName('exerciseRecommendations')) {
      col.fields.add(
        new EditorField({
          name: 'exerciseRecommendations',
          required: false,
        }),
      )
    }

    if (!col.fields.getByName('nutritionRecommendations')) {
      col.fields.add(
        new EditorField({
          name: 'nutritionRecommendations',
          required: false,
        }),
      )
    }

    if (!col.fields.getByName('reassessmentDate')) {
      col.fields.add(
        new DateField({
          name: 'reassessmentDate',
          required: false,
        }),
      )
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('assessments')

    const exerciseField = col.fields.getByName('exerciseRecommendations')
    if (exerciseField) col.fields.remove(exerciseField)

    const nutritionField = col.fields.getByName('nutritionRecommendations')
    if (nutritionField) col.fields.remove(nutritionField)

    const reassessmentField = col.fields.getByName('reassessmentDate')
    if (reassessmentField) col.fields.remove(reassessmentField)

    app.save(col)
  },
)
