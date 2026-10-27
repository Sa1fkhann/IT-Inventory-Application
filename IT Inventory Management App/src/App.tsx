import { ChangeEvent, FormEvent, ReactNode, useEffect, useMemo, useState } from 'react'

type Role = 'admin' | 'hr' | 'manager'
type Status = 'Available' | 'Assigned' | 'Under Repair' | 'Inactive' | 'Archived'
type Page = 'dashboard' | 'assets' | 'assignments' | 'software' | 'alerts' | 'reports' | 'import' | 'audit' | 'settings'
type Asset = {
  id: number; tag: string; type: string; user: string; location: string; cpu: string; ram: string; storage: string;
  config: string; model: string; serial: string; os: string; office: string; antivirus: string; lastUser: string;
  software: string[]; remark: string; status: Status; updated: string; history: HistoryItem[]
}
type HistoryItem = { user: string; date: string; note: string; action: string }
type Audit = { id: number; action: string; target: string; actor: string; time: string; detail: string }
type License = { id: number; name: string; vendor: string; type: string; reference: string; seats: number; allocated: number; renewal: string; expiry: string; status: string; notes: string }

const today = new Date()
const dateFromNow = (days: number) => { const d = new Date(today); d.setDate(d.getDate() + days); return d.toISOString().slice(0, 10) }
const sampleAssets: Asset[] = [
  { id: 1, tag: 'HH-DES-016', type: 'DES Desktop', user: 'Aarav Mehta', location: 'Head Office', cpu: 'Intel Core i5-12500', ram: '16 GB', storage: '512 GB SSD', config: 'Intel Core i5-12500 · 16 GB · 512 GB SSD', model: 'Dell OptiPlex 7000', serial: 'DL7000-016', os: 'Windows 11 PRO', office: 'Professional Plus 2021', antivirus: dateFromNow(19), lastUser: 'Finance Department', software: ['Chrome', 'Adobe Reader', 'Tally'], remark: 'Good condition', status: 'Assigned', updated: dateFromNow(-1), history: [{ user: 'Aarav Mehta', date: dateFromNow(-90), action: 'Assigned', note: 'Finance onboarding' }] },
  { id: 2, tag: 'HH-LAP-021', type: 'LAP Laptop', user: '', location: 'Vasai', cpu: 'Intel Core i7-1260P', ram: '16 GB', storage: '1 TB SSD', config: 'Intel Core i7-1260P · 16 GB · 1 TB SSD', model: 'Lenovo ThinkPad T14', serial: 'PF3X9021', os: 'Windows 11 PRO', office: 'Office 365', antivirus: dateFromNow(5), lastUser: 'People Operations', software: ['Chrome', 'Teams', 'Zoom'], remark: 'Ready for onboarding', status: 'Available', updated: dateFromNow(-2), history: [{ user: 'Nisha Rao', date: dateFromNow(-35), action: 'Returned', note: 'Employee exit; inspected' }] },
  { id: 3, tag: 'HH-PRN-004', type: 'PRN Printer', user: 'Admin Desk', location: 'Head Office', cpu: 'Not Applicable', ram: 'Not Applicable', storage: 'Not Applicable', config: 'Network colour laser printer', model: 'HP Color LaserJet Pro M479fdw', serial: 'CNB4P004', os: 'Not Applicable', office: 'Not Applicable', antivirus: '', lastUser: 'Administration', software: ['HP Universal Print Driver'], remark: 'Shared floor printer', status: 'Assigned', updated: dateFromNow(-6), history: [] },
  { id: 4, tag: 'HH-SVR-002', type: 'SVR Server', user: 'Infrastructure Team', location: 'Head Office', cpu: 'Intel Xeon Silver 4310', ram: '128 GB ECC', storage: '4 × 2 TB RAID 10', config: 'Xeon Silver 4310 · 128 GB ECC · 4 × 2 TB RAID 10', model: 'Dell PowerEdge R650', serial: 'SVR-R650-002', os: 'Windows Server 2022', office: 'Not Applicable', antivirus: dateFromNow(-12), lastUser: 'Infrastructure', software: ['Hyper-V', 'Veeam Agent'], remark: 'Antivirus renewal overdue', status: 'Assigned', updated: dateFromNow(-3), history: [] },
  { id: 5, tag: 'HH-DES-031', type: 'DES Desktop', user: '', location: 'Vasai', cpu: 'AMD Ryzen 5 5600G', ram: '8 GB', storage: '256 GB SSD', config: 'AMD Ryzen 5 5600G · 8 GB · 256 GB SSD', model: 'Assembled', serial: 'Assembled', os: 'Windows 10 PRO', office: 'Professional Plus 2021', antivirus: dateFromNow(62), lastUser: 'Sales Department', software: ['Chrome', 'LibreOffice'], remark: 'Power supply under inspection', status: 'Under Repair', updated: dateFromNow(-4), history: [] },
  { id: 6, tag: 'HH-LAP-009', type: 'LAP Laptop', user: '', location: 'Remote', cpu: 'Intel Core i5-10210U', ram: '8 GB', storage: '512 GB SSD', config: 'Intel Core i5-10210U · 8 GB · 512 GB SSD', model: 'HP ProBook 440 G7', serial: '5CD009DEMO', os: 'Windows 10 PRO', office: 'Office 365', antivirus: dateFromNow(-40), lastUser: 'Marketing Department', software: ['Chrome', 'Canva'], remark: 'Decommissioned sample record', status: 'Archived', updated: dateFromNow(-20), history: [{ user: 'Marketing Department', date: dateFromNow(-20), action: 'Archived', note: 'End of useful life' }] },
  { id: 7, tag: 'HH-LAP-034', type: 'LAP Laptop', user: 'Maya Shah', location: 'Remote', cpu: 'Apple M2', ram: '16 GB', storage: '512 GB SSD', config: 'Apple M2 · 16 GB · 512 GB SSD', model: 'MacBook Air 13', serial: 'FVFG-DEMO-034', os: 'Not Applicable', office: 'Office 365', antivirus: dateFromNow(120), lastUser: 'Design Team', software: ['Chrome', 'Figma', 'Slack'], remark: 'Remote assignment', status: 'Assigned', updated: dateFromNow(-8), history: [] },
  { id: 8, tag: 'HH-DES-044', type: 'DES Desktop', user: '', location: 'Head Office', cpu: 'Intel Core i3-12100', ram: '8 GB', storage: '256 GB SSD', config: 'Intel Core i3-12100 · 8 GB · 256 GB SSD', model: 'Assembled', serial: 'Not Available', os: 'Windows 11 PRO', office: 'Professional Plus 2021', antivirus: '', lastUser: '', software: ['Chrome'], remark: 'Spare workstation', status: 'Available', updated: dateFromNow(-10), history: [] },
]
const sampleLicenses: License[] = [
  { id: 1, name: 'Microsoft 365 Business Standard', vendor: 'Microsoft', type: 'Subscription', reference: 'M365-••••-4821', seats: 50, allocated: 42, renewal: dateFromNow(38), expiry: dateFromNow(38), status: 'Active', notes: 'Sample tenant subscription' },
  { id: 2, name: 'Endpoint Protection', vendor: 'Demo Security Co.', type: 'Per device', reference: 'AV-••••-1908', seats: 35, allocated: 31, renewal: dateFromNow(19), expiry: dateFromNow(19), status: 'Renewal due', notes: 'Sample antivirus licence' },
  { id: 3, name: 'Adobe Acrobat Pro', vendor: 'Adobe', type: 'Named user', reference: 'ADB-••••-8842', seats: 10, allocated: 8, renewal: dateFromNow(95), expiry: dateFromNow(95), status: 'Active', notes: 'Finance and operations' },
]
const nav: { id: Page; label: string; symbol: string; roles?: Role[] }[] = [
  { id: 'dashboard', label: 'Dashboard', symbol: '▦' }, { id: 'assets', label: 'All Assets', symbol: '□' },
  { id: 'assignments', label: 'Assignments & History', symbol: '↔' }, { id: 'software', label: 'Software & Licences', symbol: '◇' },
  { id: 'alerts', label: 'Expiry & Renewal Alerts', symbol: '!' }, { id: 'reports', label: 'Reports & Analytics', symbol: '▥' },
  { id: 'import', label: 'Import / Export', symbol: '⇅', roles: ['admin'] }, { id: 'audit', label: 'Audit Logs', symbol: '≡', roles: ['admin', 'manager'] },
  { id: 'settings', label: 'Settings', symbol: '⚙', roles: ['admin'] },
]
const roleNames: Record<Role, string> = { admin: 'IT Administrator', hr: 'HR / Operations', manager: 'Management / Audit' }
const pageNames: Record<Page, string> = Object.fromEntries(nav.map(n => [n.id, n.label])) as Record<Page, string>

function Button({ children, variant = 'primary', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger' }) {
  return <button className={`btn btn-${variant}`} {...props}>{children}</button>
}
function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return <label className="field"><span>{label}</span>{children}{error && <small>{error}</small>}</label>
}
function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: string }) { return <span className={`badge badge-${tone}`}>{children}</span> }
function formatDate(value: string) { return value ? new Date(`${value}T00:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-') : 'Not recorded' }
function expiryStatus(value: string) {
  if (!value) return { label: 'Not Recorded', tone: 'neutral', days: 99999 }
  const days = Math.ceil((new Date(`${value}T23:59:59`).getTime() - Date.now()) / 86400000)
  if (days < 0) return { label: 'Expired', tone: 'error', days }
  if (days <= 7) return { label: 'Within 7 Days', tone: 'error', days }
  if (days <= 30) return { label: 'Within 30 Days', tone: 'warning', days }
  return { label: 'Valid', tone: 'success', days }
}
function usePersisted<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : initial } catch { return initial } })
  useEffect(() => { localStorage.setItem(key, JSON.stringify(value)) }, [key, value])
  return [value, setValue] as const
}

function Login({ onLogin }: { onLogin: (r: Role) => void }) {
  const [role, setRole] = useState<Role>('admin'), [username, setUsername] = useState('admin'), [password, setPassword] = useState('demo123')
  const [show, setShow] = useState(false), [error, setError] = useState('')
  const fill = (r: Role) => { setRole(r); setUsername(r); setPassword('demo123'); setError('') }
  const submit = (e: FormEvent) => { e.preventDefault(); if (username === role && password === 'demo123') onLogin(role); else setError('Credentials do not match the selected demo role.') }
  return <main className="login-shell">
    <section className="login-brand">
      <div className="brand-mark">IT</div><div className="eyebrow light">IT OPERATIONS</div>
      <div className="display-title">Every asset.<br />One reliable record.</div>
      <p>Search, assign, audit, and maintain company technology from a clear, centralized workspace.</p>
      <div className="login-features"><span>✓ Central inventory</span><span>✓ Renewal visibility</span><span>✓ Assignment history</span></div>
    </section>
    <section className="login-panel">
      <div className="login-card">
        <Badge tone="blue">Demo Mode — Sample Data Only</Badge>
        <div className="page-title login-title">Welcome back</div><p className="muted">Sign in with a predefined demo role. No real account is required.</p>
        <form onSubmit={submit} className="login-form">
          <Field label="Demo role"><select value={role} onChange={e => fill(e.target.value as Role)}><option value="admin">IT Administrator</option><option value="hr">HR / Operations</option><option value="manager">Management / Audit</option></select></Field>
          <Field label="Username"><input value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" /></Field>
          <Field label="Password"><div className="password"><input type={show ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" /><button type="button" onClick={() => setShow(!show)}>{show ? 'Hide' : 'Show'}</button></div></Field>
          {error && <div className="error-message" role="alert">{error}</div>}
          <Button type="submit">Enter inventory workspace →</Button>
        </form>
        <div className="quick"><span>Quick demo entry</span>{(['admin', 'hr', 'manager'] as Role[]).map(r => <button key={r} onClick={() => fill(r)}>{roleNames[r].split(' ')[0]}</button>)}</div>
        <p className="fineprint">Client-side credentials are for prototype use only and do not provide production security.</p>
      </div>
    </section>
  </main>
}

function App() {
  const [role, setRole] = usePersisted<Role | null>('it-demo-session', null)
  const [assets, setAssets] = usePersisted<Asset[]>('it-demo-assets', sampleAssets)
  const [audits, setAudits] = usePersisted<Audit[]>('it-demo-audit', [
    { id: 1, action: 'Asset updated', target: 'HH-DES-016', actor: 'IT Administrator', time: new Date().toISOString(), detail: 'Antivirus renewal date reviewed' },
    { id: 2, action: 'Assignment returned', target: 'HH-LAP-021', actor: 'IT Administrator', time: new Date(Date.now() - 86400000).toISOString(), detail: 'Asset marked available' },
  ])
  const [locations, setLocations] = usePersisted<string[]>('it-demo-locations', ['Vasai', 'Head Office', 'Remote'])
  const [page, setPage] = useState<Page>('dashboard'), [selected, setSelected] = useState<Asset | null>(null)
  const [query, setQuery] = useState(''), [filters, setFilters] = useState({ location: '', type: '', os: '', expiry: '', status: '' })
  const [assetModal, setAssetModal] = useState<Asset | 'new' | null>(null), [assignModal, setAssignModal] = useState<Asset | null>(null)
  const [sidebar, setSidebar] = useState(true), [toast, setToast] = useState('')
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(''), 3000); return () => clearTimeout(t) } }, [toast])
  if (!role) return <Login onLogin={r => { setRole(r); setPage('dashboard') }} />
  const go = (p: Page) => { setSelected(null); setPage(p); if (window.innerWidth < 800) setSidebar(false) }
  const openAsset = (a: Asset) => { setSelected(a); setPage('assets') }
  const log = (action: string, target: string, detail: string) => setAudits(v => [{ id: Date.now(), action, target, actor: roleNames[role], time: new Date().toISOString(), detail }, ...v])
  const saveAsset = (asset: Asset) => {
    const isNew = !assets.some(a => a.id === asset.id)
    setAssets(v => isNew ? [asset, ...v] : v.map(a => a.id === asset.id ? asset : a))
    log(isNew ? 'Asset created' : 'Asset updated', asset.tag, isNew ? 'New demo inventory record' : 'Asset fields changed')
    setAssetModal(null); setSelected(asset); setToast(`${asset.tag} ${isNew ? 'created' : 'updated'} successfully`)
  }
  const filtered = filterAssets(assets, query, filters)
  return <div className="app-shell">
    <aside className={`sidebar ${sidebar ? 'open' : 'closed'}`}>
      <div className="brand"><div className="brand-mark small">IT</div><div><strong>Inventory Record</strong><span>Asset management</span></div></div>
      <nav>{nav.filter(n => !n.roles || n.roles.includes(role)).map(n => <button key={n.id} className={page === n.id && !selected ? 'active' : ''} onClick={() => go(n.id)}><i>{n.symbol}</i><span>{n.label}</span></button>)}</nav>
      <div className="sidebar-foot"><Badge tone="blue">DEMO</Badge><span>Sample data stored locally</span></div>
    </aside>
    <div className="workspace">
      <header className="topbar">
        <button className="icon-button" onClick={() => setSidebar(!sidebar)} aria-label="Toggle navigation">☰</button>
        <div className="global-search"><span>⌕</span><input value={query} onChange={e => { setQuery(e.target.value); if (e.target.value) go('assets') }} placeholder="Search asset tag, serial, user, model..." /></div>
        <Badge tone="blue">Demo Mode — Sample Data Only</Badge>
        <div className="profile"><div className="avatar">{role === 'admin' ? 'IA' : role === 'hr' ? 'HR' : 'MA'}</div><div><strong>{roleNames[role]}</strong><span>Demo user</span></div></div>
        <Button variant="ghost" onClick={() => setRole(null)}>Logout</Button>
      </header>
      <main className="content">
        <div className="crumb">Inventory / {selected ? selected.tag : pageNames[page]}</div>
        {selected ? <AssetDetail asset={assets.find(a => a.id === selected.id) || selected} role={role} onBack={() => setSelected(null)} onEdit={() => setAssetModal(selected)} onAssign={() => setAssignModal(selected)} onArchive={() => {
          if (confirm(`Archive ${selected.tag}? Its history will be retained.`)) { const changed = { ...selected, status: 'Archived' as Status, user: '', updated: new Date().toISOString().slice(0, 10), history: [...selected.history, { user: selected.user, date: new Date().toISOString().slice(0, 10), action: 'Archived', note: 'Archived from asset detail' }] }; setAssets(v => v.map(a => a.id === changed.id ? changed : a)); setSelected(changed); log('Asset archived', changed.tag, 'Status changed to Archived') }
        }} /> :
          page === 'dashboard' ? <Dashboard assets={assets} licenses={sampleLicenses} role={role} onFilter={(k, v) => { setFilters({ location: '', type: '', os: '', expiry: '', status: '', [k]: v }); go('assets') }} onAsset={openAsset} onAction={a => a === 'add' ? setAssetModal('new') : go(a as Page)} /> :
          page === 'assets' ? <AssetsPage assets={filtered} allCount={assets.length} query={query} setQuery={setQuery} filters={filters} setFilters={setFilters} role={role} onOpen={openAsset} onAdd={() => setAssetModal('new')} onExport={() => exportCsv(filtered, log)} /> :
          page === 'assignments' ? <Assignments assets={assets} role={role} onOpen={openAsset} onAssign={setAssignModal} /> :
          page === 'software' ? <SoftwarePage licenses={sampleLicenses} /> :
          page === 'alerts' ? <Alerts assets={assets} onOpen={openAsset} /> :
          page === 'reports' ? <Reports assets={assets} licenses={sampleLicenses} onFilter={(k, v) => { setFilters({ location: '', type: '', os: '', expiry: '', status: '', [k]: v }); go('assets') }} /> :
          page === 'import' ? <ImportExport assets={assets} onImport={rows => { setAssets(v => [...rows, ...v]); log('CSV import', `${rows.length} assets`, 'Validated demo CSV import'); setToast(`${rows.length} records imported`) }} onExport={() => exportCsv(filtered, log)} /> :
          page === 'audit' ? <AuditPage audits={audits} /> :
          <Settings locations={locations} setLocations={setLocations} />}
      </main>
    </div>
    {assetModal && <AssetForm initial={assetModal === 'new' ? null : assetModal} assets={assets} locations={locations} onClose={() => setAssetModal(null)} onSave={saveAsset} />}
    {assignModal && <AssignForm asset={assignModal} onClose={() => setAssignModal(null)} onSave={(user, status, note) => {
      const changed = { ...assignModal, user: status === 'Assigned' ? user : '', status, lastUser: assignModal.user || assignModal.lastUser, updated: new Date().toISOString().slice(0, 10), history: [...assignModal.history, { user: user || assignModal.user, date: new Date().toISOString().slice(0, 10), action: status === 'Assigned' ? 'Assigned / Reassigned' : 'Returned', note }] }
      setAssets(v => v.map(a => a.id === changed.id ? changed : a)); setSelected(changed); setAssignModal(null); log('Assignment updated', changed.tag, `${status}${user ? ` — ${user}` : ''}`); setToast('Assignment history updated')
    }} />}
    {toast && <div className="toast">✓ {toast}</div>}
  </div>
}

function filterAssets(assets: Asset[], q: string, f: Record<string, string>) {
  const term = q.toLowerCase().trim()
  return assets.filter(a => (!term || [a.tag, a.serial, a.user, a.model, a.config].some(x => x.toLowerCase().includes(term))) &&
    (!f.location || a.location === f.location) && (!f.type || a.type === f.type) && (!f.os || a.os === f.os) &&
    (!f.status || a.status === f.status) && (!f.expiry || expiryStatus(a.antivirus).label === f.expiry))
    .sort((a, b) => (a.tag.toLowerCase() === term ? -1 : b.tag.toLowerCase() === term ? 1 : a.id - b.id))
}
function PageHead({ title, sub, action }: { title: string; sub: string; action?: ReactNode }) { return <div className="page-head"><div><div className="page-title">{title}</div><p>{sub}</p></div>{action}</div> }
function Dashboard({ assets, licenses, role, onFilter, onAsset, onAction }: { assets: Asset[]; licenses: License[]; role: Role; onFilter: (k: string, v: string) => void; onAsset: (a: Asset) => void; onAction: (v: string) => void }) {
  const active = assets.filter(a => a.status !== 'Archived').length, exp30 = assets.filter(a => ['Within 7 Days', 'Within 30 Days'].includes(expiryStatus(a.antivirus).label)).length
  const metrics = [['Active assets', active, 'status', ''], ['Available', assets.filter(a => a.status === 'Available').length, 'status', 'Available'], ['Assigned', assets.filter(a => a.status === 'Assigned').length, 'status', 'Assigned'], ['Under repair', assets.filter(a => a.status === 'Under Repair').length, 'status', 'Under Repair'], ['Archived', assets.filter(a => a.status === 'Archived').length, 'status', 'Archived'], ['Expiring ≤30 days', exp30, 'expiry', 'Within 30 Days']]
  const locations = counts(assets.filter(a => a.status !== 'Archived'), 'location'), types = counts(assets.filter(a => a.status !== 'Archived'), 'type')
  const upcoming = assets.filter(a => expiryStatus(a.antivirus).days <= 30).sort((a, b) => expiryStatus(a.antivirus).days - expiryStatus(b.antivirus).days).slice(0, 4)
  return <><PageHead title="Inventory overview" sub="A live view of your locally stored demo records." action={<div className="head-date">As of {formatDate(new Date().toISOString().slice(0, 10))}</div>} />
    <div className="metric-grid">{metrics.map(([label, value, key, filter]) => <button className="metric-card" key={String(label)} onClick={() => onFilter(String(key), String(filter))}><span>{label}</span><strong>{value}</strong><em>View records →</em></button>)}</div>
    <div className="dashboard-grid">
      <section className="card span-2"><div className="card-head"><strong>Assets by location</strong><span>{active} active assets</span></div><div className="bars">{Object.entries(locations).map(([k, v], i) => <button key={k} onClick={() => onFilter('location', k)}><span>{k}<b>{v}</b></span><i><u style={{ width: `${Math.max(12, (v / active) * 100)}%` }} className={`bar-${i}`} /></i></button>)}</div></section>
      <section className="card quick-card"><div className="card-head"><strong>Quick actions</strong></div>{role === 'admin' && <button onClick={() => onAction('add')}><b>＋</b><span>Add new asset<small>Create an inventory record</small></span></button>}<button onClick={() => onAction('assets')}><b>⌕</b><span>Find an asset<small>Search all identifiers</small></span></button>{role === 'admin' && <button onClick={() => onAction('import')}><b>⇧</b><span>Import records<small>Validate a CSV file</small></span></button>}<button onClick={() => onAction('alerts')}><b>!</b><span>View renewals<small>Review upcoming expiry</small></span></button></section>
      <section className="card"><div className="card-head"><strong>Assets by type</strong></div><div className="donut-row"><div className="donut"><span>{active}<small>Total</small></span></div><div className="legend">{Object.entries(types).map(([k, v]) => <button key={k} onClick={() => onFilter('type', k)}><i />{k.replace(/^[A-Z]+ /, '')}<b>{v}</b></button>)}</div></div></section>
      <section className="card span-2"><div className="card-head"><strong>Renewal attention</strong><button onClick={() => onAction('alerts')}>View all</button></div><div className="mini-list">{upcoming.map(a => { const e = expiryStatus(a.antivirus); return <button key={a.id} onClick={() => onAsset(a)}><div className="asset-icon">{a.type.slice(0, 3)}</div><span><b>{a.tag}</b><small>{a.model}</small></span><Badge tone={e.tone}>{e.label}</Badge><time>{formatDate(a.antivirus)}</time></button> })}</div></section>
      <section className="card"><div className="card-head"><strong>Licence capacity</strong><span>{licenses.length} records</span></div>{licenses.map(l => <div className="lic-mini" key={l.id}><span>{l.name}<small>{l.allocated} of {l.seats} allocated</small></span><b>{l.seats - l.allocated} free</b></div>)}</section>
    </div>
  </>
}
function counts(items: Asset[], key: 'location' | 'type') { return items.reduce<Record<string, number>>((r, a) => ({ ...r, [a[key]]: (r[a[key]] || 0) + 1 }), {}) }

function AssetsPage({ assets, allCount, query, setQuery, filters, setFilters, role, onOpen, onAdd, onExport }: any) {
  const [sort, setSort] = useState<'id' | 'tag' | 'expiry'>('id'), [page, setPage] = useState(1), pageSize = 6
  const sorted = [...assets].sort((a, b) => sort === 'tag' ? a.tag.localeCompare(b.tag) : sort === 'expiry' ? a.antivirus.localeCompare(b.antivirus) : a.id - b.id)
  const shown = sorted.slice((page - 1) * pageSize, page * pageSize)
  useEffect(() => setPage(1), [query, filters])
  const setF = (k: string, v: string) => setFilters((f: any) => ({ ...f, [k]: v }))
  return <><PageHead title="All assets" sub={`${assets.length} of ${allCount} records · searchable, sortable and filterable`} action={<div className="actions">{role === 'admin' && <Button onClick={onAdd}>＋ Add asset</Button>}<Button variant="secondary" onClick={onExport}>Export CSV</Button></div>} />
    <section className="card table-card">
      <div className="table-tools"><div className="search-box">⌕<input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search asset tag, serial, user..." /></div>
        <select value={filters.location} onChange={e => setF('location', e.target.value)}><option value="">All locations</option><option>Head Office</option><option>Vasai</option><option>Remote</option></select>
        <select value={filters.type} onChange={e => setF('type', e.target.value)}><option value="">All types</option><option>DES Desktop</option><option>LAP Laptop</option><option>PRN Printer</option><option>SVR Server</option></select>
        <select value={filters.status} onChange={e => setF('status', e.target.value)}><option value="">All statuses</option>{['Available', 'Assigned', 'Under Repair', 'Inactive', 'Archived'].map(x => <option key={x}>{x}</option>)}</select>
        <select value={filters.os} onChange={e => setF('os', e.target.value)}><option value="">All operating systems</option><option>Windows 10 PRO</option><option>Windows 11 PRO</option><option>Windows Server 2022</option><option>Not Applicable</option></select>
        <select value={filters.expiry} onChange={e => setF('expiry', e.target.value)}><option value="">All renewal states</option>{['Expired', 'Within 7 Days', 'Within 30 Days', 'Valid', 'Not Recorded'].map(x => <option key={x}>{x}</option>)}</select>
        <button className="clear" onClick={() => { setFilters({ location: '', type: '', os: '', expiry: '', status: '' }); setQuery('') }}>Clear all</button>
      </div>
      <div className="table-scroll"><table><thead><tr><th onClick={() => setSort('id')}>Sr No ↕</th><th onClick={() => setSort('tag')}>Asset Tag ↕</th><th>Type</th><th>User Name</th><th>Location</th><th>Status</th><th>Config</th><th>Make / Model</th><th>Serial No</th><th>Windows OS</th><th>MS Office</th><th onClick={() => setSort('expiry')}>Antivirus Expiry ↕</th><th>Last User / Dept.</th><th>Software Installed</th><th>Remark</th><th>Actions</th></tr></thead>
        <tbody>{shown.map(a => <tr key={a.id} onClick={() => onOpen(a)}><td>{a.id}</td><td><button className="tag-link">{a.tag}</button></td><td>{a.type}</td><td>{a.user || 'Unassigned'}</td><td>{a.location}</td><td><Badge tone={a.status === 'Available' ? 'success' : a.status === 'Under Repair' ? 'warning' : a.status === 'Archived' ? 'neutral' : 'blue'}>{a.status}</Badge></td><td className="wide">{a.config}</td><td>{a.model}</td><td>{a.serial}</td><td>{a.os}</td><td>{a.office}</td><td><Badge tone={expiryStatus(a.antivirus).tone}>{formatDate(a.antivirus)}</Badge></td><td>{a.lastUser || '—'}</td><td>{a.software.join(', ')}</td><td>{a.remark || '—'}</td><td><Button variant="ghost">View</Button></td></tr>)}</tbody></table></div>
      {!shown.length && <div className="empty"><b>No assets found</b><span>Try clearing one or more search filters.</span></div>}
      <div className="pagination"><span>Showing {shown.length ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, sorted.length)} of {sorted.length}</span><div><Button variant="secondary" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button><span>Page {page} of {Math.max(1, Math.ceil(sorted.length / pageSize))}</span><Button variant="secondary" disabled={page * pageSize >= sorted.length} onClick={() => setPage(p => p + 1)}>Next</Button></div></div>
    </section>
  </>
}

function AssetDetail({ asset, role, onBack, onEdit, onAssign, onArchive }: any) {
  const info = [['Asset type', asset.type], ['Make / Model', asset.model], ['Serial number', asset.serial], ['Windows OS', asset.os], ['MS Office', asset.office], ['Antivirus expiry', formatDate(asset.antivirus)], ['Last user / department', asset.lastUser || 'Not recorded'], ['Installed software', asset.software.join(', ') || 'None recorded']]
  return <><PageHead title={asset.tag} sub={`Asset record #${asset.id} · Last updated ${formatDate(asset.updated)}`} action={<div className="actions"><Button variant="secondary" onClick={onBack}>← All assets</Button>{role === 'admin' && <><Button variant="secondary" onClick={onAssign} disabled={asset.status === 'Archived'}>Reassign</Button><Button onClick={onEdit}>Edit asset</Button></>}</div>} />
    <div className="detail-hero"><div className="asset-icon large">{asset.type.slice(0, 3)}</div><div><span className="eyebrow">CURRENT ASSIGNMENT</span><strong>{asset.user || 'Unassigned asset'}</strong><p>{asset.location} · <Badge tone={asset.status === 'Available' ? 'success' : asset.status === 'Under Repair' ? 'warning' : asset.status === 'Archived' ? 'neutral' : 'blue'}>{asset.status}</Badge></p></div><div className="detail-expiry"><span>Antivirus status</span><Badge tone={expiryStatus(asset.antivirus).tone}>{expiryStatus(asset.antivirus).label}</Badge><b>{formatDate(asset.antivirus)}</b></div></div>
    <div className="detail-grid"><section className="card span-2"><div className="section-title">Asset information</div><div className="info-grid">{info.map(([k, v]) => <div key={k}><span>{k}</span><b>{v}</b></div>)}</div></section>
      <section className="card"><div className="section-title">Hardware configuration</div><div className="spec"><span>Processor / CPU<b>{asset.cpu}</b></span><span>Memory / RAM<b>{asset.ram}</b></span><span>Storage<b>{asset.storage}</b></span><span>Additional details<b>{asset.config}</b></span></div></section>
      <section className="card span-2"><div className="section-title">Assignment & change history</div>{asset.history.length ? <div className="timeline">{[...asset.history].reverse().map((h: HistoryItem, i: number) => <div key={i}><i /><span><b>{h.action}</b><small>{h.user || 'No current user'} · {formatDate(h.date)}</small><p>{h.note}</p></span></div>)}</div> : <div className="empty compact">No assignment history recorded for this sample asset.</div>}</section>
      <section className="card"><div className="section-title">Remarks & maintenance</div><p className="note">{asset.remark || 'No remarks recorded.'}</p>{role === 'admin' && asset.status !== 'Archived' && <Button variant="danger" onClick={onArchive}>Archive asset</Button>}</section>
    </div>
  </>
}

function AssetForm({ initial, assets, locations, onClose, onSave }: { initial: Asset | null; assets: Asset[]; locations: string[]; onClose: () => void; onSave: (a: Asset) => void }) {
  const empty: Asset = { id: Math.max(0, ...assets.map(a => a.id)) + 1, tag: '', type: 'DES Desktop', user: '', location: locations[0], cpu: '', ram: '', storage: '', config: '', model: '', serial: '', os: 'Windows 11 PRO', office: 'Office 365', antivirus: '', lastUser: '', software: [], remark: '', status: 'Available', updated: new Date().toISOString().slice(0, 10), history: [] }
  const [f, setF] = useState<Asset>(initial || empty), [error, setError] = useState<Record<string, string>>({})
  const update = (k: keyof Asset, v: any) => setF({ ...f, [k]: v })
  const submit = (e: FormEvent) => { e.preventDefault(); const er: Record<string, string> = {}; if (!f.tag.trim()) er.tag = 'Asset Tag is required.'; if (assets.some(a => a.tag.toLowerCase() === f.tag.toLowerCase() && a.id !== f.id)) er.tag = 'This Asset Tag already exists.'; if (!f.model.trim()) er.model = 'Make / Model is required.'; if (!f.serial.trim()) er.serial = 'Enter a serial number, Assembled, or Not Available.'; setError(er); if (!Object.keys(er).length) onSave({ ...f, tag: f.tag.toUpperCase(), config: f.config || [f.cpu, f.ram, f.storage].filter(Boolean).join(' · '), updated: new Date().toISOString().slice(0, 10) }) }
  return <div className="modal-backdrop"><form className="modal asset-modal" onSubmit={submit}><div className="modal-head"><div><div className="page-title">{initial ? 'Edit asset' : 'Add new asset'}</div><p>Fields marked required must be completed.</p></div><button type="button" onClick={onClose}>×</button></div>
    <div className="form-body"><div className="form-section"><div className="section-title">Identification</div><div className="form-grid"><Field label="Sr No (auto-generated)"><input value={f.id} disabled /></Field><Field label="Asset Tag *" error={error.tag}><input value={f.tag} onChange={e => update('tag', e.target.value)} placeholder="HH-DES-000" /></Field><Field label="Asset Type *"><select value={f.type} onChange={e => update('type', e.target.value)}><option>DES Desktop</option><option>LAP Laptop</option><option>PRN Printer</option><option>SVR Server</option></select></Field><Field label="Make / Model *" error={error.model}><input value={f.model} onChange={e => update('model', e.target.value)} placeholder="Manufacturer and model or Assembled" /></Field><Field label="Serial No *" error={error.serial}><input value={f.serial} onChange={e => update('serial', e.target.value)} placeholder="Serial, Assembled, or Not Available" /></Field></div></div>
    <div className="form-section"><div className="section-title">Hardware configuration</div><div className="form-grid"><Field label="Processor / CPU"><input value={f.cpu} onChange={e => update('cpu', e.target.value)} /></Field><Field label="RAM"><input value={f.ram} onChange={e => update('ram', e.target.value)} /></Field><Field label="Storage capacity & type"><input value={f.storage} onChange={e => update('storage', e.target.value)} /></Field><Field label="Additional configuration"><input value={f.config} onChange={e => update('config', e.target.value)} /></Field></div></div>
    <div className="form-section"><div className="section-title">Assignment</div><div className="form-grid"><Field label="User Name"><input value={f.user} onChange={e => update('user', e.target.value)} /></Field><Field label="Location"><select value={f.location} onChange={e => update('location', e.target.value)}>{locations.map(x => <option key={x}>{x}</option>)}</select></Field><Field label="Status"><select value={f.status} onChange={e => update('status', e.target.value as Status)}>{['Available', 'Assigned', 'Under Repair', 'Inactive', 'Archived'].map(x => <option key={x}>{x}</option>)}</select></Field><Field label="Last User / Department"><input value={f.lastUser} onChange={e => update('lastUser', e.target.value)} /></Field></div></div>
    <div className="form-section"><div className="section-title">Operating system & software</div><div className="form-grid"><Field label="Windows OS"><select value={f.os} onChange={e => update('os', e.target.value)}><option>Windows 10 PRO</option><option>Windows 11 PRO</option><option>Windows Server 2022</option><option>Not Applicable</option></select></Field><Field label="MS Office"><select value={f.office} onChange={e => update('office', e.target.value)}><option>Professional Plus 2021</option><option>Office 365</option><option>Not Applicable</option></select></Field><Field label="Antivirus Expiry"><input type="date" value={f.antivirus} onChange={e => update('antivirus', e.target.value)} /></Field><Field label="Installed Software (comma separated)"><input value={f.software.join(', ')} onChange={e => update('software', e.target.value.split(',').map(x => x.trim()).filter(Boolean))} /></Field></div></div>
    <div className="form-section"><Field label="Remark"><textarea value={f.remark} onChange={e => update('remark', e.target.value)} rows={3} /></Field></div></div>
    <div className="modal-actions"><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit">{initial ? 'Save changes' : 'Create asset'}</Button></div></form></div>
}
function AssignForm({ asset, onClose, onSave }: { asset: Asset; onClose: () => void; onSave: (u: string, s: Status, n: string) => void }) {
  const [user, setUser] = useState(asset.user), [status, setStatus] = useState<Status>(asset.status === 'Archived' ? 'Archived' : 'Assigned'), [note, setNote] = useState('')
  return <div className="modal-backdrop"><form className="modal small-modal" onSubmit={e => { e.preventDefault(); if (status === 'Assigned' && !user.trim()) return; onSave(user, status, note) }}><div className="modal-head"><div><div className="page-title">Update assignment</div><p>{asset.tag} · Current: {asset.user || 'Unassigned'}</p></div><button type="button" onClick={onClose}>×</button></div><div className="form-body"><Field label="New user name"><input value={user} onChange={e => setUser(e.target.value)} required={status === 'Assigned'} /></Field><Field label="Outcome"><select value={status} onChange={e => setStatus(e.target.value as Status)}><option>Assigned</option><option>Available</option><option>Under Repair</option></select></Field><Field label="Handover remarks"><textarea value={note} onChange={e => setNote(e.target.value)} rows={3} placeholder="Reason, condition, accessories..." /></Field></div><div className="modal-actions"><Button variant="secondary" type="button" onClick={onClose}>Cancel</Button><Button type="submit">Update assignment</Button></div></form></div>
}

function Assignments({ assets, role, onOpen, onAssign }: any) { const records = assets.filter((a: Asset) => a.history.length || a.status === 'Assigned'); return <><PageHead title="Assignments & history" sub="Current custody and retained handover events." /><section className="card table-card"><div className="table-scroll"><table><thead><tr><th>Asset</th><th>Current user</th><th>Location</th><th>Status</th><th>Previous user / dept.</th><th>History events</th><th>Action</th></tr></thead><tbody>{records.map((a: Asset) => <tr key={a.id} onClick={() => onOpen(a)}><td><button className="tag-link">{a.tag}</button></td><td>{a.user || 'Unassigned'}</td><td>{a.location}</td><td><Badge tone={a.status === 'Assigned' ? 'blue' : 'neutral'}>{a.status}</Badge></td><td>{a.lastUser || '—'}</td><td>{a.history.length}</td><td>{role !== 'manager' && a.status !== 'Archived' ? <Button variant="ghost" onClick={(e) => { e.stopPropagation(); onAssign(a) }}>Update</Button> : 'View only'}</td></tr>)}</tbody></table></div></section></> }
function SoftwarePage({ licenses }: { licenses: License[] }) { return <><PageHead title="Software & licences" sub="Sample subscription capacity and renewal records. Secure references are masked." /><div className="license-grid">{licenses.map(l => <section className="card licence-card" key={l.id}><div className="card-head"><div className="asset-icon">SW</div><Badge tone={l.status === 'Active' ? 'success' : 'warning'}>{l.status}</Badge></div><div className="section-title">{l.name}</div><p>{l.vendor} · {l.type}</p><div className="seat-bar"><i><u style={{ width: `${l.allocated / l.seats * 100}%` }} /></i><span><b>{l.allocated}</b> allocated of {l.seats}<strong>{l.seats - l.allocated} available</strong></span></div><div className="lic-data"><span>Secure reference<b>{l.reference}</b></span><span>Renewal date<b>{formatDate(l.renewal)}</b></span><span>Expiry date<b>{formatDate(l.expiry)}</b></span></div><p className="note">{l.notes}</p></section>)}</div></> }
function Alerts({ assets, onOpen }: { assets: Asset[]; onOpen: (a: Asset) => void }) { const [filter, setFilter] = useState(''); const list = assets.filter(a => !filter || expiryStatus(a.antivirus).label === filter).sort((a, b) => expiryStatus(a.antivirus).days - expiryStatus(b.antivirus).days); return <><PageHead title="Expiry & renewal alerts" sub="Antivirus status is calculated dynamically from today's date. No external notifications are configured." /><section className="card table-card"><div className="table-tools"><select value={filter} onChange={e => setFilter(e.target.value)}><option value="">All expiry categories</option>{['Expired', 'Within 7 Days', 'Within 30 Days', 'Valid', 'Not Recorded'].map(x => <option key={x}>{x}</option>)}</select></div><div className="table-scroll"><table><thead><tr><th>Asset Tag</th><th>Device</th><th>Product</th><th>Expiry date</th><th>Current status</th><th>Action</th></tr></thead><tbody>{list.map(a => <tr key={a.id} onClick={() => onOpen(a)}><td><button className="tag-link">{a.tag}</button></td><td>{a.model}</td><td>Endpoint Protection</td><td>{formatDate(a.antivirus)}</td><td><Badge tone={expiryStatus(a.antivirus).tone}>{expiryStatus(a.antivirus).label}</Badge></td><td><Button variant="ghost">Open asset</Button></td></tr>)}</tbody></table></div></section></> }
function Reports({ assets, licenses, onFilter }: any) { const loc = counts(assets, 'location'), types = counts(assets, 'type'), max = Math.max(...Object.values(loc)); return <><PageHead title="Reports & analytics" sub="All figures derive from the shared local demo records. No valuation is shown because purchase-cost data is unavailable." /><div className="report-grid"><section className="card span-2"><div className="section-title">Location distribution</div><div className="report-bars">{Object.entries(loc).map(([k, v]) => <button key={k} onClick={() => onFilter('location', k)}><span>{k}<b>{v} assets</b></span><i><u style={{ width: `${v / max * 100}%` }} /></i></button>)}</div></section><section className="card"><div className="section-title">Assignment status</div>{['Available', 'Assigned', 'Under Repair', 'Archived'].map(s => <button className="stat-row" key={s} onClick={() => onFilter('status', s)}><span>{s}</span><b>{assets.filter((a: Asset) => a.status === s).length}</b></button>)}</section><section className="card"><div className="section-title">Asset types</div>{Object.entries(types).map(([k, v]) => <button className="stat-row" key={k} onClick={() => onFilter('type', k)}><span>{k}</span><b>{v}</b></button>)}</section><section className="card span-2"><div className="section-title">Software licence allocation</div>{licenses.map((l: License) => <div className="alloc-row" key={l.id}><span>{l.name}</span><i><u style={{ width: `${l.allocated / l.seats * 100}%` }} /></i><b>{l.allocated}/{l.seats}</b></div>)}</section></div></> }
function AuditPage({ audits }: { audits: Audit[] }) { return <><PageHead title="Audit logs" sub="Read-only demo activity history. This is not a tamper-proof production audit system." /><section className="card table-card"><div className="table-scroll"><table><thead><tr><th>Timestamp</th><th>Action</th><th>Affected record</th><th>Demo actor</th><th>Change detail</th></tr></thead><tbody>{audits.map(a => <tr key={a.id}><td>{new Date(a.time).toLocaleString()}</td><td><Badge tone="blue">{a.action}</Badge></td><td>{a.target}</td><td>{a.actor}</td><td>{a.detail}</td></tr>)}</tbody></table></div></section></> }
function Settings({ locations, setLocations }: { locations: string[]; setLocations: (v: string[]) => void }) { const [name, setName] = useState(''); return <><PageHead title="Settings" sub="Administrator-only configuration stored in this browser." /><div className="settings-grid"><section className="card"><div className="section-title">Supported locations</div><div className="chips">{locations.map(x => <span key={x}>{x}<button onClick={() => locations.length > 1 && setLocations(locations.filter(v => v !== x))}>×</button></span>)}</div><form className="inline-form" onSubmit={e => { e.preventDefault(); if (name.trim() && !locations.includes(name.trim())) { setLocations([...locations, name.trim()]); setName('') } }}><input value={name} onChange={e => setName(e.target.value)} placeholder="Add a location" /><Button type="submit">Add</Button></form></section><section className="card"><div className="section-title">Asset types</div><p className="muted">Standard demo taxonomy</p><div className="chips static">{['DES Desktop', 'LAP Laptop', 'PRN Printer', 'SVR Server'].map(x => <span key={x}>{x}</span>)}</div><p className="note">Type codes are fixed in this prototype to preserve reporting consistency.</p></section></div></> }
function ImportExport({ assets, onImport, onExport }: { assets: Asset[]; onImport: (a: Asset[]) => void; onExport: () => void }) {
  const [rows, setRows] = useState<any[]>([]), [errors, setErrors] = useState<string[]>([])
  const file = (e: ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (!f) return; const reader = new FileReader(); reader.onload = () => { const lines = String(reader.result).trim().split(/\r?\n/); const heads = lines[0].split(',').map(x => x.trim()); const parsed = lines.slice(1).map((line, i) => { const vals = line.split(','); return { row: i + 2, ...Object.fromEntries(heads.map((h, j) => [h, vals[j]?.trim() || ''])) } }); setRows(parsed); setErrors(parsed.flatMap(r => !r['Asset Tag'] ? [`Row ${r.row}: Asset Tag is required`] : assets.some(a => a.tag.toLowerCase() === r['Asset Tag'].toLowerCase()) ? [`Row ${r.row}: duplicate Asset Tag ${r['Asset Tag']}`] : [])) }; reader.readAsText(f) }
  const downloadTemplate = () => download('asset-import-template.csv', 'Asset Tag,Asset Type,User Name,Location,Make / Model,Serial No,Windows OS,MS Office,Antivirus Expiry,Remark\nHH-LAP-999,LAP Laptop,,Head Office,Demo Model,DEMO-999,Windows 11 PRO,Office 365,2026-12-31,Sample row')
  const confirmImport = () => { if (errors.length || !rows.length) return; onImport(rows.map((r, i) => ({ id: Math.max(...assets.map(a => a.id)) + i + 1, tag: r['Asset Tag'], type: r['Asset Type'] || 'DES Desktop', user: r['User Name'] || '', location: r['Location'] || 'Head Office', cpu: '', ram: '', storage: '', config: r['Config'] || '', model: r['Make / Model'] || 'Not Available', serial: r['Serial No'] || 'Not Available', os: r['Windows OS'] || 'Windows 11 PRO', office: r['MS Office'] || 'Office 365', antivirus: r['Antivirus Expiry'] || '', lastUser: '', software: [], remark: r['Remark'] || '', status: r['User Name'] ? 'Assigned' : 'Available', updated: new Date().toISOString().slice(0, 10), history: [] }))); setRows([]) }
  return <><PageHead title="Import / Export" sub="Validate CSV records before adding them to the local demo store." /><div className="import-grid"><section className="card"><div className="step">1</div><div className="section-title">Select CSV file</div><p className="muted">Required column: Asset Tag. Supported fields match the inventory template.</p><input className="file" type="file" accept=".csv,text/csv" onChange={file} /><Button variant="secondary" onClick={downloadTemplate}>Download CSV template</Button></section><section className="card"><div className="step">2</div><div className="section-title">Validate & confirm</div><p className="muted">{rows.length ? `${rows.length} rows ready for preview` : 'Select a file to preview mapped rows and row-level validation.'}</p>{errors.map(x => <div className="error-message" key={x}>{x}</div>)}<Button disabled={!rows.length || !!errors.length} onClick={confirmImport}>Import {rows.length || ''} valid records</Button></section><section className="card"><div className="step">3</div><div className="section-title">Export current records</div><p className="muted">Downloads the current filtered and sorted inventory view as CSV.</p><Button onClick={onExport}>Export CSV</Button></section></div>{rows.length > 0 && <section className="card table-card preview"><div className="section-title">Import preview</div><pre>{JSON.stringify(rows.slice(0, 5), null, 2)}</pre></section>}</> 
}
function download(name: string, content: string) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([content], { type: 'text/csv' })); a.download = name; a.click(); URL.revokeObjectURL(a.href) }
function exportCsv(assets: Asset[], log: (a: string, b: string, c: string) => void) { const heads = ['Sr No', 'Asset Tag', 'Asset Type', 'User Name', 'Location', 'Config', 'Make / Model', 'Serial No', 'Windows OS', 'MS Office', 'Antivirus Expiry', 'Last User / Department', 'Software Installed', 'Remark', 'Status']; const vals = assets.map(a => [a.id, a.tag, a.type, a.user, a.location, a.config, a.model, a.serial, a.os, a.office, a.antivirus, a.lastUser, a.software.join('; '), a.remark, a.status].map(v => `"${String(v).replaceAll('"', '""')}"`).join(',')); download(`it-inventory-${new Date().toISOString().slice(0, 10)}.csv`, [heads.join(','), ...vals].join('\n')); log('CSV export', `${assets.length} assets`, 'Exported current filtered view') }
export default App
