"use client";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";

type Status = { wordpress:{connected:boolean;site?:string;error?:string}; vercel:{connected:boolean;recentDeployments?:{uid:string;url:string;state:string;createdAt:number}[];error?:string}; productionWritesEnabled:boolean };
const nav = ["Overview","AI Command Center","Website Manager","SEO Intelligence","Performance","Task Queue","Approvals","Integrations","Audit Logs"];
export default function Dashboard() {
  const [message,setMessage]=useState(""); const [answer,setAnswer]=useState(""); const [busy,setBusy]=useState(false);
  const [status,setStatus]=useState<Status|null>(null); const [tasks,setTasks]=useState<{id:string;title:string;status:string;createdAt:string}[]>([]);
  const [tab,setTab]=useState("Overview");
  async function refresh(){
    const [s,t]=await Promise.all([fetch("/api/integrations/status"),fetch("/api/tasks")]);
    if(s.ok)setStatus(await s.json()); if(t.ok)setTasks(await t.json());
  }
  useEffect(()=>{refresh()},[]);
  async function ask(e:React.FormEvent){e.preventDefault();setBusy(true);setAnswer("");try{const r=await fetch("/api/agent",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message})});const d=await r.json();setAnswer(d.answer||d.error||"No response.");refresh()}catch{setAnswer("Request failed. Check server logs.")}finally{setBusy(false)}}
  return <div className="shell">
    <aside className="sidebar"><div className="brand">THE LOGO <span>CRAFT</span></div><div className="subbrand">AI WEBSITE OPERATIONS</div><div className="navlabel">WORKSPACE</div><nav className="nav">{nav.map((n,i)=><a href="#" key={n} className={tab===n?"active":""} onClick={e=>{e.preventDefault();setTab(n)}}><span>{["◫","✳","▣","⌕","◷","≡","◇","⌘","☷"][i]}</span>{n}</a>)}</nav><div className="sidebar-foot">● Read-only mode enabled<br/>Production write actions are disabled.</div></aside>
    <main className="main"><header className="topbar"><div><div className="eyebrow">WORKSPACE / {tab.toUpperCase()}</div><h1 className="h1">{tab==="Overview"?"Website overview":tab}</h1><div className="muted" style={{fontSize:12}}>Monitor, inspect and manage The Logo Craft website.</div></div><div style={{display:"flex",gap:10,alignItems:"center"}}><span className="status">● READ-ONLY</span><button className="pill" onClick={()=>signOut({callbackUrl:"/login"})}>Sign out</button></div></header>
    <div className="notice"><b>Safety lock active.</b> This MVP only reads WordPress and Vercel data. It cannot publish posts, edit pages, deploy code, change DNS, or modify production. Approval records are proposals only; no execution endpoint is implemented.</div>
    <section className="grid">
      <div className="metric"><small>CONNECTED WEBSITE</small><strong style={{fontSize:20}}>The Logo Craft</strong><em>thelogocraft.com</em></div>
      <div className="metric"><small>WORDPRESS API</small><strong>{status?status.wordpress.connected?"Connected":"Offline":"—"}</strong><em>{status?.wordpress.connected?"Read access":"Awaiting configuration"}</em></div>
      <div className="metric"><small>VERCEL API</small><strong>{status?status.vercel.connected?"Connected":"Offline":"—"}</strong><em>{status?.vercel.connected?"Deployment read access":"Awaiting configuration"}</em></div>
      <div className="metric"><small>PRODUCTION WRITES</small><strong className="good">Disabled</strong><em>Locked by architecture</em></div>
    </section>
    <section className="section two">
      <div className="panel"><div className="sectionhead"><h2>AI Command Center</h2><span className="pill">READ-ONLY TOOLS</span></div><p className="muted" style={{fontSize:12}}>Ask the agent to inspect connected WordPress content or recent Vercel deployments.</p><form className="command" onSubmit={ask}><input value={message} onChange={e=>setMessage(e.target.value)} placeholder="e.g. List the latest published blog posts…" minLength={3} maxLength={2000} required/><button className="btn" disabled={busy}>{busy?"Working…":"Run agent"}</button></form>{answer&&<div className="answer">{answer}</div>}</div>
      <div className="panel"><h2 className="panel-title">Integration health</h2><div className="rowitem"><span>WordPress REST API</span><span className={status?.wordpress.connected?"good":"warn"}>{status?.wordpress.connected?"Connected":"Not configured"}</span></div><div className="rowitem"><span>Vercel deployments</span><span className={status?.vercel.connected?"good":"warn"}>{status?.vercel.connected?"Connected":"Not configured"}</span></div><div className="rowitem"><span>OpenAI agent</span><span className="pill">Check API key</span></div><button className="pill" style={{marginTop:14,cursor:"pointer"}} onClick={refresh}>Refresh connections ↻</button></div>
    </section>
    <section className="section two">
      <div className="panel"><div className="sectionhead"><h2>Recent agent activity</h2><span className="pill">{tasks.length} records</span></div>{tasks.length?tasks.slice(0,7).map(t=><div className="rowitem" key={t.id}><span>{t.title}</span><span className="pill">{t.status}</span></div>):<p className="muted" style={{fontSize:12}}>No agent tasks yet. Run a read-only command to create the first activity record.</p>}</div>
      <div className="panel"><h2 className="panel-title">Recent Vercel deployments</h2>{status?.vercel.recentDeployments?.length?status.vercel.recentDeployments.slice(0,5).map(d=><div className="rowitem" key={d.uid}><span>{d.url}</span><span className="pill">{d.state}</span></div>):<p className="muted" style={{fontSize:12}}>{status?.vercel.error||"Deployment information will appear after Vercel is configured."}</p>}</div>
    </section>
    <section className="section panel"><h2 className="panel-title">Initial implementation status</h2><div className="rowitem"><span>Next.js dashboard and protected routes</span><span className="good">Included</span></div><div className="rowitem"><span>PostgreSQL schema and seed</span><span className="good">Included</span></div><div className="rowitem"><span>WordPress read-only REST client</span><span className="good">Included</span></div><div className="rowitem"><span>Vercel read-only deployments client</span><span className="good">Included</span></div><div className="rowitem"><span>AI tool-calling agent (read-only)</span><span className="good">Included</span></div><div className="rowitem"><span>Production write execution</span><span className="warn">Intentionally not implemented</span></div></section>
    <footer className="muted" style={{fontSize:11,marginTop:22}}>The Logo Craft AI Manager · MVP scaffold · Do not expose .env values or API tokens in client code.</footer>
    </main></div>;
}
