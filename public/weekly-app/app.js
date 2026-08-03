const officialRosterVersion = '2026-official-staff-01';
const officialStaffAccounts = [
  { name: 'Rodel L. Pompa' },
  { name: 'John Aldrich R. Vinzon' },
  { name: 'Mila D. Lim' },
  { name: 'Richelle M. Degala' },
  { name: 'Eng. Hidy C. Flores' },
  { name: 'Kristine Joy M. Torres' },
  { name: 'Mellette B. Musico' },
  { name: 'Rose Ann O. Marasigan' },
  { name: 'Lorie May S. Tabilisma' },
  { name: 'Jess Mark R. Macalalad' },
  { name: 'Aleckz Andrea Rose M. Marayan' },
  { name: 'Kezzer G. Fabregas' },
  { name: 'Dra. Ithiel M. Maalihan' },
  { name: 'Robert A. Merabete, Jr.' },
  { name: 'Richman M. Bugarin' },
  { name: 'Princess Joy C. Villarba' },
  { name: 'Joshua Vargas' },
  { name: 'Diana Rose Pedragoza' },
  { name: 'Jaime M. Cupiado' },
  { name: 'Aquilito S. Constantino' },
  { name: 'Junnel F. Hernandez' },
  { name: 'Elias G. Burgos' },
  { name: 'Cheridan M. Faildo' },
  { name: 'Melanio O. Mapacpac' }
];
const defaultStaff = officialStaffAccounts.map((account) => account.name);

const programs = ['Rice', 'HVCC', 'Corn', 'Livestock', 'Fishery', 'Biosystems Engineering'];
const plusFactors = {
  'Regular Work': 0,
  Planning: 5,
  Mapping: 8,
  'System Maintenance': 8,
  'System Creation': 10
};
const allCropStages = ['Land preparation', 'Seedbed', 'Newly planted', 'Vegetative', 'Reproductive', 'Maturity', 'Harvesting', 'Marketing'];
const nonRatedAccomplishmentTypes = ['Absent', 'Leave', 'Official Travel'];
const sharedTaReportRubric = [
  {
    label: 'Dates checked and current period covered',
    stages: allCropStages,
    detect: (plan, text) => Boolean(plan.accomplishmentDate || plan.datePlanned || plan.weekStart || /\b(date|week|period|covered|conducted)\b/.test(text))
  },
  {
    label: 'Technical assistance evidence',
    stages: allCropStages,
    detect: (plan, text) => Boolean(plan.taLatitude || plan.taLongitude || plan.taPhotoData || /\b(technical assistance|assisted|advised|consultation|field visit|validated|inspection|training)\b/.test(text))
  },
  { label: 'Client concern / purpose of assistance', stages: allCropStages, keywords: ['concern', 'request', 'purpose', 'client', 'farmer', 'raiser', 'fisherfolk', 'beneficiary', 'complaint', 'issue'] },
  { label: 'Challenges / constraints encountered', stages: allCropStages, keywords: ['challenge', 'constraint', 'problem', 'issue', 'concern', 'lack', 'shortage', 'delayed', 'damage', 'difficulty'] },
  { label: 'Recommendations / interventions / follow-up', stages: allCropStages, keywords: ['recommend', 'recommendation', 'intervention', 'follow-up', 'follow up', 'advised', 'next step', 'action needed', 'solution'] }
];
const cropTaReportRubric = [
  { label: 'Fertilizers / pesticides used', stages: ['Vegetative', 'Reproductive'], keywords: ['fertilizer', 'fertiliser', 'urea', 'complete', '14-14-14', '16-20-0', 'pesticide', 'insecticide', 'herbicide', 'fungicide', 'chemical', 'spray'] },
  { label: 'Farming practices / strategies', stages: ['Land preparation', 'Seedbed', 'Newly planted', 'Vegetative'], keywords: ['practice', 'strategy', 'method', 'planting', 'spacing', 'transplant', 'direct seeding', 'land preparation', 'cultural management', 'farm management'] },
  { label: 'Crop variety / seed type and source', stages: ['Seedbed', 'Newly planted'], keywords: ['variety', 'seed', 'hybrid', 'inbred', 'certified seed', 'seed source', 'seedling', 'breed', 'stock'] },
  { label: 'Soil condition / land preparation', stages: ['Land preparation', 'Newly planted'], keywords: ['soil', 'land preparation', 'plow', 'harrow', 'tillage', 'muddy', 'dry soil', 'soil condition', 'field condition'] },
  { label: 'Irrigation / water management', stages: ['Land preparation', 'Seedbed', 'Newly planted', 'Vegetative', 'Reproductive'], keywords: ['irrigation', 'water', 'canal', 'pump', 'drainage', 'flooding', 'moisture', 'water management'] },
  { label: 'Pest and disease incidence / control', stages: ['Seedbed', 'Newly planted', 'Vegetative', 'Reproductive', 'Maturity'], keywords: ['pest', 'disease', 'insect', 'rat', 'bug', 'armyworm', 'stemborer', 'blast', 'bacterial', 'control', 'infestation', 'damage'] },
  { label: 'Current crop condition / stage of growth', stages: ['Seedbed', 'Newly planted', 'Vegetative', 'Reproductive', 'Maturity'], keywords: ['crop condition', 'condition', 'vegetative', 'flowering', 'tillering', 'booting', 'maturity', 'growth stage', 'healthy', 'stunted'] },
  { label: 'Estimated yield / comparison', stages: ['Reproductive', 'Maturity', 'Harvesting'], keywords: ['yield', 'estimated production', 'production', 'harvest estimate', 'bags', 'tons', 'cavans', 'comparison', 'compared'] },
  { label: 'Innovative or best practices observed', stages: ['Vegetative', 'Reproductive', 'Maturity'], keywords: ['innovation', 'innovative', 'best practice', 'good practice', 'improved', 'technology', 'demo', 'adapted'] },
  { label: 'Harvesting / post-harvest practices', stages: ['Maturity', 'Harvesting'], keywords: ['harvest', 'post-harvest', 'post harvest', 'drying', 'milling', 'storage', 'threshing', 'processing'] },
  { label: 'Marketing information', stages: ['Marketing'], keywords: ['market', 'price', 'buyer', 'trader', 'selling', 'marketing', 'demand', 'farmgate'] }
];
const livestockTaReportRubric = [
  { label: 'Animal species / number / production stage', keywords: ['livestock', 'animal', 'cattle', 'carabao', 'swine', 'hog', 'goat', 'poultry', 'chicken', 'duck', 'head', 'herd', 'flock', 'breeder', 'grower'] },
  { label: 'Health condition / disease signs / mortality', keywords: ['health', 'disease', 'sick', 'symptom', 'mortality', 'death', 'fever', 'diarrhea', 'wound', 'infection', 'parasite'] },
  { label: 'Feeds / nutrition / housing management', keywords: ['feed', 'feeding', 'nutrition', 'forage', 'housing', 'pen', 'shelter', 'waterer', 'sanitation', 'management'] },
  { label: 'Vaccination / treatment / veterinary referral', keywords: ['vaccine', 'vaccination', 'treatment', 'deworm', 'medicine', 'antibiotic', 'veterinary', 'vet', 'referral'] }
];
const fisheryTaReportRubric = [
  { label: 'Fishery commodity / culture or capture activity', keywords: ['fish', 'fishery', 'tilapia', 'bangus', 'shrimp', 'aquaculture', 'pond', 'cage', 'capture', 'fishing', 'fisherfolk'] },
  { label: 'Water condition / pond or coastal site condition', keywords: ['water', 'pond', 'coastal', 'salinity', 'oxygen', 'ph', 'turbidity', 'algae', 'site condition', 'habitat'] },
  { label: 'Stocking / feeding / gear or production practices', keywords: ['stocking', 'fingerling', 'feed', 'feeding', 'gear', 'net', 'boat', 'production practice', 'culture management'] },
  { label: 'Fish health / losses / regulatory concern', keywords: ['fish kill', 'disease', 'mortality', 'loss', 'damage', 'illegal', 'registration', 'license', 'permit', 'compliance'] }
];
const biosystemsTaReportRubric = [
  { label: 'Project / equipment / facility inspected', keywords: ['project', 'equipment', 'facility', 'machinery', 'irrigation', 'greenhouse', 'dryer', 'post-harvest', 'structure', 'system'] },
  { label: 'Technical condition / progress / defect observed', keywords: ['condition', 'progress', 'defect', 'damage', 'repair', 'maintenance', 'calibration', 'inspection', 'validation', 'operation'] },
  { label: 'Beneficiary / contractor / operator coordination', keywords: ['beneficiary', 'contractor', 'operator', 'coordination', 'turnover', 'training', 'orientation', 'client'] },
  { label: 'Engineering recommendation / action required', keywords: ['engineering', 'recommend', 'action', 'required', 'design', 'specification', 'measurement', 'follow-up', 'correction'] }
];
const storageKey = 'weekly-itinerary-accomplishment-monitor-v1';
const staffStorageKey = 'weekly-accomplishment-staff-v1';
const signatoryStorageKey = 'weekly-accomplishment-signatories-v1';
const accessStorageKey = 'weekly-accomplishment-access-v1';
const sessionStorageKey = 'weekly-accomplishment-session-v1';
const apiBaseUrl = window.location.hostname.endsWith('github.io')
  ? 'https://weekly-accomplishment-monitor.daphneisolde.chatgpt.site'
  : '';
const sharedStateEndpoint = `${apiBaseUrl}/api/weekly-state`;
const loginEndpoint = `${apiBaseUrl}/api/login`;
const logoutEndpoint = `${apiBaseUrl}/api/logout`;
let sharedStateReady = false;
let sharedSaveTimer = null;
let applyingSharedState = false;

const defaultSignatories = {
  preparedBy: 'Staff / Encoder',
  preparedByTitle: 'Agricultural Technologist/AEW',
  reviewedBy: 'RODEL L. POMPA',
  reviewedByTitle: 'Senior Agriculturist',
  approvedBy: 'DANNY S. VILLACRUSIS',
  approvedByTitle: 'Municipal Agriculturist'
};

const defaultAccess = {
  rosterVersion: officialRosterVersion,
  staffPassword: '',
  adminPassword: '',
  viewerPassword: '',
  staffAccounts: officialStaffAccounts.map((account) => ({ ...account })),
  staffCanPlan: true,
  staffCanAccomplish: true,
  staffCanBossTask: false
};

const state = {
  staff: [],
  plans: [],
  signatories: { ...defaultSignatories },
  access: { ...defaultAccess },
  session: { role: '', staffName: '' },
  staffFilter: 'All',
  programFilter: 'All',
  activeView: 'itineraryView',
  boundary: null,
  mapView: null,
  mapDrag: null
};

const els = {
  weekStart: document.querySelector('#weekStart'),
  loginScreen: document.querySelector('#loginScreen'),
  loginForm: document.querySelector('#loginForm'),
  loginRole: document.querySelector('#loginRole'),
  loginStaffField: document.querySelector('#loginStaffField'),
  loginStaff: document.querySelector('#loginStaff'),
  loginPassword: document.querySelector('#loginPassword'),
  loginMessage: document.querySelector('#loginMessage'),
  sessionBadge: document.querySelector('#sessionBadge'),
  weekEnd: document.querySelector('#weekEnd'),
  staffFilter: document.querySelector('#staffFilter'),
  programFilter: document.querySelector('#programFilter'),
  plannedTasks: document.querySelector('#plannedTasks'),
  conductedTasks: document.querySelector('#conductedTasks'),
  justificationNeeded: document.querySelector('#justificationNeeded'),
  overallEfficiency: document.querySelector('#overallEfficiency'),
  overallReportGrade: document.querySelector('#overallReportGrade'),
  planRows: document.querySelector('#planRows'),
  accomplishmentRows: document.querySelector('#accomplishmentRows'),
  dashboardRows: document.querySelector('#dashboardRows'),
  staffList: document.querySelector('#staffList'),
  notConductedCount: document.querySelector('#notConductedCount'),
  bossInstructionCount: document.querySelector('#bossInstructionCount'),
  bossTaskRating: document.querySelector('#bossTaskRating'),
  averageReportGrade: document.querySelector('#averageReportGrade'),
  planForm: document.querySelector('#planForm'),
  planId: document.querySelector('#planId'),
  planStaff: document.querySelector('#planStaff'),
  planDate: document.querySelector('#planDate'),
  planProgram: document.querySelector('#planProgram'),
  planWorkType: document.querySelector('#planWorkType'),
  planPlace: document.querySelector('#planPlace'),
  planTask: document.querySelector('#planTask'),
  planClients: document.querySelector('#planClients'),
  planTechnicalAssistance: document.querySelector('#planTechnicalAssistance'),
  accomplishmentForm: document.querySelector('#accomplishmentForm'),
  accomplishmentPlanId: document.querySelector('#accomplishmentPlanId'),
  accomplishmentStaff: document.querySelector('#accomplishmentStaff'),
  accomplishmentDate: document.querySelector('#accomplishmentDate'),
  accomplishmentType: document.querySelector('#accomplishmentType'),
  accomplishmentPercent: document.querySelector('#accomplishmentPercent'),
  accomplishmentWorkType: document.querySelector('#accomplishmentWorkType'),
  adjustedScorePreview: document.querySelector('#adjustedScorePreview'),
  accomplishmentOutput: document.querySelector('#accomplishmentOutput'),
  accomplishmentJustification: document.querySelector('#accomplishmentJustification'),
  accomplishmentTechnicalAssistance: document.querySelector('#accomplishmentTechnicalAssistance'),
  taPhotoInput: document.querySelector('#taPhotoInput'),
  captureLocationBtn: document.querySelector('#captureLocationBtn'),
  locationStatus: document.querySelector('#locationStatus'),
  taPhotoPreview: document.querySelector('#taPhotoPreview'),
  cropStage: document.querySelector('#cropStage'),
  reportDetails: document.querySelector('#reportDetails'),
  autoChecklistPreview: document.querySelector('#autoChecklistPreview'),
  reportGradePreview: document.querySelector('#reportGradePreview'),
  totalPlusFactor: document.querySelector('#totalPlusFactor'),
  averageAdjustedScore: document.querySelector('#averageAdjustedScore'),
  performanceChart: document.querySelector('#performanceChart'),
  fieldMap: document.querySelector('#fieldMap'),
  installAppBtn: document.querySelector('#installAppBtn'),
  adminModal: document.querySelector('#adminModal'),
  newStaffNameInput: document.querySelector('#newStaffNameInput'),
  newStaffPasswordInput: document.querySelector('#newStaffPasswordInput'),
  addStaffAccountBtn: document.querySelector('#addStaffAccountBtn'),
  staffAccountList: document.querySelector('#staffAccountList'),
  staffNamesInput: document.querySelector('#staffNamesInput'),
  staffPasswordInput: document.querySelector('#staffPasswordInput'),
  viewerPasswordInput: document.querySelector('#viewerPasswordInput'),
  adminPasswordInput: document.querySelector('#adminPasswordInput'),
  staffCanPlanInput: document.querySelector('#staffCanPlanInput'),
  staffCanAccomplishInput: document.querySelector('#staffCanAccomplishInput'),
  staffCanBossTaskInput: document.querySelector('#staffCanBossTaskInput'),
  preparedByInput: document.querySelector('#preparedByInput'),
  preparedByTitleInput: document.querySelector('#preparedByTitleInput'),
  reviewedByInput: document.querySelector('#reviewedByInput'),
  reviewedByTitleInput: document.querySelector('#reviewedByTitleInput'),
  approvedByInput: document.querySelector('#approvedByInput'),
  approvedByTitleInput: document.querySelector('#approvedByTitleInput'),
  preparedByPrint: document.querySelector('#preparedByPrint'),
  preparedByTitlePrint: document.querySelector('#preparedByTitlePrint'),
  reviewedByPrint: document.querySelector('#reviewedByPrint'),
  reviewedByTitlePrint: document.querySelector('#reviewedByTitlePrint'),
  approvedByPrint: document.querySelector('#approvedByPrint'),
  approvedByTitlePrint: document.querySelector('#approvedByTitlePrint')
};

let deferredInstallPrompt = null;

function isAdmin() {
  return state.session.role === 'admin';
}

function isStaff() {
  return state.session.role === 'staff';
}

function isViewer() {
  return state.session.role === 'viewer';
}

function staffAccountLines() {
  return state.access.staffAccounts.map((account) => `${account.name} | ${account.password}`).join('\n');
}

function authHeaders() {
  return state.session.token ? { authorization: `Bearer ${state.session.token}` } : {};
}

function parseStaffAccountLines(value) {
  return value
    .split('\n')
    .map((line) => {
      const [namePart, passwordPart] = line.split('|');
      return {
        name: (namePart || '').trim(),
        password: (passwordPart || '').trim()
      };
    })
    .filter((account) => account.name);
}

function syncStaffAccountTextarea(accounts) {
  els.staffNamesInput.value = accounts.map((account) => `${account.name} | ${account.password}`).join('\n');
}

function staffAccountsFromAdminForm() {
  const defaultStaffPassword = els.staffPasswordInput.value.trim() || defaultAccess.staffPassword;
  const previousAccounts = state.access.staffAccounts || [];
  const accounts = parseStaffAccountLines(els.staffNamesInput.value).map((account) => {
    const existing = previousAccounts.find((item) => item.name === account.name);
    return {
      name: account.name,
      password: account.password || (existing && existing.password) || defaultStaffPassword
    };
  });
  return accounts.filter((account, index, list) => (
    list.findIndex((item) => item.name.toLowerCase() === account.name.toLowerCase()) === index
  ));
}

function renderStaffAccountManager() {
  if (!els.staffAccountList) return;
  const accounts = staffAccountsFromAdminForm();
  els.staffAccountList.innerHTML = '';
  accounts.forEach((account, index) => {
    const row = document.createElement('article');
    row.className = 'account-row';
    row.innerHTML = `
      <div>
        <strong>${escapeHtml(account.name)}</strong>
        <span>Password</span>
      </div>
      <input type="text" value="${escapeHtml(account.password)}" data-account-password="${index}" aria-label="Password for ${escapeHtml(account.name)}" />
      <button class="delete-btn" type="button" data-delete-account="${index}">Delete</button>
    `;
    els.staffAccountList.append(row);
  });
}

function passwordForStaff(name) {
  const account = state.access.staffAccounts.find((item) => item.name === name);
  return account ? account.password : state.access.staffPassword;
}

function normalizedReportText(plan) {
  return [
    plan.staffName,
    plan.program,
    plan.place,
    plan.task,
    plan.clients,
    plan.accomplishmentOutput,
    plan.justification,
    plan.reportDetails
  ].filter(Boolean).join(' ').toLowerCase();
}

function systemDetectsTechnicalAssistance(plan) {
  if (isNonRatedOfficialStatus(plan)) return false;
  const text = normalizedReportText(plan);
  const assistancePattern = /\b(technical assistance|ta\b|field visit|farm visit|site visit|assisted|assist|advised|consultation|consulted|validated|validation|inspection|inspected|training|coaching|demonstration|demo|diagnosis|recommendation|intervention|follow-up|follow up|client concern|farmer|grower|raiser|fisherfolk|beneficiary)\b/;
  const programPattern = /\b(crop|rice|corn|hvcc|vegetable|livestock|animal|swine|hog|cattle|carabao|goat|poultry|fishery|fish|pond|coastal|biosystems|engineering|equipment|facility|irrigation|post-harvest|project site)\b/;
  return Boolean(
    plan.taLatitude ||
    plan.taLongitude ||
    plan.taPhotoData ||
    assistancePattern.test(text) ||
    (programPattern.test(text) && /\b(client|farmer|grower|raiser|fisherfolk|beneficiary|field|site|barangay|farm|pond|project)\b/.test(text))
  );
}

function technicalAssistanceApplies(plan) {
  return systemDetectsTechnicalAssistance(plan);
}

function cropStageFor(plan) {
  return allCropStages.includes(plan.cropStage) ? plan.cropStage : 'Not crop-specific';
}

function isCropProgram(program = '') {
  return ['Rice', 'HVCC', 'Corn'].includes(program);
}

function uniqueRubricItems(items) {
  const byLabel = new Map();
  items.forEach((item) => {
    if (!byLabel.has(item.label)) byLabel.set(item.label, item);
  });
  return [...byLabel.values()];
}

function applicableReportItems(plan) {
  const stage = cropStageFor(plan);
  let programItems = cropTaReportRubric;
  if (plan.program === 'Livestock') programItems = livestockTaReportRubric;
  if (plan.program === 'Fishery') programItems = fisheryTaReportRubric;
  if (plan.program === 'Biosystems Engineering') programItems = biosystemsTaReportRubric;
  if (isCropProgram(plan.program)) {
    const cropItems = stage === 'Not crop-specific'
      ? cropTaReportRubric
      : cropTaReportRubric.filter((item) => !item.stages || item.stages.includes(stage));
    return uniqueRubricItems([...sharedTaReportRubric, ...cropItems]);
  }
  return uniqueRubricItems([...sharedTaReportRubric, ...programItems]);
}

function detectedReportItems(plan) {
  if (!technicalAssistanceApplies(plan)) return [];
  const text = normalizedReportText(plan);
  return applicableReportItems(plan)
    .filter((item) => {
      if (item.detect) return item.detect(plan, text);
      return item.keywords.some((keyword) => text.includes(keyword));
    })
    .map((item) => item.label);
}

function reportGrade(plan) {
  if (!technicalAssistanceApplies(plan)) return null;
  const checkedItems = detectedReportItems(plan).length;
  const applicableItems = applicableReportItems(plan).length || sharedTaReportRubric.length;
  return Math.round((checkedItems / applicableItems) * 100);
}

function reportGradeClass(grade) {
  if (grade === null || grade === undefined) return 'not-applicable';
  if (grade >= 90) return 'excellent';
  if (grade >= 75) return 'good';
  if (grade >= 60) return 'fair';
  return 'needs-work';
}

function reportGradeText(plan) {
  const grade = reportGrade(plan);
  if (grade === null || grade === undefined) return 'N/A';
  return `${grade}%`;
}

function plusFactorFor(plan) {
  return plusFactors[plan.workType || 'Regular Work'] || 0;
}

function earnedPlusFactor(plan) {
  if (!plan.accomplishmentType || plan.accomplishmentType === 'Not Conducted - Justified' || isNonRatedOfficialStatus(plan)) return 0;
  return plusFactorFor(plan);
}

function adjustedScore(plan) {
  if (!plan.accomplishmentType || plan.accomplishmentType === 'Not Conducted - Justified' || isNonRatedOfficialStatus(plan)) return 0;
  const base = Number(plan.accomplishmentPercent || 0);
  return Math.min(100, base + earnedPlusFactor(plan));
}

function adjustedScoreText(plan) {
  if (!plan.accomplishmentType) return 'Pending';
  if (isNonRatedOfficialStatus(plan)) return 'Excluded from rating';
  return `${adjustedScore(plan)}% (+${earnedPlusFactor(plan)})`;
}

function isNonRatedOfficialStatus(plan) {
  return nonRatedAccomplishmentTypes.includes(plan.accomplishmentType);
}

function createId(index = 0) {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}-${index}`;
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function startOfWeek(date) {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = copy.getDate() - day + (day === 0 ? -6 : 1);
  copy.setDate(diff);
  return copy;
}

function toDateInputValue(date) {
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date - tzOffset).toISOString().slice(0, 10);
}

function addDays(dateValue, days) {
  const date = new Date(`${dateValue}T00:00:00`);
  date.setDate(date.getDate() + days);
  return toDateInputValue(date);
}

function setDefaultDates() {
  const start = startOfWeek(new Date());
  const end = new Date(start);
  end.setDate(start.getDate() + 4);
  els.weekStart.value = toDateInputValue(start);
  els.weekEnd.value = toDateInputValue(end);
}

function samplePlans() {
  const weekStart = els.weekStart.value;
  return [
    ['Rodel L. Pompa', 0, 'Rice', 'Municipal Agriculture Office', 'Prepare rice program weekly coordination plan', 'Rice farmers association presidents', 'Conducted', 100, 'Coordination completed and encoded.'],
    ['John Aldrich R. Vinzon', 1, 'HVCC', 'Barangay market area', 'Validate HVCC client concerns and update profile list', 'Vegetable growers and traders', 'Not Conducted - Justified', 0, 'Client group requested rescheduling due to conflict.'],
    ['Mila D. Lim', 2, 'Livestock', 'MAO records section', 'Consolidate livestock service requests for the week', 'Livestock raisers', 'Conducted', 100, 'Service request list completed.'],
    ['Richelle M. Degala', 3, 'Fishery', 'Coastal barangay hall', 'Meet fishery clients for registration follow-up', 'Fisherfolk association officers', 'Boss Instruction', 95, 'Instructed by the Boss to assist urgent office consolidation.'],
    ['Eng. Hidy C. Flores', 4, 'Biosystems Engineering', 'Project site', 'Inspect biosystems engineering activity progress', 'Contractor and beneficiary group', 'Conducted', 100, 'Inspection notes and photos submitted.']
  ].map((item, index) => ({
    id: createId(index),
    staffName: item[0],
    weekStart,
    weekEnd: els.weekEnd.value,
    datePlanned: addDays(weekStart, item[1]),
    program: item[2],
    workType: index === 0 ? 'Planning' : index === 4 ? 'Mapping' : 'Regular Work',
    place: item[3],
    task: item[4],
    clients: item[5],
    technicalAssistance: index < 3,
    accomplishmentType: item[6],
    accomplishmentDate: addDays(weekStart, item[1]),
    accomplishmentPercent: item[7],
    accomplishmentOutput: item[6] === 'Boss Instruction' ? 'Urgent office consolidation instructed by the Boss' : item[4],
    justification: item[8],
    reportDetails: 'Report checked against the reporting reference guide. Technical observations and recommendations should be encoded here.'
  }));
}

function loadStaff() {
  const stored = localStorage.getItem(staffStorageKey);
  if (Array.isArray(state.access.staffAccounts) && state.access.staffAccounts.length) {
    state.staff = state.access.staffAccounts.map((account) => account.name).filter(Boolean);
    return;
  }
  state.staff = (stored ? JSON.parse(stored) : defaultStaff).filter(Boolean);
}

function saveStaff() {
  localStorage.setItem(staffStorageKey, JSON.stringify(state.staff));
  scheduleSharedStateSave();
}

function loadSignatories() {
  const stored = localStorage.getItem(signatoryStorageKey);
  state.signatories = { ...defaultSignatories, ...(stored ? JSON.parse(stored) : {}) };
  if (state.signatories.reviewedBy === 'Supervisor / Section Head') {
    state.signatories.reviewedBy = 'RODEL L. POMPA';
  }
  if (state.signatories.reviewedBy === 'Head Of Operations') {
    state.signatories.reviewedBy = 'RODEL L. POMPA';
  }
  if (state.signatories.reviewedByTitle === 'Reviewed by') {
    state.signatories.reviewedByTitle = 'Senior Agriculturist';
  }
  if (state.signatories.preparedByTitle === 'Prepared by') {
    state.signatories.preparedByTitle = 'Agricultural Technologist/AEW';
  }
}

function saveSignatories() {
  localStorage.setItem(signatoryStorageKey, JSON.stringify(state.signatories));
  scheduleSharedStateSave();
}

function renderSignatories() {
  els.preparedByPrint.textContent = state.signatories.preparedBy;
  els.preparedByTitlePrint.textContent = state.signatories.preparedByTitle;
  els.reviewedByPrint.textContent = state.signatories.reviewedBy;
  els.reviewedByTitlePrint.textContent = state.signatories.reviewedByTitle;
  els.approvedByPrint.textContent = state.signatories.approvedBy;
  els.approvedByTitlePrint.textContent = state.signatories.approvedByTitle;
}

function loadAccess() {
  const stored = localStorage.getItem(accessStorageKey);
  state.access = { ...defaultAccess, ...(stored ? JSON.parse(stored) : {}) };
  if (state.access.rosterVersion !== officialRosterVersion) {
    state.access.rosterVersion = officialRosterVersion;
    state.access.staffPassword = defaultAccess.staffPassword;
    state.access.staffAccounts = officialStaffAccounts.map((account) => ({ ...account }));
    if (!state.access.adminPassword || state.access.adminPassword === 'admin123') {
      state.access.adminPassword = defaultAccess.adminPassword;
    }
    saveAccess();
  }
  if (!Array.isArray(state.access.staffAccounts) || !state.access.staffAccounts.length) {
    const storedStaff = localStorage.getItem(staffStorageKey);
    const names = storedStaff ? JSON.parse(storedStaff) : defaultStaff;
    state.access.staffAccounts = names.map((name) => ({
      name,
      password: state.access.staffPassword || defaultAccess.staffPassword
    }));
  }
  state.access.staffAccounts = state.access.staffAccounts
    .map((account) => ({
      name: String(account.name || '').trim(),
      password: String(account.password || state.access.staffPassword || defaultAccess.staffPassword).trim()
    }))
    .filter((account) => account.name);
}

function saveAccess() {
  localStorage.setItem(accessStorageKey, JSON.stringify(state.access));
  scheduleSharedStateSave();
}

function loadSession() {
  const stored = sessionStorage.getItem(sessionStorageKey);
  state.session = stored ? JSON.parse(stored) : { role: '', staffName: '' };
}

function saveSession() {
  sessionStorage.setItem(sessionStorageKey, JSON.stringify(state.session));
}

function clearSession() {
  sessionStorage.removeItem(sessionStorageKey);
  state.session = { role: '', staffName: '', token: '' };
}

function loadPlans() {
  const stored = localStorage.getItem(storageKey);
  state.plans = stored ? JSON.parse(stored) : [];
}

function savePlans(options = {}) {
  localStorage.setItem(storageKey, JSON.stringify(state.plans));
  if (options.replaceSharedPlans) replaceSharedPlansNow();
  else scheduleSharedStateSave();
}

function sharedStatePayload() {
  return {
    plans: state.plans,
    staff: state.staff,
    access: state.access,
    signatories: state.signatories
  };
}

function hasSharedStateData(payload) {
  return Boolean(
    payload &&
    (
      (Array.isArray(payload.plans) && payload.plans.length) ||
      (Array.isArray(payload.staff) && payload.staff.length) ||
      (payload.access && Object.keys(payload.access).length) ||
      (payload.signatories && Object.keys(payload.signatories).length)
    )
  );
}

function mergePlans(remotePlans = [], localPlans = []) {
  const byId = new Map();
  [...remotePlans, ...localPlans].forEach((plan) => {
    if (!plan || !plan.id) return;
    byId.set(plan.id, { ...byId.get(plan.id), ...plan });
  });
  return [...byId.values()];
}

function persistSharedStateLocally() {
  localStorage.setItem(storageKey, JSON.stringify(state.plans));
  localStorage.setItem(staffStorageKey, JSON.stringify(state.staff));
  localStorage.setItem(accessStorageKey, JSON.stringify(state.access));
  localStorage.setItem(signatoryStorageKey, JSON.stringify(state.signatories));
}

async function pushSharedState(options = {}) {
  if (!options.replaceSharedPlans) {
    try {
      const response = await fetch(sharedStateEndpoint, { cache: 'no-store', headers: authHeaders() });
      if (response.ok) {
        const remoteState = await response.json();
        if (hasSharedStateData(remoteState)) {
          state.plans = mergePlans(remoteState.plans, state.plans);
          localStorage.setItem(storageKey, JSON.stringify(state.plans));
        }
      }
    } catch (error) {
      console.warn('Shared merge failed before save', error);
    }
  }

  await fetch(sharedStateEndpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...authHeaders() },
    body: JSON.stringify(sharedStatePayload())
  });
}

function scheduleSharedStateSave() {
  if (!sharedStateReady || applyingSharedState) return;
  clearTimeout(sharedSaveTimer);
  sharedSaveTimer = setTimeout(() => {
    pushSharedState().catch((error) => console.warn('Shared save failed', error));
  }, 500);
}

function replaceSharedPlansNow() {
  if (!sharedStateReady || applyingSharedState || !state.session.token) return;
  clearTimeout(sharedSaveTimer);
  pushSharedState({ replaceSharedPlans: true }).catch((error) => console.warn('Shared replace failed', error));
}

async function initializeSharedState() {
  try {
    const response = await fetch(sharedStateEndpoint, { cache: 'no-store', headers: authHeaders() });
    if (!response.ok) throw new Error(`Shared storage unavailable (${response.status})`);
    const remoteState = await response.json();

    applyingSharedState = true;
    if (hasSharedStateData(remoteState)) {
      const mergedPlans = mergePlans(remoteState.plans, state.plans);
      const localAddedRecords = mergedPlans.length > (Array.isArray(remoteState.plans) ? remoteState.plans.length : 0);

      state.plans = mergedPlans;
      state.access = { ...defaultAccess, ...(remoteState.access || {}) };
      state.signatories = { ...defaultSignatories, ...(remoteState.signatories || {}) };
      state.staff = Array.isArray(remoteState.staff) && remoteState.staff.length
        ? remoteState.staff.filter(Boolean)
        : state.access.staffAccounts.map((account) => account.name).filter(Boolean);

      persistSharedStateLocally();
      populateStaffSelects();
      renderAll();

      if (localAddedRecords && state.session.token) {
        await pushSharedState();
      }
    } else if (state.session.token) {
      await pushSharedState();
    }
  } catch (error) {
    console.warn('Shared storage is unavailable; using this device only for now.', error);
  } finally {
    applyingSharedState = false;
    sharedStateReady = true;
  }
}

function populateStaffSelects() {
  els.staffFilter.innerHTML = '<option value="All">All staff</option>';
  els.planStaff.innerHTML = '';
  els.accomplishmentStaff.innerHTML = '';
  els.loginStaff.innerHTML = '';
  state.staff.forEach((name) => {
    els.staffFilter.add(new Option(name, name));
    els.planStaff.add(new Option(name, name));
    els.accomplishmentStaff.add(new Option(name, name));
    els.loginStaff.add(new Option(name, name));
  });
}

function isInSelectedWeek(plan) {
  return plan.weekStart === els.weekStart.value && plan.weekEnd === els.weekEnd.value;
}

function filteredPlans() {
  return state.plans.filter((plan) => {
    const staffMatch = isStaff()
      ? plan.staffName === state.session.staffName
      : state.staffFilter === 'All' || plan.staffName === state.staffFilter;
    const programMatch = state.programFilter === 'All' || plan.program === state.programFilter;
    return isInSelectedWeek(plan) && staffMatch && programMatch;
  });
}

function ratingStats(plans) {
  const nonRatedOfficial = plans.filter(isNonRatedOfficialStatus);
  const ratedPlanned = plans.filter((plan) => plan.accomplishmentType !== 'Boss Instruction' && !isNonRatedOfficialStatus(plan));
  const conducted = ratedPlanned.filter((plan) => plan.accomplishmentType === 'Conducted');
  const justified = ratedPlanned.filter((plan) => plan.accomplishmentType === 'Not Conducted - Justified');
  const missing = ratedPlanned.filter((plan) => !plan.accomplishmentType);
  const bossChanges = plans.filter((plan) => plan.accomplishmentType === 'Boss Instruction');
  const efficiency = ratedPlanned.length ? Math.round((conducted.length / ratedPlanned.length) * 100) : 0;
  const bossRating = bossChanges.length
    ? Math.round(bossChanges.reduce((sum, plan) => sum + Number(plan.accomplishmentPercent || 0), 0) / bossChanges.length)
    : 0;
  const accomplishedReports = plans.filter((plan) => plan.accomplishmentType && technicalAssistanceApplies(plan));
  const averageReportGrade = accomplishedReports.length
    ? Math.round(accomplishedReports.reduce((sum, plan) => sum + reportGrade(plan), 0) / accomplishedReports.length)
    : null;
  const scoredPlans = plans.filter((plan) => plan.accomplishmentType && !isNonRatedOfficialStatus(plan));
  const totalPlus = scoredPlans.reduce((sum, plan) => sum + earnedPlusFactor(plan), 0);
  const averageAdjusted = scoredPlans.length
    ? Math.round(scoredPlans.reduce((sum, plan) => sum + adjustedScore(plan), 0) / scoredPlans.length)
    : 0;
  return { ratedPlanned, conducted, justified, missing, bossChanges, nonRatedOfficial, efficiency, bossRating, averageReportGrade, totalPlus, averageAdjusted };
}

function statusLabel(plan) {
  if (!plan.accomplishmentType) return '<span class="status pending">No accomplishment yet</span>';
  if (plan.accomplishmentType === 'Conducted') return '<span class="status conducted">Conducted</span>';
  if (plan.accomplishmentType === 'Boss Instruction') return '<span class="status boss">Boss priority task</span>';
  if (isNonRatedOfficialStatus(plan)) return `<span class="status excluded">${escapeHtml(plan.accomplishmentType)}</span>`;
  return '<span class="status justified">Not conducted</span>';
}

function ratingEffect(plan) {
  if (!plan.accomplishmentType) return 'Pending encoding';
  if (plan.accomplishmentType === 'Conducted') return `Rated as conducted (${plan.accomplishmentPercent || 100}%), adjusted ${adjustedScoreText(plan)}`;
  if (plan.accomplishmentType === 'Boss Instruction') {
    return `Planned task not graded due to Boss priority instruction. Replacement task rated ${adjustedScoreText(plan)}.`;
  }
  if (isNonRatedOfficialStatus(plan)) {
    return `${plan.accomplishmentType} is recorded but excluded from marking.`;
  }
  return 'Counted as not conducted; justification required.';
}

function renderMetrics() {
  const plans = filteredPlans();
  const stats = ratingStats(plans);
  els.plannedTasks.textContent = plans.length;
  els.conductedTasks.textContent = stats.conducted.length;
  els.justificationNeeded.textContent = stats.justified.length + stats.missing.length;
  els.overallEfficiency.textContent = `${stats.efficiency}%`;
  els.overallReportGrade.textContent = stats.averageReportGrade === null ? 'N/A' : `${stats.averageReportGrade}%`;
  els.notConductedCount.textContent = stats.justified.length + stats.missing.length;
  els.bossInstructionCount.textContent = stats.bossChanges.length;
  els.bossTaskRating.textContent = `${stats.bossRating}%`;
  els.averageReportGrade.textContent = stats.averageReportGrade === null ? 'N/A' : `${stats.averageReportGrade}%`;
  els.totalPlusFactor.textContent = stats.totalPlus;
  els.averageAdjustedScore.textContent = `${stats.averageAdjusted}%`;
}

function renderPlanRows() {
  const plans = filteredPlans();
  els.planRows.innerHTML = '';
  if (!plans.length) {
    els.planRows.append(document.querySelector('#emptyPlanTemplate').content.cloneNode(true));
    return;
  }
  plans.forEach((plan) => {
    const row = document.createElement('tr');
    const planActions = [];
    if (isAdmin() || (isStaff() && state.access.staffCanPlan)) {
      planActions.push(`<button class="subtle-btn" type="button" data-action="edit-plan" data-id="${plan.id}">Edit</button>`);
    }
    if (isAdmin() || (isStaff() && state.access.staffCanAccomplish)) {
      planActions.push(`<button class="primary-btn" type="button" data-action="encode" data-id="${plan.id}">Accomplish</button>`);
    }
    if (isAdmin()) {
      planActions.push(`<button class="delete-btn" type="button" data-action="delete-plan" data-id="${plan.id}">Delete</button>`);
    }
    row.innerHTML = `
      <td>${escapeHtml(plan.staffName)}</td>
      <td>${escapeHtml(plan.datePlanned)}</td>
      <td>${escapeHtml(plan.program)}</td>
      <td>${escapeHtml(plan.workType || 'Regular Work')}</td>
      <td>${escapeHtml(plan.task)}</td>
      <td>${escapeHtml(plan.place)}</td>
      <td>${escapeHtml(plan.clients || '')}</td>
      <td>${technicalAssistanceApplies(plan) ? 'Yes' : 'No'}</td>
      <td>${statusLabel(plan)}</td>
      <td>
        <div class="row-actions">
          ${planActions.join('') || '<span class="staff-meta">View only</span>'}
        </div>
      </td>
    `;
    els.planRows.append(row);
  });
}

function renderAccomplishmentRows() {
  const plans = filteredPlans();
  els.accomplishmentRows.innerHTML = '';
  if (!plans.length) {
    els.accomplishmentRows.append(document.querySelector('#emptyPlanTemplate').content.cloneNode(true));
    return;
  }
  plans.forEach((plan) => {
    const row = document.createElement('tr');
    const accomplishment = plan.accomplishmentType
      ? `${escapeHtml(plan.accomplishmentOutput || '')}<div class="staff-meta">${escapeHtml(plan.justification || '')}</div>`
      : '<span class="staff-meta">Waiting for accomplishment entry</span>';
    const isTechnicalAssistance = technicalAssistanceApplies(plan);
    const evidence = isTechnicalAssistance && (plan.taLatitude || plan.taPhotoData)
      ? `<div class="staff-meta">Evidence: ${plan.taLatitude && plan.taLongitude ? `${Number(plan.taLatitude).toFixed(5)}, ${Number(plan.taLongitude).toFixed(5)}` : 'photo attached'}</div>`
      : '';
    const reportReference = [
      escapeHtml(plan.reportDetails || ''),
      isTechnicalAssistance ? `<div class="staff-meta">Crop stage/category: ${escapeHtml(cropStageFor(plan))}</div>` : '',
      isTechnicalAssistance && detectedReportItems(plan).length
        ? `<div class="staff-meta">System detected ${detectedReportItems(plan).length}/${applicableReportItems(plan).length}: ${escapeHtml(detectedReportItems(plan).join(', '))}</div>`
        : `<div class="staff-meta">${isTechnicalAssistance ? 'No checklist evidence detected yet' : 'Not graded under technical-assistance checklist'}</div>`
    ].join('');
    const grade = reportGrade(plan);
    const gradeHtml = `<span class="grade ${reportGradeClass(grade)}">${reportGradeText(plan)}</span>`;
    const canEncode = isAdmin() || (isStaff() && state.access.staffCanAccomplish);
    const accomplishmentActions = [];
    if (canEncode) {
      accomplishmentActions.push(`<button class="primary-btn" type="button" data-action="encode" data-id="${plan.id}">Encode</button>`);
    }
    if (isAdmin() && plan.accomplishmentType) {
      accomplishmentActions.push(`<button class="delete-btn" type="button" data-action="delete-accomplishment" data-id="${plan.id}">Remove Accomplishment</button>`);
    }
    row.innerHTML = `
      <td>${escapeHtml(plan.staffName)}</td>
      <td>${escapeHtml(plan.datePlanned)}</td>
      <td>${escapeHtml(plan.task)}</td>
      <td>${escapeHtml(plan.place)}</td>
      <td>${escapeHtml(plan.program)}</td>
      <td>${accomplishment}${evidence}</td>
      <td>${reportReference}</td>
      <td>${gradeHtml}</td>
      <td>${escapeHtml(ratingEffect(plan))}</td>
      <td>
        <div class="row-actions">
          ${accomplishmentActions.join('') || '<span class="staff-meta">View only</span>'}
        </div>
      </td>
    `;
    els.accomplishmentRows.append(row);
  });
}

function renderDashboard() {
  els.dashboardRows.innerHTML = '';
  els.staffList.innerHTML = '';
  state.staff.forEach((name) => {
    const staffPlans = filteredPlans().filter((plan) => plan.staffName === name);
    const stats = ratingStats(staffPlans);
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${escapeHtml(name)}</td>
      <td>${stats.ratedPlanned.length}</td>
      <td>${stats.conducted.length}</td>
      <td>${stats.justified.length + stats.missing.length}</td>
      <td>${stats.bossChanges.length}</td>
      <td>${stats.nonRatedOfficial.length}</td>
      <td>${stats.efficiency}%</td>
      <td>${stats.bossRating}%</td>
      <td>${stats.averageReportGrade === null ? 'N/A' : `${stats.averageReportGrade}%`}</td>
      <td>${stats.totalPlus}</td>
      <td>${stats.averageAdjusted}%</td>
    `;
    els.dashboardRows.append(row);

    const item = document.createElement('article');
    item.className = 'staff-item';
    item.innerHTML = `
      <div class="staff-row">
        <span class="staff-name">${escapeHtml(name)}</span>
        <span class="staff-meta">${stats.conducted.length}/${stats.ratedPlanned.length} conducted</span>
      </div>
      <div class="bar" aria-label="${escapeHtml(name)} efficiency ${stats.efficiency}%"><span style="width: ${stats.efficiency}%"></span></div>
      <div class="staff-meta">${stats.nonRatedOfficial.length} excluded day(s), ${stats.bossChanges.length} boss priority change(s), boss priority task rating ${stats.bossRating}%, report grade ${stats.averageReportGrade === null ? 'N/A' : `${stats.averageReportGrade}%`}, adjusted score ${stats.averageAdjusted}%</div>
    `;
    els.staffList.append(item);
  });
  renderPerformanceChart();
  renderFieldMap();
}

function staffChartData() {
  return state.staff.map((name) => {
    const stats = ratingStats(filteredPlans().filter((plan) => plan.staffName === name));
    return { name, efficiency: stats.efficiency, adjusted: stats.averageAdjusted };
  }).filter((item) => item.efficiency || item.adjusted);
}

function renderPerformanceChart() {
  if (!els.performanceChart) return;
  const data = staffChartData();
  if (!data.length) {
    els.performanceChart.innerHTML = '<p class="empty-state">No staff scores yet for the selected week.</p>';
    return;
  }
  const width = Math.max(680, data.length * 88);
  const height = 320;
  const top = 28;
  const bottom = 78;
  const left = 44;
  const chartHeight = height - top - bottom;
  const barSlot = (width - left - 24) / data.length;
  const bars = data.map((item, index) => {
    const x = left + index * barSlot + 14;
    const effHeight = (item.efficiency / 100) * chartHeight;
    const adjHeight = (item.adjusted / 100) * chartHeight;
    return `
      <rect class="chart-bar efficiency" x="${x}" y="${top + chartHeight - effHeight}" width="22" height="${effHeight}"></rect>
      <rect class="chart-bar adjusted" x="${x + 26}" y="${top + chartHeight - adjHeight}" width="22" height="${adjHeight}"></rect>
      <text class="chart-value" x="${x + 24}" y="${top + chartHeight - Math.max(effHeight, adjHeight) - 8}" text-anchor="middle">${item.adjusted}%</text>
      <text class="chart-label" x="${x + 24}" y="${height - 42}" text-anchor="middle">${escapeHtml(item.name.split(' ')[0])}</text>
    `;
  }).join('');
  els.performanceChart.innerHTML = `
    <div class="chart-scroll">
      <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Comparative staff performance chart">
        <line class="chart-axis" x1="${left}" y1="${top + chartHeight}" x2="${width - 16}" y2="${top + chartHeight}"></line>
        <line class="chart-axis" x1="${left}" y1="${top}" x2="${left}" y2="${top + chartHeight}"></line>
        <text class="chart-tick" x="12" y="${top + 5}">100%</text>
        <text class="chart-tick" x="18" y="${top + chartHeight + 4}">0%</text>
        ${bars}
      </svg>
    </div>
    <div class="chart-legend"><span><i class="legend-efficiency"></i>Efficiency</span><span><i class="legend-adjusted"></i>Adjusted score</span></div>
  `;
}

function boundaryCoordinates() {
  if (!state.boundary || !Array.isArray(state.boundary.features)) return [];
  return state.boundary.features.flatMap((feature) => feature.geometry.coordinates);
}

function resetMapView() {
  state.mapView = { x: 0, y: 0, width: 760, height: 460 };
  applyMapView();
}

function applyMapView() {
  const svg = document.querySelector('.interactive-map');
  if (!svg || !state.mapView) return;
  const view = state.mapView;
  svg.setAttribute('viewBox', `${view.x} ${view.y} ${view.width} ${view.height}`);
}

function zoomFieldMap(factor) {
  if (!state.mapView) state.mapView = { x: 0, y: 0, width: 760, height: 460 };
  const view = state.mapView;
  const nextWidth = Math.max(120, Math.min(760, view.width * factor));
  const nextHeight = Math.max(72, Math.min(460, view.height * factor));
  const centerX = view.x + view.width / 2;
  const centerY = view.y + view.height / 2;
  state.mapView = {
    x: Math.max(0, Math.min(760 - nextWidth, centerX - nextWidth / 2)),
    y: Math.max(0, Math.min(460 - nextHeight, centerY - nextHeight / 2)),
    width: nextWidth,
    height: nextHeight
  };
  applyMapView();
}

function panFieldMap(deltaX, deltaY, svg) {
  if (!state.mapView || !svg) return;
  const rect = svg.getBoundingClientRect();
  const view = state.mapView;
  const moveX = (deltaX / rect.width) * view.width;
  const moveY = (deltaY / rect.height) * view.height;
  state.mapView = {
    ...view,
    x: Math.max(0, Math.min(760 - view.width, view.x - moveX)),
    y: Math.max(0, Math.min(460 - view.height, view.y - moveY))
  };
  applyMapView();
}

function renderFieldMap() {
  if (!els.fieldMap) return;
  const rings = boundaryCoordinates();
  const points = filteredPlans().filter((plan) => technicalAssistanceApplies(plan) && plan.taLatitude && plan.taLongitude);
  if (!rings.length) {
    els.fieldMap.innerHTML = '<p class="empty-state">Boundary map is loading.</p>';
    return;
  }
  const allCoords = rings.flat();
  points.forEach((plan) => allCoords.push([Number(plan.taLongitude), Number(plan.taLatitude)]));
  const xs = allCoords.map((coord) => coord[0]);
  const ys = allCoords.map((coord) => coord[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const width = 760;
  const height = 460;
  if (!state.mapView) state.mapView = { x: 0, y: 0, width, height };
  const mapView = state.mapView;
  const pad = 24;
  const scale = (coord) => {
    const x = pad + ((coord[0] - minX) / (maxX - minX || 1)) * (width - pad * 2);
    const y = height - pad - ((coord[1] - minY) / (maxY - minY || 1)) * (height - pad * 2);
    return [x, y];
  };
  const paths = rings.map((ring) => {
    const d = ring.map((coord, index) => {
      const [x, y] = scale(coord);
      return `${index ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ');
    return `<path class="boundary-path" d="${d} Z"></path>`;
  }).join('');
  const pins = points.map((plan) => {
    const [x, y] = scale([Number(plan.taLongitude), Number(plan.taLatitude)]);
    return `<g class="map-pin" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><circle r="6"></circle><title>${escapeHtml(plan.staffName)} - ${escapeHtml(plan.accomplishmentOutput || plan.task)}</title></g>`;
  }).join('');
  const list = points.length
    ? points.map((plan) => `
        <article class="map-evidence">
          ${plan.taPhotoData ? `<img src="${plan.taPhotoData}" alt="Field evidence from ${escapeHtml(plan.staffName)}" />` : ''}
          <div><strong>${escapeHtml(plan.staffName)}</strong><span>${escapeHtml(plan.accomplishmentDate || plan.datePlanned)} | ${Number(plan.taLatitude).toFixed(5)}, ${Number(plan.taLongitude).toFixed(5)}</span><p>${escapeHtml(plan.accomplishmentOutput || plan.task)}</p></div>
        </article>
      `).join('')
    : '<p class="empty-state">No technical assistance location evidence yet for the selected week.</p>';
  els.fieldMap.innerHTML = `
    <div class="map-toolbar" aria-label="Map controls">
      <button class="subtle-btn" type="button" data-map-action="zoom-in">Zoom In</button>
      <button class="subtle-btn" type="button" data-map-action="zoom-out">Zoom Out</button>
      <button class="subtle-btn" type="button" data-map-action="reset">Reset</button>
      <span class="staff-meta">Drag the map to pan.</span>
    </div>
    <div class="map-canvas">
      <svg class="interactive-map" viewBox="${mapView.x} ${mapView.y} ${mapView.width} ${mapView.height}" role="img" aria-label="Consolidated technical assistance locations inside Pinamalayan boundary">
        ${paths}
        ${pins}
      </svg>
    </div>
    <div class="map-evidence-list">${list}</div>
  `;
}

function updateReportGradePreview() {
  const tempPlan = {
    staffName: els.accomplishmentStaff.value,
    program: state.plans.find((item) => item.id === els.accomplishmentPlanId.value)?.program || programs[0],
    place: state.plans.find((item) => item.id === els.accomplishmentPlanId.value)?.place || '',
    clients: state.plans.find((item) => item.id === els.accomplishmentPlanId.value)?.clients || '',
    datePlanned: els.accomplishmentDate.value,
    accomplishmentDate: els.accomplishmentDate.value,
    task: els.accomplishmentOutput.value,
    accomplishmentOutput: els.accomplishmentOutput.value,
    justification: els.accomplishmentJustification.value,
    accomplishmentType: els.accomplishmentType.value,
    cropStage: els.cropStage.value,
    reportDetails: els.reportDetails.value,
    technicalAssistance: false,
    taLatitude: els.locationStatus.dataset.lat || '',
    taLongitude: els.locationStatus.dataset.lng || '',
    taPhotoData: els.taPhotoPreview.dataset.photoData || ''
  };
  setTechnicalAssistanceIndicator(els.accomplishmentTechnicalAssistance, technicalAssistanceApplies(tempPlan));
  const detected = detectedReportItems(tempPlan);
  const applicable = applicableReportItems(tempPlan);
  els.reportGradePreview.textContent = reportGradeText(tempPlan);
  els.reportGradePreview.className = `grade-preview ${reportGradeClass(reportGrade(tempPlan))}`;
  if (els.autoChecklistPreview) {
    els.autoChecklistPreview.innerHTML = applicable.map((item) => {
      const matched = detected.includes(item.label);
      return `<span class="${matched ? 'detected' : 'missing'}">${matched ? 'Detected' : 'Missing'}: ${escapeHtml(item.label)}</span>`;
    }).join('');
  }
}

function updateAdjustedScorePreview() {
  const tempPlan = {
    accomplishmentType: els.accomplishmentType.value,
    accomplishmentPercent: Number(els.accomplishmentPercent.value || 0),
    workType: els.accomplishmentWorkType.value
  };
  els.adjustedScorePreview.textContent = adjustedScoreText(tempPlan);
}

function updatePlanTechnicalAssistanceIndicator() {
  const tempPlan = {
    staffName: els.planStaff.value,
    program: els.planProgram.value,
    place: els.planPlace.value,
    task: els.planTask.value,
    clients: els.planClients.value,
    datePlanned: els.planDate.value
  };
  setTechnicalAssistanceIndicator(els.planTechnicalAssistance, technicalAssistanceApplies(tempPlan));
}

function setTechnicalAssistanceIndicator(element, detected) {
  if (!element) return;
  element.textContent = detected ? 'System detected: Yes' : 'System detected: No';
  element.classList.toggle('detected', detected);
  element.classList.toggle('not-detected', !detected);
}

function syncAccomplishmentStatusControls() {
  const nonRated = nonRatedAccomplishmentTypes.includes(els.accomplishmentType.value);
  if (nonRated) {
    els.accomplishmentPercent.value = 0;
    setTechnicalAssistanceIndicator(els.accomplishmentTechnicalAssistance, false);
  }
  els.accomplishmentPercent.disabled = nonRated;
  els.accomplishmentWorkType.disabled = nonRated;
  updateReportGradePreview();
  updateAdjustedScorePreview();
}

function setLocationStatus(lat, lng, capturedAt = new Date().toISOString()) {
  els.locationStatus.dataset.lat = lat || '';
  els.locationStatus.dataset.lng = lng || '';
  els.locationStatus.dataset.capturedAt = capturedAt || '';
  els.locationStatus.textContent = lat && lng
    ? `Location captured: ${Number(lat).toFixed(6)}, ${Number(lng).toFixed(6)}`
    : 'No location captured yet.';
  updateReportGradePreview();
}

function setPhotoPreview(dataUrl = '') {
  els.taPhotoPreview.dataset.photoData = dataUrl;
  els.taPhotoPreview.src = dataUrl;
  els.taPhotoPreview.classList.toggle('hidden', !dataUrl);
  updateReportGradePreview();
}

function resizePhoto(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error('Unable to read image.'));
      image.onload = () => {
        const maxSize = 900;
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext('2d');
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.72));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function captureCurrentLocation() {
  if (!navigator.geolocation) {
    els.locationStatus.textContent = 'Location is not available on this device/browser.';
    return;
  }
  els.locationStatus.textContent = 'Getting current location...';
  navigator.geolocation.getCurrentPosition(
    (position) => setLocationStatus(position.coords.latitude, position.coords.longitude),
    () => {
      els.locationStatus.textContent = 'Location permission was denied or unavailable.';
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
  );
}

function loadBoundary() {
  fetch('pinamalayan-boundary.json')
    .then((response) => response.json())
    .then((geojson) => {
      state.boundary = geojson;
      renderFieldMap();
    })
    .catch(() => {
      if (els.fieldMap) els.fieldMap.innerHTML = '<p class="empty-state">Boundary map could not be loaded.</p>';
    });
}

function setupInstallPrompt() {
  if (!els.installAppBtn) return;
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
  if (isStandalone) return;
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    els.installAppBtn.classList.remove('hidden');
  });
  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    els.installAppBtn.classList.add('hidden');
  });
}

function installApp() {
  if (!deferredInstallPrompt) {
    alert('On Android Chrome, open the menu and choose Add to Home screen or Install app.');
    return;
  }
  deferredInstallPrompt.prompt();
  deferredInstallPrompt.userChoice.finally(() => {
    deferredInstallPrompt = null;
    els.installAppBtn.classList.add('hidden');
  });
}

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js').catch(() => {});
  });
}

function applyAccessRules() {
  const loggedIn = Boolean(state.session.role);
  els.loginScreen.classList.toggle('hidden', loggedIn);
  document.body.classList.toggle('is-locked', !loggedIn);
  els.sessionBadge.textContent = isAdmin() ? 'Admin' : isViewer() ? 'Viewer' : `Staff: ${state.session.staffName || ''}`;
  document.querySelector('#adminBtn').classList.toggle('hidden', !isAdmin());
  document.querySelector('#printBtn').classList.toggle('hidden', !(isAdmin() || isStaff()));
  document.querySelector('#exportBtn').classList.toggle('hidden', !(isAdmin() || isStaff()));
  if (deferredInstallPrompt && els.installAppBtn) els.installAppBtn.classList.remove('hidden');
  document.querySelector('[data-view="dashboardView"]').classList.toggle('hidden', !(isAdmin() || isViewer()));
  document.querySelector('#resetBtn').classList.toggle('hidden', !isAdmin());
  document.querySelector('#addPlanBtn').classList.toggle('hidden', !(isAdmin() || (isStaff() && state.access.staffCanPlan)));
  document.querySelector('#addBossTaskBtn').classList.toggle('hidden', !(isAdmin() || (isStaff() && state.access.staffCanBossTask)));
  els.staffFilter.disabled = isStaff();
  document.body.classList.toggle('role-staff', isStaff());
  document.body.classList.toggle('role-admin', isAdmin());
  document.body.classList.toggle('role-viewer', isViewer());
  if (isStaff()) {
    state.staffFilter = state.session.staffName;
    els.staffFilter.value = state.session.staffName;
    if (state.activeView === 'dashboardView') showView('itineraryView');
  }
}

function renderAll() {
  applyAccessRules();
  renderSignatories();
  renderMetrics();
  renderPlanRows();
  renderAccomplishmentRows();
  renderDashboard();
}

function showView(viewId) {
  state.activeView = viewId;
  document.querySelectorAll('.view').forEach((view) => view.classList.toggle('active', view.id === viewId));
  document.querySelectorAll('.tab').forEach((tab) => tab.classList.toggle('active', tab.dataset.view === viewId));
}

function showPlanForm(plan = null) {
  if (!(isAdmin() || (isStaff() && state.access.staffCanPlan))) {
    alert('Only the admin can enable itinerary editing for staff.');
    return;
  }
  els.planForm.classList.remove('hidden');
  if (plan) {
    els.planId.value = plan.id;
    els.planStaff.value = plan.staffName;
    els.planDate.value = plan.datePlanned;
    els.planProgram.value = plan.program;
    els.planWorkType.value = plan.workType || 'Regular Work';
    els.planPlace.value = plan.place;
    els.planTask.value = plan.task;
    els.planClients.value = plan.clients || '';
    setTechnicalAssistanceIndicator(els.planTechnicalAssistance, technicalAssistanceApplies(plan));
  } else {
    els.planForm.reset();
    els.planId.value = '';
    els.planDate.value = els.weekStart.value;
    els.planWorkType.value = 'Regular Work';
    if (isStaff()) els.planStaff.value = state.session.staffName;
    updatePlanTechnicalAssistanceIndicator();
  }
  els.planStaff.disabled = isStaff() && !isAdmin();
  els.planTask.focus();
}

function hidePlanForm() {
  els.planForm.classList.add('hidden');
  els.planForm.reset();
  els.planId.value = '';
  els.planStaff.disabled = false;
}

function savePlan(event) {
  event.preventDefault();
  if (!(isAdmin() || (isStaff() && state.access.staffCanPlan))) return;
  const existing = state.plans.find((plan) => plan.id === els.planId.value);
  const plan = {
    ...(existing || {}),
    id: els.planId.value || createId(),
    staffName: isStaff() ? state.session.staffName : els.planStaff.value,
    weekStart: els.weekStart.value,
    weekEnd: els.weekEnd.value,
    datePlanned: els.planDate.value,
    program: els.planProgram.value,
    workType: els.planWorkType.value,
    place: els.planPlace.value.trim(),
    task: els.planTask.value.trim(),
    clients: els.planClients.value.trim()
  };
  plan.technicalAssistance = technicalAssistanceApplies(plan);
  const index = state.plans.findIndex((item) => item.id === plan.id);
  if (index >= 0) state.plans[index] = plan;
  else state.plans.unshift(plan);
  savePlans();
  hidePlanForm();
  renderAll();
}

function showAccomplishmentForm(plan = null) {
  const allowed = plan
    ? isAdmin() || (isStaff() && state.access.staffCanAccomplish)
    : isAdmin() || (isStaff() && state.access.staffCanBossTask);
  if (!allowed) {
    alert('Only the admin can enable accomplishment encoding for staff.');
    return;
  }
  const target = plan || {
    id: createId(),
    staffName: isStaff() ? state.session.staffName : state.staff[0] || '',
    datePlanned: els.weekStart.value,
    weekStart: els.weekStart.value,
    weekEnd: els.weekEnd.value,
    program: programs[0],
    workType: 'Regular Work',
    task: 'New task instructed by the Boss',
    place: '',
    clients: ''
  };
  if (!plan) state.plans.unshift(target);
  els.accomplishmentForm.classList.remove('hidden');
  els.accomplishmentPlanId.value = target.id;
  els.accomplishmentStaff.value = target.staffName;
  els.accomplishmentDate.value = target.accomplishmentDate || target.datePlanned || els.weekStart.value;
  els.accomplishmentType.value = target.accomplishmentType || (plan ? 'Conducted' : 'Boss Instruction');
  els.accomplishmentPercent.value = target.accomplishmentPercent ?? 100;
  els.accomplishmentWorkType.value = target.workType || 'Regular Work';
  els.accomplishmentOutput.value = target.accomplishmentOutput || target.task || '';
  els.accomplishmentJustification.value = target.justification || '';
  setTechnicalAssistanceIndicator(els.accomplishmentTechnicalAssistance, technicalAssistanceApplies(target));
  els.cropStage.value = target.cropStage || 'Not crop-specific';
  els.reportDetails.value = target.reportDetails || '';
  setLocationStatus(target.taLatitude || '', target.taLongitude || '', target.taLocationCapturedAt || '');
  setPhotoPreview(target.taPhotoData || '');
  els.taPhotoInput.value = '';
  els.accomplishmentStaff.disabled = isStaff() && !isAdmin();
  updateReportGradePreview();
  syncAccomplishmentStatusControls();
  if (!plan) {
    savePlans();
    renderAll();
  }
  els.accomplishmentOutput.focus();
}

function hideAccomplishmentForm() {
  els.accomplishmentForm.classList.add('hidden');
  els.accomplishmentForm.reset();
  els.accomplishmentPlanId.value = '';
  els.accomplishmentStaff.disabled = false;
  els.accomplishmentPercent.disabled = false;
  els.accomplishmentWorkType.disabled = false;
  setLocationStatus('', '', '');
  setPhotoPreview('');
  updateReportGradePreview();
  updateAdjustedScorePreview();
}

function saveAccomplishment(event) {
  event.preventDefault();
  const plan = state.plans.find((item) => item.id === els.accomplishmentPlanId.value);
  if (!plan) return;
  const isBossOnlyTask = plan.task === 'New task instructed by the Boss' || plan.accomplishmentType === 'Boss Instruction';
  const allowed = isAdmin() || (isStaff() && (isBossOnlyTask ? state.access.staffCanBossTask : state.access.staffCanAccomplish));
  if (!allowed) return;
  const type = els.accomplishmentType.value;
  const nonRated = nonRatedAccomplishmentTypes.includes(type);
  const justification = els.accomplishmentJustification.value.trim();
  if (type !== 'Conducted' && !justification) {
    alert('Please encode the justification, official travel details, leave/absence details, or Boss instruction details.');
    return;
  }
  plan.staffName = isStaff() ? state.session.staffName : els.accomplishmentStaff.value;
  plan.accomplishmentDate = els.accomplishmentDate.value;
  plan.accomplishmentType = type;
  plan.accomplishmentPercent = nonRated ? 0 : Number(els.accomplishmentPercent.value);
  plan.workType = nonRated ? (plan.workType || 'Regular Work') : els.accomplishmentWorkType.value;
  plan.accomplishmentOutput = els.accomplishmentOutput.value.trim();
  plan.justification = justification;
  plan.reportDetails = els.reportDetails.value.trim();
  plan.taLatitude = nonRated ? '' : els.locationStatus.dataset.lat || '';
  plan.taLongitude = nonRated ? '' : els.locationStatus.dataset.lng || '';
  plan.taLocationCapturedAt = nonRated ? '' : els.locationStatus.dataset.capturedAt || '';
  plan.taPhotoData = nonRated ? '' : els.taPhotoPreview.dataset.photoData || '';
  const detectedTechnicalAssistance = !nonRated && technicalAssistanceApplies(plan);
  plan.technicalAssistance = detectedTechnicalAssistance;
  plan.cropStage = plan.technicalAssistance ? els.cropStage.value : '';
  if (!plan.technicalAssistance) {
    plan.taLatitude = '';
    plan.taLongitude = '';
    plan.taLocationCapturedAt = '';
    plan.taPhotoData = '';
  }
  plan.reportItems = detectedReportItems(plan);
  if (type === 'Boss Instruction' && plan.task === 'New task instructed by the Boss') {
    plan.task = plan.accomplishmentOutput;
    plan.program = plan.program || programs[0];
    plan.datePlanned = plan.accomplishmentDate;
    plan.weekStart = els.weekStart.value;
    plan.weekEnd = els.weekEnd.value;
  }
  savePlans();
  hideAccomplishmentForm();
  renderAll();
}

function removeAccomplishment(plan) {
  const isBossOnlyTask = plan.accomplishmentType === 'Boss Instruction' && plan.task === plan.accomplishmentOutput;
  if (isBossOnlyTask) {
    if (!confirm('Delete this boss-instructed accomplishment entry?')) return;
    state.plans = state.plans.filter((item) => item.id !== plan.id);
  } else {
    if (!confirm('Remove the encoded accomplishment for this itinerary? The planned itinerary will remain.')) return;
    delete plan.accomplishmentType;
    delete plan.accomplishmentDate;
    delete plan.accomplishmentPercent;
    delete plan.accomplishmentOutput;
    delete plan.justification;
    delete plan.reportDetails;
    delete plan.reportItems;
    delete plan.technicalAssistance;
    delete plan.cropStage;
    delete plan.taLatitude;
    delete plan.taLongitude;
    delete plan.taLocationCapturedAt;
    delete plan.taPhotoData;
  }
  savePlans({ replaceSharedPlans: true });
  renderAll();
}

function showAdminSettings() {
  els.staffNamesInput.value = staffAccountLines();
  els.newStaffNameInput.value = '';
  els.newStaffPasswordInput.value = '';
  renderStaffAccountManager();
  els.staffPasswordInput.value = state.access.staffPassword;
  els.viewerPasswordInput.value = state.access.viewerPassword;
  els.adminPasswordInput.value = state.access.adminPassword;
  els.staffCanPlanInput.checked = state.access.staffCanPlan;
  els.staffCanAccomplishInput.checked = state.access.staffCanAccomplish;
  els.staffCanBossTaskInput.checked = state.access.staffCanBossTask;
  els.preparedByInput.value = state.signatories.preparedBy;
  els.preparedByTitleInput.value = state.signatories.preparedByTitle;
  els.reviewedByInput.value = state.signatories.reviewedBy;
  els.reviewedByTitleInput.value = state.signatories.reviewedByTitle;
  els.approvedByInput.value = state.signatories.approvedBy;
  els.approvedByTitleInput.value = state.signatories.approvedByTitle;
  els.adminModal.classList.remove('hidden');
  els.newStaffNameInput.focus();
}

function hideAdminSettings() {
  els.adminModal.classList.add('hidden');
}

function saveAdminSettings(event) {
  event.preventDefault();
  const defaultStaffPassword = els.staffPasswordInput.value.trim() || defaultAccess.staffPassword;
  const uniqueAccounts = staffAccountsFromAdminForm().map((account) => ({
    ...account,
    password: account.password || defaultStaffPassword
  }));
  if (!uniqueAccounts.length) {
    alert('Please keep at least one staff account.');
    return;
  }
  state.staff = uniqueAccounts.map((account) => account.name);
  state.access = {
    rosterVersion: officialRosterVersion,
    staffPassword: defaultStaffPassword,
    adminPassword: els.adminPasswordInput.value.trim() || defaultAccess.adminPassword,
    viewerPassword: els.viewerPasswordInput.value.trim() || defaultAccess.viewerPassword,
    staffAccounts: uniqueAccounts,
    staffCanPlan: els.staffCanPlanInput.checked,
    staffCanAccomplish: els.staffCanAccomplishInput.checked,
    staffCanBossTask: els.staffCanBossTaskInput.checked
  };
  state.signatories = {
    preparedBy: els.preparedByInput.value.trim() || defaultSignatories.preparedBy,
    preparedByTitle: els.preparedByTitleInput.value.trim() || defaultSignatories.preparedByTitle,
    reviewedBy: els.reviewedByInput.value.trim() || defaultSignatories.reviewedBy,
    reviewedByTitle: els.reviewedByTitleInput.value.trim() || defaultSignatories.reviewedByTitle,
    approvedBy: els.approvedByInput.value.trim() || defaultSignatories.approvedBy,
    approvedByTitle: els.approvedByTitleInput.value.trim() || defaultSignatories.approvedByTitle
  };
  if (state.staffFilter !== 'All' && !state.staff.includes(state.staffFilter)) state.staffFilter = 'All';
  saveStaff();
  saveAccess();
  saveSignatories();
  populateStaffSelects();
  els.staffFilter.value = state.staffFilter;
  hideAdminSettings();
  renderAll();
}

function exportCsv() {
  const rows = [
    ['Week Start', els.weekStart.value],
    ['Week End', els.weekEnd.value],
    [],
    ['Staff', 'Planned Date', 'Program', 'Work Type', 'Planned Task', 'Place', 'Clients', 'Technical Assistance Report', 'Crop Stage / Service Category', 'Accomplishment Type', 'Date Conducted', 'Actual Output', 'Performance', 'Plus Factor', 'Adjusted Score', 'Latitude', 'Longitude', 'Justification / Boss Instruction / Official Status Details', 'Technical / Operational Details', 'Applicable Checklist Count', 'System Detected Checklist', 'TA Report Grade', 'Rating Effect'],
    ...filteredPlans().map((plan) => [
      plan.staffName,
      plan.datePlanned,
      plan.program,
      plan.workType || 'Regular Work',
      plan.task,
      plan.place,
      plan.clients,
      technicalAssistanceApplies(plan) ? 'Yes' : 'No',
      technicalAssistanceApplies(plan) ? cropStageFor(plan) : '',
      plan.accomplishmentType || '',
      plan.accomplishmentDate || '',
      plan.accomplishmentOutput || '',
      isNonRatedOfficialStatus(plan) ? 'Excluded' : plan.accomplishmentPercent === undefined ? '' : `${plan.accomplishmentPercent}%`,
      earnedPlusFactor(plan),
      isNonRatedOfficialStatus(plan) ? 'Excluded' : plan.accomplishmentType ? `${adjustedScore(plan)}%` : '',
      plan.taLatitude || '',
      plan.taLongitude || '',
      plan.justification || '',
      plan.reportDetails || '',
      technicalAssistanceApplies(plan) ? applicableReportItems(plan).length : '',
      detectedReportItems(plan).join('; '),
      reportGradeText(plan),
      ratingEffect(plan)
    ])
  ];
  const csv = rows
    .map((row) => row.map((cell = '') => `"${String(cell).replaceAll('"', '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `weekly-itinerary-accomplishment-${els.weekStart.value || 'report'}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function printCleanReport() {
  const cssUrl = new URL('styles.css', window.location.href).href;
  const printWindow = window.open('', 'mao-weekly-report-print', 'popup,width=1100,height=800');
  if (!printWindow) {
    alert('Please allow pop-ups for printing, then try again.');
    return;
  }

  const printDocument = printWindow.document;
  printDocument.open();
  printDocument.write(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>MAO Weekly Report</title>
    <link rel="stylesheet" href="${cssUrl}" />
    <style>
      @page { margin: 0; size: auto; }
      html, body { background: #fff; margin: 0; }
      body { padding: 12mm; }
      .topbar-actions,
      .login-screen,
      .controls-panel,
      .tabs,
      .entry-form,
      .row-actions,
      #addPlanBtn,
      #addBossTaskBtn,
      #resetBtn,
      .modal-backdrop,
      .actions-col {
        display: none !important;
      }
    </style>
  </head>
  <body class="${document.body.className}">
    <header class="topbar">${document.querySelector('.topbar').innerHTML}</header>
    <main class="layout">${document.querySelector('.layout').innerHTML}</main>
  </body>
</html>`);
  printDocument.close();

  const closePrintWindow = () => {
    setTimeout(() => printWindow.close(), 500);
  };

  printWindow.onload = () => {
    printWindow.focus();
    printWindow.onafterprint = closePrintWindow;
    printWindow.print();
    setTimeout(closePrintWindow, 3000);
  };
}

async function handleLogin(event) {
  event.preventDefault();
  const role = els.loginRole.value;
  const password = els.loginPassword.value;
  const staffName = role === 'staff' ? els.loginStaff.value : '';

  try {
    const response = await fetch(loginEndpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ role, staffName, password })
    });
    const result = await response.json();
    if (!response.ok || !result.token) {
      els.loginMessage.textContent = result.error || 'Incorrect password. Please try again.';
      return;
    }
    state.session = { role: result.role, staffName: result.staffName || '', token: result.token };
    if (state.session.role === 'staff') state.staffFilter = state.session.staffName;
  } catch (error) {
    els.loginMessage.textContent = 'Login is unavailable. Please check the internet connection.';
    return;
  }

  els.loginPassword.value = '';
  els.loginMessage.textContent = '';
  saveSession();
  await initializeSharedState();
  renderAll();
}

function handleLogout() {
  if (state.session.token) {
    fetch(logoutEndpoint, {
      method: 'POST',
      headers: authHeaders()
    }).catch(() => {});
  }
  clearSession();
  hidePlanForm();
  hideAccomplishmentForm();
  renderAll();
}

function bindEvents() {
  els.loginForm.addEventListener('submit', handleLogin);
  els.loginRole.addEventListener('change', () => {
    els.loginStaffField.classList.toggle('hidden', els.loginRole.value !== 'staff');
    els.loginMessage.textContent = '';
  });
  document.querySelectorAll('.tab').forEach((tab) => {
    tab.addEventListener('click', () => showView(tab.dataset.view));
  });
  els.weekStart.addEventListener('change', () => {
    els.weekEnd.value = addDays(els.weekStart.value, 4);
    renderAll();
  });
  els.weekEnd.addEventListener('change', renderAll);
  els.staffFilter.addEventListener('change', (event) => {
    state.staffFilter = event.target.value;
    renderAll();
  });
  els.programFilter.addEventListener('change', (event) => {
    state.programFilter = event.target.value;
    renderAll();
  });
  document.querySelector('#addPlanBtn').addEventListener('click', () => showPlanForm());
  document.querySelector('#cancelPlanBtn').addEventListener('click', hidePlanForm);
  els.planForm.addEventListener('submit', savePlan);
  [els.planStaff, els.planDate, els.planProgram, els.planPlace, els.planTask, els.planClients].forEach((input) => {
    input.addEventListener('input', updatePlanTechnicalAssistanceIndicator);
    input.addEventListener('change', updatePlanTechnicalAssistanceIndicator);
  });
  document.querySelector('#addBossTaskBtn').addEventListener('click', () => showAccomplishmentForm());
  document.querySelector('#cancelAccomplishmentBtn').addEventListener('click', hideAccomplishmentForm);
  els.accomplishmentForm.addEventListener('submit', saveAccomplishment);
  document.querySelector('#adminBtn').addEventListener('click', showAdminSettings);
  document.querySelector('#closeAdminBtn').addEventListener('click', hideAdminSettings);
  document.querySelector('#adminForm').addEventListener('submit', saveAdminSettings);
  els.addStaffAccountBtn.addEventListener('click', () => {
    const name = els.newStaffNameInput.value.trim();
    const password = els.newStaffPasswordInput.value.trim() || els.staffPasswordInput.value.trim() || defaultAccess.staffPassword;
    if (!name) {
      alert('Please enter the staff name.');
      return;
    }
    const accounts = staffAccountsFromAdminForm();
    const existing = accounts.find((account) => account.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      existing.password = password;
    } else {
      accounts.push({ name, password });
    }
    syncStaffAccountTextarea(accounts);
    els.newStaffNameInput.value = '';
    els.newStaffPasswordInput.value = '';
    renderStaffAccountManager();
    els.newStaffNameInput.focus();
  });
  els.staffNamesInput.addEventListener('input', renderStaffAccountManager);
  els.staffAccountList.addEventListener('input', (event) => {
    const input = event.target.closest('input[data-account-password]');
    if (!input) return;
    const accounts = staffAccountsFromAdminForm();
    const index = Number(input.dataset.accountPassword);
    if (accounts[index]) accounts[index].password = input.value.trim();
    syncStaffAccountTextarea(accounts);
  });
  els.staffAccountList.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-delete-account]');
    if (!button) return;
    const accounts = staffAccountsFromAdminForm();
    const index = Number(button.dataset.deleteAccount);
    const account = accounts[index];
    if (!account) return;
    if (!confirm(`Delete staff account for ${account.name}? Existing encoded reports will remain in the records.`)) return;
    accounts.splice(index, 1);
    syncStaffAccountTextarea(accounts);
    renderStaffAccountManager();
  });
  document.querySelector('#restoreStaffBtn').addEventListener('click', () => {
    if (!confirm('Restore the default staff list?')) return;
    state.staff = [...defaultStaff];
    state.access.rosterVersion = officialRosterVersion;
    state.access.staffPassword = defaultAccess.staffPassword;
    state.access.staffAccounts = officialStaffAccounts.map((account) => ({ ...account }));
    els.staffNamesInput.value = staffAccountLines();
    renderStaffAccountManager();
    saveStaff();
    saveAccess();
    populateStaffSelects();
    renderAll();
  });
  els.adminModal.addEventListener('click', (event) => {
    if (event.target === els.adminModal) hideAdminSettings();
  });
  document.querySelector('#exportBtn').addEventListener('click', exportCsv);
  els.installAppBtn.addEventListener('click', installApp);
  document.querySelector('#printBtn').addEventListener('click', printCleanReport);
  document.querySelector('#logoutBtn').addEventListener('click', handleLogout);
  els.reportDetails.addEventListener('input', updateReportGradePreview);
  els.accomplishmentOutput.addEventListener('input', updateReportGradePreview);
  els.accomplishmentJustification.addEventListener('input', updateReportGradePreview);
  els.accomplishmentStaff.addEventListener('change', updateReportGradePreview);
  els.accomplishmentDate.addEventListener('change', updateReportGradePreview);
  els.cropStage.addEventListener('change', updateReportGradePreview);
  els.accomplishmentType.addEventListener('change', syncAccomplishmentStatusControls);
  els.accomplishmentPercent.addEventListener('input', updateAdjustedScorePreview);
  els.accomplishmentWorkType.addEventListener('change', updateAdjustedScorePreview);
  els.captureLocationBtn.addEventListener('click', captureCurrentLocation);
  els.taPhotoInput.addEventListener('change', async (event) => {
    const [file] = event.target.files || [];
    if (!file) {
      setPhotoPreview('');
      return;
    }
    try {
      setPhotoPreview(await resizePhoto(file));
    } catch {
      alert('The photo could not be attached. Please try another image.');
      setPhotoPreview('');
    }
  });
  document.querySelector('#resetBtn').addEventListener('click', () => {
    if (!confirm('Restore sample itinerary and accomplishment records?')) return;
    state.plans = samplePlans();
    savePlans();
    renderAll();
  });
  document.body.addEventListener('click', (event) => {
    const mapButton = event.target.closest('button[data-map-action]');
    if (mapButton) {
      if (mapButton.dataset.mapAction === 'zoom-in') zoomFieldMap(0.72);
      if (mapButton.dataset.mapAction === 'zoom-out') zoomFieldMap(1.28);
      if (mapButton.dataset.mapAction === 'reset') resetMapView();
      return;
    }
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const plan = state.plans.find((item) => item.id === button.dataset.id);
    if (button.dataset.action === 'edit-plan' && plan) showPlanForm(plan);
    if (button.dataset.action === 'encode' && plan) {
      showView('accomplishmentView');
      showAccomplishmentForm(plan);
    }
    if (button.dataset.action === 'delete-plan' && plan && confirm('Delete this itinerary record?')) {
      state.plans = state.plans.filter((item) => item.id !== plan.id);
      savePlans({ replaceSharedPlans: true });
      renderAll();
    }
    if (button.dataset.action === 'delete-accomplishment' && plan && isAdmin()) {
      removeAccomplishment(plan);
    }
  });
  document.body.addEventListener('pointerdown', (event) => {
    const svg = event.target.closest('.interactive-map');
    if (!svg) return;
    state.mapDrag = { x: event.clientX, y: event.clientY, svg };
    svg.classList.add('is-panning');
    svg.setPointerCapture(event.pointerId);
  });
  document.body.addEventListener('pointermove', (event) => {
    if (!state.mapDrag) return;
    const deltaX = event.clientX - state.mapDrag.x;
    const deltaY = event.clientY - state.mapDrag.y;
    state.mapDrag.x = event.clientX;
    state.mapDrag.y = event.clientY;
    panFieldMap(deltaX, deltaY, state.mapDrag.svg);
  });
  document.body.addEventListener('pointerup', (event) => {
    const svg = state.mapDrag && state.mapDrag.svg;
    if (svg) {
      svg.classList.remove('is-panning');
      if (svg.releasePointerCapture) svg.releasePointerCapture(event.pointerId);
    }
    state.mapDrag = null;
  });
  document.body.addEventListener('wheel', (event) => {
    const svg = event.target.closest('.interactive-map');
    if (!svg) return;
    event.preventDefault();
    zoomFieldMap(event.deltaY < 0 ? 0.86 : 1.14);
  }, { passive: false });
}

setDefaultDates();
loadAccess();
loadStaff();
loadSignatories();
loadSession();
populateStaffSelects();
loadPlans();
bindEvents();
setupInstallPrompt();
registerServiceWorker();
loadBoundary();
renderAll();
initializeSharedState();
