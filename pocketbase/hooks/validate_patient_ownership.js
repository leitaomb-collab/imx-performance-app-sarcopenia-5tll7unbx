onRecordCreateRequest((e) => {
  var now = new Date().toISOString()
  var recordId = e.record ? e.record.id : 'unknown'

  var errorMsg = null

  try {
    var patientId = e.record.getString('patientId')

    if (!patientId) {
      errorMsg = 'Paciente é obrigatório.'
    } else {
      var patient = null
      try {
        patient = $app.findRecordById('patients', patientId)
      } catch (notFoundErr) {
        var errStr = (notFoundErr.message || '').toLowerCase()
        if (errStr.indexOf('no rows') !== -1 || errStr.indexOf('not found') !== -1) {
          errorMsg = 'Paciente não encontrado.'
        } else {
          errorMsg = 'Erro ao validar paciente.'
          console.log(
            '[validate-patient-ownership] Record: ' +
              recordId +
              ' | ' +
              now +
              ' | DB Error: ' +
              notFoundErr.message,
          )
        }
      }

      if (!errorMsg && patient) {
        var userId = e.auth ? e.auth.id : ''
        if (!userId) {
          errorMsg = 'Erro ao validar paciente.'
          console.log(
            '[validate-patient-ownership] Record: ' +
              recordId +
              ' | ' +
              now +
              ' | No authenticated user.',
          )
        } else {
          var createdBy = patient.getString('createdBy')
          if (createdBy !== userId) {
            errorMsg = 'Paciente não pertence ao usuário atual.'
          }
        }
      }
    }

    if (!errorMsg) {
      console.log(
        '[validate-patient-ownership] Record: ' + recordId + ' | ' + now + ' | Validation passed.',
      )
    }
  } catch (err) {
    errorMsg = 'Erro ao validar paciente.'
    console.log(
      '[validate-patient-ownership] Record: ' + recordId + ' | ' + now + ' | Error: ' + err.message,
    )
  }

  if (errorMsg) {
    console.log(
      '[validate-patient-ownership] Record: ' + recordId + ' | ' + now + ' | Rejected: ' + errorMsg,
    )
    return e.badRequestError(errorMsg)
  }

  e.next()
}, 'assessments')
