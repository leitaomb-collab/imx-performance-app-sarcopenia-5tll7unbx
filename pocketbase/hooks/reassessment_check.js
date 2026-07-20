cronAdd('reassessment-check', '0 6 * * *', () => {
  var now = new Date()
  var today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  var inThirtyDays = new Date(today)
  inThirtyDays.setDate(inThirtyDays.getDate() + 30)

  var processed = 0
  var created = 0
  var existing = 0

  var assessments = $app.findRecordsByFilter(
    'assessments',
    "status = 'concluida'",
    '-assessmentDate',
    500,
    0,
  )

  for (var i = 0; i < assessments.length; i++) {
    var assessment = assessments[i]
    processed++

    var dateStr = assessment.getString('assessmentDate')
    if (!dateStr) continue

    var assessmentDate = new Date(dateStr)
    var months = assessment.getInt('reassessmentMonths')
    if (!months || months <= 0) months = 6

    var reassessmentDate = new Date(assessmentDate)
    reassessmentDate.setMonth(reassessmentDate.getMonth() + months)

    var type = ''
    if (reassessmentDate < today) {
      type = 'overdue'
    } else if (reassessmentDate <= inThirtyDays) {
      type = 'upcoming'
    } else {
      continue
    }

    var dedupFilter = "assessmentId = '" + assessment.id + "' && type = '" + type + "'"
    var alreadyExists = false
    try {
      $app.findFirstRecordByFilter('notifications', dedupFilter)
      alreadyExists = true
    } catch (_) {}

    if (alreadyExists) {
      existing++
      continue
    }

    var patientId = assessment.getString('patientId')
    var patientName = 'Paciente'
    try {
      var patient = $app.findRecordById('patients', patientId)
      patientName = patient.getString('name')
    } catch (_) {}

    var evaluatorId = assessment.getString('evaluatorId')
    if (!evaluatorId) continue

    var day = String(reassessmentDate.getDate())
    if (day.length < 2) day = '0' + day
    var month = String(reassessmentDate.getMonth() + 1)
    if (month.length < 2) month = '0' + month
    var year = reassessmentDate.getFullYear()
    var formattedDate = day + '/' + month + '/' + year

    var message = ''
    if (type === 'overdue') {
      message =
        'Reavaliação de ' + patientName + ' está em atraso (prevista para ' + formattedDate + ').'
    } else {
      message = 'Reavaliação de ' + patientName + ' prevista para ' + formattedDate + '.'
    }

    var reassessmentDateStr = year + '-' + month + '-' + day

    var notifCol = $app.findCollectionByNameOrId('notifications')
    var notif = new Record(notifCol)
    notif.set('userId', evaluatorId)
    notif.set('patientId', patientId)
    notif.set('assessmentId', assessment.id)
    notif.set('type', type)
    notif.set('message', message)
    notif.set('reassessmentDate', reassessmentDateStr)
    notif.set('isRead', false)
    $app.save(notif)
    created++
  }

  console.log(
    '[reassessment-check] Processed: ' +
      processed +
      ', Created: ' +
      created +
      ', Existing: ' +
      existing,
  )
})
