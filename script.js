/* ============ CHECKLIST DATA ============
   Fas 1 och 2 har egna formulär. Fas 3–6 använder den befintliga
   checklistmotorn, men med få huvudpunkter och villkorsstyrd visning. */
const SECTIONS = [
  {
    id:"kontakt", title:"Företagsprofil & uppdrag",
    syfte:"Ringa in kunden, uppdragets omfattning och de uppgifter som ska styra resten av onboardingen.",
    groups:[]
  },
  {
    id:"kundkannedom", title:"Kundkännedom & risk",
    syfte:"Säkerställa tillräcklig kundkännedom, bedöma risk och avgöra om kunden kan accepteras.",
    groups:[]
  },
  {
    id:"avtal", title:"Avtal & arbetssätt",
    groups:[
      {title:"Uppdrag och villkor", items:[
        {id:"scope", text:"Uppdragets omfattning och gränsdragning är fastställd"}
      ]},
      {title:"Ansvar och samarbete", items:[
        {id:"responsibility", text:"Ansvarsfördelningen mellan kunden och byrån är fastställd"},
        {id:"internal", text:"Ansvarig konsult, eventuell ersättare och behov av specialist är hanterade"},
        {id:"communication", text:"Kontaktpersoner och kommunikationskanaler är fastställda"},
        {id:"materialRoutine", text:"Rutin för inskickning av underlag och viktiga deadlines är överenskomna"},
        {id:"approvalRoutine", text:"Attest- och godkännanderutiner är fastställda, om relevant"}
      ]},
      {title:"Administration och avtal", items:[
        {id:"customerCard", text:"Kundkortet är komplett"},
        {id:"agreement", text:"Uppdragsavtal med relevanta villkor och bilagor är upprättat"},
        {id:"agreementSigned", text:"Uppdragsavtalet är signerat och arkiverat"}
      ]}
    ]
  },
  {
    id:"overtag", title:"Övertag & ekonomiskt underlag",
    groups:[
      {title:"Räkenskapsinformation", items:[
        {id:"bookkeepingData", text:"Bokföringsdata/SIE och nödvändiga bokföringsunderlag är mottagna", visibleWhen:"existing"},
        {id:"annualMaterial", text:"Senaste bokslut/årsredovisning och relevanta deklarationer är mottagna", visibleWhen:"existing"},
        {id:"registers", text:"Nödvändiga register och specifikationer är mottagna", visibleWhen:"existing"}
      ]},
      {title:"Ingående läge", items:[
        {id:"openingBalances", text:"Ingående balanser och väsentliga poster är kontrollerade", visibleWhen:"existing"},
        {id:"deviations", text:"Eventuella fel eller avvikelser är dokumenterade och hanterade", visibleWhen:"existing"}
      ]}
    ]
  },
  {
    id:"system", title:"Behörigheter, system & dokumentation",
    groups:[
      {title:"Behörigheter", items:[
        {id:"authorityAccess", text:"Nödvändiga myndighets- och ombudsbehörigheter är på plats"},
        {id:"bankSystemAccess", text:"Nödvändiga bank- och systembehörigheter är på plats"},
        {id:"correctAccess", text:"Rätt personer har rätt åtkomst"}
      ]},
      {title:"Systemuppsättning", items:[
        {id:"baseSetup", text:"Grundinställningar och kontoplan är korrekt konfigurerade"},
        {id:"payrollSetup", text:"Lönesystem och relevanta lönebehörigheter är uppsatta", visibleWhen:"payroll"},
        {id:"foreignSetup", text:"Relevant utlandsmoms/OSS eller annan utlandshantering är konfigurerad", visibleWhen:"foreign"},
        {id:"integrations", text:"Nödvändiga integrationer och specialfunktioner är aktiverade och testade"}
      ]},
      {title:"Digital dokumenthantering", items:[
        {id:"documentStructure", text:"Kundens dokumentstruktur är upprättad enligt byråns standard"}
      ]}
    ]
  },
  {
    id:"uppfoljning", title:"Startklar & uppföljning",
    groups:[
      {title:"Startklar", items:[
        {id:"acceptanceAgreement", text:"Kundaccept och uppdragsavtal är klara", disabledWhen:"startPrerequisites"},
        {id:"openingReady", text:"Nödvändigt underlag och ekonomiskt utgångsläge är kontrollerade", visibleWhen:"existing"},
        {id:"systemsReady", text:"Behörigheter, system och integrationer fungerar"},
        {id:"workReady", text:"Ansvar, arbetsrutiner och kommande deadlines är tydliga"},
        {id:"remaining", text:"Eventuella kvarstående punkter är dokumenterade och har en ansvarig"}
      ]},
      {title:"Uppföljning efter start", items:[
        {id:"customerFollowup", text:"Kunden är kontaktad och övergången fungerar som förväntat"},
        {id:"routineFollowup", text:"Rutiner för kommunikation och inskickning av material fungerar"},
        {id:"technicalFollowup", text:"Behörigheter, integrationer och relevanta systemflöden fungerar"},
        {id:"issuesFollowup", text:"Eventuella problem, saknade uppgifter eller brister är identifierade och hanterade"}
      ]}
    ]
  }
];

/* ============ STORAGE KEYS ============ */
const CUSTOMERS_KEY = "onboarding-customers-v1";
const ACTIVE_CUSTOMER_KEY = "onboarding-active-customer-v1";
const stateKeyFor = (customerId) => "onboarding-state-v1-" + customerId;

/* ============ FAS 1: FÖRETAGSUPPGIFTER OCH UPPDRAGSPROFIL ============
   Fas 1 skiljer sig från övriga steg: användaren matar in grunddata och
   systemet återanvänder samma data för flera regelverksbedömningar.
   Övriga faser fortsätter använda den befintliga checklistmodellen ovan. */
const PHASE1_KEY_PREFIX = "onboarding-phase1-v1-";
const phaseOneKeyFor = (customerId) => PHASE1_KEY_PREFIX + customerId;

/* Intervallen ligger samlade här så att Fas 1-reglerna kan använda samma gränser
   utan att lagra eller visa påhittade exakta belopp. */
const TURNOVER_RANGES = [
  {value:'turnover_upto_1m', label:'Upp till 1 mkr', minExclusive:null, max:1000000},
  {value:'turnover_1m_3m', label:'1 mkr – 3 mkr', minExclusive:1000000, max:3000000},
  {value:'turnover_3m_40m', label:'3 mkr – 40 mkr', minExclusive:3000000, max:40000000},
  {value:'turnover_40m_80m', label:'40 mkr – 80 mkr', minExclusive:40000000, max:80000000},
  {value:'turnover_over_80m', label:'Över 80 mkr', minExclusive:80000000, max:null}
];
const BALANCE_RANGES = [
  {value:'balance_upto_1_5m', label:'Upp till 1,5 mkr', minExclusive:null, max:1500000},
  {value:'balance_1_5m_40m', label:'1,5 mkr – 40 mkr', minExclusive:1500000, max:40000000},
  {value:'balance_over_40m', label:'Över 40 mkr', minExclusive:40000000, max:null}
];
const EMPLOYEE_RANGES = [
  {value:'employees_0_3', label:'0–3', minExclusive:null, max:3},
  {value:'employees_4_50', label:'4–50', minExclusive:3, max:50},
  {value:'employees_over_50', label:'Över 50', minExclusive:50, max:null}
];
const PHASE1_RANGES = {turnover:TURNOVER_RANGES, balance:BALANCE_RANGES, employees:EMPLOYEE_RANGES};

function blankPhaseOne(){
  return {
    companyType: "",                 // "ab" | "sole"
    businessStatus: "",              // "new" | "existing"
    services: [],                     // bookkeeping, vat, payroll, annual, tax, other
    otherService: "",
    otherServices: [],                // Tillagda tjänster; otherService används som sparat utkast.
    otherServiceEditIndex: null,       // null = stängt, -1 = ny tjänst, annars index för pågående redigering.
    // Kompakta registrerings- och styrfrågor som används för att filtrera Fas 3–6.
    vatRegistered: "",                // "yes" | "no"
    employerRegistered: "",           // "yes" | "no"
    fTaxRegistered: "",               // "yes" | "no"
    previousFirm: "",                 // "yes" | "no" (endast befintlig verksamhet)
    foreignActivity: "",              // "yes" | "no"
    latest: { turnover:"", balance:"", employees:"" },
    previous: { turnover:"", balance:"", employees:"" },
    expected: { turnover:"", balance:"", employees:"" },
    choices: { kRule:"", accountingMethod:"", vatPeriod:"" }
  };
}

function ensurePhaseOne(data){
  const base = blankPhaseOne();
  const d = data && typeof data === 'object' ? data : {};
  // Äldre fritext blir en enda listpost. En befintlig lista (även tom) migreras aldrig igen.
  const hasServiceList = Array.isArray(d.otherServices);
  const otherServices = hasServiceList ? d.otherServices.filter(value=>typeof value==='string' && value.trim())
    : typeof d.otherService==='string' && d.otherService.trim() ? [d.otherService] : [];
  const editIndex = d.otherServiceEditIndex;
  return {
    ...base,
    ...d,
    services: Array.isArray(d.services) ? d.services : [],
    otherServices,
    otherService: hasServiceList && typeof d.otherService==='string' ? d.otherService : '',
    otherServiceEditIndex: Number.isInteger(editIndex) && editIndex>=-1 && editIndex<otherServices.length ? editIndex : null,
    latest: {...base.latest, ...(d.latest || {})},
    previous: {...base.previous, ...(d.previous || {})},
    expected: {...base.expected, ...(d.expected || {})},
    choices: {...base.choices, ...(d.choices || {})}
  };
}

function loadPhaseOneFor(customerId){
  try{
    const raw = localStorage.getItem(phaseOneKeyFor(customerId));
    return ensurePhaseOne(raw ? JSON.parse(raw) : null);
  }catch(e){
    return blankPhaseOne();
  }
}

function savePhaseOne(){
  if(!activeCustomerId) return;
  clearUnavailablePhaseOneChoices();
  try{
    localStorage.setItem(phaseOneKeyFor(activeCustomerId), JSON.stringify(phaseOne));
    setSaveStatus("Sparat automatiskt");
  }catch(e){
    setSaveStatus("Kunde inte spara just nu");
  }
}

function toNumber(value){
  if(value === "" || value === null || value === undefined) return null;
  const n = Number(String(value).replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

function formatMoney(value){
  const n = toNumber(value);
  return n === null ? "–" : new Intl.NumberFormat('sv-SE', {maximumFractionDigits:0}).format(n) + " kr";
}

function phaseOneScope(p=phaseOne){
  return p.businessStatus === 'new' ? p.expected : p.latest;
}

function getRangeDefinition(type, value){
  return (PHASE1_RANGES[type] || []).find(range => range.value === value) || null;
}

/* Äldre kunder kan ha exakta numeriska värden sparade. De klassificeras vid läsning/användning
   men localStorage skrivs inte om förrän användaren själv ändrar ett dropdown-val. */
function classifyLegacyRangeValue(type, value){
  if(value === '' || value === null || value === undefined) return '';
  if(getRangeDefinition(type, value)) return value;
  const n = toNumber(value);
  if(n === null) return '';
  const match = (PHASE1_RANGES[type] || []).find(range =>
    (range.minExclusive === null || n > range.minExclusive) &&
    (range.max === null || n <= range.max)
  );
  return match ? match.value : '';
}

function hasRangeValue(type, value){
  return !!classifyLegacyRangeValue(type, value);
}

function getRangeLabel(type, value){
  const normalized = classifyLegacyRangeValue(type, value);
  const range = getRangeDefinition(type, normalized);
  return range ? range.label : '';
}

/* Gränserna ligger exakt mellan intervallen. Därför kan varje regel avgöras entydigt
   utan att anta ett exakt belopp inne i intervallet. */
function rangeExceedsThreshold(type, value, threshold){
  const range = getRangeDefinition(type, classifyLegacyRangeValue(type, value));
  if(!range) return null;
  return range.minExclusive !== null && range.minExclusive >= threshold;
}

function hasCompleteHistoricalData(p=phaseOne){
  return ['turnover','balance','employees'].every(k => hasRangeValue(k, p.latest[k]) && hasRangeValue(k, p.previous[k]));
}

function hasCompleteScopeData(p=phaseOne){
  if(p.businessStatus === 'existing') return hasCompleteHistoricalData(p);
  if(p.businessStatus === 'new') return ['turnover','balance','employees'].every(k => hasRangeValue(k, p.expected[k]));
  return false;
}

function countExceeded(year, limits){
  return Object.keys(limits).reduce((count, key) => count + (rangeExceedsThreshold(key, year[key], limits[key]) === true ? 1 : 0), 0);
}

/* Separata logikfunktioner enligt Fas 1-prompten. De använder samma grunddata. */
function calculateAuditRequirement(){
  if(phaseOne.companyType !== 'ab') return {status:'na', label:'Inte aktuellt', detail:'Revisionspliktskontrollen visas endast för aktiebolag.'};
  if(phaseOne.businessStatus !== 'existing' || !hasCompleteHistoricalData()){
    return {status:'review', label:'Kan inte slutligt bedömas', detail:'Två kompletta historiska räkenskapsår krävs för den automatiska tvåårsbedömningen.'};
  }
  const limits = {turnover:3000000, balance:1500000, employees:3};
  const a = countExceeded(phaseOne.latest, limits);
  const b = countExceeded(phaseOne.previous, limits);
  const required = a >= 2 && b >= 2;
  return {
    status: required ? 'blocked' : 'possible',
    label: required ? 'Revisionsplikt föreligger' : 'Ingen revisionsplikt utifrån storlekskriterierna',
    detail: `Senaste året: ${a} av 3 gränsvärden överskridna. Föregående året: ${b} av 3.`
  };
}

function calculateLargeCompanyStatus(p=phaseOne){
  if(!['ab','sole'].includes(p.companyType)) return {status:'na', label:'Inte aktuellt', detail:'Välj företagsform för att få storleksstöd.'};
  if(p.businessStatus !== 'existing' || !hasCompleteHistoricalData(p)){
    return {status:'review', label:'Kan inte slutligt bedömas', detail:'Två kompletta historiska räkenskapsår krävs för den automatiska tvåårsbedömningen.'};
  }
  const limits = {turnover:80000000, balance:40000000, employees:50};
  const a = countExceeded(p.latest, limits);
  const b = countExceeded(p.previous, limits);
  // Minst samma två gränsvärden måste vara överskridna under båda åren.
  const consistentlyExceeded = Object.keys(limits).filter(key =>
    rangeExceedsThreshold(key, p.latest[key], limits[key]) === true &&
    rangeExceedsThreshold(key, p.previous[key], limits[key]) === true
  ).length;
  const large = consistentlyExceeded >= 2;
  return {
    status: large ? 'blocked' : 'possible',
    label: large ? 'Företaget uppfyller storlekskriterierna för större företag' : 'Företaget uppfyller inte storlekskriterierna för större företag',
    detail: `Senaste året: ${a} av 3 gränsvärden överskridna. Föregående året: ${b} av 3. Samma gränsvärden båda åren: ${consistentlyExceeded} av 3. Detta är stöd för K-regelverksvalet.`
  };
}

function calculateK1Eligibility(p=phaseOne){
  if(p.companyType !== 'sole') return {visible:false, status:'na', label:'Inte aktuellt', detail:'K1-stödet gäller här endast enskild näringsverksamhet.'};
  if(!p.businessStatus) return {visible:true, status:'review', label:'Kan inte bedömas ännu', detail:'Ange verksamhetens status och nettoomsättning för att få K1-stöd.'};

  if(p.businessStatus === 'new'){
    const turnover = p.expected.turnover;
    if(!hasRangeValue('turnover', turnover)) return {visible:true, status:'review', label:'Kan inte bedömas ännu', detail:'Ange förväntad nettoomsättning för att få K1-stöd.'};
    const overThree = rangeExceedsThreshold('turnover', turnover, 3000000);
    return overThree
      ? {visible:true, status:'blocked', label:'Inte möjligt utifrån angiven omsättning', detail:'K1 är inte möjligt utifrån angiven förväntad nettoomsättning över 3 mkr.'}
      : {visible:true, status:'possible', label:'Kan vara möjligt', detail:'Den förväntade nettoomsättningen ligger inom K1:s omsättningsgräns på högst 3 mkr. Övriga förutsättningar behöver också vara uppfyllda.'};
  }

  const latest = p.latest.turnover;
  const previous = p.previous.turnover;
  if(!hasRangeValue('turnover', latest) || !hasRangeValue('turnover', previous)){
    return {visible:true, status:'review', label:'Kan inte bedömas ännu', detail:'Ange nettoomsättning för båda räkenskapsåren för att få K1-stöd.'};
  }
  const latestOver = rangeExceedsThreshold('turnover', latest, 3000000);
  const previousOver = rangeExceedsThreshold('turnover', previous, 3000000);
  if(!latestOver && !previousOver){
    return {visible:true, status:'possible', label:'Kan vara möjligt', detail:'Nettoomsättningen ligger på högst 3 mkr under båda angivna räkenskapsåren. Övriga förutsättningar behöver också vara uppfyllda.'};
  }
  if(latestOver !== previousOver){
    return {visible:true, status:'review', label:'Kräver bedömning', detail:'Nettoomsättningen överstiger 3 mkr under ett av de två åren. K1 bygger på att nettoomsättningen normalt uppgår till högst 3 mkr. Ett enstaka överskridande behöver därför bedömas.'};
  }
  // Två räkenskapsår över 3 mkr blockerar K1 enligt verktygets tvåårsbedömning.
  return {visible:true, status:'blocked', label:'Inte möjligt utifrån angiven omsättning', detail:'Nettoomsättningen överstiger 3 mkr under båda angivna räkenskapsåren.'};
}

function getAvailableKRules(p=phaseOne){
  if(!p.companyType) return [];
  // K-regelverket kan väljas först när samtliga aktuella omfattningsintervall är angivna.
  if(!hasCompleteScopeData(p)){
    return ['K1','K2','K3'].map(value=>({value, state:'review', disabled:true, note:'Fyll i samtliga intervall ovan först'}));
  }
  const large = calculateLargeCompanyStatus(p);
  if(p.companyType === 'ab'){
    return [
      {value:'K1', state:'disabled', disabled:true, note:'Ej tillämpligt för aktiebolag'},
      {value:'K2', state: large.status === 'blocked' ? 'disabled' : 'possible', disabled:large.status === 'blocked', note: large.status === 'blocked' ? 'Ej tillämpligt för större företag' : 'Kan vara möjligt'},
      {value:'K3', state:'possible', note:'Kan vara möjligt'}
    ];
  }
  if(p.companyType === 'sole'){
    const k1 = calculateK1Eligibility(p);
    return [
      {value:'K1', state:k1.status, disabled:k1.status === 'blocked', note:k1.status === 'possible' ? k1.label : `${k1.label}. ${k1.detail}`},
      {value:'K2', state: large.status === 'blocked' ? 'disabled' : 'possible', disabled:large.status === 'blocked', note: large.status === 'blocked' ? 'Ej tillämpligt för större företag' : 'Kan vara möjligt'},
      {value:'K3', state:'possible', note:'Kan vara möjligt'}
    ];
  }
  return [];
}

function getAvailableAccountingMethods(p=phaseOne){
  const turnover = phaseOneScope(p).turnover;
  if(!hasRangeValue('turnover', turnover)) return {status:'review', message:'Ange nettoomsättning för att få stöd om bokföringsmetod.', options:[{value:'cash',label:'Kontantmetoden',disabled:true},{value:'invoice',label:'Faktureringsmetoden',disabled:false}]};
  const cashPossible = rangeExceedsThreshold('turnover', turnover, 3000000) === false;
  return {
    status: cashPossible ? 'possible' : 'blocked',
    message: cashPossible ? 'Kontantmetoden kan vara möjlig' : 'Kontantmetoden är inte möjlig utifrån angiven nettoomsättning',
    options:[{value:'cash',label:'Kontantmetoden',disabled:!cashPossible},{value:'invoice',label:'Faktureringsmetoden',disabled:false}]
  };
}

function getAvailableVatPeriods(p=phaseOne){
  if(!p.services.includes('vat')) return {visible:false, options:[]};
  const turnover = phaseOneScope(p).turnover;
  if(!hasRangeValue('turnover', turnover)) return {visible:true, status:'review', message:'Ange nettoomsättning för att se möjliga momsperioder.', options:[]};
  const options = [
    {value:'year', label:'År', disabled:rangeExceedsThreshold('turnover', turnover, 1000000) === true},
    {value:'quarter', label:'Kvartal', disabled:rangeExceedsThreshold('turnover', turnover, 40000000) === true},
    {value:'month', label:'Månad', disabled:false}
  ];
  return {visible:true, status:'possible', message:'Välj bland de perioder som är möjliga utifrån angiven omfattning.', options};
}

/* Rensa endast slutval som inte längre är valbara enligt befintligt regelstöd.
   Valbara alternativ behålls även när de kräver bedömning; inget ersättningsval görs. */
function clearUnavailablePhaseOneChoices(kRules=getAvailableKRules(), accounting=getAvailableAccountingMethods(), vat=getAvailableVatPeriods()){
  const optionsByChoice = {kRule:kRules, accountingMethod:accounting.options, vatPeriod:vat.options};
  let changed = false;
  Object.entries(optionsByChoice).forEach(([key, options])=>{
    const selected = phaseOne.choices[key];
    if(selected && !options.some(o=>o.value === selected && !o.disabled && o.state !== 'disabled')){
      phaseOne.choices[key] = '';
      changed = true;
    }
  });
  return changed;
}

function calculateSimplifiedAnnualReportEligibility(){
  if(phaseOne.companyType !== 'sole') return {visible:false};
  const k1 = calculateK1Eligibility();
  return {visible:true, status:k1.status, label:k1.label, detail:k1.detail};
}

function phaseOneCountsOf(data){
  return requirementCounts(phaseOneRequirements(data));
}
function phaseOneCounts(){ return phaseOneCountsOf(phaseOne); }

function statusIcon(status){
  return status === 'possible' ? '🟢' : status === 'blocked' ? '🔴' : status === 'review' ? '🟡' : '⚪';
}

function safe(text){
  return String(text ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
}

function radioCard(name, value, label, checked){
  return `<label class="choice-card"><input type="radio" name="${name}" data-p1="${name}" value="${value}" ${checked ? 'checked' : ''}><span class="choice-dot"></span><span>${label}</span></label>`;
}

function compactYesNo(name, label, value){
  return `<div class="compact-choice-line"><span>${label}</span><div class="choice-row compact">${radioCard(name,'yes','Ja',value==='yes')}${radioCard(name,'no','Nej',value==='no')}</div></div>`;
}

function rangeOptions(type, value){
  const selected = classifyLegacyRangeValue(type, value);
  return `<option value="">Välj intervall</option>` + (PHASE1_RANGES[type] || []).map(range =>
    `<option value="${range.value}" ${selected===range.value?'selected':''}>${safe(range.label)}</option>`
  ).join('');
}

function rangeField(path, label, type, value){
  return `<label class="field"><span>${label}</span><select data-p1-path="${path}">${rangeOptions(type, value)}</select></label>`;
}

function renderRuleCard(title, result, detailsLabel='Visa beräkning'){
  return `<div class="rule-card status-${result.status}">
    <div class="rule-title">${title}</div>
    <div class="rule-result">${statusIcon(result.status)} <strong>${result.label}</strong></div>
    ${result.detail ? `<details><summary>${detailsLabel}</summary><p>${safe(result.detail)}</p></details>` : ''}
  </div>`;
}

function renderPhaseOnePage(){
  const page = document.createElement('div');
  page.className = 'page';
  page.id = 'page-kontakt';
  const audit = calculateAuditRequirement();
  const large = calculateLargeCompanyStatus();
  const kRules = getAvailableKRules();
  const accounting = getAvailableAccountingMethods();
  const vat = getAvailableVatPeriods();
  // Kontrollera även äldre sparade val innan markeringar och sammanfattning visas.
  if(clearUnavailablePhaseOneChoices(kRules, accounting, vat)) savePhaseOne();
  const simplified = calculateSimplifiedAnnualReportEligibility();
  const counts = phaseOneCounts();
  const pct = Math.round((counts.done / counts.total) * 100);

  const services = [
    ['bookkeeping','Löpande bokföring'],['vat','Moms'],['payroll','Arbetsgivardeklaration/löneadministration'],
    ['annual','Bokslut/årsredovisning'],['tax','Inkomstdeklaration'],['other','Annat']
  ];

  const historical = `<div class="scope-table">
    <div class="scope-head"></div><div class="scope-head">Senaste räkenskapsår</div><div class="scope-head">Föregående räkenskapsår</div>
    <div class="scope-label">Nettoomsättning</div><select data-p1-path="latest.turnover">${rangeOptions('turnover',phaseOne.latest.turnover)}</select><select data-p1-path="previous.turnover">${rangeOptions('turnover',phaseOne.previous.turnover)}</select>
    <div class="scope-label">Balansomslutning</div><select data-p1-path="latest.balance">${rangeOptions('balance',phaseOne.latest.balance)}</select><select data-p1-path="previous.balance">${rangeOptions('balance',phaseOne.previous.balance)}</select>
    <div class="scope-label">Medelantal anställda</div><select data-p1-path="latest.employees">${rangeOptions('employees',phaseOne.latest.employees)}</select><select data-p1-path="previous.employees">${rangeOptions('employees',phaseOne.previous.employees)}</select>
  </div>`;

  const expected = `<div class="field-grid three">
    ${rangeField('expected.turnover','Förväntad nettoomsättning','turnover',phaseOne.expected.turnover)}
    ${rangeField('expected.balance','Förväntad balansomslutning','balance',phaseOne.expected.balance)}
    ${rangeField('expected.employees','Förväntat antal anställda','employees',phaseOne.expected.employees)}
  </div>`;

  const kHtml = kRules.map(r => {
    const disabled = r.disabled === true || r.state === 'disabled';
    return `<label class="rule-option ${disabled ? 'is-disabled' : ''} status-${r.state}">
      <input type="radio" name="kRule" data-p1-choice="kRule" value="${r.value}" ${phaseOne.choices.kRule===r.value?'checked':''} ${disabled?'disabled':''}>
      <span><strong>${r.value}</strong><small>${statusIcon(r.state)} ${safe(r.note)}</small></span>
    </label>`;
  }).join('');

  const accountingOptions = accounting.options.map(o => `<label class="rule-option ${o.disabled?'is-disabled':''}"><input type="radio" name="accountingMethod" data-p1-choice="accountingMethod" value="${o.value}" ${phaseOne.choices.accountingMethod===o.value?'checked':''} ${o.disabled?'disabled':''}><span><strong>${o.label}</strong></span></label>`).join('');
  const vatOptions = vat.options.map(o => `<label class="rule-option ${o.disabled?'is-disabled':''}"><input type="radio" name="vatPeriod" data-p1-choice="vatPeriod" value="${o.value}" ${phaseOne.choices.vatPeriod===o.value?'checked':''} ${o.disabled?'disabled':''}><span><strong>${o.label}</strong></span></label>`).join('');

  const selectedServices = selectedServiceNames(Object.fromEntries(services)).join(', ') || '–';
  const kAvailable = kRules.filter(r=>r.state!=='disabled' && !r.disabled).map(r=>r.value).join(' / ') || '–';
  const methodAvailable = accounting.options.filter(o=>!o.disabled).map(o=>o.label).join(' / ') || '–';
  const vatAvailable = vat.visible ? (vat.options.filter(o=>!o.disabled).map(o=>o.label).join(' / ') || 'Kan inte bedömas ännu') : 'Inte aktuellt';

  page.innerHTML = `
    <div class="page-eyebrow">Onboarding · Steg 1 av 6</div>
    <h2>Företagsuppgifter och uppdragsprofil</h2>
    <div class="progress-wrap" id="progress-kontakt"><div class="progress-top"><span class="pct-num">${pct}%</span><span class="frac">${counts.done} av ${counts.total} uppgifter ifyllda</span></div><div class="bar-track"><div class="bar-fill" style="width:${pct}%; background:${pctColor(pct)}"></div></div></div>

    <section class="phase-block"><div><h3>Företagsform</h3><div class="choice-row">${radioCard('companyType','ab','Aktiebolag',phaseOne.companyType==='ab')}${radioCard('companyType','sole','Enskild näringsverksamhet',phaseOne.companyType==='sole')}</div></div></section>

    <section class="phase-block"><div><h3>Verksamhetens status</h3><div class="choice-row">${radioCard('businessStatus','new','Nystartad verksamhet',phaseOne.businessStatus==='new')}${radioCard('businessStatus','existing','Befintlig verksamhet',phaseOne.businessStatus==='existing')}</div>${phaseOne.businessStatus ? `<div class="info-box">ⓘ ${phaseOne.businessStatus==='existing'?'Hämta uppgifter från befintliga underlag där det är möjligt, exempelvis senaste årsredovisning eller bokslut.':'Historiska uppgifter saknas. Ange förväntad omfattning om uppgifterna behövs för bedömningen.'}</div>`:''}</div></section>

    <section class="phase-block"><div><h3>Vilka tjänster ska byrån utföra? <span class="required">Minst ett val</span></h3><div class="service-grid">${services.map(([v,l])=>`<label class="service-option"><input type="checkbox" data-p1-service="${v}" ${phaseOne.services.includes(v)?'checked':''}><span class="native-box"></span><span>${l}</span></label>`).join('')}</div>${phaseOne.services.includes('other')?renderOtherServices():''}</div></section>

    <section class="phase-block"><div><h3>Registreringar och styrande uppgifter</h3>
      <div class="compact-choice-stack">
        ${compactYesNo('fTaxRegistered','F-skatt registrerad?',phaseOne.fTaxRegistered)}
        ${phaseOne.services.includes('vat') ? compactYesNo('vatRegistered','Momsregistrerad?',phaseOne.vatRegistered) : ''}
        ${phaseOne.services.includes('payroll') ? compactYesNo('employerRegistered','Arbetsgivarregistrerad?',phaseOne.employerRegistered) : ''}
        ${phaseOne.businessStatus==='existing' ? compactYesNo('previousFirm','Tidigare redovisningsbyrå?',phaseOne.previousFirm) : ''}
        ${compactYesNo('foreignActivity','Utlandsverksamhet, import eller export?',phaseOne.foreignActivity)}
      </div>
    </div></section>

    <section class="phase-block"><div><h3>Verksamhetens omfattning</h3><p class="block-help">Ange uppgifterna från befintliga underlag där det är möjligt. Uppgifterna används för att bedöma vilka regler och alternativ som kan vara aktuella för kunden.</p>${phaseOne.businessStatus==='existing'?historical:phaseOne.businessStatus==='new'?`${expected}<div class="info-box">ⓘ Ange uppskattad omfattning om den är känd. Uppgifterna används endast som underlag för regelverksstöd och kan behöva uppdateras när faktisk omfattning är känd.</div>`:`<div class="empty-state">Välj först om verksamheten är nystartad eller befintlig.</div>`}</div></section>

    <section class="phase-block rules"><div><h3>Regelverksstöd</h3><p class="block-help">Detta är automatiskt stöd utifrån uppgifterna ovan. Gör bara ett aktivt val där flera alternativ är möjliga.</p>
      ${phaseOne.companyType==='ab'?renderRuleCard('Revisionsplikt',audit):''}
      ${phaseOne.companyType==='ab'?renderRuleCard('Större företag',large):''}
      ${phaseOne.companyType?`<div class="rule-card"><div class="rule-title">K-regelverk</div><div class="rule-options">${kHtml}</div></div>`:''}
      ${phaseOne.businessStatus?`<div class="rule-card status-${accounting.status}"><div class="rule-title">Bokföringsmetod</div><div class="rule-result">${statusIcon(accounting.status)} <strong>${accounting.message}</strong></div><div class="rule-options">${accountingOptions}</div><p class="micro-help">Kontantmetoden kan vara möjlig vid nettoomsättning på högst 3 mkr, under förutsättning att övriga krav är uppfyllda.</p></div>`:''}
      ${vat.visible?`<div class="rule-card status-${vat.status}"><div class="rule-title">Momsperiod</div><div class="rule-result">${statusIcon(vat.status)} <strong>${vat.message}</strong></div>${vatOptions?`<div class="rule-options">${vatOptions}</div>`:''}</div>`:''}
      ${simplified.visible?renderRuleCard('Förenklat årsbokslut',simplified,'Varför krävs bedömning?'):''}
    </div></section>

    <section class="phase-summary"><div class="page-eyebrow">Fas 1 · Sammanfattning</div><h3>Sammanfattning</h3>
      <div class="summary-grid"><span>Företagsform</span><strong>${phaseOne.companyType==='ab'?'Aktiebolag':phaseOne.companyType==='sole'?'Enskild näringsverksamhet':'–'}</strong><span>Verksamhet</span><strong>${phaseOne.businessStatus==='existing'?'Befintlig':phaseOne.businessStatus==='new'?'Nystartad':'–'}</strong><span>Byråns uppdrag</span><strong>${safe(selectedServices)}</strong></div>
      <h4>Regelverksstöd</h4><div class="summary-grid"><span>Revisionsplikt</span><strong>${phaseOne.companyType==='ab'?statusIcon(audit.status)+' '+safe(audit.label):'Inte aktuellt'}</strong><span>Större företag</span><strong>${phaseOne.companyType==='ab'?statusIcon(large.status)+' '+safe(large.label):'Inte aktuellt'}</strong><span>K-regelverk</span><strong>${safe(kAvailable)}</strong><span>Bokföringsmetod</span><strong>${safe(methodAvailable)}</strong><span>Momsperiod</span><strong>${safe(vatAvailable)}</strong></div>
      <h4>Mina val</h4><div class="final-choices"><span>K-regelverk: <strong>${safe(phaseOne.choices.kRule||'Inte valt')}</strong></span><span>Bokföringsmetod: <strong>${phaseOne.choices.accountingMethod==='cash'?'Kontantmetoden':phaseOne.choices.accountingMethod==='invoice'?'Faktureringsmetoden':'Inte valt'}</strong></span>${vat.visible?`<span>Momsperiod: <strong>${phaseOne.choices.vatPeriod==='year'?'År':phaseOne.choices.vatPeriod==='quarter'?'Kvartal':phaseOne.choices.vatPeriod==='month'?'Månad':'Inte valt'}</strong></span>`:''}</div>
    </section>`;
  return page;
}

function setNestedPhaseOne(path, value){
  const parts = path.split('.');
  let target = phaseOne;
  for(let i=0;i<parts.length-1;i++) target = target[parts[i]];
  target[parts[parts.length-1]] = value;
}

function bindPhaseOneEvents(){
  const page = document.getElementById('page-kontakt');
  if(!page) return;
  page.querySelectorAll('[data-p1]').forEach(el=>el.addEventListener('change', ()=>{
    phaseOne[el.dataset.p1] = el.value;
    // Byte av företagsform/status kan göra tidigare slutval ogiltiga; de behålls bara om de fortfarande är valbara.
    savePhaseOne(); renderMain(); renderSidebar();
  }));
  page.querySelectorAll('[data-p1-service]').forEach(el=>el.addEventListener('change', ()=>{
    const v = el.dataset.p1Service;
    phaseOne.services = el.checked ? [...new Set([...phaseOne.services,v])] : phaseOne.services.filter(x=>x!==v);
    if(v==='vat' && !el.checked) phaseOne.choices.vatPeriod = '';
    savePhaseOne(); renderMain(); renderSidebar();
  }));
  page.querySelectorAll('[data-p1-path]').forEach(el=>el.addEventListener('change', ()=>{
    setNestedPhaseOne(el.dataset.p1Path, el.value);
    savePhaseOne(); renderMain(); renderSidebar();
  }));
  page.querySelectorAll('[data-p1-choice]').forEach(el=>el.addEventListener('change', ()=>{
    phaseOne.choices[el.dataset.p1Choice] = el.value;
    savePhaseOne(); renderMain(); renderSidebar();
  }));
  bindOtherServiceEvents(page);
}

/* ============ FAS 2: KUNDKÄNNEDOM OCH RISKBEDÖMNING ============
   Fas 2 använder en kompakt, villkorsstyrd datamodell. Grundkontrollerna
   visas alltid medan följdfrågor bara visas när ett svar gör dem relevanta.
   Övriga faser fortsätter använda den befintliga checklistmodellen. */
const PHASE2_KEY_PREFIX = "onboarding-phase2-v1-";
const phaseTwoKeyFor = (customerId) => PHASE2_KEY_PREFIX + customerId;

// Beskrivande val för verksamhetsbilden; används inte som automatiska riskgränser.
const KYC_CUSTOMER_TYPES = [
  ['private','Privatpersoner'], ['business','Företag'],
  ['public','Offentlig sektor'], ['organisations','Föreningar och andra organisationer']
];
const KYC_PAYMENT_METHODS = [
  ['bank','Banköverföring/bankgiro'], ['card','Kort'], ['swish','Swish'],
  ['cash','Kontanter'], ['other','Annat']
];
const KYC_PAYMENT_RANGES = [
  ['upTo5000','Upp till 5 000 kr'], ['5000To30000','5 000–30 000 kr'],
  ['30000To100000','30 000–100 000 kr'], ['over100000','Över 100 000 kr'],
  ['varied','Stor variation']
];

function blankPhaseTwo(){
  return {
    identityVerified: false,
    identitySource: "",
    identityDate: "",
    identityDateInitialized: false,   // Förifyll endast vid första användningen, aldrig efter borttagning.
    identityDetailsEditing: true,
    identityDocumentationOpen: false,
    representativeStatus: "",      // "no" | "yes"
    representativeChecked: false,

    beneficialOwnerInvestigated: false,
    beneficialOwnerStatus: "",      // "identified" | "none" | "unknown"
    beneficialOwnerName: "",
    beneficialOwnerNameEditing: true, // Endast visningsläge; texten sparas löpande.
    noBeneficialOwnerReason: "",
    alternativeBeneficialOwner: "",
    complexOwnership: "",            // "no" | "yes"

    businessUnderstood: false,
    businessDescription: "",
    revenueModel: "",
    expectedTransactions: "",
    businessDetailsEditing: true,     // Endast visningsläge; påverkar inte om uppgifterna är ifyllda.
    businessDescriptionEditing: true,
    customerTypes: [],
    paymentMethods: [],
    otherPaymentMethod: "",
    otherPaymentMethodEditing: true,
    paymentRange: "",
    noCustomerPayments: false,
    businessNotes: "",
    businessNotesEditing: true,

    pepResult: "",                   // "none" | "hit"
    sanctionsResult: "",             // "none" | "hit"
    geographicRisk: "",              // "no" | "yes" | "unsure"

    riskLevel: "",                   // "low" | "normal" | "high"
    riskReason: "",
    riskReasonEditing: true,

    enhancedMeasures: {
      additionalInformation: false,
      risksInvestigated: false,
      sourceOfFunds: false,
      approval: false,
      enhancedMonitoring: false
    },

    kycSufficient: "",               // "yes" | "no" | "review"
    remainingInvestigation: "",
    acceptanceDecision: ""           // "accept" | "decline" | "pending"
  };
}

function ensurePhaseTwo(data){
  const base = blankPhaseTwo();
  const d = data && typeof data === 'object' ? data : {};
  return {
    ...base,
    ...d,
    businessDetailsEditing: d.businessDetailsEditing !== false,
    businessDescriptionEditing: (d.businessDescriptionEditing ?? d.businessDetailsEditing) !== false,
    customerTypes: KYC_CUSTOMER_TYPES.map(([value])=>value).filter(value=>Array.isArray(d.customerTypes) && d.customerTypes.includes(value)),
    paymentMethods: KYC_PAYMENT_METHODS.map(([value])=>value).filter(value=>Array.isArray(d.paymentMethods) && d.paymentMethods.includes(value)),
    noCustomerPayments: d.noCustomerPayments === true,
    otherPaymentMethodEditing: d.otherPaymentMethodEditing !== false,
    businessNotesEditing: d.businessNotesEditing !== false,
    beneficialOwnerNameEditing: d.beneficialOwnerNameEditing !== false,
    riskReasonEditing: d.riskReasonEditing !== false,
    identityDetailsEditing: d.identityDetailsEditing !== false,
    identityDocumentationOpen: d.identityDocumentationOpen === true,
    identityDateInitialized: d.identityDateInitialized === true || !!String(d.identityDate ?? '').trim(),
    enhancedMeasures: {...base.enhancedMeasures, ...(d.enhancedMeasures || {})}
  };
}

function loadPhaseTwoFor(customerId){
  try{
    const raw = localStorage.getItem(phaseTwoKeyFor(customerId));
    return ensurePhaseTwo(raw ? JSON.parse(raw) : null);
  }catch(e){
    return blankPhaseTwo();
  }
}

function savePhaseTwo(){
  if(!activeCustomerId) return;
  clearUnavailableAcceptanceDecision();
  try{
    localStorage.setItem(phaseTwoKeyFor(activeCustomerId), JSON.stringify(phaseTwo));
    setSaveStatus("Sparat automatiskt");
  }catch(e){
    setSaveStatus("Kunde inte spara just nu");
  }
}

/* Samma villkor styr avsnittet, progressionen och riskstödet utan att radera sparade svar. */
function isBeneficialOwnerRelevant(p1 = phaseOne){
  return p1.companyType !== 'sole';
}

/* Riskindikatorerna är stöd för konsulten. De sätter aldrig risknivån automatiskt. */
function getKycRiskIndicators(data = phaseTwo, p1 = phaseOne){
  const p = ensurePhaseTwo(data);
  const indicators = [];
  if(isBeneficialOwnerRelevant(p1)){
    if(p.complexOwnership === 'yes') indicators.push('Komplex ägarstruktur');
    if(p.beneficialOwnerStatus === 'unknown') indicators.push('Verklig huvudman kan inte fastställas');
  }
  if(p.pepResult === 'hit') indicators.push('PEP/RCA-träff eller möjlig träff');
  if(p.sanctionsResult === 'hit') indicators.push('Sanktionsindikator');
  if(p.geographicRisk === 'yes') indicators.push('Geografisk risk');
  if(p.geographicRisk === 'unsure') indicators.push('Geografisk risk behöver bedömas');
  return indicators;
}

function isEnhancedDueDiligenceRequired(data = phaseTwo){
  const p = ensurePhaseTwo(data);
  return p.riskLevel === 'high' || p.pepResult === 'hit';
}

function canAcceptCustomer(data = phaseTwo, p1 = phaseOne){
  const p = ensurePhaseTwo(data);
  // Undanta själva beslutet för att undvika ett cirkelberoende med progressionen.
  const ready = phaseTwoRequirements(p, p1, false).every(item=>item.done);
  if(!ready) return {ready, allowed:false, reason:'Fyll i alla övriga obligatoriska uppgifter i Fas 2 för att välja kundaccept.'};
  if(p.kycSufficient !== 'yes') return {ready, allowed:false, reason:'Kundkännedomen måste vara tillräcklig innan kunden kan accepteras.'};
  // Sanktionsindikatorn visas som riskinformation och är ingen separat spärr för kundaccept.
  return {ready, allowed:true, reason:''};
}

function isAcceptanceDecisionAvailable(decision, acceptance = canAcceptCustomer()){
  return acceptance.ready && (decision==='accept' ? acceptance.allowed : ['decline','pending'].includes(decision));
}

function clearUnavailableAcceptanceDecision(){
  if(!phaseTwo.acceptanceDecision || isAcceptanceDecisionAvailable(phaseTwo.acceptanceDecision)) return false;
  phaseTwo.acceptanceDecision = '';
  return true;
}

function customerAcceptanceLabel(acceptance = canAcceptCustomer()){
  return isAcceptanceDecisionAvailable(phaseTwo.acceptanceDecision, acceptance)
    ? {accept:'Accepterad',decline:'Accepteras inte',pending:'Avvaktar'}[phaseTwo.acceptanceDecision] : '–';
}

/* Uppdatera val och sammanfattning under inmatning utan att ersätta det aktiva textfältet. */
function refreshCustomerAcceptanceUI(){
  const page = document.getElementById('page-kundkannedom');
  if(!page) return;
  const acceptance = canAcceptCustomer();
  page.querySelectorAll('[data-p2-field="acceptanceDecision"]').forEach(el=>{
    el.disabled = !isAcceptanceDecisionAvailable(el.value, acceptance);
    el.checked = !el.disabled && el.value===phaseTwo.acceptanceDecision;
    el.closest('.choice-card').classList.toggle('is-disabled', el.disabled);
  });
  const help = page.querySelector('[data-acceptance-help]');
  if(help){ help.hidden = acceptance.allowed; help.textContent = acceptance.reason; }
  const summary = page.querySelector('[data-acceptance-summary]');
  if(summary) summary.textContent = customerAcceptanceLabel(acceptance);
}

/* Samma obligatoriska frågor används i progressen och i listan över det som återstår. */
function phaseTwoCountsOf(data, p1 = phaseOne){
  return requirementCounts(phaseTwoRequirements(data, p1));
}
function phaseTwoCounts(){ return phaseTwoCountsOf(phaseTwo); }

function kycRadio(name, value, label, current, disabled=false){
  return `<label class="choice-card ${disabled ? 'is-disabled' : ''}">
    <input type="radio" name="p2-${name}" data-p2-field="${name}" value="${value}" ${current===value?'checked':''} ${disabled?'disabled':''}>
    <span class="choice-dot"></span><span>${label}</span>
  </label>`;
}

function kycCheck(field, label, checked){
  return `<label class="service-option kyc-check">
    <input type="checkbox" data-p2-check="${field}" ${checked?'checked':''}>
    <span class="native-box"></span><span>${label}</span>
  </label>`;
}

function kycEnhancedCheck(field, label){
  return `<label class="service-option kyc-check">
    <input type="checkbox" data-p2-enhanced="${field}" ${phaseTwo.enhancedMeasures[field]?'checked':''}>
    <span class="native-box"></span><span>${label}</span>
  </label>`;
}

function kycTextField(field, label, value, placeholder=''){
  return `<label class="field"><span>${label}</span><input type="text" data-p2-text="${field}" value="${safe(value)}" placeholder="${safe(placeholder)}"></label>`;
}

function phaseOneContextForKyc(){
  const services = [
    ['bookkeeping','Löpande bokföring'],['vat','Moms'],['payroll','Lön/AGI'],
    ['annual','Bokslut/årsredovisning'],['tax','Inkomstdeklaration'],['other','Annat']
  ];
  const type = phaseOne.companyType === 'ab' ? 'Aktiebolag' : phaseOne.companyType === 'sole' ? 'Enskild näringsverksamhet' : 'Inte angivet';
  const selectedServices = services.filter(([v])=>phaseOne.services.includes(v)).map(([,l])=>l).join(', ') || 'Inte angivet';
  const scope = phaseOneScope();
  const turnover = getRangeLabel('turnover', scope.turnover);
  return {type, selectedServices, turnover: turnover || 'Inte angivet'};
}

function renderPhaseTwoPage(){
  const page = document.createElement('div');
  page.className = 'page';
  page.id = 'page-kundkannedom';

  const counts = phaseTwoCounts();
  const pct = Math.round((counts.done / counts.total) * 100);
  const indicators = getKycRiskIndicators();
  const enhancedRequired = isEnhancedDueDiligenceRequired();
  const acceptance = canAcceptCustomer();
  const p1 = phaseOneContextForKyc();
  const showBeneficialOwner = isBeneficialOwnerRelevant();

  const beneficialOwnerExtra = phaseTwo.beneficialOwnerStatus === 'identified'
    ? renderSavedText('beneficialOwnerName')
    : phaseTwo.beneficialOwnerStatus === 'none'
      ? `<div class="conditional-block">${kycTextField('noBeneficialOwnerReason','Kort motivering',phaseTwo.noBeneficialOwnerReason,'Varför bedöms ingen verklig huvudman finnas?')}</div>`
      : phaseTwo.beneficialOwnerStatus === 'unknown'
        ? `<div class="conditional-block"><div class="alert-box warning">🟡 <strong>Ytterligare utredning krävs</strong></div>${kycTextField('alternativeBeneficialOwner','Alternativ verklig huvudman',phaseTwo.alternativeBeneficialOwner,'Namn')}</div>`
        : '';

  const pepFollowup = phaseTwo.pepResult === 'hit'
    ? `<div class="alert-box warning">🟡 <strong>Skärpta åtgärder krävs.</strong> Följdåtgärder visas längre ned.</div>`
    : '';
  const sanctionsFollowup = phaseTwo.sanctionsResult === 'hit'
    ? `<div class="alert-box danger">🔴 <strong>Kräver manuell bedömning innan kundaccept.</strong></div>`
    : '';

  const riskHtml = indicators.length
    ? indicators.map(x=>`<div class="risk-indicator">🟡 ${safe(x)}</div>`).join('')
    : `<div class="risk-clear">🟢 Inga särskilda riskindikatorer identifierade</div>`;

  const enhancedHtml = enhancedRequired ? `
    <section class="phase-block kyc-conditional-section"><div>
      <h3>Skärpta åtgärder</h3>
      <p class="block-help">Visa endast det som behöver göras i det här ärendet. Bocka de åtgärder som faktiskt är relevanta.</p>
      <div class="service-grid single">
        ${kycEnhancedCheck('additionalInformation','Ytterligare information har inhämtats')}
        ${kycEnhancedCheck('risksInvestigated','Identifierade risker har utretts')}
        ${kycEnhancedCheck('sourceOfFunds','Medlens/tillgångarnas ursprung har utretts när relevant')}
        ${kycEnhancedCheck('approval','Nödvändigt godkännande har inhämtats')}
        ${kycEnhancedCheck('enhancedMonitoring','Förstärkt uppföljning har planerats när relevant')}
      </div>
    </div></section>` : '';

  page.innerHTML = `
    <div class="page-eyebrow">Onboarding · Steg 2 av 6</div>
    <h2>Kundkännedom</h2>
    <p class="block-help"><strong>Stöd för kundkännedom</strong><br>Verktyget hjälper dig att strukturera och dokumentera kundkännedomen. Byrån ansvarar för att uppgifterna och kontrollerna är tillräckliga utifrån kundens risk och uppdraget. Kompletterande underlag och kontroller kan behövas även när alla uppgifter är ifyllda.</p>
    <div class="progress-wrap" id="progress-kundkannedom"><div class="progress-top"><span class="pct-num">${pct}%</span><span class="frac">${counts.done} av ${counts.total} uppgifter ifyllda</span></div><div class="bar-track"><div class="bar-fill" style="width:${pct}%; background:${pctColor(pct)}"></div></div></div>

    <section class="phase-block"><div>
      <h3>Identitet och behörighet</h3>
      ${kycCheck('identityVerified','Kund och företrädare identifierade och verifierade',phaseTwo.identityVerified)}
      ${renderIdentityDocumentation()}
      <div class="mini-question"><strong>Finns ombud/fullmakt?</strong><div class="choice-row compact">${kycRadio('representativeStatus','no','Nej',phaseTwo.representativeStatus)}${kycRadio('representativeStatus','yes','Ja',phaseTwo.representativeStatus)}</div></div>
      ${phaseTwo.representativeStatus==='yes'?`<div class="conditional-block">${kycCheck('representativeChecked','Ombud och behörighet kontrollerade',phaseTwo.representativeChecked)}</div>`:''}
    </div></section>

    ${showBeneficialOwner?`<section class="phase-block"><div>
      <h3>Verklig huvudman</h3>
      ${kycCheck('beneficialOwnerInvestigated','Verklig huvudman och ägar-/kontrollstruktur utredd',phaseTwo.beneficialOwnerInvestigated)}
      <div class="mini-question"><strong>Status</strong><div class="choice-row">${kycRadio('beneficialOwnerStatus','identified','Identifierad',phaseTwo.beneficialOwnerStatus)}${kycRadio('beneficialOwnerStatus','none','Ingen finns',phaseTwo.beneficialOwnerStatus)}${kycRadio('beneficialOwnerStatus','unknown','Går inte att fastställa',phaseTwo.beneficialOwnerStatus)}</div></div>
      ${beneficialOwnerExtra}
      <div class="mini-question"><strong>Komplex eller svåröverskådlig ägarstruktur?</strong><div class="choice-row compact">${kycRadio('complexOwnership','no','Nej',phaseTwo.complexOwnership)}${kycRadio('complexOwnership','yes','Ja',phaseTwo.complexOwnership)}</div></div>
      ${phaseTwo.complexOwnership==='yes'?`<div class="alert-box warning">🟡 Komplex ägarstruktur läggs automatiskt till som riskindikator.</div>`:''}
    </div></section>`:''}

    <section class="phase-block"><div>
      <h3>Verksamhet och affärsförbindelse</h3>
      ${kycCheck('businessUnderstood','Verksamheten och affärsförbindelsen är tillräckligt förstådda',phaseTwo.businessUnderstood)}
      <div class="phase1-context"><span><small>Företagsform · från Fas 1</small><strong>${safe(p1.type)}</strong></span><span><small>Byråns uppdrag · från Fas 1</small><strong>${safe(p1.selectedServices)}</strong></span><span><small>Omsättning · från Fas 1</small><strong>${safe(p1.turnover)}</strong></span></div>
      ${renderBusinessDetails()}
    </div></section>

    <section class="phase-block"><div>
      <h3>PEP, sanktioner och geografi</h3>
      <div class="kyc-control-row"><div><strong>PEP/RCA-kontroll</strong></div><div class="choice-row compact">${kycRadio('pepResult','none','Ingen träff',phaseTwo.pepResult)}${kycRadio('pepResult','hit','Träff/möjlig träff',phaseTwo.pepResult)}</div></div>
      ${pepFollowup}
      <div class="kyc-control-row"><div><strong>Sanktionskontroll</strong></div><div class="choice-row compact">${kycRadio('sanctionsResult','none','Ingen träff',phaseTwo.sanctionsResult)}${kycRadio('sanctionsResult','hit','Möjlig/bekräftad träff',phaseTwo.sanctionsResult)}</div></div>
      ${sanctionsFollowup}
      <div class="mini-question"><strong>Finns relevant koppling till högriskland eller annan tydlig geografisk risk?</strong><div class="choice-row">${kycRadio('geographicRisk','no','Nej',phaseTwo.geographicRisk)}${kycRadio('geographicRisk','yes','Ja',phaseTwo.geographicRisk)}${kycRadio('geographicRisk','unsure','Osäkert',phaseTwo.geographicRisk)}</div></div>
    </div></section>

    <section class="phase-block"><div>
      <h3>Riskbedömning</h3>
      <p class="block-help">Riskindikatorerna är stöd. Du gör alltid den slutliga riskbedömningen.</p>
      <div class="risk-list">${riskHtml}</div>
      <div class="mini-question"><strong>Risknivå</strong><div class="choice-row">${kycRadio('riskLevel','low','Låg',phaseTwo.riskLevel)}${kycRadio('riskLevel','normal','Normal',phaseTwo.riskLevel)}${kycRadio('riskLevel','high','Förhöjd',phaseTwo.riskLevel)}</div></div>
      ${renderSavedText('riskReason')}
    </div></section>

    ${enhancedHtml}

    <section class="phase-block"><div>
      <h3>Kundkännedom och kundaccept</h3>
      <div class="mini-question"><strong>Är kundkännedomen tillräcklig?</strong><div class="choice-row">${kycRadio('kycSufficient','yes','Ja',phaseTwo.kycSufficient)}${kycRadio('kycSufficient','no','Nej',phaseTwo.kycSufficient)}${kycRadio('kycSufficient','review','Ytterligare utredning krävs',phaseTwo.kycSufficient)}</div></div>
      ${phaseTwo.kycSufficient==='review'?`<div class="conditional-block">${kycTextField('remainingInvestigation','Vad återstår?',phaseTwo.remainingInvestigation,'Kort beskrivning')}</div>`:''}
      ${phaseTwo.kycSufficient==='no'?`<div class="alert-box danger">🔴 Kunden kan inte markeras som accepterad innan kundkännedomen är tillräcklig.</div>`:''}
      <div class="mini-question"><strong>Kundaccept</strong><div class="choice-row">${kycRadio('acceptanceDecision','accept','Kunden accepteras',phaseTwo.acceptanceDecision,!acceptance.allowed)}${kycRadio('acceptanceDecision','decline','Kunden accepteras inte',phaseTwo.acceptanceDecision,!acceptance.ready)}${kycRadio('acceptanceDecision','pending','Beslut avvaktar',phaseTwo.acceptanceDecision,!acceptance.ready)}</div></div>
      <p class="micro-help" data-acceptance-help ${acceptance.allowed?'hidden':''}>${safe(acceptance.reason)}</p>
      ${enhancedRequired && !Object.values(phaseTwo.enhancedMeasures).every(Boolean)?`<div class="alert-box warning">🟡 Skärpta åtgärder är aktuella. Kontrollera att relevanta åtgärder ovan är genomförda innan slutligt beslut.</div>`:''}
    </div></section>

    <section class="phase-summary"><div class="page-eyebrow">Fas 2 · Sammanfattning</div><h3>Sammanfattning</h3>
      <div class="summary-grid">
        <span>Identitet</span><strong>${phaseTwo.identityVerified?'🟢 Verifierad':'⚪ Inte klar'}</strong>
        ${showBeneficialOwner?`<span>Verklig huvudman</span><strong>${phaseTwo.beneficialOwnerStatus==='identified'?'🟢 Identifierad':phaseTwo.beneficialOwnerStatus==='none'?'🟢 Ingen identifierad':phaseTwo.beneficialOwnerStatus==='unknown'?'🟡 Ytterligare utredning':'⚪ Inte bedömd'}</strong>`:''}
        <span>PEP</span><strong>${phaseTwo.pepResult==='none'?'🟢 Ingen träff':phaseTwo.pepResult==='hit'?'🟡 Träff/möjlig träff':'⚪ Inte klart'}</strong>
        <span>Sanktioner</span><strong>${phaseTwo.sanctionsResult==='none'?'🟢 Ingen träff':phaseTwo.sanctionsResult==='hit'?'🔴 Kräver bedömning':'⚪ Inte klart'}</strong>
        <span>Risknivå</span><strong>${phaseTwo.riskLevel==='low'?'Låg':phaseTwo.riskLevel==='normal'?'Normal':phaseTwo.riskLevel==='high'?'Förhöjd':'–'}</strong>
        <span>Kundkännedom</span><strong>${phaseTwo.kycSufficient==='yes'?'🟢 Tillräcklig':phaseTwo.kycSufficient==='no'?'🔴 Otillräcklig':phaseTwo.kycSufficient==='review'?'🟡 Ytterligare utredning':'–'}</strong>
        <span>Kundaccept</span><strong data-acceptance-summary>${customerAcceptanceLabel(acceptance)}</strong>
      </div>
    </section>`;

  return page;
}

function bindPhaseTwoEvents(){
  const page = document.getElementById('page-kundkannedom');
  if(!page) return;

  page.querySelectorAll('[data-p2-check]').forEach(el=>el.addEventListener('change', ()=>{
    phaseTwo[el.dataset.p2Check] = el.checked;
    if(el.dataset.p2Check==='identityVerified' && el.checked) initializeIdentityDate();
    savePhaseTwo(); renderMain(); renderSidebar();
  }));

  page.querySelectorAll('[data-p2-field]').forEach(el=>el.addEventListener('change', ()=>{
    phaseTwo[el.dataset.p2Field] = el.value;
    savePhaseTwo(); renderMain(); renderSidebar();
  }));

  page.querySelectorAll('[data-p2-text]').forEach(el=>{
    el.addEventListener('input', ()=>{
      phaseTwo[el.dataset.p2Text] = el.value;
      if(el.dataset.p2Text==='identityDate') phaseTwo.identityDateInitialized = true;
      savePhaseTwo();
      // Uppdatera återstående uppgifter utan att ersätta fältet eller stänga dokumentationen.
      refreshChecklistUI(); renderSidebar();
    });
  });

  page.querySelectorAll('[data-p2-enhanced]').forEach(el=>el.addEventListener('change', ()=>{
    phaseTwo.enhancedMeasures[el.dataset.p2Enhanced] = el.checked;
    savePhaseTwo(); renderMain(); renderSidebar();
  }));
  page.querySelectorAll('[data-p2-list]').forEach(el=>el.addEventListener('change', ()=>{
    const key = el.dataset.p2List;
    phaseTwo[key] = el.checked ? [...new Set([...phaseTwo[key], el.value])] : phaseTwo[key].filter(value=>value!==el.value);
    savePhaseTwo(); renderMain(); renderSidebar();
  }));
  bindSavedTextEvents(page);
  bindIdentityDocumentationEvents(page);
}


/* ============ EXTRA TJÄNSTER OCH BESKRIVNINGARNAS LÄSLÄGE ============ */
function otherServiceEditorOpen(){
  return phaseOne.otherServiceEditIndex!==null || !phaseOne.otherServices.length || phaseOne.otherService!=='';
}

function refreshTextEditors(focusSelector){
  renderMain(); renderSidebar();
  if(focusSelector) mainEl.querySelector(focusSelector)?.focus({preventScroll:true});
}

function renderOtherServices(){
  const open = otherServiceEditorOpen();
  const editing = phaseOne.otherServiceEditIndex!==null && phaseOne.otherServiceEditIndex>=0;
  return `<div class="other-services" data-other-services role="group" aria-label="Andra tjänster">
    ${open?`<div class="other-service-editor">
      <label class="field other-field"><span>${editing?'Ändra tjänst':'Beskriv annan tjänst'}</span><input type="text" data-p1-other value="${safe(phaseOne.otherService)}" placeholder="Annan tjänst"></label>
      <div class="text-editor-actions"><button type="button" class="text-editor-button" data-other-service-save ${phaseOne.otherService.trim()?'':'disabled'}>${editing?'Spara ändring':'Lägg till'}</button>${phaseOne.otherServices.length?'<button type="button" class="text-editor-link" data-other-service-cancel>Avbryt</button>':''}</div>
    </div>`:''}
    ${phaseOne.otherServices.length?`<ul class="other-service-list">${phaseOne.otherServices.map((text,index)=>`<li>
      <span>${safe(text)}</span><span class="other-service-actions">
        <button type="button" class="text-editor-link" data-other-service-edit="${index}" aria-label="Ändra tjänsten ${safe(text)}" ${open?'disabled title="Avsluta pågående redigering först"':''}>Ändra</button>
        <button type="button" class="text-editor-link" data-other-service-delete="${index}" aria-label="Ta bort tjänsten ${safe(text)}" ${open?'disabled title="Avsluta pågående redigering först"':''}>Ta bort</button>
      </span></li>`).join('')}</ul>`:''}
    ${!open?'<button type="button" class="text-editor-link" data-other-service-add>+ Lägg till ytterligare tjänst</button>':''}
  </div>`;
}

function commitOtherService(){
  const text = phaseOne.otherService.trim();
  if(!text) return false;
  const index = phaseOne.otherServiceEditIndex;
  if(index!==null && index>=0){
    if(index>=phaseOne.otherServices.length) return false;
    phaseOne.otherServices[index] = text;
  }else{
    phaseOne.otherServices.push(text);
  }
  phaseOne.otherService = '';
  phaseOne.otherServiceEditIndex = null;
  savePhaseOne();
  refreshTextEditors('[data-other-service-add]');
  return true;
}

function beginOtherService(index=-1){
  // Ett utkast får inte skrivas över genom att en annan rad öppnas samtidigt.
  if(otherServiceEditorOpen() || !Number.isInteger(index) || index < -1 || index>=phaseOne.otherServices.length) return;
  phaseOne.otherServiceEditIndex = index;
  phaseOne.otherService = index>=0 ? phaseOne.otherServices[index] : '';
  savePhaseOne();
  refreshTextEditors('[data-p1-other]');
}

function removeOtherService(index){
  if(otherServiceEditorOpen() || !Number.isInteger(index) || index<0 || index>=phaseOne.otherServices.length) return;
  phaseOne.otherServices.splice(index,1);
  savePhaseOne();
  refreshTextEditors(phaseOne.otherServices.length?'[data-other-service-add]':'[data-p1-other]');
}

function bindOtherServiceEvents(page){
  const input = page.querySelector('[data-p1-other]');
  if(input){
    input.addEventListener('input', ()=>{
      phaseOne.otherService = input.value;
      if(phaseOne.otherServiceEditIndex===null) phaseOne.otherServiceEditIndex = -1;
      savePhaseOne(); refreshChecklistUI(); renderSidebar();
      page.querySelector('[data-other-service-save]').disabled = !input.value.trim();
    });
    input.addEventListener('keydown', event=>{
      if(event.key==='Enter' && !event.isComposing){ event.preventDefault(); commitOtherService(); }
    });
  }
  page.querySelector('[data-other-service-save]')?.addEventListener('click', commitOtherService);
  page.querySelector('[data-other-service-add]')?.addEventListener('click', ()=>beginOtherService());
  page.querySelector('[data-other-service-cancel]')?.addEventListener('click', ()=>{
    phaseOne.otherService = ''; phaseOne.otherServiceEditIndex = null;
    savePhaseOne(); refreshTextEditors('[data-other-service-add]');
  });
  page.querySelectorAll('[data-other-service-edit]').forEach(button=>button.addEventListener('click', ()=>beginOtherService(Number(button.dataset.otherServiceEdit))));
  page.querySelectorAll('[data-other-service-delete]').forEach(button=>button.addEventListener('click', ()=>removeOtherService(Number(button.dataset.otherServiceDelete))));
}

function renderBusinessDetails(){
  const p = phaseTwo, notes = businessNotesPrompt(p);
  // Äldre fritext ligger kvar i sina ursprungliga fält och visas utan migrering eller dubbletter.
  const legacy = [['revenueModel','Tidigare uppgift – Huvudsakliga intäkter'],['expectedTransactions','Tidigare uppgift – Normala transaktioner']]
    .filter(([key])=>String(p[key] ?? '').trim());
  return `<div class="business-details" data-business-details>
    ${renderSavedText('businessDescription')}
    <div class="mini-question remaining-target" id="question-kundkannedom-noCustomerPayments">${kycCheck('noCustomerPayments','Inga kundbetalningar',p.noCustomerPayments)}</div>
    ${!p.noCustomerPayments?`
      ${renderBusinessChoices('customerTypes','Vilka säljer företaget till?',KYC_CUSTOMER_TYPES)}
      ${renderBusinessChoices('paymentMethods','Hur betalar företagets kunder?',KYC_PAYMENT_METHODS)}
      ${p.paymentMethods.includes('other')?renderSavedText('otherPaymentMethod'):''}
      <div class="mini-question"><label class="field"><span>Hur stor är en vanlig kundbetalning?</span>
        <select data-p2-field="paymentRange" aria-describedby="kyc-payment-range-help">
          <option value="">Välj intervall</option>
          ${KYC_PAYMENT_RANGES.map(([value,label])=>`<option value="${value}" ${p.paymentRange===value?'selected':''}>${label}</option>`).join('')}
        </select>
      </label><p class="micro-help" id="kyc-payment-range-help">Ange belopp per betalning från kund, inte årsomsättning eller samlade utbetalningar från en betaltjänst.</p></div>
    `:''}
    <div class="mini-question">${renderSavedText('businessNotes',{...SAVED_TEXT_FIELDS.businessNotes,label:notes.required?'Kompletterande beskrivning':'Kompletterande beskrivning (frivilligt)',help:notes.help})}</div>
    ${legacy.length?`<div class="mini-question"><dl class="saved-text-summary">${legacy.map(([key,label])=>`<dt>${label}</dt><dd>${safe(p[key])}</dd>`).join('')}</dl></div>`:''}
  </div>`;
}

function renderBusinessChoices(key, label, options){
  return `<div class="mini-question" data-p2-business-group="${key}" role="group" aria-label="${label}">
    <strong>${label}</strong><div class="service-grid">${options.map(([value,title])=>`<label class="service-option">
      <input type="checkbox" data-p2-list="${key}" value="${value}" ${phaseTwo[key].includes(value)?'checked':''}>
      <span class="native-box"></span><span>${title}${key==='paymentMethods' && value==='bank'?'<small class="micro-help"> · Exempelvis betalning av fakturor</small>':''}</span>
    </label>`).join('')}</div>
  </div>`;
}

// Samma villkor används för hjälptext, obligatoriska uppgifter och kundaccept.
function businessNotesPrompt(p){
  if(p.noCustomerPayments) return {required:true,help:'Beskriv kort hur verksamheten finansieras.'};
  if(p.paymentRange==='varied') return {required:true,help:'Beskriv kort hur betalningarnas storlek varierar.'};
  if(p.paymentRange==='over100000') return {required:true,help:'Ange betalningarnas ungefärliga storleksordning.'};
  return {required:false,help:'Komplettera vid behov, exempelvis med särskilda betalningsflöden, finansiering eller större utbetalningar.'};
}

/* Enskilda textvärden delar läsläge och åtgärder; befintlig autosparning används vid inmatning. */
const SAVED_TEXT_FIELDS = {
  businessDescription: {label:'Verksamhetsbeskrivning', placeholder:'Kort beskrivning', help:'Beskriv kort vad företaget säljer eller arbetar med.'},
  otherPaymentMethod: {label:'Beskriv betalningssättet', placeholder:'Annat betalningssätt'},
  businessNotes: {label:'Kompletterande beskrivning', placeholder:'Beskriv kort'},
  beneficialOwnerName: {label:'Namn på verklig huvudman', placeholder:'Namn'},
  riskReason: {label:'Kort motivering', placeholder:'Motivera bedömningen kort'}
};

function renderSavedText(key, field = SAVED_TEXT_FIELDS[key]){
  const editing = phaseTwo[`${key}Editing`];
  return `<div class="kyc-single-field" data-saved-text="${key}" id="question-kundkannedom-${key}">
    ${editing ? kycTextField(key,field.label,phaseTwo[key],field.placeholder)
      : `<dl class="saved-text-summary"><dt>${field.label}</dt><dd>${String(phaseTwo[key] ?? '').trim()?safe(phaseTwo[key]):'<span class="text-editor-empty">Inte ifyllt</span>'}</dd></dl>`}
    ${field.help?`<p class="micro-help" id="help-${key}">${safe(field.help)}</p>`:''}
    <div class="text-editor-actions">
      <button type="button" class="${editing?'text-editor-button':'text-editor-link'}" data-saved-text-action="${editing?'save':'edit'}">${editing?'Spara':'Ändra'}</button>
      ${!editing?'<button type="button" class="text-editor-link" data-saved-text-action="delete">Ta bort</button>':''}
    </div>
  </div>`;
}

function bindSavedTextEvents(page){
  page.querySelectorAll('[data-saved-text-action]').forEach(button=>button.addEventListener('click', ()=>{
    const key = button.closest('[data-saved-text]').dataset.savedText;
    const action = button.dataset.savedTextAction;
    if(action==='delete') phaseTwo[key] = '';
    phaseTwo[`${key}Editing`] = action!=='save';
    savePhaseTwo();
    refreshTextEditors(action==='save' ? `[data-saved-text="${key}"] [data-saved-text-action="edit"]` : `[data-p2-text="${key}"]`);
  }));
}

/* Identitetsdokumentationen återanvänder textfält, läsläge och knappar för en enda uppsättning svar. */
const IDENTITY_DETAIL_FIELDS = [
  {key:'identitySource',label:'Källa',placeholder:'T.ex. registreringsbevis'},
  {key:'identityDate',label:'Kontrolldatum',placeholder:'ÅÅÅÅ-MM-DD'}
];

function initializeIdentityDate(){
  if(phaseTwo.identityDateInitialized) return false;
  phaseTwo.identityDateInitialized = true;
  if(!String(phaseTwo.identityDate ?? '').trim()){
    const today = new Date();
    phaseTwo.identityDate = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  }
  return true;
}

function renderIdentityDocumentation(){
  const editing = phaseTwo.identityDetailsEditing;
  return `<details class="compact-details" data-identity-documentation ${phaseTwo.identityDocumentationOpen?'open':''}><summary>Visa dokumentation</summary>
    ${editing?`<div class="field-grid two">${IDENTITY_DETAIL_FIELDS.map(field=>`<div data-identity-detail="${field.key}" id="question-kundkannedom-${field.key}">${kycTextField(field.key,field.label,phaseTwo[field.key],field.placeholder)}</div>`).join('')}</div>`
      : `<dl class="saved-text-summary field-grid two">${IDENTITY_DETAIL_FIELDS.map(field=>`<div data-identity-detail="${field.key}" id="question-kundkannedom-${field.key}"><dt>${field.label}</dt><dd>${String(phaseTwo[field.key] ?? '').trim()?safe(phaseTwo[field.key]):'<span class="text-editor-empty">Inte ifyllt</span>'}</dd></div>`).join('')}</dl>`}
    <div class="text-editor-actions">
      <button type="button" class="${editing?'text-editor-button':'text-editor-link'}" data-identity-action="${editing?'save':'edit'}">${editing?'Spara':'Ändra'}</button>
      ${!editing?'<button type="button" class="text-editor-link" data-identity-action="delete">Ta bort</button>':''}
    </div>
  </details>`;
}

function bindIdentityDocumentationEvents(page){
  const details = page.querySelector('[data-identity-documentation]');
  if(!details) return;
  const customerId = activeCustomerId;
  details.addEventListener('toggle', ()=>{
    if(!details.isConnected || activeCustomerId!==customerId) return;
    if(details.open===phaseTwo.identityDocumentationOpen && (!details.open || phaseTwo.identityDateInitialized)) return;
    phaseTwo.identityDocumentationOpen = details.open;
    if(details.open && initializeIdentityDate()){
      const input = details.querySelector('[data-p2-text="identityDate"]');
      if(input) input.value = phaseTwo.identityDate;
      const savedDate = details.querySelector('[data-identity-detail="identityDate"] dd');
      if(savedDate) savedDate.textContent = phaseTwo.identityDate;
    }
    savePhaseTwo(); refreshChecklistUI(); renderSidebar();
  });
  details.querySelectorAll('[data-identity-action]').forEach(button=>button.addEventListener('click', ()=>{
    const action = button.dataset.identityAction;
    if(action==='delete'){
      phaseTwo.identitySource = ''; phaseTwo.identityDate = '';
      phaseTwo.identityDateInitialized = true;
    }else initializeIdentityDate();
    phaseTwo.identityDetailsEditing = action!=='save';
    phaseTwo.identityDocumentationOpen = true;
    savePhaseTwo();
    refreshTextEditors(action==='save' ? '[data-identity-action="edit"]' : '[data-p2-text="identitySource"]');
  }));
}

/* ============ OBLIGATORISKA UPPGIFTER OCH LÄNKAR ============
   En fråga ger en post, även när den innehåller flera svarsalternativ.
   Villkorade fält tas med först när de visas. Kundernas lagringsformat ändras inte. */
function requirementCounts(items){
  return {done:items.filter(item=>item.done).length, total:items.length};
}

function phaseOneRequirements(data){
  const p = ensurePhaseOne(data), items = [];
  const add = (key, label, selector, done)=>items.push({key,label,selector,done:!!done});
  const radio = (key, label)=>add(key,label,`[data-p1="${key}"]`,p[key]);
  radio('companyType','Företagsform');
  radio('businessStatus','Verksamhetens status');
  add('services','Byråns uppdrag – välj minst en tjänst','[data-p1-service]',p.services.length);
  if(p.services.includes('other')) add('otherService','Lägg till minst en annan tjänst','[data-other-services]',p.otherServices.length);
  radio('fTaxRegistered','F-skatt registrerad?');
  if(p.services.includes('vat')) radio('vatRegistered','Momsregistrerad?');
  if(p.services.includes('payroll')) radio('employerRegistered','Arbetsgivarregistrerad?');
  if(p.businessStatus==='existing') radio('previousFirm','Tidigare redovisningsbyrå?');
  radio('foreignActivity','Utlandsverksamhet, import eller export?');
  const periods = p.businessStatus==='existing' ? [['latest','senaste räkenskapsåret'],['previous','föregående räkenskapsåret']]
    : p.businessStatus==='new' ? [['expected','förväntat']] : [];
  periods.forEach(([period,label])=>{
    [['turnover','Nettoomsättning'],['balance','Balansomslutning'],['employees','Medelantal anställda']].forEach(([field,title])=>{
      const key = `${period}.${field}`;
      add(key,`${title} – ${label}`,`[data-p1-path="${key}"]`,hasRangeValue(field,p[period][field]));
    });
  });
  const choice = (key,label,options)=>{
    const available = options.filter(o=>!o.disabled && o.state!=='disabled');
    if(available.length) add(key,label,`[data-p1-choice="${key}"]`,available.some(o=>o.value===p.choices[key]));
  };
  choice('kRule','K-regelverk',getAvailableKRules(p));
  if(p.businessStatus) choice('accountingMethod','Bokföringsmetod',getAvailableAccountingMethods(p).options);
  choice('vatPeriod','Momsperiod',getAvailableVatPeriods(p).options);
  return items;
}

function phaseTwoRequirements(data, p1 = phaseOne, includeAcceptance = true){
  const p = ensurePhaseTwo(data), items = [];
  const add = (key,label,attribute,done)=>items.push({key,label,selector:`[${attribute}="${key}"]`,done:!!done});
  const check = (key,label)=>add(key,label,'data-p2-check',p[key]);
  const radio = (key,label)=>add(key,label,'data-p2-field',p[key]);
  const text = (key,label)=>add(key,label,SAVED_TEXT_FIELDS[key]?'data-saved-text':IDENTITY_DETAIL_FIELDS.some(field=>field.key===key)?'data-identity-detail':'data-p2-text',String(p[key] ?? '').trim());
  check('identityVerified','Kund och företrädare identifierade och verifierade');
  text('identitySource','Identitetskontroll – källa');
  text('identityDate','Identitetskontroll – kontrolldatum');
  radio('representativeStatus','Finns ombud/fullmakt?');
  if(p.representativeStatus==='yes') check('representativeChecked','Ombud och behörighet kontrollerade');
  if(isBeneficialOwnerRelevant(p1)){
    check('beneficialOwnerInvestigated','Verklig huvudman och ägar-/kontrollstruktur utredd');
    radio('beneficialOwnerStatus','Verklig huvudman – status');
    if(p.beneficialOwnerStatus==='identified') text('beneficialOwnerName','Namn på verklig huvudman');
    if(p.beneficialOwnerStatus==='none') text('noBeneficialOwnerReason','Motivering till att verklig huvudman saknas');
    if(p.beneficialOwnerStatus==='unknown') text('alternativeBeneficialOwner','Alternativ verklig huvudman');
    radio('complexOwnership','Komplex eller svåröverskådlig ägarstruktur?');
  }
  check('businessUnderstood','Verksamheten och affärsförbindelsen är tillräckligt förstådda');
  text('businessDescription','Verksamhetsbeskrivning');
  if(!p.noCustomerPayments){
    add('customerTypes','Vilka säljer företaget till?','data-p2-business-group',p.customerTypes.length);
    add('paymentMethods','Hur betalar företagets kunder?','data-p2-business-group',p.paymentMethods.length);
    if(p.paymentMethods.includes('other')) text('otherPaymentMethod','Beskriv betalningssättet');
    add('paymentRange','Hur stor är en vanlig kundbetalning?','data-p2-field',KYC_PAYMENT_RANGES.some(([value])=>value===p.paymentRange));
  }
  if(businessNotesPrompt(p).required) text('businessNotes',p.noCustomerPayments?'Beskriv hur verksamheten finansieras':'Kompletterande beskrivning – betalningarnas storlek');
  radio('pepResult','Resultat av PEP/RCA-kontrollen');
  radio('sanctionsResult','Resultat av sanktionskontrollen');
  radio('geographicRisk','Koppling till högriskland eller annan geografisk risk?');
  radio('riskLevel','Risknivå');
  text('riskReason','Riskbedömning – kort motivering');
  if(isEnhancedDueDiligenceRequired(p)){
    // De två åtgärder som uttryckligen anges som "när relevant" är fortsatt bedömningsberoende.
    [['additionalInformation','Ytterligare information har inhämtats'],['risksInvestigated','Identifierade risker har utretts'],['approval','Nödvändigt godkännande har inhämtats']].forEach(([key,label])=>{
      add(key,label,'data-p2-enhanced',p.enhancedMeasures[key]);
    });
  }
  radio('kycSufficient','Är kundkännedomen tillräcklig?');
  if(p.kycSufficient==='review') text('remainingInvestigation','Kundkännedom – vad återstår att utreda?');
  if(includeAcceptance) add('acceptanceDecision','Kundaccept','data-p2-field',isAcceptanceDecisionAvailable(p.acceptanceDecision, canAcceptCustomer(p, p1)));
  return items;
}

function phaseRequirements(section){
  if(section.id==='kontakt') return phaseOneRequirements(phaseOne);
  if(section.id==='kundkannedom') return phaseTwoRequirements(phaseTwo);
  let index = 0;
  return section.groups.flatMap(group=>group.items.map(item=>{
    const current = index++;
    return {key:typeof item==='string'?String(current):item.id, label:checklistItemText(item),
      selector:`[data-section="${section.id}"][data-index="${current}"]`,
      done:!!(state[section.id] && state[section.id][current]), visible:isChecklistItemVisible(item), blocked:checklistItemDisabled(item)};
  })).filter(item=>item.visible);
}

function refreshRemainingTasks(){
  SECTIONS.forEach(section=>{
    const page = document.getElementById('page-'+section.id);
    if(!page) return;
    const items = phaseRequirements(section);
    items.forEach(item=>{
      const field = page.querySelector(item.selector);
      if(!field) return;
      const grouped = field.type==='radio' || field.hasAttribute('data-p1-service');
      const target = grouped ? field.closest('.rule-options, .choice-row, .service-grid')
        : field.closest('.field, .service-option, .item') || field;
      if(!target.id) target.id = `question-${section.id}-${item.key.replace(/[^a-zA-Z0-9_-]/g,'-')}`;
      item.targetId = target.id;
      target.classList.add('remaining-target');
      if(grouped){ target.setAttribute('role','group'); target.setAttribute('aria-label',item.label); }
      if(!field.labels?.length && !field.hasAttribute('aria-label')) field.setAttribute('aria-label',item.label);
      if(field.hasAttribute('data-section')){
        field.disabled = item.blocked;
        target.classList.toggle('is-disabled',item.blocked);
        const note = target.querySelector('.item-note');
        if(!item.blocked && note) note.remove();
        if(item.blocked && !note) target.querySelector('.txt').insertAdjacentHTML('beforeend','<small class="item-note">Kräver godkänd kundaccept i Fas 2 och signerat uppdragsavtal i Fas 3.</small>');
      }
    });
    const missing = items.filter(item=>!item.done);
    const footerId = 'remaining-'+section.id;
    let footer = page.querySelector('.remaining-tasks');
    if(!footer){
      footer = document.createElement('section'); footer.className = 'remaining-tasks';
      footer.id = footerId; footer.tabIndex = -1; footer.setAttribute('aria-labelledby',footerId+'-title');
      page.appendChild(footer);
    }
    footer.innerHTML = missing.length ? `<h3 id="${footerId}-title">Kvar att fylla i – ${missing.length} ${missing.length===1?'uppgift':'uppgifter'}</h3>
      <ul>${missing.map(item=>`<li><a href="#${item.targetId}" data-remaining-link>${safe(item.label)}</a>${item.blocked?'<span class="remaining-note">Kan slutföras efter godkänd kundaccept och signerat uppdragsavtal.</span>':''}</li>`).join('')}</ul>`
      : `<p id="${footerId}-title" class="remaining-complete">Alla obligatoriska uppgifter i fasen är ifyllda.</p>`;
    let jump = page.querySelector('.remaining-jump');
    if(!jump){ jump = document.createElement('p'); jump.className = 'remaining-jump'; page.querySelector('.progress-wrap').appendChild(jump); }
    jump.hidden = !missing.length;
    jump.innerHTML = missing.length ? `<a href="#${footerId}" data-remaining-link>${missing.length} ${missing.length===1?'uppgift återstår':'uppgifter återstår'} ↓</a>` : '';
  });
}

let remainingHighlightTimer;
function onRemainingTaskLink(event){
  const link = event.target.closest('a[data-remaining-link]');
  if(!link || !mainEl.contains(link)) return;
  const targetId = link.getAttribute('href').slice(1);
  let target = document.getElementById(targetId);
  if(!target) return;
  event.preventDefault();
  // Ett länkmål finns i båda lägena; öppna redigeringen innan det saknade fältet fokuseras.
  const identityDocumentation = target.closest('[data-identity-documentation]');
  const savedText = target.closest('[data-saved-text]');
  const editingKey = identityDocumentation ? 'identityDetailsEditing' : savedText ? `${savedText.dataset.savedText}Editing` : null;
  if(identityDocumentation){ phaseTwo.identityDocumentationOpen = true; initializeIdentityDate(); }
  if(identityDocumentation || (editingKey && !phaseTwo[editingKey])){
    phaseTwo[editingKey] = true;
    savePhaseTwo(); renderMain(); renderSidebar();
    target = document.getElementById(targetId);
    if(!target) return;
  }
  for(let parent=target.parentElement; parent; parent=parent.parentElement){
    if(parent.tagName==='DETAILS') parent.open = true;
  }
  const control = target.matches('input:not(:disabled), select:not(:disabled), textarea:not(:disabled)') ? target
    : target.querySelector('input:not(:disabled), select:not(:disabled), textarea:not(:disabled)');
  if(!control) target.tabIndex = -1;
  (control || target).focus({preventScroll:true});

// Skrolla endast huvudinnehållet och lämna lite luft ovanför frågan.
const top =
  mainEl.scrollTop +
  target.getBoundingClientRect().top -
  mainEl.getBoundingClientRect().top -
  mainEl.clientTop -
  24;

mainEl.scrollTo({
  top: Math.max(0, top),
  behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? 'instant'
    : 'smooth'
});

  mainEl.querySelectorAll('.remaining-highlight').forEach(el=>el.classList.remove('remaining-highlight'));
  clearTimeout(remainingHighlightTimer);
  target.classList.add('remaining-highlight');
  remainingHighlightTimer = setTimeout(()=>target.classList.remove('remaining-highlight'),2500);
}

/* ============ APP STATE ============ */
let customers = [];          // [{id, name, createdAt, lastTab}]
let activeCustomerId = null; // id of the currently open customer, or null
let state = {};              // checklist state för de handlingsorienterade faserna 3–6
let phaseOne = blankPhaseOne(); // strukturerad data för Fas 1
let phaseTwo = blankPhaseTwo(); // strukturerad, villkorsstyrd data för Fas 2
let view = 'customers';      // 'customers' | 'checklist'
let activeId = SECTIONS[0].id;

function flatCount(section){
  return section.groups.reduce((n,g)=>n+g.items.length,0);
}

/* Fas 3–6 har fasta huvudpunkter, men vissa ska bara räknas och visas när
   Fas 1 gör dem relevanta. Indexen ligger ändå kvar så sparad checklistdata
   inte flyttar på sig när ett villkor ändras. */
function isChecklistItemVisible(item, p1=phaseOne){
  if(!item || typeof item === 'string' || !item.visibleWhen) return true;
  switch(item.visibleWhen){
    case 'existing': return p1.businessStatus === 'existing';
    case 'payroll': return p1.services.includes('payroll');
    case 'foreign': return p1.foreignActivity === 'yes';
    default: return true;
  }
}
function checklistItemText(item){ return typeof item === 'string' ? item : item.text; }
function visibleFlatIndices(section, p1=phaseOne){
  const indices = [];
  let flatIdx = 0;
  section.groups.forEach(g=>g.items.forEach(item=>{
    if(isChecklistItemVisible(item, p1)) indices.push(flatIdx);
    flatIdx++;
  }));
  return indices;
}
function blankState(){
  const s = {};
  SECTIONS.forEach(sec=>{ s[sec.id] = Array.from({length:flatCount(sec)}, ()=>false); });
  return s;
}
function ensureState(s){
  s = s && typeof s === 'object' ? s : {};
  // Äldre checklistor hade 10 punkter i Fas 3 och 9 i Fas 4. Ta bort endast
  // de utgångna positionerna så att kvarvarande punkter behåller rätt bockar.
  // Längdkontrollen hindrar att anpassningen upprepas för redan uppdaterad data.
  if(Array.isArray(s.avtal) && s.avtal.length === 10) s.avtal.splice(1, 1);
  if(Array.isArray(s.overtag) && s.overtag.length === 9) s.overtag.splice(1, 3);
  // Tidigare byråkontakt låg först i Fas 4. Anpassa även äldre data efter steget ovan.
  if(Array.isArray(s.overtag) && s.overtag.length === 6) s.overtag.splice(0, 1);
  // Fas 5 hade 13 punkter. Ta bort bakifrån så att kvarvarande bockar behåller rätt position.
  if(Array.isArray(s.system) && s.system.length === 13){
    s.system.splice(10, 3);
    s.system.splice(4, 1);
  }
  // Betalningsflöden låg på position 5 i den tidigare checklistan för Fas 5.
  if(Array.isArray(s.system) && s.system.length === 9) s.system.splice(5, 1);
  SECTIONS.forEach(sec=>{
    const n = flatCount(sec);
    if(!Array.isArray(s[sec.id]) || s[sec.id].length!==n){
      const prev = Array.isArray(s[sec.id]) ? s[sec.id] : [];
      s[sec.id] = Array.from({length:n}, (_,i)=> !!prev[i]);
    }
  });
  return s;
}

function sectionPctOf(s, section, p1=phaseOne){
  // Övertaget är ännu inte bedömt när verksamhetsstatus saknas i Fas 1.
  if(section.id==='overtag' && !p1.businessStatus) return 0;
  const arr = (s && s[section.id]) || [];
  const visible = visibleFlatIndices(section, p1);
  if(visible.length===0) return 100;
  const done = visible.filter(i=>!!arr[i]).length;
  return Math.round((done/visible.length)*100);
}
function sectionCountsOf(s, section, p1=phaseOne){
  const arr = (s && s[section.id]) || [];
  const visible = visibleFlatIndices(section, p1);
  const done = visible.filter(i=>!!arr[i]).length;
  return {done, total:visible.length};
}
function overallPctOf(s){
  let done=0, total=0;
  SECTIONS.forEach(sec=>{
    const c = sectionCountsOf(s, sec);
    done+=c.done; total+=c.total;
  });
  return total===0?0:Math.round((done/total)*100);
}
function sectionPct(section){
  if(section.id === 'kontakt'){ const c = phaseOneCounts(); return Math.round((c.done/c.total)*100); }
  if(section.id === 'kundkannedom'){ const c = phaseTwoCounts(); return Math.round((c.done/c.total)*100); }
  return sectionPctOf(state, section);
}
function sectionCounts(section){
  if(section.id === 'kontakt') return phaseOneCounts();
  if(section.id === 'kundkannedom') return phaseTwoCounts();
  return sectionCountsOf(state, section);
}
function overallPct(){
  let done=0,total=0;
  SECTIONS.forEach(sec=>{ const c=sectionCounts(sec); done+=c.done; total+=c.total; });
  return total===0?0:Math.round((done/total)*100);
}

function pctColor(pct){
  const r1=166,g1=59,b1=50; // red
  const r2=63,g2=122,b2=87; // green
  const t = Math.max(0, Math.min(100,pct))/100;
  const r = Math.round(r1+(r2-r1)*t);
  const g = Math.round(g1+(g2-g1)*t);
  const b = Math.round(b1+(b2-b1)*t);
  return `rgb(${r},${g},${b})`;
}

/* ============ PERSISTENCE (localStorage — this file runs standalone in the browser) ============ */
function loadCustomers(){
  try{
    const raw = localStorage.getItem(CUSTOMERS_KEY);
    customers = raw ? JSON.parse(raw) : [];
  }catch(e){ customers = []; }
  try{
    activeCustomerId = localStorage.getItem(ACTIVE_CUSTOMER_KEY) || null;
  }catch(e){ activeCustomerId = null; }
}
function saveCustomers(){
  try{
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
    setSaveStatus("Sparat automatiskt");
  }catch(e){
    setSaveStatus("Kunde inte spara just nu");
  }
}
function loadStateFor(customerId){
  let s = blankState();
  try{
    const raw = localStorage.getItem(stateKeyFor(customerId));
    if(raw) s = JSON.parse(raw);
  }catch(e){ /* keep blank */ }
  return ensureState(s);
}
function saveState(){
  if(!activeCustomerId) return;
  try{
    localStorage.setItem(stateKeyFor(activeCustomerId), JSON.stringify(state));
    setSaveStatus("Sparat automatiskt");
  }catch(e){
    setSaveStatus("Kunde inte spara just nu");
  }
}
function setSaveStatus(text){
  const el = document.getElementById('save-status');
  if(el) el.textContent = text;
}
function getCustomerOverallPct(customerId){
  const customerState = loadStateFor(customerId);
  const customerPhaseOne = loadPhaseOneFor(customerId);
  const customerPhaseTwo = loadPhaseTwoFor(customerId);
  let done=0,total=0;
  SECTIONS.forEach(sec=>{
    const c = sec.id === 'kontakt' ? phaseOneCountsOf(customerPhaseOne) : sec.id === 'kundkannedom' ? phaseTwoCountsOf(customerPhaseTwo, customerPhaseOne) : sectionCountsOf(customerState, sec, customerPhaseOne);
    done += c.done; total += c.total;
  });
  return total===0 ? 0 : Math.round((done/total)*100);
}

/* ============ CUSTOMER ACTIONS ============ */
function makeId(){
  return 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2,7);
}
function addCustomer(name){
  const trimmed = name.trim();
  if(!trimmed) return false;

  // Namnet normaliseras bara för jämförelsen. Sparat kundnamn behåller användarens skrivsätt efter trimning.
  const normalized = trimmed.replace(/\s+/g, ' ').toLocaleLowerCase('sv-SE');
  const duplicate = customers.some(c => String(c.name ?? '').trim().replace(/\s+/g, ' ').toLocaleLowerCase('sv-SE') === normalized);
  if(duplicate){
    const warning = document.getElementById('duplicate-client-warning');
    if(warning) warning.hidden = false;
    return false;
  }

  const customer = { id: makeId(), name: trimmed, createdAt: new Date().toISOString(), lastTab: SECTIONS[0].id };
  customers.push(customer);
  saveCustomers();
  openCustomer(customer.id);
  return true;
}

function validTabId(id){
  return id === 'summary' || SECTIONS.some(s=>s.id===id) ? id : SECTIONS[0].id;
}
function openCustomer(id){
  const c = customers.find(x=>x.id===id);
  if(!c) return;
  activeCustomerId = id;
  try{ localStorage.setItem(ACTIVE_CUSTOMER_KEY, id); }catch(e){}
  state = loadStateFor(id);
  phaseOne = loadPhaseOneFor(id);
  phaseTwo = loadPhaseTwoFor(id);
  view = 'checklist';
  activeId = validTabId(c.lastTab || SECTIONS[0].id);
  fullRender();
}
function deleteCustomer(id){
  const c = customers.find(x=>x.id===id);
  if(!c) return;
  if(!confirm(`Ta bort kundprofilen "${c.name}" och all dess checklistdata? Detta går inte att ångra.`)) return;
  customers = customers.filter(x=>x.id!==id);
  try{ localStorage.removeItem(stateKeyFor(id)); localStorage.removeItem(phaseOneKeyFor(id)); localStorage.removeItem(phaseTwoKeyFor(id)); }catch(e){}
  saveCustomers();
  if(activeCustomerId===id){
    activeCustomerId = null;
    try{ localStorage.removeItem(ACTIVE_CUSTOMER_KEY); }catch(e){}
    view = 'customers';
  }
  fullRender();
}
function goToCustomerList(){
  view = 'customers';
  fullRender();
}

/* ============ RENDER: SIDEBAR ============ */
const tabsEl = document.getElementById('tabs');
const clientBtn = document.getElementById('client-btn');
const clientSwitchBtn = document.getElementById('client-switch-btn');
const clientNameLabel = document.getElementById('client-name-label');
const clientCapLabel = document.getElementById('client-cap-label');
const clientActionLabel = document.getElementById('client-action-label');
const clientProgress = document.getElementById('client-progress');
const clientProgressMeta = document.getElementById('client-progress-meta');
const clientProgressFill = document.getElementById('client-progress-fill');
const checkSvg = `<svg viewBox="0 0 24 24" fill="none"><path d="M4 12.5L9.5 18L20 6" stroke="#F1ECDD" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/* Kundblocket återanvänder befintlig fas- och progressionslogik. */
function renderClientButton(){
  const activeCustomer = customers.find(c=>c.id===activeCustomerId);
  if(activeCustomer){
    const progress = overallPct();
    const phaseIndex = SECTIONS.findIndex(s=>s.id===activeId);

    clientBtn.classList.remove('no-client');
    clientBtn.setAttribute('aria-label', `Öppna ${activeCustomer.name}`);
    clientSwitchBtn.setAttribute('aria-label', 'Byt kund');
    clientCapLabel.textContent = 'Aktiv kund';
    clientNameLabel.textContent = activeCustomer.name;
    clientActionLabel.textContent = 'Byt ›';
    clientProgress.hidden = false;
    clientProgressMeta.textContent = view !== 'checklist' || activeId === 'summary' || phaseIndex < 0
      ? `${progress} % klart`
      : `Fas ${phaseIndex + 1} av ${SECTIONS.length} · ${progress} % klart`;
    clientProgressFill.style.width = progress + '%';
    clientProgressFill.style.background = pctColor(progress);
  }else{
    clientBtn.classList.add('no-client');
    clientBtn.setAttribute('aria-label', 'Välj eller skapa kund');
    clientSwitchBtn.setAttribute('aria-label', 'Välj eller skapa kund');
    clientCapLabel.textContent = 'Ingen kund vald';
    clientNameLabel.textContent = 'Välj eller skapa kund';
    clientActionLabel.textContent = '›';
    clientProgress.hidden = true;
    clientProgressMeta.textContent = '';
    clientProgressFill.style.width = '0%';
  }
}

function renderSidebar(){
  tabsEl.innerHTML = "";
  const hasActive = !!activeCustomerId;
  tabsEl.classList.toggle('disabled', !hasActive);

  SECTIONS.forEach((s, idx)=>{
    const pct = sectionPct(s);
    const c = sectionCounts(s);
    const btn = document.createElement('button');
    btn.className = 'tab-btn' + (view==='checklist' && s.id===activeId ? ' active':'');
    btn.dataset.id = s.id;
    btn.innerHTML = `
      <span class="num">${String(idx+1).padStart(2,'0')}</span>
      <span class="ring" style="--pct:${pct}; --ringcolor:${pctColor(pct)}"><span>${pct}</span></span>
      <span class="label"><span class="t">${s.title}</span><span class="f">${c.total===0?'Ej aktuell':`${c.done}/${c.total} klara`}</span></span>
    `;
    btn.addEventListener('click', ()=>{ if(hasActive) setActive(s.id); });
    tabsEl.appendChild(btn);
  });

  const op = overallPct();
  const total = SECTIONS.reduce((n,s)=>n+sectionCounts(s).total,0);
  const done = SECTIONS.reduce((n,s)=>n+sectionCounts(s).done,0);
  const sBtn = document.createElement('button');
  sBtn.className = 'tab-btn summary-btn' + (view==='checklist' && activeId==='summary' ? ' active':'');
  sBtn.dataset.id = 'summary';
  sBtn.innerHTML = `
    <span class="num">${String(SECTIONS.length+1).padStart(2,'0')}</span>
    <span class="ring" style="--pct:${op}; --ringcolor:${pctColor(op)}"><span>${op}</span></span>
    <span class="label"><span class="t">Sammanfattning</span><span class="f">${done}/${total} totalt</span></span>
  `;
  sBtn.addEventListener('click', ()=>{ if(hasActive) setActive('summary'); });
  tabsEl.appendChild(sBtn);

  document.getElementById('reset-btn').disabled = !hasActive;
  renderClientButton();
}

/* ============ RENDER: CHECKLIST PAGES ============ */
function findChecklistIndex(sectionId, itemId){
  const section = SECTIONS.find(s=>s.id===sectionId);
  if(!section) return -1;
  let index = 0;
  for(const group of section.groups){
    for(const item of group.items){
      if(typeof item !== 'string' && item.id === itemId) return index;
      index++;
    }
  }
  return -1;
}
function isChecklistChecked(sectionId, itemId){
  const index = findChecklistIndex(sectionId,itemId);
  return index >= 0 && !!(state[sectionId] && state[sectionId][index]);
}
function checklistItemDisabled(item){
  if(!item || typeof item === 'string' || !item.disabledWhen) return false;
  if(item.disabledWhen === 'startPrerequisites'){
    const accepted = phaseTwo.acceptanceDecision === 'accept' && canAcceptCustomer().allowed;
    return !(accepted && isChecklistChecked('avtal','agreementSigned'));
  }
  return false;
}

function selectedServiceNames(labels={bookkeeping:'Bokföring',vat:'Moms',payroll:'Lön/AGI',annual:'Bokslut/årsredovisning',tax:'Inkomstdeklaration',other:'Annat'}){
  return phaseOne.services.flatMap(v=>{
    if(v!=='other') return [labels[v] || v];
    const otherServices = phaseOne.otherServices.map(text=>text.trim()).filter(Boolean);
    return otherServices.length ? otherServices : [labels.other];
  });
}

/* Kort kontext från tidigare faser. Det är information, inte fler frågor. */
function renderSectionContext(section){
  const services = selectedServiceNames();
  if(section.id === 'avtal'){
    return `<div class="section-context"><strong>Uppdrag från Fas 1</strong><div class="context-chips">${services.length ? services.map(x=>`<span>${safe(x)}</span>`).join('') : '<span>Inga tjänster valda ännu</span>'}</div><p>Detaljer om ansvar och rutiner behöver bara omfatta de tjänster som faktiskt ingår i uppdraget.</p></div>`;
  }
  if(section.id === 'overtag'){
    if(!phaseOne.businessStatus) return `<div class="info-box">ⓘ Välj nystartad eller befintlig verksamhet i Fas 1 för att anpassa den här fasen.</div>`;
    if(phaseOne.businessStatus === 'new') return `<div class="section-context status-neutral"><strong>⚪ Nystartad verksamhet</strong><p>Historiskt övertag och ingående balanser är inte aktuella. Den praktiska uppsättningen fortsätter i Fas 5.</p></div>`;
    return '';
  }
  if(section.id === 'system'){
    const details = [];
    if(phaseOne.services.includes('payroll')) details.push('lön');
    if(phaseOne.foreignActivity === 'yes') details.push('utlandshantering');
    return `<div class="section-context"><strong>Systemdelen är filtrerad utifrån kunden</strong><p>${details.length ? `Fokus just nu: ${safe(details.join(', '))}.` : 'Fyll i uppdragsprofilen i Fas 1 för mer specifik filtrering.'} Övriga kundspecifika integrationer hanteras bara när de faktiskt används.</p></div>`;
  }
  return '';
}

function groupCounts(section, groupIndex){
  let offset = 0;
  for(let i=0;i<groupIndex;i++) offset += section.groups[i].items.length;
  const arr = state[section.id] || [];
  const visible = section.groups[groupIndex].items
    .map((item,ii)=>({item,index:offset+ii}))
    .filter(x=>isChecklistItemVisible(x.item));
  return {done:visible.filter(x=>!!arr[x.index]).length,total:visible.length};
}

function renderSectionFooter(section){
  if(section.id !== 'uppfoljning') return '';
  const start = groupCounts(section,0);
  const customerAccepted = phaseTwo.acceptanceDecision === 'accept' && canAcceptCustomer().allowed;
  const phase3 = sectionCounts(SECTIONS.find(s=>s.id==='avtal'));
  const phase4 = sectionCounts(SECTIONS.find(s=>s.id==='overtag'));
  const phase5 = sectionCounts(SECTIONS.find(s=>s.id==='system'));
  const implementationReady = [phase3,phase4,phase5].every(c=>c.total===0 || c.done===c.total);
  let cls='status-blocked', icon='🔴', label='Inte startklar';
  if(customerAccepted && implementationReady && start.total > 0 && start.done === start.total){ cls='status-possible'; icon='🟢'; label='Startklar'; }
  else if(customerAccepted && (start.done > 0 || phase3.done > 0 || phase5.done > 0)){ cls='status-review'; icon='🟡'; label='Pågående – kvarstående åtgärder'; }
  let reason = `${start.done} av ${start.total} startkontroller klara.`;
  if(!customerAccepted) reason = 'Kundaccept behöver vara klar i Fas 2 innan kunden kan markeras som startklar.';
  else if(!implementationReady) reason = 'Relevanta arbetsmoment i Fas 3–5 behöver slutföras innan slutstatus kan bli Startklar.';
  return `<div class="rule-card ${cls} start-ready-card"><div class="rule-title">Onboardingstatus</div><div class="rule-result">${icon} <strong>${label}</strong></div><p class="micro-help">${safe(reason)}</p></div>`;
}

function renderSectionPage(section){
  const page = document.createElement('div');
  page.className = 'page';
  page.id = 'page-'+section.id;

  const pct = sectionPct(section);
  const c = sectionCounts(section);

  let groupsHtml = "";
  section.groups.forEach((g, gi)=>{
    let offset = 0;
    for(let i=0;i<gi;i++) offset += section.groups[i].items.length;
    let itemsHtml = "";
    g.items.forEach((item, ii)=>{
      if(!isChecklistItemVisible(item)) return;
      const flatIdx = offset+ii;
      const checked = (state[section.id] && state[section.id][flatIdx]) ? 'checked' : '';
      const disabled = checklistItemDisabled(item);
      itemsHtml += `
        <label class="item ${disabled?'is-disabled':''}">
          <input type="checkbox" data-section="${section.id}" data-index="${flatIdx}" ${checked} ${disabled?'disabled':''}>
          <span class="box">${checkSvg}</span>
          <span class="txt">${safe(checklistItemText(item))}${disabled?'<small class="item-note">Kräver godkänd kundaccept i Fas 2 och signerat uppdragsavtal i Fas 3.</small>':''}</span>
        </label>
      `;
    });
    if(!itemsHtml) return;
    const headHtml = g.title ? `<div class="group-head">${g.label? `<span class="gnum">${g.label}</span>`:""}<span class="gtitle">${g.title}</span></div>` : '';
    groupsHtml += `<div class="group">${headHtml}${itemsHtml}</div>`;
  });

  const progressText = c.total ? `${c.done} av ${c.total} punkter avklarade` : 'Inte aktuell för den här kunden';
  page.innerHTML = `
    <div class="page-eyebrow">Onboarding · Steg ${SECTIONS.findIndex(s=>s.id===section.id)+1} av ${SECTIONS.length}</div>
    <h2>${section.title}</h2>
    <div class="progress-wrap" id="progress-${section.id}">
      <div class="progress-top">
        <span class="pct-num">${pct}%</span>
        <span class="frac">${progressText}</span>
      </div>
      <div class="bar-track"><div class="bar-fill" style="width:${pct}%; background:${pctColor(pct)}"></div></div>
    </div>
    ${renderSectionContext(section)}
    ${groupsHtml || '<div class="empty-state">Inga arbetsmoment är aktuella i den här fasen utifrån uppgifterna i Fas 1.</div>'}
    ${renderSectionFooter(section)}
  `;
  return page;
}

function renderSummaryPage(){
  const page = document.createElement('div');
  page.className = 'page';
  page.id = 'page-summary';

  const op = overallPct();
  const total = SECTIONS.reduce((n,s)=>n+sectionCounts(s).total,0);
  const done = SECTIONS.reduce((n,s)=>n+sectionCounts(s).done,0);
  const activeCustomer = customers.find(c=>c.id===activeCustomerId);

  let rows = "";
  SECTIONS.forEach(s=>{
    const pct = sectionPct(s);
    const c = sectionCounts(s);
    rows += `
      <div class="sum-row" data-id="${s.id}">
        <span class="sname">${s.title}</span>
        <span class="sbar"><span class="sbar-fill" style="width:${pct}%; background:${pctColor(pct)}"></span></span>
        <span class="sfrac">${c.total===0?'Ej aktuell':`${c.done}/${c.total}`}</span>
      </div>
    `;
  });

  page.innerHTML = `
    <div class="page-eyebrow">Onboarding · Översikt</div>
    <h2>Sammanfattning${activeCustomer ? ' – '+safe(activeCustomer.name) : ''}</h2>
    <div class="summary-hero">
      <div class="big-ring" style="--pct:${op}; --ringcolor:${pctColor(op)}"><span class="num">${op}%</span></div>
      <div class="cap">Total färdigställd onboarding</div>
      <div class="sub">${done} av ${total} punkter avklarade över samtliga faser</div>
    </div>
    <div id="sum-rows">${rows}</div>
  `;
  return page;
}

/* ============ RENDER: CUSTOMERS PAGE ============ */
function renderCustomersPage(){
  const page = document.createElement('div');
  page.className = 'page active';
  page.id = 'page-customers';

  let listHtml = "";
  if(customers.length===0){
    listHtml = `<div class="empty-clients">Inga kunder ännu — lägg till din första kund ovan för att komma igång.</div>`;
  }else{
    const sorted = [...customers].sort((a,b)=> new Date(b.createdAt)-new Date(a.createdAt));
    sorted.forEach(c=>{
      const pct = getCustomerOverallPct(c.id);
      const dateStr = new Date(c.createdAt).toLocaleDateString('sv-SE');
      listHtml += `
        <div class="client-card" data-id="${c.id}">
          <span class="cring" style="--pct:${pct}; --ringcolor:${pctColor(pct)}"><span>${pct}%</span></span>
          <span class="cinfo">
            <div class="cname">${safe(c.name)}</div>
            <div class="cmeta">Skapad ${dateStr}</div>
          </span>
          <span class="copen">Öppna checklista ›</span>
          <button class="cdel" type="button" data-del="${c.id}">Ta bort</button>
        </div>
      `;
    });
  }

  page.innerHTML = `
    <div class="page-eyebrow">Onboarding · Kunder</div>
    <h2>Kundprofiler</h2>
    <p class="syfte">Lägg till en ny kund för att starta en onboarding, eller öppna en befintlig kundprofil för att fortsätta där du var.</p>
    <form class="add-client-form" id="add-client-form">
      <input type="text" id="new-client-name" placeholder="Kundens namn, t.ex. Onboardly AB" autocomplete="off">
      <button type="submit">Lägg till kund</button>
      <div id="duplicate-client-warning" class="alert-box warning client-duplicate-warning" role="alert" hidden>Kunden finns redan. Öppna den befintliga kundprofilen i listan nedan.</div>
    </form>
    <div id="client-list">${listHtml}</div>
  `;
  return page;
}

/* ============ MAIN RENDER ORCHESTRATION ============ */
const mainEl = document.getElementById('main');

function renderMain(){
  // Fångar även nya villkor från Fas 1 och otillåtna beslut hos en återöppnad kund.
  if(view==='checklist' && clearUnavailableAcceptanceDecision()) savePhaseTwo();
  // Behåll fokus på samma fråga när ett svar uppdaterar de villkorade fälten.
  const focused = document.activeElement;
  const focusTargetId = mainEl.contains(focused) ? focused.closest('.remaining-target')?.id : null;
  const focusValue = focused?.value;
  mainEl.innerHTML = "";

  if(view==='customers'){
    const page = renderCustomersPage();
    mainEl.appendChild(page);

    document.getElementById('add-client-form').addEventListener('submit', (e)=>{
      e.preventDefault();
      const input = document.getElementById('new-client-name');
      if(addCustomer(input.value)) input.value = "";
    });
    document.getElementById('new-client-name').addEventListener('input', ()=>{
      const warning = document.getElementById('duplicate-client-warning');
      if(warning) warning.hidden = true;
    });
    mainEl.querySelectorAll('.client-card').forEach(card=>{
      card.addEventListener('click', (e)=>{
        if(e.target.closest('[data-del]')) return;
        openCustomer(card.dataset.id);
      });
    });
    mainEl.querySelectorAll('[data-del]').forEach(btn=>{
      btn.addEventListener('click', (e)=>{
        e.stopPropagation();
        deleteCustomer(btn.dataset.del);
      });
    });
    return;
  }

  // view === 'checklist'
  SECTIONS.forEach(s=>{
    // Fas 1 och Fas 2 har egna formulär. Fas 3–6 återanvänder den befintliga checklist-renderaren med villkorsstyrning.
    const page = s.id === 'kontakt' ? renderPhaseOnePage() : s.id === 'kundkannedom' ? renderPhaseTwoPage() : renderSectionPage(s);
    if(s.id===activeId) page.classList.add('active');
    mainEl.appendChild(page);
  });
  refreshRemainingTasks();
  const summaryPage = renderSummaryPage();
  if(activeId==='summary') summaryPage.classList.add('active');
  mainEl.appendChild(summaryPage);

  mainEl.querySelectorAll('input[type="checkbox"][data-section]').forEach(cb=>{
    cb.addEventListener('change', onToggle);
  });
  bindPhaseOneEvents();
  bindPhaseTwoEvents();
  if(focusTargetId){
    const target = document.getElementById(focusTargetId);
    const controls = target ? [target,...target.querySelectorAll('input, select, textarea')]
      .filter(el=>el.matches('input:not(:disabled), select:not(:disabled), textarea:not(:disabled)')) : [];
    const control = controls.find(el=>el.value===focusValue) || controls[0];
    if(control) control.focus({preventScroll:true});
  }
  mainEl.querySelectorAll('.sum-row').forEach(row=>{
    row.addEventListener('click', ()=> setActive(row.dataset.id));
  });
}

function onToggle(e){
  const sectionId = e.target.dataset.section;
  const idx = parseInt(e.target.dataset.index, 10);
  state[sectionId][idx] = e.target.checked;
  saveState();
  refreshChecklistUI();
  renderSidebar();
}

function refreshChecklistUI(){
  refreshCustomerAcceptanceUI();
  SECTIONS.forEach(s=>{
    const wrap = document.getElementById('progress-'+s.id);
    if(wrap){
      const pct = sectionPct(s);
      const c = sectionCounts(s);
      wrap.querySelector('.pct-num').textContent = pct+'%';
      wrap.querySelector('.frac').textContent = c.total ? `${c.done} av ${c.total} ${['kontakt','kundkannedom'].includes(s.id)?'uppgifter ifyllda':'punkter avklarade'}` : 'Inte aktuell för den här kunden';
      const fill = wrap.querySelector('.bar-fill');
      fill.style.width = pct+'%';
      fill.style.background = pctColor(pct);
    }
  });
  refreshRemainingTasks();
  const readyCard = document.querySelector('.start-ready-card');
  if(readyCard) readyCard.outerHTML = renderSectionFooter(SECTIONS.find(s=>s.id==='uppfoljning'));
  const summaryPage = document.getElementById('page-summary');
  if(summaryPage){
    const op = overallPct();
    const total = SECTIONS.reduce((n,s)=>n+sectionCounts(s).total,0);
    const done = SECTIONS.reduce((n,s)=>n+sectionCounts(s).done,0);
    const ring = summaryPage.querySelector('.big-ring');
    if(ring){
      ring.style.setProperty('--pct', op);
      ring.style.setProperty('--ringcolor', pctColor(op));
      ring.querySelector('.num').textContent = op+'%';
      summaryPage.querySelector('.sub').textContent = `${done} av ${total} punkter avklarade över samtliga faser`;
    }
    SECTIONS.forEach(s=>{
      const row = summaryPage.querySelector(`.sum-row[data-id="${s.id}"]`);
      if(row){
        const pct = sectionPct(s);
        const c = sectionCounts(s);
        row.querySelector('.sbar-fill').style.width = pct+'%';
        row.querySelector('.sbar-fill').style.background = pctColor(pct);
        row.querySelector('.sfrac').textContent = c.total ? `${c.done}/${c.total}` : 'Ej aktuell';
      }
    });
  }
}

function setActive(id){
  activeId = validTabId(id);
  const c = customers.find(x=>x.id===activeCustomerId);
  if(c){ c.lastTab = activeId; saveCustomers(); }

  // Fasnavigation ska fungera även när Kundprofiler-vyn är renderad.
  if(view !== 'checklist'){
    view = 'checklist';
    renderMain();
  }

  document.querySelectorAll('.tab-btn').forEach(b=> b.classList.toggle('active', b.dataset.id===activeId));
  document.querySelectorAll('.page').forEach(p=> p.classList.remove('active'));
  const target = document.getElementById('page-'+activeId);
  if(target) target.classList.add('active');
  renderClientButton();
  mainEl.scrollTop = 0;
}

function fullRender(){
  renderSidebar();
  renderMain();
  if(view==='checklist') setActive(activeId);
  mainEl.scrollTop = 0;
}

/* ============ EVENTS ============ */
mainEl.addEventListener('click', onRemainingTaskLink);
clientBtn.addEventListener('click', ()=>{
  if(activeCustomerId) openCustomer(activeCustomerId);
  else goToCustomerList();
});
clientSwitchBtn.addEventListener('click', goToCustomerList);

document.getElementById('reset-btn').addEventListener('click', ()=>{
  if(!activeCustomerId) return;
  const c = customers.find(x=>x.id===activeCustomerId);
  if(!confirm(`Nollställa onboardingdata och samtliga bockade punkter för "${c ? c.name : 'kunden'}"? Detta går inte att ångra.`)) return;
  state = blankState();
  phaseOne = blankPhaseOne();
  phaseTwo = blankPhaseTwo();
  saveState();
  savePhaseOne();
  savePhaseTwo();
  fullRender();
});

/* ============ INIT ============ */
(function init(){
  loadCustomers();
  if(activeCustomerId && customers.find(c=>c.id===activeCustomerId)){
    const c = customers.find(c=>c.id===activeCustomerId);
    state = loadStateFor(activeCustomerId);
    phaseOne = loadPhaseOneFor(activeCustomerId);
    phaseTwo = loadPhaseTwoFor(activeCustomerId);
    view = 'checklist';
    activeId = validTabId(c.lastTab || SECTIONS[0].id);
  }else{
    activeCustomerId = null;
    view = 'customers';
  }
  fullRender();
})();
