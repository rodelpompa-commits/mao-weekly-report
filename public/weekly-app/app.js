const defaultStaff = [
  'Rodel L. Pompa',
  'John Aldrich R. Vinzon',
  'Mila D. Lim',
  'Richelle M. Degala',
  'Eng. Hidy C. Flores',
  'Kristine Joy M. Torres',
  'Mellette B. Musico',
  'Rose Ann O. Marasigan',
  'Lorie May S. Tabilisma',
  'Jess Mark R. Macalalad',
  'Aleckz Andrea Rose M. Marayan',
  'Kezzer G. Fabregas',
  'Dra. Ithiel M. Maalihan'
];

const programs = ['Rice', 'HVCC', 'Livestock', 'Fishery', 'Biosystems Engineering'];
const storageKey = 'weekly-itinerary-accomplishment-monitor-v1';
const staffStorageKey = 'weekly-accomplishment-staff-v1';
const signatoryStorageKey = 'weekly-accomplishment-signatories-v1';
const accessStorageKey = 'weekly-accomplishment-access-v1';
const sessionStorageKey = 'weekly-accomplishment-session-v1';

const defaultSignatories = {
  preparedBy: 'Staff / Encoder',
  preparedByTitle: 'Agricultural Technologist/AEW',
  reviewedBy: 'RODEL L. POMPA',
  reviewedByTitle: 'Senior Agriculturist',
  approvedBy: 'DANNY S. VILLACRUSIS',
  approvedByTitle: 'Municipal Agriculturist'
};

const defaultAccess = {
  staffPassword: 'staff123',
  adminPassword: 'admin123',
  viewerPassword: 'viewer123',
  staffAccounts: defaultStaff.map((name) => ({ name, password: 'staff123' })),
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
  activeView: 'itineraryView'
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
  accomplishmentOutput: document.querySelector('#accomplishmentOutput'),
  accomplishmentJustification: document.querySelector('#accomplishmentJustification'),
  accomplishmentTechnicalAssistance: document.querySelector('#accomplishmentTechnicalAssistance'),
  reportDetails: document.querySelector('#reportDetails'),
  reportGradePreview: document.querySelector('#reportGradePreview'),
  adminModal: document.querySelector('#adminModal'),
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

function reportItemInputs() {
  return Array.from(document.querySelectorAll('input[name="reportItem"]'));
}

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

function passwordForStaff(name) {
  const account = state.access.staffAccounts.find((item) => item.name === name);
  return account ? account.password : state.access.staffPassword;
}

function selectedReportItems() {
  return reportItemInputs().filter((input) => input.checked).map((input) => input.value);
}

function reportGrade(plan) {
  if (!plan.technicalAssistance) return null;
  const totalItems = reportItemInputs().length || 15;
  const checkedItems = Array.isArray(plan.reportItems) ? plan.reportItems.length : 0;
  const detailsBonus = plan.reportDetails && plan.reportDetails.trim().length >= 60 ? 5 : 0;
  return Math.min(100, Math.round((checkedItems / totalItems) * 95 + detailsBonus));
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
    place: item[3],
    task: item[4],
    clients: item[5],
    technicalAssistance: index < 3,
    accomplishmentType: item[6],
    accomplishmentDate: addDays(weekStart, item[1]),
    accomplishmentPercent: item[7],
    accomplishmentOutput: item[6] === 'Boss Instruction' ? 'Urgent office consolidation instructed by the Boss' : item[4],
    justification: item[8],
    reportDetails: 'Report checked against the reporting reference guide. Technical observations and recommendations should be encoded here.',
    reportItems: ['Dates checked and current period covered', 'Recommendations / interventions / follow-up']
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
  state.session = { role: '', staffName: '' };
}

function loadPlans() {
  const stored = localStorage.getItem(storageKey);
  state.plans = stored ? JSON.parse(stored) : samplePlans();
}

function savePlans() {
  localStorage.setItem(storageKey, JSON.stringify(state.plans));
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
  const ratedPlanned = plans.filter((plan) => plan.accomplishmentType !== 'Boss Instruction');
  const conducted = ratedPlanned.filter((plan) => plan.accomplishmentType === 'Conducted');
  const justified = ratedPlanned.filter((plan) => plan.accomplishmentType === 'Not Conducted - Justified');
  const missing = ratedPlanned.filter((plan) => !plan.accomplishmentType);
  const bossChanges = plans.filter((plan) => plan.accomplishmentType === 'Boss Instruction');
  const efficiency = ratedPlanned.length ? Math.round((conducted.length / ratedPlanned.length) * 100) : 0;
  const bossRating = bossChanges.length
    ? Math.round(bossChanges.reduce((sum, plan) => sum + Number(plan.accomplishmentPercent || 0), 0) / bossChanges.length)
    : 0;
  const accomplishedReports = plans.filter((plan) => plan.accomplishmentType && plan.technicalAssistance);
  const averageReportGrade = accomplishedReports.length
    ? Math.round(accomplishedReports.reduce((sum, plan) => sum + reportGrade(plan), 0) / accomplishedReports.length)
    : null;
  return { ratedPlanned, conducted, justified, missing, bossChanges, efficiency, bossRating, averageReportGrade };
}

function statusLabel(plan) {
  if (!plan.accomplishmentType) return '<span class="status pending">No accomplishment yet</span>';
  if (plan.accomplishmentType === 'Conducted') return '<span class="status conducted">Conducted</span>';
  if (plan.accomplishmentType === 'Boss Instruction') return '<span class="status boss">Boss instruction</span>';
  return '<span class="status justified">Not conducted</span>';
}

function ratingEffect(plan) {
  if (!plan.accomplishmentType) return 'Pending encoding';
  if (plan.accomplishmentType === 'Conducted') return `Rated as conducted (${plan.accomplishmentPercent || 100}%)`;
  if (plan.accomplishmentType === 'Boss Instruction') {
    return `No penalty on planned task. New task rated ${plan.accomplishmentPercent || 0}%.`;
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
      <td>${escapeHtml(plan.task)}</td>
      <td>${escapeHtml(plan.place)}</td>
      <td>${escapeHtml(plan.clients || '')}</td>
      <td>${plan.technicalAssistance ? 'Yes' : 'No'}</td>
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
    const reportReference = [
      escapeHtml(plan.reportDetails || ''),
      plan.technicalAssistance && plan.reportItems && plan.reportItems.length
        ? `<div class="staff-meta">Checklist: ${escapeHtml(plan.reportItems.join(', '))}</div>`
        : `<div class="staff-meta">${plan.technicalAssistance ? 'No checklist items selected' : 'Not graded under technical-assistance checklist'}</div>`
    ].join('');
    const grade = reportGrade(plan);
    const gradeHtml = `<span class="grade ${reportGradeClass(grade)}">${reportGradeText(plan)}</span>`;
    const canEncode = isAdmin() || (isStaff() && state.access.staffCanAccomplish);
    row.innerHTML = `
      <td>${escapeHtml(plan.staffName)}</td>
      <td>${escapeHtml(plan.datePlanned)}</td>
      <td>${escapeHtml(plan.task)}</td>
      <td>${escapeHtml(plan.place)}</td>
      <td>${escapeHtml(plan.program)}</td>
      <td>${accomplishment}</td>
      <td>${reportReference}</td>
      <td>${gradeHtml}</td>
      <td>${escapeHtml(ratingEffect(plan))}</td>
      <td>
        <div class="row-actions">
          ${canEncode ? `<button class="primary-btn" type="button" data-action="encode" data-id="${plan.id}">Encode</button>` : '<span class="staff-meta">View only</span>'}
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
      <td>${stats.efficiency}%</td>
      <td>${stats.bossRating}%</td>
      <td>${stats.averageReportGrade === null ? 'N/A' : `${stats.averageReportGrade}%`}</td>
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
      <div class="staff-meta">${stats.bossChanges.length} boss-instructed change(s), boss task rating ${stats.bossRating}%, report grade ${stats.averageReportGrade === null ? 'N/A' : `${stats.averageReportGrade}%`}</div>
    `;
    els.staffList.append(item);
  });
}

function updateReportGradePreview() {
  const tempPlan = {
    reportDetails: els.reportDetails.value,
    reportItems: selectedReportItems(),
    technicalAssistance: els.accomplishmentTechnicalAssistance.checked
  };
  els.reportGradePreview.textContent = reportGradeText(tempPlan);
  els.reportGradePreview.className = `grade-preview ${reportGradeClass(reportGrade(tempPlan))}`;
}

function applyAccessRules() {
  const loggedIn = Boolean(state.session.role);
  els.loginScreen.classList.toggle('hidden', loggedIn);
  document.body.classList.toggle('is-locked', !loggedIn);
  els.sessionBadge.textContent = isAdmin() ? 'Admin' : isViewer() ? 'Viewer' : `Staff: ${state.session.staffName || ''}`;
  document.querySelector('#adminBtn').classList.toggle('hidden', !isAdmin());
  document.querySelector('#printBtn').classList.toggle('hidden', !(isAdmin() || isStaff()));
  document.querySelector('#exportBtn').classList.toggle('hidden', !(isAdmin() || isStaff()));
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
    els.planPlace.value = plan.place;
    els.planTask.value = plan.task;
    els.planClients.value = plan.clients || '';
    els.planTechnicalAssistance.checked = Boolean(plan.technicalAssistance);
  } else {
    els.planForm.reset();
    els.planId.value = '';
    els.planDate.value = els.weekStart.value;
    if (isStaff()) els.planStaff.value = state.session.staffName;
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
    place: els.planPlace.value.trim(),
    task: els.planTask.value.trim(),
    clients: els.planClients.value.trim(),
    technicalAssistance: els.planTechnicalAssistance.checked
  };
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
  els.accomplishmentOutput.value = target.accomplishmentOutput || target.task || '';
  els.accomplishmentJustification.value = target.justification || '';
  els.accomplishmentTechnicalAssistance.checked = Boolean(target.technicalAssistance);
  els.reportDetails.value = target.reportDetails || '';
  reportItemInputs().forEach((input) => {
    input.checked = Array.isArray(target.reportItems) && target.reportItems.includes(input.value);
  });
  els.accomplishmentStaff.disabled = isStaff() && !isAdmin();
  updateReportGradePreview();
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
  updateReportGradePreview();
}

function saveAccomplishment(event) {
  event.preventDefault();
  const plan = state.plans.find((item) => item.id === els.accomplishmentPlanId.value);
  if (!plan) return;
  const isBossOnlyTask = plan.task === 'New task instructed by the Boss' || plan.accomplishmentType === 'Boss Instruction';
  const allowed = isAdmin() || (isStaff() && (isBossOnlyTask ? state.access.staffCanBossTask : state.access.staffCanAccomplish));
  if (!allowed) return;
  const type = els.accomplishmentType.value;
  const justification = els.accomplishmentJustification.value.trim();
  if (type !== 'Conducted' && !justification) {
    alert('Please encode the justification or Boss instruction details.');
    return;
  }
  plan.staffName = isStaff() ? state.session.staffName : els.accomplishmentStaff.value;
  plan.accomplishmentDate = els.accomplishmentDate.value;
  plan.accomplishmentType = type;
  plan.accomplishmentPercent = Number(els.accomplishmentPercent.value);
  plan.accomplishmentOutput = els.accomplishmentOutput.value.trim();
  plan.justification = justification;
  plan.technicalAssistance = els.accomplishmentTechnicalAssistance.checked;
  plan.reportDetails = els.reportDetails.value.trim();
  plan.reportItems = plan.technicalAssistance ? selectedReportItems() : [];
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

function showAdminSettings() {
  els.staffNamesInput.value = staffAccountLines();
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
  els.staffNamesInput.focus();
}

function hideAdminSettings() {
  els.adminModal.classList.add('hidden');
}

function saveAdminSettings(event) {
  event.preventDefault();
  const defaultStaffPassword = els.staffPasswordInput.value.trim() || defaultAccess.staffPassword;
  const previousAccounts = state.access.staffAccounts || [];
  const accounts = els.staffNamesInput.value
    .split('\n')
    .map((line) => {
      const [namePart, passwordPart] = line.split('|');
      const name = (namePart || '').trim();
      const existing = previousAccounts.find((account) => account.name === name);
      const password = (passwordPart || '').trim() || (existing && existing.password) || defaultStaffPassword;
      return { name, password };
    })
    .filter((account) => account.name);
  const uniqueAccounts = accounts.filter((account, index, list) => (
    list.findIndex((item) => item.name.toLowerCase() === account.name.toLowerCase()) === index
  ));
  if (!uniqueAccounts.length) {
    alert('Please keep at least one staff account.');
    return;
  }
  state.staff = uniqueAccounts.map((account) => account.name);
  state.access = {
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
    ['Staff', 'Planned Date', 'Program', 'Planned Task', 'Place', 'Clients', 'Technical Assistance Report', 'Accomplishment Type', 'Date Conducted', 'Actual Output', 'Performance', 'Justification / Boss Instruction', 'Technical / Operational Details', 'Report Checklist', 'TA Report Grade', 'Rating Effect'],
    ...filteredPlans().map((plan) => [
      plan.staffName,
      plan.datePlanned,
      plan.program,
      plan.task,
      plan.place,
      plan.clients,
      plan.technicalAssistance ? 'Yes' : 'No',
      plan.accomplishmentType || '',
      plan.accomplishmentDate || '',
      plan.accomplishmentOutput || '',
      plan.accomplishmentPercent === undefined ? '' : `${plan.accomplishmentPercent}%`,
      plan.justification || '',
      plan.reportDetails || '',
      (plan.reportItems || []).join('; '),
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

function handleLogin(event) {
  event.preventDefault();
  const role = els.loginRole.value;
  const password = els.loginPassword.value;
  if (role === 'admin' && password === state.access.adminPassword) {
    state.session = { role: 'admin', staffName: '' };
  } else if (role === 'viewer' && password === state.access.viewerPassword) {
    state.session = { role: 'viewer', staffName: '' };
  } else if (role === 'staff') {
    const staffName = els.loginStaff.value;
    if (password !== passwordForStaff(staffName)) {
      els.loginMessage.textContent = 'Incorrect password. Please try again.';
      return;
    }
    state.session = { role: 'staff', staffName };
    state.staffFilter = els.loginStaff.value;
  } else {
    els.loginMessage.textContent = 'Incorrect password. Please try again.';
    return;
  }
  els.loginPassword.value = '';
  els.loginMessage.textContent = '';
  saveSession();
  renderAll();
}

function handleLogout() {
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
  document.querySelector('#addBossTaskBtn').addEventListener('click', () => showAccomplishmentForm());
  document.querySelector('#cancelAccomplishmentBtn').addEventListener('click', hideAccomplishmentForm);
  els.accomplishmentForm.addEventListener('submit', saveAccomplishment);
  document.querySelector('#adminBtn').addEventListener('click', showAdminSettings);
  document.querySelector('#closeAdminBtn').addEventListener('click', hideAdminSettings);
  document.querySelector('#adminForm').addEventListener('submit', saveAdminSettings);
  document.querySelector('#restoreStaffBtn').addEventListener('click', () => {
    if (!confirm('Restore the default staff list?')) return;
    state.staff = [...defaultStaff];
    state.access.staffAccounts = defaultStaff.map((name) => ({ name, password: state.access.staffPassword || defaultAccess.staffPassword }));
    els.staffNamesInput.value = staffAccountLines();
    saveStaff();
    saveAccess();
    populateStaffSelects();
    renderAll();
  });
  els.adminModal.addEventListener('click', (event) => {
    if (event.target === els.adminModal) hideAdminSettings();
  });
  document.querySelector('#exportBtn').addEventListener('click', exportCsv);
  document.querySelector('#printBtn').addEventListener('click', () => window.print());
  document.querySelector('#logoutBtn').addEventListener('click', handleLogout);
  reportItemInputs().forEach((input) => input.addEventListener('change', updateReportGradePreview));
  els.reportDetails.addEventListener('input', updateReportGradePreview);
  els.accomplishmentTechnicalAssistance.addEventListener('change', updateReportGradePreview);
  document.querySelector('#resetBtn').addEventListener('click', () => {
    if (!confirm('Restore sample itinerary and accomplishment records?')) return;
    state.plans = samplePlans();
    savePlans();
    renderAll();
  });
  document.body.addEventListener('click', (event) => {
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
      savePlans();
      renderAll();
    }
  });
}

setDefaultDates();
loadAccess();
loadStaff();
loadSignatories();
loadSession();
populateStaffSelects();
loadPlans();
bindEvents();
renderAll();
