routerAdd('GET', '/backend/v1/export/longitudinal', (e) => {
  var userId = e.auth ? e.auth.id : ''
  if (!userId) return e.unauthorizedError('Não autorizado.')

  var query = e.requestInfo().query || {}
  var patientId = query['patientId'] || ''
  if (!patientId) return e.badRequestError('patientId é obrigatório.')

  var patient = null
  try {
    patient = $app.findRecordById('patients', patientId)
  } catch (_) {
    return e.forbiddenError('Paciente não encontrado ou não pertence ao usuário atual.')
  }

  if (patient.getString('createdBy') !== userId) {
    return e.forbiddenError('Paciente não encontrado ou não pertence ao usuário atual.')
  }

  var filter = "patientId = '" + patientId + "' && status = 'concluida'"
  var assessments = $app.findRecordsByFilter('assessments', filter, 'assessmentDate', 0, 0)

  if (assessments.length === 0) {
    return e.notFoundError('Nenhuma avaliação concluída encontrada para este paciente.')
  }

  function pick(obj, keys) {
    if (!obj || typeof obj !== 'object') return null
    for (var i = 0; i < keys.length; i++) {
      if (obj[keys[i]] !== undefined && obj[keys[i]] !== null && obj[keys[i]] !== '') {
        return obj[keys[i]]
      }
    }
    return null
  }

  function getNested(obj, key) {
    if (!obj || typeof obj !== 'object') return null
    if (obj[key] === undefined || obj[key] === null) return null
    return obj[key]
  }

  function fmtNum(val) {
    if (val == null || val === '') return ''
    var n
    if (typeof val === 'number') {
      n = val
    } else if (typeof val === 'string') {
      n = parseFloat(val)
    } else {
      return ''
    }
    if (isNaN(n)) return ''
    return String(n)
  }

  function pad2(n) {
    return n < 10 ? '0' + n : String(n)
  }

  function fmtDate(dateStr) {
    if (!dateStr) return ''
    var d = new Date(dateStr + 'T00:00:00')
    if (isNaN(d.getTime())) return ''
    return pad2(d.getDate()) + '/' + pad2(d.getMonth() + 1) + '/' + d.getFullYear()
  }

  function calcAge(birthDate, assessmentDate) {
    if (!birthDate || !assessmentDate) return ''
    var b = new Date(birthDate + 'T00:00:00')
    var a = new Date(assessmentDate + 'T00:00:00')
    if (isNaN(b.getTime()) || isNaN(a.getTime())) return ''
    var age = a.getFullYear() - b.getFullYear()
    var m = a.getMonth() - b.getMonth()
    if (m < 0 || (m === 0 && a.getDate() < b.getDate())) age--
    return String(age)
  }

  function csvEscape(val) {
    var s = String(val == null ? '' : val)
    if (
      s.indexOf(',') !== -1 ||
      s.indexOf('"') !== -1 ||
      s.indexOf('\n') !== -1 ||
      s.indexOf('\r') !== -1
    ) {
      s = '"' + s.replace(/"/g, '""') + '"'
    }
    return s
  }

  function getJson(record, field) {
    var val = record.get(field)
    if (val == null) return {}
    if (typeof val === 'object') return val
    if (typeof val === 'string') {
      if (val === '') return {}
      try {
        return JSON.parse(val)
      } catch (_) {
        return {}
      }
    }
    return {}
  }

  var birthDate = patient.getString('birthDate')
  var patientWeight = patient.get('weight')
  var patientHeight = patient.get('height')

  var pw = typeof patientWeight === 'number' ? patientWeight : parseFloat(patientWeight)
  var ph = typeof patientHeight === 'number' ? patientHeight : parseFloat(patientHeight)
  var imc = ''
  if (!isNaN(pw) && !isNaN(ph) && pw > 0 && ph > 0) {
    imc = (pw / (ph * ph)).toFixed(1)
  }

  var headers = [
    'Data da Avaliação',
    'Idade',
    'Peso (kg)',
    'Estatura (m)',
    'IMC',
    'PA Sistolica (mmHg)',
    'PA Diastolica (mmHg)',
    'FC (bpm)',
    'FR (irpm)',
    'SpO2 (%)',
    'Temp Axilar (C)',
    'Massa Magra Total (kg)',
    'Massa Muscular Esqueletica (kg)',
    'Massa Gorda (kg)',
    '% Gordura',
    'Massa Muscular Apendicular (kg)',
    'ALMI (kg/m2)',
    'Angulo de Fase (graus)',
    'Agua Corporal Total (L)',
    'TMB (kcal)',
    'Circ. Panturrilha (cm)',
    'Circ. Cintura (cm)',
    'Somatotipo',
    'Handgrip Direita (kg)',
    'Handgrip Esquerda (kg)',
    'Handgrip Maximo (kg)',
    'Handgrip Percentil',
    'Chair Stand (s)',
    'TUG Simples (s)',
    'TUG Dupla Tarefa (s)',
    'SPPB Equilibrio (0-4)',
    'SPPB Velocidade Marcha (0-4)',
    'SPPB Levantar Cadeira (0-4)',
    'SPPB Total (0-12)',
    'Estabilometria Area OA (cm2)',
    'Estabilometria Velocidade OA (cm/s)',
    'Estabilometria AP OA (cm)',
    'Estabilometria ML OA (cm)',
    'Estabilometria Area OF (cm2)',
    'Estabilometria Velocidade OF (cm/s)',
    'Estabilometria AP OF (cm)',
    'Estabilometria ML OF (cm)',
    'PImax Atual (cmH2O)',
    'PImax Previsto (cmH2O)',
    'PImax % Previsto',
    'PEmax Atual (cmH2O)',
    'PEmax Previsto (cmH2O)',
    'PEmax % Previsto',
    'CVF Atual (L)',
    'CVF Previsto (L)',
    'CVF % Previsto',
    'VEF1 Atual (L)',
    'VEF1 Previsto (L)',
    'VEF1 % Previsto',
    'VEF1/CVF (%)',
    'FEF25-75 Atual (L/s)',
    'FEF25-75 Previsto (L/s)',
    'FEF25-75 % Previsto',
    'PFE Atual (L/s)',
    'PFE Previsto (L/s)',
    'PFE % Previsto',
    'Padrao Espirometrico',
    'SARC-F Forca',
    'SARC-F Caminhar',
    'SARC-F Cadeira',
    'SARC-F Escadas',
    'SARC-F Quedas',
    'SARC-F Total',
    'SARC-CalF Total',
    'Diagnostico EWGSOP2',
    'Reavaliacao (meses)',
  ]

  var dxMap = {
    sem_sarcopenia: 'Sem sarcopenia',
    sarcopenia: 'Sarcopenia provavel',
    sarcopenia_grave: 'Sarcopenia grave',
    nao_avaliado: 'Não avaliado',
  }

  var rows = []
  for (var i = 0; i < assessments.length; i++) {
    var a = assessments[i]
    var assessmentDate = a.getString('assessmentDate')

    var vitals = getJson(a, 'vitals')
    var bodyComp = getJson(a, 'bodyComposition')
    var anthro = getJson(a, 'anthropometry')
    var muscle = getJson(a, 'muscleStrength')
    var balance = getJson(a, 'balanceAssessment')
    var resp = getJson(a, 'respiratoryStrength')
    var spiro = getJson(a, 'spirometry')
    var sarc = getJson(a, 'sarcopeniaScreening')

    var bp = pick(vitals, ['bloodPressure'])
    var sys = '',
      dia = ''
    if (typeof bp === 'string' && bp.indexOf('/') !== -1) {
      var parts = bp.split('/')
      sys = parts[0] ? parts[0].trim() : ''
      dia = parts[1] ? parts[1].trim() : ''
    } else {
      sys = fmtNum(pick(vitals, ['bloodPressureSystolic', 'systolic']))
      dia = fmtNum(pick(vitals, ['bloodPressureDiastolic', 'diastolic']))
    }

    var stabOpen = pick(balance, ['stabEyesOpen', 'stabilometryEyesOpen'])
    var stabClosed = pick(balance, ['stabEyesClosed', 'stabilometryEyesClosed'])

    var dx = a.getString('finalDiagnosis')
    var dxLabel = dxMap[dx] || dx || ''

    var row = [
      fmtDate(assessmentDate),
      calcAge(birthDate, assessmentDate),
      fmtNum(patientWeight),
      fmtNum(patientHeight),
      imc,
      sys,
      dia,
      fmtNum(pick(vitals, ['heartRate'])),
      fmtNum(pick(vitals, ['respiratoryRate'])),
      fmtNum(pick(vitals, ['oxygenSaturation'])),
      fmtNum(pick(vitals, ['axillaryTemp', 'temperature'])),
      fmtNum(pick(bodyComp, ['leanMass'])),
      fmtNum(pick(bodyComp, ['skeletalMuscleMass'])),
      fmtNum(pick(bodyComp, ['fatMass'])),
      fmtNum(pick(bodyComp, ['fatPercentage'])),
      fmtNum(pick(bodyComp, ['appendicularMuscleMass'])),
      fmtNum(pick(bodyComp, ['almi'])),
      fmtNum(pick(bodyComp, ['phaseAngle'])),
      fmtNum(pick(bodyComp, ['totalBodyWater'])),
      fmtNum(pick(bodyComp, ['basalMetabolicRate'])),
      fmtNum(pick(anthro, ['calfCircumference'])),
      fmtNum(pick(anthro, ['waistCircumference'])),
      pick(anthro, ['somatotype']) || '',
      fmtNum(pick(muscle, ['handgripRight'])),
      fmtNum(pick(muscle, ['handgripLeft'])),
      fmtNum(pick(muscle, ['handgripMax'])),
      fmtNum(pick(muscle, ['handgripPercentile'])),
      fmtNum(pick(muscle, ['chairStandTime'])),
      fmtNum(pick(balance, ['tugSimple'])),
      fmtNum(pick(balance, ['tugDualTask'])),
      fmtNum(pick(balance, ['sppbBalance'])),
      fmtNum(pick(balance, ['sppbGaitSpeed', 'sppbGait'])),
      fmtNum(pick(balance, ['sppbChairStand', 'sppbChair'])),
      fmtNum(pick(balance, ['sppbTotal'])),
      fmtNum(getNested(stabOpen, 'area')),
      fmtNum(getNested(stabOpen, 'velocity')),
      fmtNum(getNested(stabOpen, 'APDisplacement')),
      fmtNum(getNested(stabOpen, 'MLDisplacement')),
      fmtNum(getNested(stabClosed, 'area')),
      fmtNum(getNested(stabClosed, 'velocity')),
      fmtNum(getNested(stabClosed, 'APDisplacement')),
      fmtNum(getNested(stabClosed, 'MLDisplacement')),
      fmtNum(pick(resp, ['pimaxCurrent', 'pimaxActual'])),
      fmtNum(pick(resp, ['pimaxPredicted'])),
      fmtNum(pick(resp, ['pimaxPercentage', 'pimaxPercent'])),
      fmtNum(pick(resp, ['pemaxCurrent', 'pemaxActual'])),
      fmtNum(pick(resp, ['pemaxPredicted'])),
      fmtNum(pick(resp, ['pemaxPercentage', 'pemaxPercent'])),
      fmtNum(pick(spiro, ['cvfCurrent', 'fvc'])),
      fmtNum(pick(spiro, ['cvfPredicted', 'fvcPredicted'])),
      fmtNum(pick(spiro, ['cvfPercentage', 'fvcPercent'])),
      fmtNum(pick(spiro, ['vef1Current', 'fev1'])),
      fmtNum(pick(spiro, ['vef1Predicted', 'fev1Predicted'])),
      fmtNum(pick(spiro, ['vef1Percentage', 'fev1Percent'])),
      fmtNum(pick(spiro, ['vef1CvfRatio', 'fev1FvcRatio'])),
      fmtNum(pick(spiro, ['fef2575Current', 'fef2575'])),
      fmtNum(pick(spiro, ['fef2575Predicted'])),
      fmtNum(pick(spiro, ['fef2575Percentage', 'fef2575Percent'])),
      fmtNum(pick(spiro, ['pfeCurrent', 'peakExpiratoryFlow'])),
      fmtNum(pick(spiro, ['pfePredicted', 'peakExpiratoryFlowPredicted'])),
      fmtNum(pick(spiro, ['pfePercentage', 'peakExpiratoryFlowPercent'])),
      pick(spiro, ['pattern']) || '',
      fmtNum(pick(sarc, ['sarcfStrength', 'strength'])),
      fmtNum(pick(sarc, ['sarcfWalking', 'assistanceWalking'])),
      fmtNum(pick(sarc, ['sarcfChairStand', 'riseChair'])),
      fmtNum(pick(sarc, ['sarcfStairs', 'climbStairs'])),
      fmtNum(pick(sarc, ['sarcfFalls', 'falls'])),
      fmtNum(pick(sarc, ['sarcfTotal', 'sarcFTotal'])),
      fmtNum(pick(sarc, ['sarcCalfTotal', 'sarcCalFTotal'])),
      dxLabel,
      fmtNum(a.get('reassessmentMonths')),
    ]

    rows.push(row.map(csvEscape).join(','))
  }

  var csvStr = '\uFEFF' + headers.map(csvEscape).join(',') + '\n' + rows.join('\n')

  var byteArr = []
  for (var j = 0; j < csvStr.length; j++) {
    var c = csvStr.charCodeAt(j)
    if (c < 0x80) {
      byteArr.push(c)
    } else if (c < 0x800) {
      byteArr.push(0xc0 | (c >> 6))
      byteArr.push(0x80 | (c & 0x3f))
    } else {
      byteArr.push(0xe0 | (c >> 12))
      byteArr.push(0x80 | ((c >> 6) & 0x3f))
      byteArr.push(0x80 | (c & 0x3f))
    }
  }

  var patientName = patient.getString('name').replace(/ /g, '_').replace(/"/g, '')
  var now = new Date()
  var dateStr = now.getFullYear() + pad2(now.getMonth() + 1) + pad2(now.getDate())
  var filename = 'longitudinal_' + patientName + '_' + dateStr + '.csv'

  e.response.header().set('Content-Disposition', 'attachment; filename="' + filename + '"')

  var bytes
  try {
    bytes = new Uint8Array(byteArr)
  } catch (_) {
    bytes = byteArr
  }
  return e.blob(200, 'text/csv; charset=utf-8', bytes)
})
