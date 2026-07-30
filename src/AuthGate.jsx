// src/lib/AuthGate.jsx
// Auth Context + หน้า Login/Signup — ครอบ <App /> ด้วย <AuthGate> เพื่อบังคับ login ก่อนเข้าระบบ
//
// การใช้งานใน main.jsx:
//   import { AuthGate, useAuth } from "./lib/AuthGate";
//   <AuthGate><App /></AuthGate>
// แล้วในหน้าไหนก็ตาม เรียก const { user, farmId, signOut } = useAuth();

import React, { createContext, useContext, useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "./supabaseClient";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthGate({ children }) {
  const [session, setSession] = useState(undefined); // undefined = กำลังโหลด
  const [farms, setFarms] = useState([]);
  const [farmId, setFarmId] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // โหลดรายชื่อสวนที่ผู้ใช้เป็นสมาชิก หลัง login สำเร็จ (และเรียกซ้ำได้เมื่อสร้าง/แก้สวน)
  const refreshFarms = async () => {
    const { data, error } = await supabase
      .from("farms")
      .select("id, name, latitude, longitude")
      .order("created_at", { ascending: true });
    if (!error && data) {
      setFarms(data);
      return data;
    }
    return [];
  };

  useEffect(() => {
    if (!session) return;
    (async () => {
      const data = await refreshFarms();
      if (data.length > 0) setFarmId(prev => prev || data[0].id);
    })();
  }, [session]);

  if (session === undefined) {
    return <CenteredMessage text="กำลังตรวจสอบสถานะการเข้าสู่ระบบ..." />;
  }

  if (!session) {
    return <LoginScreen />;
  }

  if (farms.length === 0) {
    return <CreateFirstFarmScreen onCreated={async (id) => { await refreshFarms(); setFarmId(id); }} />;
  }

  return (
    <AuthContext.Provider
      value={{
        user: session.user,
        farmId,
        farms,
        setFarmId,
        refreshFarms,
        signOut: () => supabase.auth.signOut(),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function CenteredMessage({ text }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#5C7A76" }}>
      {text}
    </div>
  );
}

function LoginScreen() {
  const [mode, setMode] = useState("login"); // login | signup
  const [email, setEmail] = useState(() => localStorage.getItem("durian_last_email") || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    localStorage.setItem("durian_last_email", email);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (error) throw error;
        setError("สมัครสำเร็จ กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ");
      }
    } catch (err) {
      setError(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#EFF8F7", fontFamily: "'Noto Sans Thai', sans-serif" }}>
      <form onSubmit={submit} style={{ background: "#fff", border: "1px solid #DCEEEC", borderRadius: 20, padding: 28, width: 340 }}>
        <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>Durian Smart Farm</div>
        <div style={{ fontSize: 13, color: "#5C7A76", marginBottom: 18 }}>
          {mode === "login" ? "เข้าสู่ระบบเพื่อจัดการสวน" : "สร้างบัญชีใหม่"}
        </div>

        {mode === "signup" && (
          <Field label="ชื่อ-นามสกุล" value={fullName} onChange={setFullName} />
        )}
        <Field label="อีเมล" value={email} onChange={setEmail} type="email" />
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#5C7A76", display: "block", marginBottom: 4 }}>รหัสผ่าน</label>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: "100%", background: "#FFF8E7", border: "1px solid #DCEEEC", borderRadius: 14, padding: "8px 36px 8px 10px", fontSize: 14 }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(s => !s)}
              style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#5C7A76", padding: 4 }}
              title={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {error && <div style={{ color: "#EF6C4A", fontSize: 12, marginBottom: 10 }}>{error}</div>}

        <button type="submit" disabled={loading} style={{ width: "100%", background: "linear-gradient(180deg, #FFE47A, #FFD23F)", color: "#123430", border: "none", borderRadius: 999, padding: "10px", fontWeight: 800, marginTop: 4, boxShadow: "0 4px 20px rgba(255,210,63,0.45)" }}>
          {loading ? "กำลังดำเนินการ..." : mode === "login" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
        </button>

        <div style={{ textAlign: "center", fontSize: 12, color: "#5C7A76", marginTop: 14 }}>
          {mode === "login" ? (
            <>ยังไม่มีบัญชี? <a href="#" onClick={(e) => { e.preventDefault(); setMode("signup"); }}>สมัครสมาชิก</a></>
          ) : (
            <>มีบัญชีอยู่แล้ว? <a href="#" onClick={(e) => { e.preventDefault(); setMode("login"); }}>เข้าสู่ระบบ</a></>
          )}
        </div>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "#5C7A76", display: "block", marginBottom: 4 }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        style={{ width: "100%", background: "#FFF8E7", border: "1px solid #DCEEEC", borderRadius: 14, padding: "8px 10px", fontSize: 14 }}
      />
    </div>
  );
}

function CreateFirstFarmScreen({ onCreated }) {
  const [name, setName] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const create = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { data: userData } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("farms")
      .insert({
        name, owner_id: userData.user.id,
        latitude: lat === "" ? null : Number(lat),
        longitude: lng === "" ? null : Number(lng),
      })
      .select()
      .single();
    setLoading(false);
    if (error) { setError(error.message); return; }
    onCreated(data.id);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#EFF8F7" }}>
      <form onSubmit={create} style={{ background: "#fff", border: "1px solid #DCEEEC", borderRadius: 20, padding: 28, width: 340 }}>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>สร้างสวนแรกของคุณ</div>
        <div style={{ fontSize: 13, color: "#5C7A76", marginBottom: 16 }}>ยังไม่มีสวนในบัญชีนี้ ตั้งชื่อสวนเพื่อเริ่มต้นใช้งาน</div>
        <Field label="ชื่อสวน" value={name} onChange={setName} />
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ flex: 1 }}><Field label="ละติจูด (ไม่บังคับ)" value={lat} onChange={setLat} /></div>
          <div style={{ flex: 1 }}><Field label="ลองจิจูด (ไม่บังคับ)" value={lng} onChange={setLng} /></div>
        </div>
        <div style={{ fontSize: 11, color: "#7D8F82", marginBottom: 12, marginTop: -6 }}>
          ใส่พิกัดสวนเพื่อให้ widget สภาพอากาศแสดงข้อมูลจริงของพื้นที่คุณ (ข้ามได้ ใส่ทีหลังได้)
        </div>
        {error && <div style={{ color: "#EF6C4A", fontSize: 12, marginBottom: 10 }}>{error}</div>}
        <button type="submit" disabled={loading} style={{ width: "100%", background: "linear-gradient(180deg, #FFE47A, #FFD23F)", color: "#123430", border: "none", borderRadius: 999, padding: "10px", fontWeight: 800, boxShadow: "0 4px 20px rgba(255,210,63,0.45)" }}>
          {loading ? "กำลังสร้าง..." : "สร้างสวน"}
        </button>
      </form>
    </div>
  );
}
