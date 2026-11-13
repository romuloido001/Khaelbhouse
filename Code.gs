/**
 * Boarding House Receipt Portal - Google Apps Script backend
 * 1) Create a Google Spreadsheet.
 * 2) Extensions > Apps Script, paste this file.
 * 3) Set ADMIN_PIN below to a strong private PIN.
 * 4) Deploy > New deployment > Web app; Execute as Me; access Anyone.
 */
const ADMIN_PIN = 'CHANGE-THIS-TO-A-STRONG-PIN';
const SHEETS = {
  tenants: ['id','name','room','rent','wifiFee','phone','status','updatedAt'],
  bills: ['id','receiptNo','dateIssued','period','dueDate','tenantId','tenantName','room',
    'waterPrev','waterNow','waterUsed','waterRate','water','elecPrev','elecNow','electricityUsed',
    'elecRate','electricity','wifi','rent','other','total','amountPaid','remarks']
};

function doGet() {
  return json_({ok:true, message:'Boarding House Receipt Portal API is running. Send POST requests from the portal.'});
}
function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (!ADMIN_PIN || ADMIN_PIN === 'CHANGE-THIS-TO-A-STRONG-PIN') throw new Error('Administrator PIN has not been configured in Code.gs.');
    if (String(body.pin || '') !== ADMIN_PIN) throw new Error('Invalid administrator PIN.');
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) throw new Error('Open this script from the target Google Spreadsheet.');
    setupSheets_(ss);
    let result;
    switch (body.action) {
      case 'getData': result = {tenants:readRows_(ss.getSheetByName('Tenants')), bills:readRows_(ss.getSheetByName('Bills'))}; break;
      case 'saveTenant': result = {tenant:saveTenant_(ss, body.tenant || {})}; break;
      case 'saveBill': result = {bill:saveBill_(ss, body.bill || {})}; break;
      default: throw new Error('Unknown action.');
    }
    return json_(Object.assign({ok:true}, result));
  } catch (err) {
    return json_({ok:false,error:err.message || String(err)});
  }
}
function setupSheets_(ss) {
  Object.keys(SHEETS).forEach(key => {
    const name = key === 'tenants' ? 'Tenants' : 'Bills';
    let sh = ss.getSheetByName(name);
    if (!sh) sh = ss.insertSheet(name);
    if (sh.getLastRow() === 0) sh.appendRow(SHEETS[key]);
    sh.setFrozenRows(1);
  });
}
function readRows_(sh) {
  const values = sh.getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values[0].map(String);
  return values.slice(1).filter(r => r.some(v => v !== '')).map(r => {
    const o = {}; headers.forEach((h,i) => o[h] = r[i] instanceof Date ? Utilities.formatDate(r[i], Session.getScriptTimeZone(), 'yyyy-MM-dd') : r[i]);
    return o;
  });
}
function saveTenant_(ss, t) {
  if (!t.name || !t.room) throw new Error('Tenant name and room are required.');
  const sh = ss.getSheetByName('Tenants'), rows = readRows_(sh);
  const id = t.id || Utilities.getUuid();
  const obj = {id,name:String(t.name).trim(),room:String(t.room).trim(),rent:money_(t.rent),wifiFee:money_(t.wifiFee),phone:String(t.phone||''),status:String(t.status||'Active'),updatedAt:new Date()};
  const index = rows.findIndex(x => String(x.id) === id);
  const row = SHEETS.tenants.map(h => obj[h] === undefined ? '' : obj[h]);
  if (index >= 0) sh.getRange(index+2,1,1,row.length).setValues([row]); else sh.appendRow(row);
  return obj;
}
function saveBill_(ss, b) {
  if (!b.tenantId || !b.period) throw new Error('Tenant and billing period are required.');
  if (Number(b.waterNow) < Number(b.waterPrev) || Number(b.elecNow) < Number(b.elecPrev)) throw new Error('Current meter readings cannot be lower than previous readings.');
  const sh = ss.getSheetByName('Bills');
  // Prevent accidentally creating a duplicate bill for the same tenant and period.
  const existing = readRows_(sh);
  if (existing.some(x => String(x.tenantId) === String(b.tenantId) && String(x.period) === String(b.period))) {
    throw new Error('A bill already exists for this tenant and billing period.');
  }
  const id = Utilities.getUuid(), now = new Date();
  const receiptNo = 'BH-' + Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyyMMdd-HHmmss');
  const obj = Object.assign({}, b, {id,receiptNo,dateIssued:Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM-dd')});
  const row = SHEETS.bills.map(h => obj[h] === undefined ? '' : obj[h]);
  sh.appendRow(row);
  return obj;
}
function money_(v) { const n = Number(v || 0); if (!isFinite(n) || n < 0) throw new Error('Charges must be valid non-negative numbers.'); return n; }
function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
