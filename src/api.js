// src/lib/api.js
// Data access layer — ทุกฟังก์ชันถูกกรองด้วย RLS ตาม role ของผู้ใช้ที่ login อยู่โดยอัตโนมัติ
import { supabase } from "./supabaseClient";

// ---------- Dashboard ----------
export async function getDashboardKpis(farmId) {
  const { data, error } = await supabase.rpc("get_dashboard_kpis", { p_farm_id: farmId });
  if (error) throw error;
  return data; // { total_trees, yield_mtd_kg, revenue_mtd, expense_mtd, open_tasks, sick_trees }
}

export async function listActiveAlerts(farmId) {
  const { data, error } = await supabase
    .from("weather_alerts")
    .select("*")
    .eq("farm_id", farmId)
    .eq("resolved", false)
    .order("triggered_at", { ascending: false });
  if (error) throw error;
  return data;
}

// ---------- Trees ----------
export async function listTrees(farmId) {
  const { data, error } = await supabase
    .from("trees")
    .select("*")
    .eq("farm_id", farmId)
    .order("tree_code");
  if (error) throw error;
  return data;
}

export async function addTree(farmId, tree) {
  // tree: { tree_code, variety, planted_date, health_status, latitude, longitude, notes }
  const { data, error } = await supabase
    .from("trees")
    .insert({ farm_id: farmId, ...tree })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateTree(id, patch) {
  const { data, error } = await supabase.from("trees").update(patch).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteTree(id) {
  const { error } = await supabase.from("trees").delete().eq("id", id);
  if (error) throw error;
}

// ---------- Operations ----------
export async function listOperations(farmId, { limit = 100 } = {}) {
  const { data, error } = await supabase
    .from("operations")
    .select("*, trees(tree_code)")
    .eq("farm_id", farmId)
    .order("performed_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function addOperation(farmId, op) {
  // op: { tree_id, operation_type, description, cost, performed_by, performed_at }
  const { data, error } = await supabase
    .from("operations")
    .insert({ farm_id: farmId, ...op })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateOperation(id, patch) {
  const { data, error } = await supabase.from("operations").update(patch).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteOperation(id) {
  const { error } = await supabase.from("operations").delete().eq("id", id);
  if (error) throw error;
}

// ---------- Harvest ----------
export async function listHarvest(farmId, { limit = 100 } = {}) {
  const { data, error } = await supabase
    .from("harvest_records")
    .select("*")
    .eq("farm_id", farmId)
    .order("harvest_date", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function addHarvest(farmId, record) {
  // record: { tree_id, harvest_date, weight_kg, grade, price_per_kg, recorded_by }
  const { data, error } = await supabase
    .from("harvest_records")
    .insert({ farm_id: farmId, ...record })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateHarvest(id, patch) {
  const { data, error } = await supabase.from("harvest_records").update(patch).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteHarvest(id) {
  const { error } = await supabase.from("harvest_records").delete().eq("id", id);
  if (error) throw error;
}

// ---------- Transactions (รายรับ-รายจ่าย) ----------
export async function listTransactions(farmId, { limit = 100 } = {}) {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("farm_id", farmId)
    .order("transaction_date", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function addTransaction(farmId, tx) {
  // tx: { transaction_type: 'income'|'expense', category, amount, transaction_date, description, created_by }
  const { data, error } = await supabase
    .from("transactions")
    .insert({ farm_id: farmId, ...tx })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateTransaction(id, patch) {
  const { data, error } = await supabase.from("transactions").update(patch).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteTransaction(id) {
  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) throw error;
}

// ---------- Soil ----------
export async function listSoilReadings(farmId, { limit = 100 } = {}) {
  const { data, error } = await supabase
    .from("soil_readings")
    .select("*")
    .eq("farm_id", farmId)
    .order("reading_date", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function addSoilReading(farmId, reading) {
  // reading: { reading_date, ph, ec, om, p, k, ca, mg, notes, recorded_by }
  if (reading.ph !== undefined && reading.ph !== null && (reading.ph < 0 || reading.ph > 14)) {
    throw new Error("ค่า pH ต้องอยู่ระหว่าง 0–14");
  }
  const { data, error } = await supabase
    .from("soil_readings")
    .insert({ farm_id: farmId, ...reading })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateSoilReading(id, patch) {
  if (patch.ph !== undefined && patch.ph !== null && (patch.ph < 0 || patch.ph > 14)) {
    throw new Error("ค่า pH ต้องอยู่ระหว่าง 0–14");
  }
  const { data, error } = await supabase.from("soil_readings").update(patch).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteSoilReading(id) {
  const { error } = await supabase.from("soil_readings").delete().eq("id", id);
  if (error) throw error;
}

// ---------- Tasks ----------
export async function listTasks(farmId) {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("farm_id", farmId)
    .order("due_date", { ascending: true });
  if (error) throw error;
  return data;
}

export async function addTask(farmId, task) {
  // task: { title, description, due_date, priority, status, assigned_to, created_by }
  const { data, error } = await supabase
    .from("tasks")
    .insert({ farm_id: farmId, ...task })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateTaskStatus(taskId, status) {
  const { data, error } = await supabase
    .from("tasks")
    .update({ status, completed_at: status === "done" ? new Date().toISOString() : null })
    .eq("id", taskId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateTask(id, patch) {
  const { data, error } = await supabase.from("tasks").update(patch).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteTask(id) {
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw error;
}

// ---------- Farm Members (สำหรับ dropdown เลือกผู้ปฏิบัติงาน/ผู้บันทึก) ----------
export async function listFarmMembers(farmId) {
  const { data, error } = await supabase
    .from("farm_members")
    .select("user_id, farm_role, profiles(full_name)")
    .eq("farm_id", farmId);
  if (error) throw error;
  return data.map(m => ({ id: m.user_id, name: m.profiles?.full_name || "ไม่ทราบชื่อ", role: m.farm_role }));
}

// ---------- Realtime (ตัวอย่าง: ฟัง alert ใหม่แบบสด) ----------
export function subscribeToAlerts(farmId, onNewAlert) {
  const channel = supabase
    .channel(`weather_alerts:${farmId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "weather_alerts", filter: `farm_id=eq.${farmId}` },
      (payload) => onNewAlert(payload.new)
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
}

// ---------- Farms ----------
export async function createFarm(name, { latitude, longitude } = {}) {
  const { data: userData } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("farms")
    .insert({ name, owner_id: userData.user.id, latitude: latitude ?? null, longitude: longitude ?? null })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ---------- Weather (OpenWeatherMap) ----------
// ต้องตั้งค่า VITE_OPENWEATHER_API_KEY ใน .env
const OWM_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

export async function getWeather(lat, lon) {
  if (!OWM_KEY) throw new Error("ไม่พบ VITE_OPENWEATHER_API_KEY ใน .env");
  const [currentRes, forecastRes] = await Promise.all([
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OWM_KEY}&units=metric&lang=th`),
    fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OWM_KEY}&units=metric&lang=th`),
  ]);
  if (!currentRes.ok) throw new Error("เรียก OpenWeatherMap ไม่สำเร็จ (ตรวจสอบ API key)");
  const current = await currentRes.json();
  const forecastData = forecastRes.ok ? await forecastRes.json() : { list: [] };

  // แปลง forecast แบบ 3 ชม./ครั้ง ให้เหลือ 1 ค่าต่อวัน (เลือกช่วงเที่ยงวันถ้ามี)
  const byDay = {};
  const minMaxByDay = {};
  forecastData.list.forEach(item => {
    const day = item.dt_txt.slice(0, 10);
    const hour = item.dt_txt.slice(11, 13);
    if (!byDay[day] || hour === "12") byDay[day] = item;
    if (!minMaxByDay[day]) minMaxByDay[day] = { min: item.main.temp_min, max: item.main.temp_max };
    minMaxByDay[day].min = Math.min(minMaxByDay[day].min, item.main.temp_min);
    minMaxByDay[day].max = Math.max(minMaxByDay[day].max, item.main.temp_max);
  });
  const forecast = Object.entries(byDay).slice(0, 6).map(([day, item]) => ({
    date: day,
    temp: Math.round(item.main.temp),
    tempMin: Math.round(minMaxByDay[day]?.min ?? item.main.temp_min),
    tempMax: Math.round(minMaxByDay[day]?.max ?? item.main.temp_max),
    rainChance: Math.round((item.pop || 0) * 100),
    icon: item.weather?.[0]?.icon,
    description: item.weather?.[0]?.description,
  }));

  const todayKey = Object.keys(byDay)[0];

  return {
    temp: Math.round(current.main.temp),
    feelsLike: Math.round(current.main.feels_like),
    humidity: current.main.humidity,
    windSpeed: current.wind?.speed,
    windDeg: current.wind?.deg ?? 0,
    visibility: current.visibility, // เมตร
    sunrise: current.sys?.sunrise ? new Date(current.sys.sunrise * 1000) : null,
    sunset: current.sys?.sunset ? new Date(current.sys.sunset * 1000) : null,
    tempMin: todayKey ? Math.round(minMaxByDay[todayKey].min) : Math.round(current.main.temp_min),
    tempMax: todayKey ? Math.round(minMaxByDay[todayKey].max) : Math.round(current.main.temp_max),
    description: current.weather?.[0]?.description,
    icon: current.weather?.[0]?.icon,
    locationName: current.name,
    forecast,
  };
}

export async function getAirQuality(lat, lon) {
  if (!OWM_KEY) throw new Error("ไม่พบ VITE_OPENWEATHER_API_KEY ใน .env");
  const res = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution/forecast?lat=${lat}&lon=${lon}&appid=${OWM_KEY}`);
  if (!res.ok) throw new Error("เรียกข้อมูลคุณภาพอากาศไม่สำเร็จ");
  const data = await res.json();

  // เฉลี่ยค่า AQI (1-5) รายวัน จากข้อมูลรายชั่วโมง
  const byDay = {};
  (data.list || []).forEach(item => {
    const day = new Date(item.dt * 1000).toISOString().slice(0, 10);
    if (!byDay[day]) byDay[day] = [];
    byDay[day].push(item.main.aqi);
  });
  const daily = Object.entries(byDay).slice(0, 6).map(([day, values]) => ({
    date: day,
    aqi: Math.round(values.reduce((s, v) => s + v, 0) / values.length),
  }));
  return { current: data.list?.[0]?.main?.aqi ?? null, daily };
}

// ---------- Photos ----------
export async function listPhotos(farmId, { category, limit = 60 } = {}) {
  let query = supabase
    .from("photos")
    .select("*")
    .eq("farm_id", farmId)
    .order("taken_at", { ascending: false })
    .limit(limit);
  if (category) query = query.eq("category", category);
  const { data, error } = await query;
  if (error) throw error;

  // สร้าง signed URL (bucket เป็น private) อายุ 1 ชม.
  const withUrls = await Promise.all(
    data.map(async (p) => {
      const { data: signed } = await supabase.storage
        .from("farm-photos")
        .createSignedUrl(p.storage_path, 3600);
      return { ...p, url: signed?.signedUrl };
    })
  );
  return withUrls;
}

export async function uploadPhoto(farmId, file, { category = "other", treeId = null, caption = "" } = {}) {
  const ext = file.name.split(".").pop();
  const path = `${farmId}/${category}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error: uploadError } = await supabase.storage.from("farm-photos").upload(path, file);
  if (uploadError) throw uploadError;

  const { data, error } = await supabase
    .from("photos")
    .insert({ farm_id: farmId, tree_id: treeId, category, storage_path: path, caption })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deletePhoto(photo) {
  await supabase.storage.from("farm-photos").remove([photo.storage_path]);
  const { error } = await supabase.from("photos").delete().eq("id", photo.id);
  if (error) throw error;
}

// ---------- AI Chat ----------
export async function askAI(farmId, question) {
  const { data, error } = await supabase.functions.invoke("ai-chat", {
    body: { farm_id: farmId, question },
  });
  if (error) throw error;
  return data.answer;
}

export async function listChatHistory(farmId, { limit = 30 } = {}) {
  const { data, error } = await supabase
    .from("ai_chat_logs")
    .select("*")
    .eq("farm_id", farmId)
    .order("created_at", { ascending: true })
    .limit(limit);
  if (error) throw error;
  return data;
}

// ---------- Notifications ----------
export async function listNotifications({ limit = 30 } = {}) {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function unreadNotificationCount() {
  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("is_read", false);
  if (error) throw error;
  return count || 0;
}

export async function markNotificationRead(id) {
  const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", id);
  if (error) throw error;
}

export async function markAllNotificationsRead() {
  const { error } = await supabase.from("notifications").update({ is_read: true }).eq("is_read", false);
  if (error) throw error;
}

export function subscribeToNotifications(userId, onNew) {
  const channel = supabase
    .channel(`notifications:${userId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
      (payload) => onNew(payload.new)
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
}
