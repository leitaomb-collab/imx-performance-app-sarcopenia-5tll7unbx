onRecordAfterUpdateSuccess((e) => {
  const nameChanged = e.record.getString('name') !== e.record.original().getString('name')
  const notesChanged = e.record.getString('notes') !== e.record.original().getString('notes')
  const chronicChanged =
    e.record.getString('chronicMedications') !== e.record.original().getString('chronicMedications')
  if (!nameChanged && !notesChanged && !chronicChanged) return e.next()
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
