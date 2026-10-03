import { useEffect, useMemo, useState, useCallback } from 'react'
import { Globe, LayoutDashboard, CalendarPlus, UserCircle, Users, Mail, Phone, CalendarCheck, Clock, MapPin, Stethoscope, LogOut, Plus, Trash2, ShieldCheck, User, X, Search, HeartPulse } from 'lucide-react'
import { api, session } from './api'

const fa = (s) => String(s).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d])
const dayFmt = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
const monFmt = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { month: 'long' })
const dNum = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { day: 'numeric' })
const toDate = (s) => new Date(s + 'T12:00:00')
const hhmm = (t) => fa(String(t).slice(0, 5))

function Ticket({ a, children, status }) {
  const d = toDate(a.date)
  return (
    <article className={'ticket ' + (status || '')}>
      <div className="stub">
        <b>{dNum.format(d)}</b>
        <span>{monFmt.format(d)}</span>
      </div>
      <div className="body">
        <h3>{a.title}</h3>
        <p className="doc"><Stethoscope size={16} /> {a.doctor}</p>
        <ul>
          <li><Clock size={14} /> {hhmm(a.time)}</li>
          <li><MapPin size={14} /> {a.place}</li>
          <li><CalendarCheck size={14} /> {dayFmt.format(d)}</li>
        </ul>
        {a.reservedByUsername && <p className="by"><User size={14} /> رزرو شده توسط {a.reservedByUsername}</p>}
      </div>
      <div className="act">{children}</div>
    </article>
  )
}

function AuthPanel({ onDone, onClose, toast }) {
  const [mode, setMode] = useState('login')
  const [f, setF] = useState({ firstname: '', lastname: '', username: '', email: '', number: '', password: '' })
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const submit = async (e) => {
    e.preventDefault(); setBusy(true)
    try {
      const r = mode === 'login' ? await api.login({ username: f.username, password: f.password }) : await api.register(f)
      session.save(r.token); onDone()
    } catch (err) {
      toast(err.status === 401 ? 'نام کاربری یا رمز عبور اشتباه است.' : err.message, 'err')
    } finally { setBusy(false) }
  }
  const field = (k, label, type = 'text') => (
    <label>{label}<input required type={type} value={f[k]} onChange={set(k)} dir={k === 'firstname' || k === 'lastname' ? 'rtl' : 'ltr'} /></label>
  )
  return (
    <div className="overlay" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <button type="button" className="x" onClick={onClose} aria-label="بستن"><X size={18} /></button>
        <h2>{mode === 'login' ? 'ورود به حساب' : 'ساخت حساب جدید'}</h2>
        <p className="sub">{mode === 'login' ? 'برای رزرو نوبت وارد شوید.' : 'چند ثانیه وقت می‌برد.'}</p>
        {mode === 'register' && <div className="row2">{field('firstname', 'نام')}{field('lastname', 'نام خانوادگی')}</div>}
        {field('username', 'نام کاربری')}
        {mode === 'register' && <>{field('email', 'ایمیل', 'email')}{field('number', 'شماره تماس', 'tel')}</>}
        {field('password', 'رمز عبور', 'password')}
        <button className="btn primary wide" disabled={busy}>{busy ? 'کمی صبر کنید…' : mode === 'login' ? 'ورود' : 'ثبت‌نام'}</button>
        <button type="button" className="link" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? 'حساب ندارید؟ ثبت‌نام کنید' : 'حساب دارید؟ وارد شوید'}
        </button>
      </form>
    </div>
  )
}

const EMPTY = { doctor: '', title: '', place: '', date: '', time: '' }

function Stat({ icon, label, value, tone }) {
  return <div className={'stat ' + (tone || '')}><span className="si">{icon}</span><b>{fa(value)}</b><small>{label}</small></div>
}

function Admin({ appts, reserved, reload, toast }) {
  const [f, setF] = useState(EMPTY)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const add = async (e) => {
    e.preventDefault()
    try { await api.add(f); toast('نوبت اضافه شد.'); setF(EMPTY); reload() } catch (err) { toast(err.message, 'err') }
  }
  const del = async (id) => {
    if (!confirm('این نوبت حذف شود؟')) return
    try { await api.remove(id); toast('نوبت حذف شد.'); reload() } catch (err) { toast(err.message, 'err') }
  }
  const byId = Object.fromEntries(reserved.map((r) => [r.id, r.reservedByUsername]))
  const users = new Set(reserved.map((r) => r.reservedByUsername)).size
  return (
    <>
      <div className="stats">
        <Stat icon={<CalendarCheck size={20} />} label="کل نوبت‌ها" value={appts.length} />
        <Stat icon={<ShieldCheck size={20} />} label="رزرو شده" value={reserved.length} tone="amber" />
        <Stat icon={<Clock size={20} />} label="آزاد" value={appts.length - reserved.length} tone="green" />
        <Stat icon={<Users size={20} />} label="بیماران فعال" value={users} />
      </div>
      <form className="card adminForm" onSubmit={add}>
        <h2><CalendarPlus size={20} /> افزودن نوبت جدید</h2>
        <div className="grid5">
          <label>پزشک<input required value={f.doctor} onChange={set('doctor')} /></label>
          <label>تخصص / عنوان<input required value={f.title} onChange={set('title')} /></label>
          <label>مکان<input required value={f.place} onChange={set('place')} /></label>
          <label>تاریخ<input required type="date" value={f.date} onChange={set('date')} dir="ltr" />{f.date && <small>{dayFmt.format(toDate(f.date))}</small>}</label>
          <label>ساعت<input required type="time" value={f.time} onChange={set('time')} dir="ltr" /></label>
        </div>
        <button className="btn primary"><Plus size={16} /> ثبت نوبت</button>
      </form>
      <div className="card tableCard">
        <h2>مدیریت نوبت‌ها</h2>
        <div className="tscroll"><table>
          <thead><tr><th>پزشک</th><th>تخصص</th><th>مکان</th><th>زمان</th><th>وضعیت</th><th></th></tr></thead>
          <tbody>{[...appts].sort((x, y) => (x.date + x.time).localeCompare(y.date + y.time)).map((a) => (
            <tr key={a.id}>
              <td><b>{a.doctor}</b></td><td>{a.title}</td><td>{a.place}</td>
              <td>{dayFmt.format(toDate(a.date))}<br /><small>{hhmm(a.time)}</small></td>
              <td>{byId[a.id] ? <span className="chip warn">{byId[a.id]}</span> : <span className="chip">آزاد</span>}</td>
              <td><button className="icon-d" onClick={() => del(a.id)} title="حذف"><Trash2 size={16} /></button></td>
            </tr>))}
          </tbody></table></div>
        {!appts.length && <p className="empty flat">نوبتی ثبت نشده است.</p>}
      </div>
    </>
  )
}

export default function App() {
  const [me, setMe] = useState(null)
  const [appts, setAppts] = useState([])
  const [reserved, setReserved] = useState([])
  const [view, setView] = useState('home')
  const [site, setSite] = useState(false)
  const [q, setQ] = useState('')
  const [auth, setAuth] = useState(false)
  const [loading, setLoading] = useState(true)
  const [toastMsg, setToastMsg] = useState(null)
  const [taken, setTaken] = useState(new Set())

  const toast = useCallback((m, kind = 'ok') => { setToastMsg({ m, kind }); setTimeout(() => setToastMsg(null), 3500) }, [])
  const load = useCallback(async () => {
    try {
      setAppts(await api.list())
      if (session.token) {
        try { const u = await api.me(); setMe(u); setReserved(u.admin ? await api.adminList() : []) }
        catch (e) { if ([401, 403, 404].includes(e.status)) { session.clear(); setMe(null) } }
      }
    } catch (e) { toast(e.message, 'err') } finally { setLoading(false) }
  }, [toast])
  useEffect(() => { load() }, [load])

  const sortBy = (l) => [...l].sort((x, y) => (x.date + x.time).localeCompare(y.date + y.time))
  const myList = useMemo(() => sortBy(me?.appointments || []), [me])
  const mine = useMemo(() => new Set(myList.map((a) => a.id)), [myList])
  const isTaken = (a) => a.reserved === true || taken.has(a.id) || mine.has(a.id)
  const shown = sortBy(appts).filter((a) => !q || [a.doctor, a.title, a.place].some((s) => s.includes(q)))

  const reserve = async (a) => {
    if (!me) return setAuth(true)
    try { await api.reserve(a.id); toast('نوبت شما رزرو شد.'); load() }
    catch (e) { if (e.status === 400) setTaken(new Set(taken).add(a.id)); toast(e.status === 400 ? 'این نوبت قبلاً رزرو شده است.' : e.message, 'err') }
  }
  const cancel = async (a) => {
    try { await api.unreserve(a.id); toast('رزرو لغو شد.'); setTaken((s) => { const n = new Set(s); n.delete(a.id); return n }); load() }
    catch (e) { toast(e.message, 'err') }
  }
  const logout = () => { session.clear(); setMe(null); setReserved([]); setView('home'); setSite(false) }

  const browse = (
    <>
      <div className="search"><Search size={18} /><input placeholder="جستجوی پزشک، تخصص یا مکان…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      {loading ? <p className="empty">در حال بارگذاری…</p> : (
        <div className="list">
          {shown.map((a) => (
            <Ticket key={a.id} a={a} status={isTaken(a) ? 'taken' : ''}>
              {mine.has(a.id) ? <span className="chip">نوبت شما</span> : isTaken(a) ? <span className="chip off">رزرو شده</span>
                : <button className="btn primary" onClick={() => reserve(a)}>رزرو نوبت</button>}
            </Ticket>))}
          {!shown.length && <p className="empty">{q ? 'نتیجه‌ای پیدا نشد.' : 'فعلاً نوبتی ثبت نشده است.'}</p>}
        </div>)}
    </>
  )
  const mineView = (
    <div className="list">
      {myList.map((a) => <Ticket key={a.id} a={a}><button className="btn ghost" onClick={() => cancel(a)}>لغو رزرو</button></Ticket>)}
      {!myList.length && <p className="empty">هنوز نوبتی رزرو نکرده‌اید. به «نوبت‌های آزاد» بروید.</p>}
    </div>
  )

  if (!me || site) return (
    <>
      <header className="top">
        <div className="brand"><HeartPulse size={22} /> <b>درمانگاه مهر</b></div><span style={{ flex: 1 }} />
        {me ? <button className="btn light" onClick={() => setSite(false)}><LayoutDashboard size={16} /> پنل من</button>
          : <button className="btn light" onClick={() => setAuth(true)}>ورود / ثبت‌نام</button>}
      </header>
      <section className="hero">
        <div><h1>نوبت پزشک را در چند ثانیه رزرو کنید</h1><p>تاریخ و ساعت خالی را ببینید، یک بار بزنید، نوبت شما ثبت شد.</p>
          {me ? <button className="btn light big" onClick={() => setSite(false)}>رفتن به پنل من</button>
            : <button className="btn light big" onClick={() => setAuth(true)}>ساخت حساب و رزرو نوبت</button>}</div>
      </section>
      <main>{browse}</main>
      {auth && <AuthPanel toast={toast} onClose={() => setAuth(false)} onDone={() => { setAuth(false); load(); toast('خوش آمدید.') }} />}
      {toastMsg && <div className={'toast ' + toastMsg.kind} role="status">{toastMsg.m}</div>}
    </>
  )

  const nav = [['home', 'داشبورد', LayoutDashboard], ['browse', 'نوبت‌های آزاد', CalendarPlus], ['mine', 'نوبت‌های من', CalendarCheck], ['profile', 'پروفایل', UserCircle]]
  const titles = { home: `سلام ${me.firstname} 👋`, browse: 'نوبت‌های آزاد', mine: 'نوبت‌های من', profile: 'پروفایل من', admin: 'پنل مدیریت' }
  const next = myList[0]
  return (
    <div className="shell">
      <aside className="side">
        <div className="brand"><HeartPulse size={22} /> <b>درمانگاه مهر</b></div>
        <div className="me"><span className="av">{me.firstname?.[0]}</span><div><b>{me.firstname} {me.lastname}</b><small>{me.admin ? 'مدیر سیستم' : 'بیمار'}</small></div></div>
        <nav>
          {nav.map(([k, l, I]) => <button key={k} className={view === k ? 'on' : ''} onClick={() => setView(k)}><I size={18} /> {l}</button>)}
          {me.admin && <><i className="sep" /><button className={view === 'admin' ? 'on' : ''} onClick={() => setView('admin')}><ShieldCheck size={18} /> پنل مدیریت</button></>}
        </nav>
        <button className="out" onClick={() => setSite(true)}><Globe size={18} /> صفحهٔ اصلی سایت</button>
        <button className="out" onClick={logout}><LogOut size={18} /> خروج از حساب</button>
      </aside>
      <section className="content">
        <h1 className="pt">{titles[view]}</h1>
        {view === 'home' && <>
          <div className="stats">
            <Stat icon={<CalendarCheck size={20} />} label="نوبت‌های رزرو شده من" value={myList.length} tone="green" />
            <Stat icon={<Clock size={20} />} label="نوبت‌های آزاد" value={appts.length - (me.admin ? reserved.length : 0)} />
          </div>
          <div className="nextCard">
            {next ? <><small>نوبت بعدی شما</small><b>{next.doctor} — {next.title}</b><span>{dayFmt.format(toDate(next.date))} · ساعت {hhmm(next.time)} · {next.place}</span></>
              : <><small>هنوز نوبتی ندارید</small><b>اولین نوبت خود را رزرو کنید</b><button className="btn light" onClick={() => setView('browse')}>مشاهدهٔ نوبت‌ها</button></>}
          </div>
          {myList.length > 0 && <><h2 className="sec">نوبت‌های پیش رو</h2>{mineView}</>}
        </>}
        {view === 'browse' && browse}
        {view === 'mine' && mineView}
        {view === 'profile' && (
          <div className="card prof">
            <span className="av big">{me.firstname?.[0]}</span>
            <h2>{me.firstname} {me.lastname}</h2>
            <p className="role">{me.admin ? 'مدیر سیستم' : 'بیمار'}</p>
            <ul>
              <li><User size={17} /> <small>نام کاربری</small><b dir="ltr">{me.username}</b></li>
              <li><Mail size={17} /> <small>ایمیل</small><b dir="ltr">{me.email}</b></li>
              <li><Phone size={17} /> <small>شماره تماس</small><b dir="ltr">{me.number}</b></li>
              <li><CalendarCheck size={17} /> <small>نوبت‌های رزرو شده</small><b>{fa(myList.length)}</b></li>
            </ul>
          </div>)}
        {view === 'admin' && me.admin && <Admin appts={appts} reserved={reserved} reload={load} toast={toast} />}
      </section>
      {toastMsg && <div className={'toast ' + toastMsg.kind} role="status">{toastMsg.m}</div>}
    </div>
  )
}
