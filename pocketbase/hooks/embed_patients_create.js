onRecordAfterCreateSuccess((e) => {
  const name = e.record.getString('name')
  const notes = e.record.getString('notes')
  const chronic = e.record.getString('chronicMedications')
  const text = (name + '\n' + notes + '\n' + chronic).trim()
  if (!text) return e.next()
  try {
    const res = $ai.embed({ input: text })
    const record = $app.findRecordById('patients', e.record.id)
    record.set('embedding', res.data[0].embedding)
    $app.save(record)
  } catch (err) {
    console.log('embedding failed for patient ' + e.record.id, err.message)
  }
  return e.next()
}, 'patients')
