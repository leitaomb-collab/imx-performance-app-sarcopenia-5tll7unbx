onRecordDeleteRequest((e) => {
  var now = new Date().toISOString()
  var recordId = e.record ? e.record.id : 'unknown'

  var errorMsg = null
  var blocked = false

  try {
    var records = $app.findRecordsByFilter(
      'assessments',
      'patientId = {:patientId} && status = {:status}',
      '-created',
      1,
      0,
      { patientId: recordId, status: 'concluida' },
    )

    if (records.length > 0) {
      blocked = true
      console.log(
        '[protect-patient-with-assessments] Record: ' +
          recordId +
          ' | ' +
          now +
          ' | Blocked: Patient has concluded assessments.',
      )
    } else {
      console.log(
        '[protect-patient-with-assessments] Record: ' +
          recordId +
          ' | ' +
          now +
          ' | Deletion allowed: No concluded assessments found.',
      )
    }
  } catch (err) {
    errorMsg = 'Erro ao verificar avaliações do paciente.'
    console.log(
      '[protect-patient-with-assessments] Record: ' +
        recordId +
        ' | ' +
        now +
        ' | Error: ' +
        err.message,
    )
  }

  if (errorMsg) {
    return e.badRequestError(errorMsg)
  }

  if (blocked) {
    return e.badRequestError(
      'Não é possível excluir um paciente com avaliações concluídas. Exclua as avaliações concluídas primeiro ou arquive o paciente.',
    )
  }

  e.next()
}, 'patients')
