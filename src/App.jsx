import { useState, useEffect, useCallback } from "react";

const SUPABASE_URL = "https://dfhkdyypyqxbqitwuphx.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmaGtkeXlweXF4YnFpdHd1cGh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0NzMyMDgsImV4cCI6MjA5NTA0OTIwOH0.Gzm35ojyujuj5h3g-TJFakcKsqWuDoDkI4Mpxq3ifQA";
const BRANCHES = ["Campinas", "Vila Nova SP", "Matriz Brasília"];

const db = async (path, opts = {}) => {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: opts.prefer || "return=representation",
    },
    ...opts,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : [];
};

const inputStyle = {
  width: "100%", padding: "10px 14px", background: "#0f0a0a",
  border: "1px solid #2a1a1a", borderRadius: 8, color: "#d0c0b0",
  fontSize: 13, outline: "none", boxSizing: "border-box",
};
const labelStyle = {
  display: "block", fontSize: 11, color: "#7a6a5a",
  letterSpacing: 1, marginBottom: 6,
};

export default function App() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("dashboard");
  const [wines, setWines] = useState([]);
  const [stock, setStock] = useState({});
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [movForm, setMovForm] = useState({ type: "Saída", wineId: "", qty: 1, toBranch: BRANCHES[1], obs: "" });
  const [filterBranch, setFilterBranch] = useState("Todas");
  const [filterType, setFilterType] = useState("Todos");
  const [searchWine, setSearchWine] = useState("");
  const [showAddWine, setShowAddWine] = useState(false);
  const [addWineForm, setAddWineForm] = useState({ name: "", type: "Tinto", region: "", year: new Date().getFullYear(), price: "" });
  const [showChangePass, setShowChangePass] = useState(false);
  const [passForm, setPassForm] = useState({ current: "", next: "", confirm: "" });

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [wineData, stockData, movData] = await Promise.all([
        db("wines?active=eq.true&order=name.asc"),
        db("stock?select=*"),
        user.role === "admin"
          ? db("movements?order=created_at.desc&limit=200")
          : db(`movements?branch=eq.${encodeURIComponent(user.branch)}&order=created_at.desc&limit=100`),
      ]);
      setWines(wineData);
      const stockMap = {};
      BRANCHES.forEach(b => { stockMap[b] = {}; });
      stockData.forEach(s => {
        if (stockMap[s.branch]) stockMap[s.branch][s.wine_id] = s.quantity;
      });
      setStock(stockMap);
      setMovements(movData);
    } catch (e) {
      showToast("Erro ao carregar dados: " + e.message, false);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleLogin = async () => {
    setLoginError("");
    try {
      const data = await db(`profiles?username=eq.${loginForm.username}&password=eq.${loginForm.password}`);
      if (data.length === 0) { setLoginError("Usuário ou senha incorretos."); return; }
      setUser(data[0]);
      setTab("dashboard");
    } catch (e) {
      setLoginError("Erro ao conectar. Tente novamente.");
    }
  };

  const handleChangePass = async () => {
    if (!passForm.current || !passForm.next || !passForm.confirm) { showToast("Preencha todos os campos.", false); return; }
    if (passForm.current !== user.password) { showToast("Senha atual incorreta.", false); return; }
    if (passForm.next !== passForm.confirm) { showToast("Novas senhas não coincidem.", false); return; }
    if (passForm.next.length < 4) { showToast("Senha muito curta (mín. 4 caracteres).", false); return; }
    try {
      await db(`profiles?id=eq.${user.id}`, { method: "PATCH", body: JSON.stringify({ password: passForm.next }) });
      setUser(u => ({ ...u, password: passForm.next }));
      setPassForm({ current: "", next: "", confirm: "" });
      setShowChangePass(false);
      showToast("Senha alterada com sucesso!");
    } catch (e) { showToast("Erro ao alterar senha.", false); }
  };

  const upsertStock = async (wineId, branch, delta) => {
    const current = stock[branch]?.[wineId] || 0;
    const newQty = current + delta;
    await db("stock", {
      method: "POST",
      prefer: "resolution=merge-duplicates,return=representation",
      body: JSON.stringify({ wine_id: wineId, branch, quantity: newQty }),
    });
  };

  const handleMovement = async () => {
    const { type, wineId, qty, toBranch, obs } = movForm;
    if (!wineId) { showToast("Selecione um vinho.", false); return; }
    const qtyN = parseInt(qty);
    if (isNaN(qtyN) || qtyN < 1) { showToast("Quantidade inválida.", false); return; }
    const wine = wines.find(w => w.id === wineId);
    const branch = user.role === "admin" ? movForm.branch || BRANCHES[0] : user.branch;

    if (type === "Saída" && (stock[branch]?.[wineId] || 0) < qtyN) {
      showToast("Estoque insuficiente.", false); return;
    }
    if (type === "Transferência") {
      if (branch === toBranch) { showToast("Filiais devem ser diferentes.", false); return; }
      if ((stock[branch]?.[wineId] || 0) < qtyN) { showToast("Estoque insuficiente para transferência.", false); return; }
    }

    setLoading(true);
    try {
      if (type === "Entrada") await upsertStock(wineId, branch, qtyN);
      else if (type === "Saída") await upsertStock(wineId, branch, -qtyN);
      else if (type === "Transferência") {
        await upsertStock(wineId, branch, -qtyN);
        await upsertStock(wineId, toBranch, qtyN);
      }

      await db("movements", {
        method: "POST",
        body: JSON.stringify({
          wine_id: wineId, wine_name: wine.name, branch,
          to_branch: type === "Transferência" ? toBranch : null,
          type, quantity: qtyN, user_name: user.username, obs: obs || null,
        }),
      });

      showToast(`${type} registrada com sucesso!`);
      setMovForm(f => ({ ...f, wineId: "", qty: 1, obs: "" }));
      await loadData();
    } catch (e) { showToast("Erro: " + e.message, false); }
    setLoading(false);
  };

  const handleAddWine = async () => {
    if (!addWineForm.name.trim()) { showToast("Nome obrigatório.", false); return; }
    setLoading(true);
    try {
      const [newWine] = await db("wines", {
        method: "POST",
        body: JSON.stringify({
          name: addWineForm.name.trim(), type: addWineForm.type,
          region: addWineForm.region, year: parseInt(addWineForm.year),
          price: parseFloat(addWineForm.price) || 0,
        }),
      });
      for (const branch of BRANCHES) {
        await db("stock", {
          method: "POST",
          body: JSON.stringify({ wine_id: newWine.id, branch, quantity: 0 }),
        });
      }
      setAddWineForm({ name: "", type: "Tinto", region: "", year: new Date().getFullYear(), price: "" });
      setShowAddWine(false);
      showToast("Rótulo cadastrado!");
      await loadData();
    } catch (e) { showToast("Erro: " + e.message, false); }
    setLoading(false);
  };

  const totalStock = (b) => Object.values(stock[b] || {}).reduce((a, v) => a + v, 0);
  const lowStock = (b) => Object.entries(stock[b] || {}).filter(([, q]) => q <= 3).length;
  const typeColor = { Entrada: "#4ade80", Saída: "#f87171", Transferência: "#60a5fa" };
  const typeIcon = { Entrada: "↓", Saída: "↑", Transferência: "⇄" };
  const fmtDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString("pt-BR") + " " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };

  const visibleBranches = user?.role === "admin" ? BRANCHES : [user?.branch];
  const filteredMovements = movements.filter(m => {
    const matchBranch = filterBranch === "Todas" || m.branch === filterBranch || m.to_branch === filterBranch;
    const matchType = filterType === "Todos" || m.type === filterType;
    const matchWine = !searchWine || m.wine_name?.toLowerCase().includes(searchWine.toLowerCase());
    return matchBranch && matchType && matchWine;
  });

  // LOGIN SCREEN
  if (!user) {
    return (
      <div style={{ minHeight: "100vh", background: "#0f0a0a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Georgia', serif" }}>
        <div style={{ width: 360, background: "#1a0f0f", border: "1px solid #2a1a1a", borderRadius: 16, padding: 40 }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🍷</div>
            <div style={{ fontFamily: "'Times New Roman', serif", fontSize: 22, letterSpacing: 3, color: "#c9a96e" }}>VINHOS DO MUNDO</div>
            <div style={{ fontSize: 11, color: "#5a4a3a", letterSpacing: 2, marginTop: 4 }}>CONTROLE DE ESTOQUE</div>
          </div>
          <div style={{ display: "grid", gap: 14 }}>
            <div>
              <label style={labelStyle}>USUÁRIO</label>
              <input value={loginForm.username} onChange={e => setLoginForm(f => ({ ...f, username: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                placeholder="seu_usuario" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>SENHA</label>
              <input type="password" value={loginForm.password} onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                placeholder="••••••" style={inputStyle} />
            </div>
            {loginError && <div style={{ color: "#f87171", fontSize: 12, textAlign: "center" }}>{loginError}</div>}
            <button onClick={handleLogin} style={{
              padding: 14, background: "#2a1a0a", border: "1px solid #c9a96e",
              color: "#c9a96e", borderRadius: 10, cursor: "pointer", fontSize: 14, letterSpacing: 2,
            }}>ENTRAR</button>
          </div>

        </div>
      </div>
    );
  }

  const isAdmin = user.role === "admin";
  const navItems = isAdmin
    ? [["dashboard", "📊 Dashboard"], ["stock", "📦 Estoque"], ["movement", "🔄 Movimentação"], ["history", "📋 Histórico"], ["users", "👥 Usuários"]]
    : [["stock", "📦 Estoque"], ["movement", "🔄 Movimentação"], ["history", "📋 Histórico"]];

  return (
    <div style={{ fontFamily: "'Georgia', serif", minHeight: "100vh", background: "#0f0a0a", color: "#e8ddd0" }}>
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 9999,
          background: toast.ok ? "#1a3a1a" : "#3a1a1a",
          border: `1px solid ${toast.ok ? "#4ade80" : "#f87171"}`,
          color: toast.ok ? "#4ade80" : "#f87171",
          padding: "12px 20px", borderRadius: 8, fontSize: 14,
          boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
        }}>{toast.msg}</div>
      )}

      {/* Header */}
      <div style={{ background: "#1a0f0f", borderBottom: "1px solid #3a1f1f", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 26 }}>🍷</span>
          <div>
            <div style={{ fontFamily: "'Times New Roman', serif", fontSize: 18, letterSpacing: 2, color: "#c9a96e" }}>VINHOS DO MUNDO</div>
            <div style={{ fontSize: 10, color: "#7a6a5a", letterSpacing: 1 }}>CONTROLE DE ESTOQUE</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, color: "#c9a96e" }}>{user.username}</div>
            <div style={{ fontSize: 10, color: "#5a4a3a" }}>{isAdmin ? "Administrador" : user.branch}</div>
          </div>
          <button onClick={() => setShowChangePass(!showChangePass)} style={{ padding: "5px 10px", background: "transparent", border: "1px solid #3a2a1a", color: "#7a6a5a", borderRadius: 6, cursor: "pointer", fontSize: 11 }}>🔑</button>
          <button onClick={() => setUser(null)} style={{ padding: "5px 10px", background: "transparent", border: "1px solid #3a2a1a", color: "#7a6a5a", borderRadius: 6, cursor: "pointer", fontSize: 11 }}>Sair</button>
        </div>
      </div>

      {/* Change password panel */}
      {showChangePass && (
        <div style={{ background: "#150c0c", borderBottom: "1px solid #2a1a1a", padding: "16px 24px" }}>
          <div style={{ maxWidth: 500, display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>SENHA ATUAL</label>
              <input type="password" value={passForm.current} onChange={e => setPassForm(f => ({ ...f, current: e.target.value }))} style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>NOVA SENHA</label>
              <input type="password" value={passForm.next} onChange={e => setPassForm(f => ({ ...f, next: e.target.value }))} style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>CONFIRMAR</label>
              <input type="password" value={passForm.confirm} onChange={e => setPassForm(f => ({ ...f, confirm: e.target.value }))} style={inputStyle} />
            </div>
            <button onClick={handleChangePass} style={{ padding: "10px 16px", background: "#2a1a0a", border: "1px solid #c9a96e", color: "#c9a96e", borderRadius: 8, cursor: "pointer", fontSize: 12 }}>Alterar</button>
          </div>
        </div>
      )}

      {/* Nav */}
      <div style={{ display: "flex", background: "#150c0c", borderBottom: "1px solid #2a1a1a", padding: "0 24px" }}>
        {navItems.map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            padding: "13px 18px", background: "none", border: "none",
            borderBottom: tab === key ? "2px solid #c9a96e" : "2px solid transparent",
            color: tab === key ? "#c9a96e" : "#7a6a5a",
            cursor: "pointer", fontSize: 12, letterSpacing: 1,
          }}>{label}</button>
        ))}
        {loading && <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", color: "#5a4a3a", fontSize: 12 }}>carregando...</div>}
      </div>

      <div style={{ padding: "24px", maxWidth: 1100, margin: "0 auto" }}>

        {/* DASHBOARD (admin only) */}
        {tab === "dashboard" && isAdmin && (
          <div>
            <div style={{ fontSize: 11, color: "#7a6a5a", letterSpacing: 2, marginBottom: 20 }}>VISÃO GERAL — TODAS AS FILIAIS</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
              {BRANCHES.map(b => (
                <div key={b} style={{ background: "#1a0f0f", border: "1px solid #2a1a1a", borderRadius: 12, padding: 20 }}>
                  <div style={{ fontSize: 11, color: "#7a6a5a", marginBottom: 8, letterSpacing: 1 }}>{b.toUpperCase()}</div>
                  <div style={{ fontSize: 36, fontWeight: "bold", color: "#c9a96e" }}>{totalStock(b)}</div>
                  <div style={{ fontSize: 12, color: "#5a4a3a" }}>garrafas em estoque</div>
                  {lowStock(b) > 0 && (
                    <div style={{ marginTop: 10, padding: "4px 10px", background: "#2a1010", border: "1px solid #5a1a1a", borderRadius: 20, display: "inline-block", fontSize: 11, color: "#f87171" }}>
                      ⚠ {lowStock(b)} rótulo(s) crítico(s)
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
              <div style={{ background: "#1a0f0f", border: "1px solid #2a1a1a", borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 11, color: "#7a6a5a", letterSpacing: 2, marginBottom: 16 }}>ÚLTIMAS MOVIMENTAÇÕES</div>
                {movements.slice(0, 8).map(m => (
                  <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #1f1515" }}>
                    <span style={{ width: 28, height: 28, borderRadius: "50%", background: "#0f0a0a", border: `1px solid ${typeColor[m.type]}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: typeColor[m.type], flexShrink: 0 }}>{typeIcon[m.type]}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: "#d0c0b0" }}>{m.wine_name}</div>
                      <div style={{ fontSize: 11, color: "#5a4a3a" }}>{m.branch}{m.to_branch ? ` → ${m.to_branch}` : ""} · {m.user_name}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 13, color: typeColor[m.type] }}>{m.type === "Saída" ? "-" : "+"}{m.quantity}</div>
                      <div style={{ fontSize: 10, color: "#4a3a2a" }}>{fmtDate(m.created_at)}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ background: "#1a0f0f", border: "1px solid #2a1a1a", borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 11, color: "#7a6a5a", letterSpacing: 2, marginBottom: 8 }}>TOTAL GERAL</div>
                <div style={{ fontSize: 48, color: "#c9a96e", fontWeight: "bold", textAlign: "center" }}>
                  {BRANCHES.reduce((acc, b) => acc + totalStock(b), 0)}
                </div>
                <div style={{ fontSize: 12, color: "#5a4a3a", textAlign: "center", marginBottom: 20 }}>garrafas · todas as filiais</div>
                <div style={{ fontSize: 11, color: "#7a6a5a", letterSpacing: 2, marginBottom: 12 }}>ALERTAS DE ESTOQUE</div>
                {BRANCHES.flatMap(b =>
                  Object.entries(stock[b] || {}).filter(([, q]) => q <= 3).map(([wid, q]) => {
                    const w = wines.find(x => x.id === wid);
                    return w ? { wine: w.name, branch: b, qty: q } : null;
                  }).filter(Boolean)
                ).slice(0, 6).map((a, i) => (
                  <div key={i} style={{ padding: "7px 0", borderBottom: "1px solid #1f1515", fontSize: 12 }}>
                    <div style={{ color: "#e8c060" }}>{a.wine}</div>
                    <div style={{ color: "#5a4a3a" }}>{a.branch} · <span style={{ color: "#f87171" }}>{a.qty} garrafa{a.qty !== 1 ? "s" : ""}</span></div>
                  </div>
                ))}
                {BRANCHES.every(b => lowStock(b) === 0) && wines.length > 0 && (
                  <div style={{ color: "#4ade80", fontSize: 13, textAlign: "center", marginTop: 16 }}>✓ Estoque saudável</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STOCK */}
        {tab === "stock" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 11, color: "#7a6a5a", letterSpacing: 2 }}>ESTOQUE{!isAdmin ? ` — ${user.branch.toUpperCase()}` : " — TODAS AS FILIAIS"}</div>
                <div style={{ fontSize: 13, color: "#c9a96e", marginTop: 4 }}>{wines.length} rótulos cadastrados</div>
              </div>
              {isAdmin && (
                <button onClick={() => setShowAddWine(!showAddWine)} style={{ padding: "8px 18px", background: "#2a1a0a", border: "1px solid #c9a96e", color: "#c9a96e", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>+ Novo Rótulo</button>
              )}
            </div>

            {showAddWine && isAdmin && (
              <div style={{ background: "#1a0f0f", border: "1px solid #3a2a1a", borderRadius: 12, padding: 20, marginBottom: 20 }}>
                <div style={{ fontSize: 11, color: "#7a6a5a", letterSpacing: 2, marginBottom: 16 }}>CADASTRAR RÓTULO</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                  <input placeholder="Nome do vinho *" value={addWineForm.name} onChange={e => setAddWineForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} />
                  <select value={addWineForm.type} onChange={e => setAddWineForm(f => ({ ...f, type: e.target.value }))} style={inputStyle}>
                    {["Tinto", "Branco", "Rosé", "Espumante", "Sobremesa"].map(t => <option key={t}>{t}</option>)}
                  </select>
                  <input placeholder="Região" value={addWineForm.region} onChange={e => setAddWineForm(f => ({ ...f, region: e.target.value }))} style={inputStyle} />
                  <input type="number" placeholder="Safra" value={addWineForm.year} onChange={e => setAddWineForm(f => ({ ...f, year: e.target.value }))} style={inputStyle} />
                  <input type="number" placeholder="Preço (R$)" value={addWineForm.price} onChange={e => setAddWineForm(f => ({ ...f, price: e.target.value }))} style={inputStyle} />
                  <button onClick={handleAddWine} style={{ ...inputStyle, background: "#2a1a0a", border: "1px solid #c9a96e", color: "#c9a96e", cursor: "pointer" }}>Cadastrar</button>
                </div>
              </div>
            )}

            <div style={{ background: "#1a0f0f", border: "1px solid #2a1a1a", borderRadius: 12, overflow: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
                <thead>
                  <tr style={{ background: "#150c0c" }}>
                    {["Rótulo", "Tipo", "Região", "Safra", "Preço", ...(isAdmin ? BRANCHES.map(b => b.replace("Filial ", "")) : ["Estoque"]), ...(isAdmin ? ["Total"] : [])].map(h => (
                      <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, color: "#7a6a5a", letterSpacing: 1, fontWeight: "normal", whiteSpace: "nowrap" }}>{h.toUpperCase()}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {wines.map((wine, i) => {
                    const branchQtys = isAdmin ? BRANCHES.map(b => stock[b]?.[wine.id] || 0) : [(stock[user.branch]?.[wine.id] || 0)];
                    const total = isAdmin ? branchQtys.reduce((a, b) => a + b, 0) : null;
                    return (
                      <tr key={wine.id} style={{ borderTop: "1px solid #1f1515", background: i % 2 === 0 ? "transparent" : "#160d0d" }}>
                        <td style={{ padding: "11px 16px", fontSize: 13, color: "#d0c0b0" }}>{wine.name}</td>
                        <td style={{ padding: "11px 16px" }}>
                          <span style={{ padding: "2px 8px", borderRadius: 20, background: "#0f0a0a", border: "1px solid #3a2a1a", color: "#a08060", fontSize: 11 }}>{wine.type}</span>
                        </td>
                        <td style={{ padding: "11px 16px", fontSize: 12, color: "#7a6a5a" }}>{wine.region}</td>
                        <td style={{ padding: "11px 16px", fontSize: 12, color: "#7a6a5a" }}>{wine.year}</td>
                        <td style={{ padding: "11px 16px", fontSize: 12, color: "#c9a96e" }}>R$ {(wine.price || 0).toFixed(2)}</td>
                        {branchQtys.map((qty, idx) => (
                          <td key={idx} style={{ padding: "11px 16px", fontSize: 15, fontWeight: "bold", color: qty <= 3 ? "#f87171" : qty <= 6 ? "#fbbf24" : "#4ade80" }}>{qty}</td>
                        ))}
                        {isAdmin && <td style={{ padding: "11px 16px", fontSize: 15, fontWeight: "bold", color: "#c9a96e" }}>{total}</td>}
                      </tr>
                    );
                  })}
                  {wines.length === 0 && (
                    <tr><td colSpan={10} style={{ padding: 32, textAlign: "center", color: "#4a3a2a" }}>Nenhum rótulo cadastrado.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: 10, fontSize: 11, color: "#4a3a2a" }}>🔴 crítico (≤3) · 🟡 atenção (≤6) · 🟢 ok (&gt;6)</div>
          </div>
        )}

        {/* MOVEMENT */}
        {tab === "movement" && (
          <div style={{ maxWidth: 600 }}>
            <div style={{ fontSize: 11, color: "#7a6a5a", letterSpacing: 2, marginBottom: 20 }}>REGISTRAR MOVIMENTAÇÃO</div>
            <div style={{ background: "#1a0f0f", border: "1px solid #2a1a1a", borderRadius: 12, padding: 24 }}>
              <div style={{ display: "grid", gap: 16 }}>
                <div>
                  <label style={labelStyle}>TIPO *</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    {(isAdmin ? ["Entrada", "Saída", "Transferência"] : ["Entrada", "Saída"]).map(t => (
                      <button key={t} onClick={() => setMovForm(f => ({ ...f, type: t }))} style={{
                        flex: 1, padding: 10, borderRadius: 8,
                        border: `1px solid ${movForm.type === t ? typeColor[t] : "#2a1a1a"}`,
                        background: movForm.type === t ? "#0f0a0a" : "transparent",
                        color: movForm.type === t ? typeColor[t] : "#5a4a3a",
                        cursor: "pointer", fontSize: 13,
                      }}>{typeIcon[t]} {t}</button>
                    ))}
                  </div>
                </div>

                {isAdmin && (
                  <div>
                    <label style={labelStyle}>FILIAL DE ORIGEM *</label>
                    <select value={movForm.branch || BRANCHES[0]} onChange={e => setMovForm(f => ({ ...f, branch: e.target.value }))} style={inputStyle}>
                      {BRANCHES.map(b => <option key={b}>{b}</option>)}
                    </select>
                  </div>
                )}

                {movForm.type === "Transferência" && isAdmin && (
                  <div>
                    <label style={labelStyle}>FILIAL DE DESTINO *</label>
                    <select value={movForm.toBranch} onChange={e => setMovForm(f => ({ ...f, toBranch: e.target.value }))} style={inputStyle}>
                      {BRANCHES.map(b => <option key={b}>{b}</option>)}
                    </select>
                  </div>
                )}

                <div>
                  <label style={labelStyle}>VINHO *</label>
                  <select value={movForm.wineId} onChange={e => setMovForm(f => ({ ...f, wineId: e.target.value }))} style={inputStyle}>
                    <option value="">Selecione...</option>
                    {wines.map(w => {
                      const branch = isAdmin ? (movForm.branch || BRANCHES[0]) : user.branch;
                      const qty = stock[branch]?.[w.id] || 0;
                      return <option key={w.id} value={w.id}>{w.name} ({w.year}) — Estoque: {qty}</option>;
                    })}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>QUANTIDADE *</label>
                  <input type="number" min="1" value={movForm.qty} onChange={e => setMovForm(f => ({ ...f, qty: e.target.value }))} style={inputStyle} />
                </div>

                <div>
                  <label style={labelStyle}>OBSERVAÇÃO</label>
                  <input placeholder="Opcional..." value={movForm.obs} onChange={e => setMovForm(f => ({ ...f, obs: e.target.value }))} style={inputStyle} />
                </div>

                <button onClick={handleMovement} disabled={loading} style={{
                  padding: 14, background: loading ? "#1a1a1a" : "#2a1a0a",
                  border: "1px solid #c9a96e", color: "#c9a96e",
                  borderRadius: 10, cursor: loading ? "not-allowed" : "pointer", fontSize: 14, letterSpacing: 1,
                }}>{loading ? "REGISTRANDO..." : "REGISTRAR MOVIMENTAÇÃO"}</button>
              </div>
            </div>
          </div>
        )}

        {/* HISTORY */}
        {tab === "history" && (
          <div>
            <div style={{ fontSize: 11, color: "#7a6a5a", letterSpacing: 2, marginBottom: 16 }}>HISTÓRICO DE MOVIMENTAÇÕES</div>
            <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
              <input placeholder="🔍 Buscar vinho..." value={searchWine} onChange={e => setSearchWine(e.target.value)} style={{ ...inputStyle, flex: 1, minWidth: 160 }} />
              {isAdmin && (
                <select value={filterBranch} onChange={e => setFilterBranch(e.target.value)} style={{ ...inputStyle, minWidth: 150 }}>
                  <option value="Todas">Todas as filiais</option>
                  {BRANCHES.map(b => <option key={b}>{b}</option>)}
                </select>
              )}
              <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ ...inputStyle, minWidth: 140 }}>
                <option value="Todos">Todos os tipos</option>
                {["Entrada", "Saída", "Transferência"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ background: "#1a0f0f", border: "1px solid #2a1a1a", borderRadius: 12, overflow: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
                <thead>
                  <tr style={{ background: "#150c0c" }}>
                    {["Data", "Tipo", "Vinho", "Filial", "Qtd", "Responsável", "Obs"].map(h => (
                      <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, color: "#7a6a5a", letterSpacing: 1, fontWeight: "normal" }}>{h.toUpperCase()}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredMovements.length === 0 && (
                    <tr><td colSpan={7} style={{ padding: 32, textAlign: "center", color: "#4a3a2a" }}>Nenhuma movimentação encontrada.</td></tr>
                  )}
                  {filteredMovements.map((m, i) => (
                    <tr key={m.id} style={{ borderTop: "1px solid #1f1515", background: i % 2 === 0 ? "transparent" : "#160d0d" }}>
                      <td style={{ padding: "10px 16px", fontSize: 11, color: "#5a4a3a", whiteSpace: "nowrap" }}>{fmtDate(m.created_at)}</td>
                      <td style={{ padding: "10px 16px" }}>
                        <span style={{ padding: "2px 10px", borderRadius: 20, background: "#0f0a0a", border: `1px solid ${typeColor[m.type]}`, color: typeColor[m.type], fontSize: 11 }}>{typeIcon[m.type]} {m.type}</span>
                      </td>
                      <td style={{ padding: "10px 16px", fontSize: 13, color: "#d0c0b0" }}>{m.wine_name}</td>
                      <td style={{ padding: "10px 16px", fontSize: 12, color: "#7a6a5a" }}>{m.branch}{m.to_branch ? <span style={{ color: "#60a5fa" }}> → {m.to_branch}</span> : ""}</td>
                      <td style={{ padding: "10px 16px", fontSize: 14, fontWeight: "bold", color: typeColor[m.type] }}>{m.type === "Saída" ? "-" : "+"}{m.quantity}</td>
                      <td style={{ padding: "10px 16px", fontSize: 12, color: "#a08060" }}>{m.user_name}</td>
                      <td style={{ padding: "10px 16px", fontSize: 11, color: "#5a4a3a" }}>{m.obs || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: 10, fontSize: 11, color: "#4a3a2a" }}>{filteredMovements.length} registro(s)</div>
          </div>
        )}

        {/* USERS (admin only) */}
        {tab === "users" && isAdmin && (
          <UserManager showToast={showToast} />
        )}
      </div>
      <style>{`* { box-sizing: border-box; }`}</style>
    </div>
  );
}

function UserManager({ showToast }) {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ username: "", password: "senha123", role: "vendedor", branch: BRANCHES[0] });
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const data = await db("profiles?order=role.asc,username.asc");
    setUsers(data);
  };
  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!form.username.trim()) { showToast("Nome de usuário obrigatório.", false); return; }
    setLoading(true);
    try {
      await db("profiles", { method: "POST", body: JSON.stringify({ ...form, username: form.username.trim(), branch: form.role === "admin" ? null : form.branch }) });
      setForm({ username: "", password: "senha123", role: "vendedor", branch: BRANCHES[0] });
      showToast("Usuário criado!");
      await load();
    } catch (e) { showToast("Erro: " + e.message, false); }
    setLoading(false);
  };

  const handleDelete = async (id, username) => {
    if (username === "admin") { showToast("Não é possível remover o admin principal.", false); return; }
    if (!confirm(`Remover usuário "${username}"?`)) return;
    await db(`profiles?id=eq.${id}`, { method: "DELETE", prefer: "" });
    showToast("Usuário removido.");
    await load();
  };

  const roleColor = { admin: "#c9a96e", vendedor: "#60a5fa" };

  return (
    <div>
      <div style={{ fontSize: 11, color: "#7a6a5a", letterSpacing: 2, marginBottom: 20 }}>GERENCIAR USUÁRIOS</div>
      <div style={{ background: "#1a0f0f", border: "1px solid #2a1a1a", borderRadius: 12, padding: 20, marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: "#7a6a5a", letterSpacing: 2, marginBottom: 16 }}>NOVO USUÁRIO</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr) auto", gap: 12, alignItems: "end" }}>
          <div>
            <label style={labelStyle}>USUÁRIO</label>
            <input placeholder="nome_usuario" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>SENHA</label>
            <input value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>PERFIL</label>
            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} style={inputStyle}>
              <option value="vendedor">Vendedor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {form.role === "vendedor" && (
            <div>
              <label style={labelStyle}>FILIAL</label>
              <select value={form.branch} onChange={e => setForm(f => ({ ...f, branch: e.target.value }))} style={inputStyle}>
                {BRANCHES.map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
          )}
          <button onClick={handleAdd} disabled={loading} style={{ padding: "10px 20px", background: "#2a1a0a", border: "1px solid #c9a96e", color: "#c9a96e", borderRadius: 8, cursor: "pointer", fontSize: 13, gridColumn: form.role !== "vendedor" ? "4 / 6" : "auto" }}>Criar</button>
        </div>
      </div>

      <div style={{ background: "#1a0f0f", border: "1px solid #2a1a1a", borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#150c0c" }}>
              {["Usuário", "Perfil", "Filial", "Ações"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, color: "#7a6a5a", letterSpacing: 1, fontWeight: "normal" }}>{h.toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={u.id} style={{ borderTop: "1px solid #1f1515", background: i % 2 === 0 ? "transparent" : "#160d0d" }}>
                <td style={{ padding: "12px 16px", fontSize: 13, color: "#d0c0b0" }}>{u.username}</td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{ padding: "2px 10px", borderRadius: 20, background: "#0f0a0a", border: `1px solid ${roleColor[u.role]}`, color: roleColor[u.role], fontSize: 11 }}>{u.role}</span>
                </td>
                <td style={{ padding: "12px 16px", fontSize: 12, color: "#7a6a5a" }}>{u.branch || "—"}</td>
                <td style={{ padding: "12px 16px" }}>
                  {u.username !== "admin" && (
                    <button onClick={() => handleDelete(u.id, u.username)} style={{ padding: "4px 12px", background: "transparent", border: "1px solid #5a1a1a", color: "#f87171", borderRadius: 6, cursor: "pointer", fontSize: 11 }}>Remover</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
