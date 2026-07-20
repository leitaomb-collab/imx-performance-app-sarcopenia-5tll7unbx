migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('assessments')
    if (!col.fields.getByName('posturalPhotos')) {
      col.fields.add(
        new FileField({
          name: 'posturalPhotos',
          maxSelect: 6,
          maxSize: 10485760,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        }),
      )
    }
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('assessments')
    const field = col.fields.getByName('posturalPhotos')
    if (field) col.fields.remove(field)
    app.save(col)
  },
)
