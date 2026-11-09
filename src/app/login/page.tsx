"use client";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const [email,setEmail]=useState(""); const [password,setPassword]=useState("");
  const [error,setError]=useState(""); const [busy,setBusy]=useState(false);
  async function submit(e:FormEvent) {
    e.preventDefault(); setBusy(true); setError("");
    const { signIn } = await import("next-auth/react");
    const result = await signIn("credentials",{email,password,redirect:false});
    setBusy(false);
    if(result?.error) setError("Login failed. Check your configured admin credentials.");
    else window.location.href="/";
  }
  return <main className="login panel"><div className="brand">THE LOGO <span>CRAFT</span></div><p className="muted">AI Website Manager · Secure sign in</p><form onSubmit={submit}><input type="email" placeholder="Admin email" value={email} onChange={e=>setEmail(e.target.value)} required/><input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required/><button className="btn" style={{width:"100%",padding:13}} disabled={busy}>{busy?"Signing in…":"Sign in"}</button>{error&&<p className="error">{error}</p>}</form></main>;
}
