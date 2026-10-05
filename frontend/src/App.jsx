import { useEffect, useState } from 'react'
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Check,
  Clipboard,
  ExternalLink,
  Link2,
  LoaderCircle,
  Search,
  Sparkles,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import './App.css'

const SHORT_LINK_ORIGIN = import.meta.env.VITE_SHORT_LINK_ORIGIN || 'http://127.0.0.1:8000'

async function readJson(response) {
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.detail || 'The request could not be completed.')
  }
  return data
}

async function loadLinkStats(shortCode, days = null) {
  const url = new URL(`/api/stats/${encodeURIComponent(shortCode)}`, window.location.origin)
  if (days !== null) {
    url.searchParams.set('days', String(days))
  }

  const response = await fetch(url)
  return readJson(response)
}

async function loadRecentLinks() {
  const response = await fetch('/api/links/recent')
  return readJson(response)
}

function formatDay(date) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(
    new Date(`${date}T12:00:00`),
  )
}

function App() {
  const [initialCode] = useState(
    () => new URLSearchParams(window.location.search).get('code') || '',
  )
  const [apiStatus, setApiStatus] = useState('checking')
  const [originalUrl, setOriginalUrl] = useState('')
  const [shortCode, setShortCode] = useState(initialCode)
  const [stats, setStats] = useState(null)
  const [recentLinks, setRecentLinks] = useState([])
  const [range, setRange] = useState('all')
  const [createBusy, setCreateBusy] = useState(false)
  const [statsBusy, setStatsBusy] = useState(false)
  const [notice, setNotice] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let active = true
    fetch('/api/openapi.json')
      .then((response) => {
        if (!response.ok) throw new Error('API unavailable')
        if (active) setApiStatus('online')
      })
      .catch(() => {
        if (active) setApiStatus('offline')
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true
    loadRecentLinks()
      .then((data) => {
        if (active) setRecentLinks(data)
      })
      .catch(() => {
        if (active) setRecentLinks([])
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!initialCode) return undefined

    let active = true
    setStatsBusy(true)
    loadLinkStats(initialCode)
      .then((data) => {
        if (active) {
          setStats(data)
          setNotice(null)
        }
      })
      .catch((error) => {
        if (active) {
          setStats(null)
          setNotice({ type: 'error', text: error.message })
        }
      })
      .finally(() => {
        if (active) setStatsBusy(false)
      })

    return () => {
      active = false
    }
  }, [initialCode])

  async function refreshStats(code = shortCode, nextRange = range) {
    const normalizedCode = code.trim()
    if (!normalizedCode) {
      setNotice({ type: 'error', text: 'Enter a short code to view its analytics.' })
      return
    }

    setStatsBusy(true)
    setNotice(null)
    try {
      const days = nextRange === 'all' ? null : Number(nextRange)
      const data = await loadLinkStats(normalizedCode, days)
      setShortCode(normalizedCode)
      setStats(data)
    } catch (error) {
      setStats(null)
      setNotice({ type: 'error', text: error.message })
    } finally {
      setStatsBusy(false)
    }
  }

  async function handleCreate(event) {
    event.preventDefault()
    setCreateBusy(true)
    setNotice(null)

    try {
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ original_url: originalUrl.trim() }),
      })
      const created = await readJson(response)
      setOriginalUrl('')
      setShortCode(created.short_code)
      await refreshStats(created.short_code, range)
      const refreshedRecent = await loadRecentLinks()
      setRecentLinks(refreshedRecent)
      setNotice({ type: 'success', text: 'Short link created.' })
    } catch (error) {
      setNotice({ type: 'error', text: error.message })
    } finally {
      setCreateBusy(false)
    }
  }

  async function copyShortLink() {
    if (!stats) return
    try {
      await navigator.clipboard.writeText(`${SHORT_LINK_ORIGIN}/${stats.short_code}`)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setNotice({ type: 'error', text: 'Clipboard access is unavailable in this browser.' })
    }
  }

  const chartData = stats
    ? [...stats.clicks_per_day].reverse().map((day) => ({
        date: formatDay(day.date),
        fullDate: day.date,
        clicks: day.clicks,
      }))
    : []
  const peakDay = chartData.reduce((peak, day) => Math.max(peak, day.clicks), 0)
  const shortLink = stats ? `${SHORT_LINK_ORIGIN}/${stats.short_code}` : ''

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Shortform home">
          <span className="brand-mark"><Link2 size={19} strokeWidth={2.4} /></span>
          <span>shortform<span className="brand-period">.</span></span>
        </a>
        <div className="topbar-meta">
          <span className={`service-dot is-${apiStatus}`} />
          <span>{apiStatus === 'checking' ? 'Checking API' : apiStatus === 'online' ? 'API connected' : 'API unavailable'}</span>
        </div>
      </header>

      <main className="dashboard">
        <section className="page-heading">
          <div>
            <p className="eyebrow"><span>WORKSPACE</span><span className="eyebrow-slash">/</span> OVERVIEW</p>
            <h1>Link analytics</h1>
          </div>
          <div className="today-stamp">
            <span className="today-label">TODAY</span>
            <span>{new Intl.DateTimeFormat('en', { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date())}</span>
          </div>
        </section>

        <div className="workspace-grid">
          <aside className="create-panel">
            <div className="panel-heading">
              <div className="panel-icon"><Sparkles size={17} /></div>
              <div>
                <p className="section-kicker">NEW LINK</p>
                <h2>Shorten a URL</h2>
              </div>
            </div>
            <form className="create-form" onSubmit={handleCreate}>
              <label htmlFor="original-url">Destination URL</label>
              <div className="input-wrap url-input-wrap">
                <ExternalLink size={16} aria-hidden="true" />
                <input
                  id="original-url"
                  type="url"
                  placeholder="https://example.com/page"
                  value={originalUrl}
                  onChange={(event) => setOriginalUrl(event.target.value)}
                  required
                />
              </div>
              <button className="primary-button" type="submit" disabled={createBusy}>
                {createBusy ? <LoaderCircle className="spin" size={17} /> : <Link2 size={17} />}
                <span>{createBusy ? 'Creating link' : 'Create short link'}</span>
                {!createBusy && <ArrowUpRight className="button-tail" size={16} />}
              </button>
            </form>
            <div className="panel-footnote">
              <span className="footnote-line" />
              <span>Each link gets its own click report.</span>
            </div>

            <div className="recent-links-panel">
              <div className="recent-links-header">
                <span className="section-kicker">RECENT LINKS</span>
                <button
                  type="button"
                  className="mini-link-button"
                  onClick={async () => {
                    try {
                      setRecentLinks(await loadRecentLinks())
                    } catch {
                      setRecentLinks([])
                    }
                  }}
                >
                  Refresh
                </button>
              </div>

              {recentLinks.length ? (
                <ul className="recent-links-list">
                  {recentLinks.map((link) => (
                    <li key={link.short_code} className="recent-link-item">
                      <button
                        type="button"
                        className="recent-link-button"
                        onClick={() => {
                          setShortCode(link.short_code)
                          refreshStats(link.short_code, range)
                        }}
                      >
                        <span className="recent-link-code">/{link.short_code}</span>
                        <span className="recent-link-url">{link.original_url}</span>
                        <span className="recent-link-meta">{link.total_clicks} clicks</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="recent-links-empty">No recent links yet.</div>
              )}
            </div>
          </aside>

          <section className="analytics-section" aria-labelledby="analytics-title">
            <div className="analytics-heading">
              <div>
                <p className="section-kicker">PERFORMANCE</p>
                <h2 id="analytics-title">Click activity</h2>
              </div>
              <form
                className="lookup-form"
                onSubmit={(event) => {
                  event.preventDefault()
                  refreshStats()
                }}
              >
                <label className="visually-hidden" htmlFor="short-code">Short code</label>
                <div className="input-wrap code-input-wrap">
                  <span className="code-prefix">/</span>
                  <input
                    id="short-code"
                    value={shortCode}
                    onChange={(event) => setShortCode(event.target.value)}
                    placeholder="short code"
                    autoComplete="off"
                  />
                </div>
                <button className="lookup-button" type="submit" disabled={statsBusy} aria-label="Load analytics">
                  {statsBusy ? <LoaderCircle className="spin" size={17} /> : <Search size={17} />}
                </button>
              </form>
            </div>

            {notice && (
              <div className={`notice notice-${notice.type}`} role={notice.type === 'error' ? 'alert' : 'status'}>
                {notice.type === 'success' ? <Check size={16} /> : <Activity size={16} />}
                <span>{notice.text}</span>
              </div>
            )}

            {stats ? (
              <div className="results" key={`${stats.short_code}-${range}`}>
                <div className="summary-row">
                  <div className="click-total">
                    <div className="metric-label"><span className="metric-dot" /> {range === 'all' ? 'TOTAL CLICKS' : `LAST ${range.toUpperCase()} DAYS`}</div>
                    <div className="metric-value">{stats.total_clicks.toLocaleString()}</div>
                    <div className="metric-caption">
                      {stats.total_clicks === 1 ? 'one recorded visit' : `${range === 'all' ? 'all recorded' : 'records in this window'} visits`}
                    </div>
                  </div>
                  <div className="link-detail">
                    <span className="detail-label">SHORT LINK</span>
                    <div className="short-link-line">
                      <a href={shortLink} target="_blank" rel="noreferrer">{shortLink.replace(/^https?:\/\//, '')}</a>
                      <button className="icon-button" onClick={copyShortLink} title="Copy short link" aria-label="Copy short link">
                        {copied ? <Check size={16} /> : <Clipboard size={16} />}
                      </button>
                    </div>
                    <span className="detail-label destination-label">DESTINATION</span>
                    <a className="destination-link" href={stats.original_url} target="_blank" rel="noreferrer">
                      {stats.original_url}<ExternalLink size={13} />
                    </a>
                  </div>
                </div>

                <div className="chart-panel">
                  <div className="chart-heading">
                    <div>
                      <h3>Clicks by day</h3>
                      <p>{chartData.length ? `${chartData.length} ${chartData.length === 1 ? 'day' : 'days'} with activity` : 'No click activity yet'}</p>
                    </div>
                    <div className="range-switcher" aria-label="Range selector">
                      {['7', '30', 'all'].map((option) => (
                        <button
                          key={option}
                          type="button"
                          className={range === option ? 'range-button active' : 'range-button'}
                          onClick={() => {
                            setRange(option)
                            refreshStats(shortCode, option)
                          }}
                        >
                          {option === 'all' ? 'All' : `${option}D`}
                        </button>
                      ))}
                    </div>
                    {peakDay > 0 && (
                      <div className="peak-label"><ArrowDownRight size={15} /> PEAK <strong>{peakDay}</strong></div>
                    )}
                  </div>
                  {chartData.length ? (
                    <div className="chart-wrap" role="img" aria-label="Bar chart of clicks by day">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 6, left: -20, bottom: 0 }}>
                          <CartesianGrid vertical={false} stroke="#e7ece8" strokeDasharray="3 5" />
                          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#84908b', fontSize: 11 }} dy={11} />
                          <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#84908b', fontSize: 11 }} dx={-5} />
                          <Tooltip
                            cursor={{ fill: '#f1f5eb' }}
                            contentStyle={{ border: '1px solid #dfe6df', borderRadius: 6, boxShadow: '0 8px 25px #17231a12' }}
                            labelFormatter={(_, payload) => payload?.[0]?.payload?.fullDate || ''}
                            formatter={(value) => [value, 'Clicks']}
                          />
                          <Bar dataKey="clicks" fill="#b9e34a" radius={[4, 4, 0, 0]} maxBarSize={42} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="chart-empty">
                      <div className="empty-mark"><Activity size={20} /></div>
                      <span>Activity will appear here</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className={`analytics-empty${statsBusy ? ' is-loading' : ''}`}>
                <div className="empty-orbit"><Activity size={24} /></div>
                <h3>{statsBusy ? 'Loading report' : 'Choose a link to inspect'}</h3>
                <p>{statsBusy ? 'Fetching the latest click data.' : 'Enter a short code above or create a new link.'}</p>
                {statsBusy && <LoaderCircle className="empty-loader spin" size={17} />}
              </div>
            )}
          </section>
        </div>

        <footer className="page-footer">
          <span><span className="footer-mark">S</span> SHORTFORM ANALYTICS</span>
          <span>POSTGRESQL <i /> REDIS <i /> FASTAPI</span>
        </footer>
      </main>
    </div>
  )
}

export default App