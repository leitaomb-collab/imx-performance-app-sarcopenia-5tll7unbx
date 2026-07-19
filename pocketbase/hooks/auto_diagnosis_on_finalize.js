onRecordAfterUpdateSuccess((e) => {
  var now = new Date().toISOString()
  var recordId = e.record.id

  try {
    var oldStatus = e.record.original().getString('status')
    var newStatus = e.record.getString('status')

    if (oldStatus !== 'rascunho' || newStatus !== 'concluida') {
      return e.next()
    }

    var currentDiagnosis = e.record.getString('finalDiagnosis')
    if (currentDiagnosis && currentDiagnosis.trim() !== '') {
      console.log(
        '[auto-diagnosis-on-finalize] Record: ' +
          recordId +
          ' | ' +
          now +
          ' | finalDiagnosis already set to "' +
          currentDiagnosis +
          '", skipping auto-mapping.',
      )
      return e.next()
    }

    var ewgsop2Str = e.record.getString('ewgsop2Analysis')
    if (!ewgsop2Str || ewgsop2Str.trim() === '' || ewgsop2Str === 'null') {
      console.log(
        '[auto-diagnosis-on-finalize] Record: ' +
          recordId +
          ' | ' +
          now +
          ' | EWGSOP2 analysis not found for assessment ' +
          recordId +
          ', finalDiagnosis remains unset.',
      )
      return e.next()
    }

    var ewgsop2
    try {
      ewgsop2 = JSON.parse(ewgsop2Str)
    } catch (parseErr) {
      console.log(
        '[auto-diagnosis-on-finalize] Record: ' +
          recordId +
          ' | ' +
          now +
          ' | EWGSOP2 analysis not found for assessment ' +
          recordId +
          ', finalDiagnosis remains unset.',
      )
      return e.next()
    }

    if (!ewgsop2 || typeof ewgsop2 !== 'object') {
      console.log(
        '[auto-diagnosis-on-finalize] Record: ' +
          recordId +
          ' | ' +
          now +
          ' | EWGSOP2 analysis not found for assessment ' +
          recordId +
          ', finalDiagnosis remains unset.',
      )
      return e.next()
    }

    var rawDiagnosis = ''
    if (ewgsop2.detailedDiagnosis) {
      rawDiagnosis = String(ewgsop2.detailedDiagnosis)
    } else if (ewgsop2.diagnosis) {
      rawDiagnosis = String(ewgsop2.diagnosis).replace(/_/g, ' ')
    }

    var detailedDiagnosis = rawDiagnosis.toLowerCase()

    if (!detailedDiagnosis) {
      console.log(
        '[auto-diagnosis-on-finalize] Record: ' +
          recordId +
          ' | ' +
          now +
          ' | EWGSOP2 analysis not found for assessment ' +
          recordId +
          ', finalDiagnosis remains unset.',
      )
      return e.next()
    }

    var mappedDiagnosis = null
    if (detailedDiagnosis.indexOf('sem sarcopenia') !== -1) {
      mappedDiagnosis = 'sem_sarcopenia'
    } else if (
      detailedDiagnosis.indexOf('provavel') !== -1 ||
      detailedDiagnosis.indexOf('provável') !== -1
    ) {
      mappedDiagnosis = 'sarcopenia'
    } else if (detailedDiagnosis.indexOf('confirmada') !== -1) {
      mappedDiagnosis = 'sarcopenia'
    } else if (detailedDiagnosis.indexOf('grave') !== -1) {
      mappedDiagnosis = 'sarcopenia_grave'
    }

    if (!mappedDiagnosis) {
      console.log(
        '[auto-diagnosis-on-finalize] Record: ' +
          recordId +
          ' | ' +
          now +
          ' | Could not map detailedDiagnosis value ' +
          rawDiagnosis +
          ' to finalDiagnosis.',
      )
      return e.next()
    }

    var updatedRecord = $app.findRecordById('assessments', recordId)
    updatedRecord.set('finalDiagnosis', mappedDiagnosis)
    $app.save(updatedRecord)

    console.log(
      '[auto-diagnosis-on-finalize] Record: ' +
        recordId +
        ' | ' +
        now +
        ' | finalDiagnosis set to "' +
        mappedDiagnosis +
        '" based on EWGSOP2 analysis.',
    )
  } catch (err) {
    now = new Date().toISOString()
    console.log(
      '[auto-diagnosis-on-finalize] Record: ' + recordId + ' | ' + now + ' | Error: ' + err.message,
    )
  }

  return e.next()
}, 'assessments')
