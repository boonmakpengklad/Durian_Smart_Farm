import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Home, TreeDeciduous, ClipboardList, FlaskConical, Plus, X, Search,
  AlertTriangle, TrendingUp, TrendingDown, Wallet, Leaf, Sprout, LogOut,
  Bell, Image as ImageIcon, Send, Trash2, Bot, Menu, CloudSun, Settings,
  LifeBuoy, LayoutGrid, CheckSquare, Square, Droplets, Wind, Sun, CalendarRange, Pencil,
  Sunrise, Sunset, Thermometer, Eye, MapPin, Camera, Download, Users, Filter
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from "recharts";

import { AuthGate, useAuth } from "./AuthGate";
import {
  getDashboardKpis, listActiveAlerts,
  listTrees, addTree, updateTree, deleteTree,
  listOperations, addOperation, updateOperation, deleteOperation,
  listHarvest, addHarvest, updateHarvest, deleteHarvest, syncHarvestTransaction,
  listSoilReadings, addSoilReading, updateSoilReading, deleteSoilReading,
  listTransactions, addTransaction, updateTransaction, deleteTransaction,
  listTasks, addTask, updateTask, updateTaskStatus, deleteTask, logTaskAsOperation,
  listFarmMembers, inviteMember, updateMemberRole, removeMember,
  listPhotos, uploadPhoto, deletePhoto,
  askAI, listChatHistory,
  listNotifications, unreadNotificationCount, markNotificationRead,
  markAllNotificationsRead, subscribeToNotifications,
  createFarm, getWeather, getAirQuality,
} from "./api";

/* ============================================================
   DESIGN TOKENS
   แนวคิด: "ห้องควบคุมสวนทุเรียน" — sidebar เขียวเข้มแบบใบทุเรียนยามค่ำ
   คอนเทนต์พื้นสว่างอ่านง่ายสำหรับงานเชิงข้อมูล/ตาราง
   ลายเซ็น: เส้น "spike rule" หยักใต้หัวข้อหลัก (อ้างอิงหนามทุเรียน) ใช้แต่พอดี
   ============================================================ */
const TOKENS = `
  @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@500;600;700&family=Noto+Sans+Thai:wght@400;500;600&display=swap');

  .dsf, .dsf *, .dsf *::before, .dsf *::after { box-sizing: border-box; }

  .dsf {
    /* ---- Flip7-inspired palette: teal-coral-gold ---- */
    --bg: #EFF8F7; --surface: #FFFFFF; --surface-2: #FFF8E7; --surface-3: #E8F6F5;
    --ink: #163430; --ink-soft: #5C7A76; --border: #DCEEEC; --border-soft: #EAF5F4;
    --green: #2BA8A2; --green-soft: #E8F6F5; --green-dark: #1E8C86;
    --blue: #5DADE2; --blue-soft: #EAF4FB;
    --orange: #E6B800; --orange-soft: #FFF3C2;
    --red: #EF6C4A; --red-soft: #FDE7E0;
    --sidebar-bg: #123430; --sidebar-bg-2: #17403B; --sidebar-text: #C9E4E1; --sidebar-text-soft: #7FA6A1;
    --sidebar-active: rgba(255,255,255,0.08); --sidebar-border: rgba(255,255,255,0.1);
    --sidebar-accent: #FFD23F;
    --shadow-sm: 0 2px 8px rgba(20,50,45,0.06);
    --shadow-md: 0 4px 16px rgba(20,50,45,0.10);
    --shadow-lg: 0 10px 32px rgba(20,50,45,0.16);
    --shadow-teal-glow: 0 4px 20px rgba(43,168,162,0.28);
    --shadow-accent-glow: 0 4px 20px rgba(255,210,63,0.45);
    --shadow-coral-glow: 0 4px 20px rgba(239,108,74,0.32);
    font-family: 'Noto Sans Thai', 'Prompt', sans-serif;
    color: var(--ink);
  }
  .dsf .disp { font-family: 'Prompt', 'Noto Sans Thai', sans-serif; font-weight: 800; letter-spacing: 0.01em; }
  .dsf .num { font-variant-numeric: tabular-nums; font-family: 'Prompt', sans-serif; }
  .dsf .muted { color: var(--ink-soft); font-size: 12.5px; }
  .dsf .spike {
    height: 6px; margin: 4px 0 16px 0; max-width: 120px;
    background-image: linear-gradient(135deg, var(--accent-gold, #FFD23F) 25%, transparent 25%),
                       linear-gradient(225deg, var(--accent-gold, #FFD23F) 25%, transparent 25%);
    background-size: 10px 6px; background-position: left top; background-repeat: repeat-x; opacity: 0.7;
  }

  .dsf-shell { display: flex; min-height: 100vh; background: var(--bg); }

  /* ---------- Sidebar ---------- */
  .dsf-sidebar {
    width: 236px; flex-shrink: 0; background: var(--sidebar-bg); color: var(--sidebar-text);
    display: flex; flex-direction: column; padding: 20px 12px; position: sticky; top: 0; height: 100vh;
    z-index: 40; transition: transform 0.25s ease; box-shadow: var(--shadow-lg);
  }
  .dsf-sidebar-overlay { display: none; }
  .dsf-logo { padding: 4px 10px 18px 10px; }
  .dsf-logo-title { font-family: 'Prompt', sans-serif; font-weight: 700; font-size: 16px; color: #fff; display: flex; align-items: center; gap: 8px; }
  .dsf-logo-sub { font-size: 11px; color: var(--sidebar-text-soft); margin-top: 2px; }
  .dsf-nav { display: flex; flex-direction: column; gap: 2px; flex: 1; overflow-y: auto; }
  .dsf-nav-item {
    display: flex; align-items: center; gap: 10px; padding: 9px 10px; border-radius: 9px;
    color: var(--sidebar-text); background: none; border: none; text-align: left; font-size: 13.5px;
    font-weight: 500; cursor: pointer; position: relative;
  }
  .dsf-nav-item:hover { background: var(--sidebar-active); }
  .dsf-nav-item.active { background: var(--sidebar-active); color: #fff; font-weight: 700; }
  .dsf-nav-item.active::before {
    content: ""; position: absolute; left: -12px; top: 8px; bottom: 8px; width: 3px;
    background: var(--sidebar-accent); border-radius: 0 3px 3px 0;
  }
  .dsf-sidebar-divider { height: 1px; background: var(--sidebar-border); margin: 10px 4px; }
  .dsf-user-card { display: flex; align-items: center; gap: 8px; padding: 8px 10px; margin-top: 6px; }
  .dsf-user-avatar {
    width: 32px; height: 32px; border-radius: 999px; background: var(--sidebar-accent); color: #0F1712;
    display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; flex-shrink: 0;
  }
  .dsf-user-name { font-size: 12.5px; font-weight: 600; color: #fff; line-height: 1.3; }
  .dsf-user-role { font-size: 11px; color: var(--sidebar-text-soft); }

  /* ---------- Main / Topbar ---------- */
  .dsf-main { flex: 1; min-width: 0; display: flex; flex-direction: column; }
  .dsf-topbar {
    height: 64px; background: var(--surface); border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between; padding: 0 20px;
    position: sticky; top: 0; z-index: 20; gap: 12px; box-shadow: var(--shadow-sm);
  }
  .dsf-hamburger { display: none; background: none; border: none; padding: 6px; color: var(--ink-soft); }
  .dsf-search { flex: 1; max-width: 320px; position: relative; }
  .dsf-search input {
    width: 100%; background: var(--surface-2); border: 1px solid var(--border); border-radius: 10px;
    padding: 9px 12px 9px 34px; font-size: 13.5px; color: var(--ink);
  }
  .dsf-search svg { position: absolute; left: 11px; top: 10px; color: var(--ink-soft); }
  .dsf-btn-primary {
    background: linear-gradient(180deg, #FFE47A, #FFD23F); color: var(--sidebar-bg); border: none; border-radius: 999px; padding: 9px 18px;
    font-size: 13px; font-weight: 800; display: flex; align-items: center; gap: 6px; white-space: nowrap; cursor: pointer;
    box-shadow: var(--shadow-accent-glow); transition: transform 0.15s cubic-bezier(0.34,1.56,0.64,1), filter 0.15s ease;
  }
  .dsf-btn-primary:hover { filter: brightness(1.04); }
  .dsf-btn-primary:active { transform: scale(0.96); }
  .dsf-icon-btn {
    width: 38px; height: 38px; border-radius: 999px; background: var(--surface-2); border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center; color: var(--ink-soft); position: relative; cursor: pointer; flex-shrink: 0;
    transition: background 0.15s ease;
  }
  .dsf-icon-btn:hover { background: var(--surface-3); }
  .dsf-badge {
    position: absolute; top: -3px; right: -3px; background: var(--red); color: #fff; font-size: 9px; font-weight: 700;
    border-radius: 999px; min-width: 15px; height: 15px; display: flex; align-items: center; justify-content: center; padding: 0 3px;
  }
  .dsf-content { padding: 22px 28px 60px 28px; max-width: none; width: 100%; min-width: 0; }

  /* ---------- Farm selector (sidebar) ---------- */
  .dsf-farm-select {
    width: 100%; background: var(--sidebar-bg-2); border: 1px solid var(--sidebar-border); color: #fff;
    border-radius: 9px; padding: 7px 9px; font-size: 12.5px; font-weight: 600; margin-top: 8px; cursor: pointer;
  }
  .dsf-farm-select:focus { outline: 1px solid var(--sidebar-accent); }

  /* ---------- Date range filter bar ---------- */
  .dsf-filterbar {
    display: flex; align-items: center; gap: 8px; flex-wrap: wrap; background: var(--surface); border: 1px solid var(--border);
    border-radius: 12px; padding: 10px 12px; margin-bottom: 16px; box-shadow: var(--shadow-sm);
  }
  .dsf-filterbar-presets { display: flex; gap: 4px; flex-wrap: wrap; }
  .dsf-preset-btn {
    border: 1px solid var(--border); background: var(--surface-2); color: var(--ink-soft); font-size: 12px; font-weight: 600;
    padding: 6px 11px; border-radius: 999px; cursor: pointer; transition: all 0.15s ease;
  }
  .dsf-preset-btn.active { background: var(--green); border-color: var(--green); color: #fff; }
  .dsf-filterbar-dates { display: flex; align-items: center; gap: 6px; margin-left: auto; }
  .dsf-filterbar-dates input {
    background: var(--surface-2); border: 1px solid var(--border); border-radius: 8px; padding: 6px 8px; font-size: 12px; color: var(--ink);
  }

  /* ---------- Cards / Tables ---------- */
  .dsf-card { background: var(--surface); border: 1px solid var(--border); border-radius: 20px; padding: 16px; box-shadow: var(--shadow-card, var(--shadow-sm)); }
  .dsf-card-head { display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 2px dashed var(--border); flex-wrap: wrap; }
  .dsf-card-title { font-family: 'Prompt', sans-serif; font-weight: 800; font-size: 15px; }
  .dsf-btn-primary-sm {
    background: var(--green); color: #fff; border: none; border-radius: 999px; padding: 6px 14px; font-size: 12px;
    font-weight: 700; display: flex; align-items: center; gap: 5px; cursor: pointer; white-space: nowrap; transition: filter 0.15s ease, transform 0.15s ease;
    box-shadow: var(--shadow-teal-glow);
  }
  .dsf-btn-primary-sm:hover { filter: brightness(1.08); }
  .dsf-btn-primary-sm:active { transform: scale(0.96); }
  .dsf-search-inline { position: relative; margin-bottom: 12px; }
  .dsf-search-inline svg { position: absolute; left: 10px; top: 9px; color: var(--ink-soft); }
  .dsf-search-inline input {
    width: 100%; background: var(--surface-2); border: 1px solid var(--border); border-radius: 9px;
    padding: 8px 10px 8px 30px; font-size: 13px;
  }
  .dsf-table-wrap { overflow-x: auto; }
  .dsf-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .dsf-table th { text-align: left; padding: 8px 10px; color: var(--ink-soft); font-weight: 600; font-size: 11.5px; text-transform: uppercase; letter-spacing: 0.03em; border-bottom: 1px solid var(--border); background: var(--surface-2); }
  .dsf-table th:first-child { border-radius: 8px 0 0 8px; }
  .dsf-table th:last-child { border-radius: 0 8px 8px 0; }
  .dsf-table td { padding: 10px; border-bottom: 1px solid var(--border-soft); }
  .dsf-table tr:hover td { background: var(--surface-2); }
  .dsf-table tr:last-child td { border-bottom: none; }
  .dsf-empty-cell { text-align: center; color: var(--ink-soft); padding: 24px 0 !important; }
  .dsf-pagination { display: flex; justify-content: space-between; align-items: center; margin-top: 12px; flex-wrap: wrap; gap: 8px; }
  .dsf-pagination-controls { display: flex; gap: 4px; }
  .dsf-pagination-controls button {
    min-width: 30px; height: 30px; border-radius: 7px; border: 1px solid var(--border); background: var(--surface);
    font-size: 12px; color: var(--ink-soft); cursor: pointer; padding: 0 8px;
  }
  .dsf-pagination-controls button.active { background: var(--green); border-color: var(--green); color: #fff; font-weight: 700; }
  .dsf-pagination-controls button:disabled { opacity: 0.4; cursor: not-allowed; }

  .chip { border-radius: 999px; font-size: 11.5px; font-weight: 700; padding: 3px 10px; display: inline-flex; align-items: center; gap: 4px; }

  /* ---------- Dashboard grid ---------- */
  .dsf-kpi-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
  .dsf-kpi-grid > * { min-width: 0; }
  .dsf-two-col { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 16px; align-items: start; }
  .dsf-three-col { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; align-items: start; }
  .dsf-checklist-item { display: flex; align-items: flex-start; gap: 10px; padding: 10px 4px; border-bottom: 1px solid var(--border); }
  .dsf-checklist-item:last-child { border-bottom: none; }
  .dsf-progress-track { background: var(--surface-2); border-radius: 999px; height: 6px; overflow: hidden; }
  .dsf-progress-fill { background: linear-gradient(90deg, var(--green-dark), var(--green)); height: 100%; border-radius: 999px; transition: width 0.3s ease; }

  input.dsf-input, select.dsf-input {
    background: var(--surface-2); border: 1px solid var(--border); border-radius: 14px;
    padding: 9px 12px; font-size: 14px; width: 100%; color: var(--ink);
  }
  input.dsf-input:focus, select.dsf-input:focus { outline: 2px solid var(--green); outline-offset: 1px; }
  label.dsf-label { font-size: 12px; font-weight: 600; color: var(--ink-soft); margin-bottom: 4px; display: block; }

  /* ---------- Responsive ---------- */
  html, body { overflow-x: hidden; max-width: 100%; }
  .dsf-shell { overflow-x: hidden; }
  .dsf-main { overflow-x: hidden; min-width: 0; }
  .dsf-card { max-width: 100%; }
  .dsf-two-col > *, .dsf-three-col > * { min-width: 0; }
  .dsf-span-2 { grid-column: span 2; }
  .dsf-table { min-width: 640px; }
  .dsf-filter-row th { padding: 3px 6px !important; }
  .dsf-filter-row select { width: 100%; font-size: 10.5px; padding: 3px 4px; border-radius: 6px; border: 1px solid var(--border); background: var(--surface-2); color: var(--ink-soft); }

  @media (max-width: 900px) {
    .dsf-sidebar { position: fixed; left: 0; transform: translateX(-100%); box-shadow: 8px 0 24px rgba(0,0,0,0.25); }
    .dsf-sidebar.open { transform: translateX(0); }
    .dsf-sidebar-overlay.open { display: block; position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 30; }
    .dsf-hamburger { display: flex; }
    .dsf-kpi-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .dsf-two-col, .dsf-three-col { grid-template-columns: minmax(0, 1fr); }
    .dsf-span-2 { grid-column: span 1; }
    .dsf-search { display: none; }
    .dsf-btn-primary span.dsf-btn-label { display: none; }
    .dsf-filterbar-dates { margin-left: 0; width: 100%; }
    .dsf-content { padding: 16px 14px 60px 14px; }
    .dsf-topbar { padding: 0 12px; gap: 6px; }
  }
  @media (max-width: 480px) {
    .dsf-btn-primary { padding: 9px 12px; }
    .dsf-icon-btn { width: 34px; height: 34px; }
    .dsf-kpi-grid { grid-template-columns: minmax(0, 1fr); }
    .dsf-card { padding: 12px; }
  }
`;

const TONE = {
  green: { fg: "var(--green)", bg: "var(--green-soft)" },
  blue: { fg: "var(--blue)", bg: "var(--blue-soft)" },
  orange: { fg: "var(--orange)", bg: "var(--orange-soft)" },
  red: { fg: "var(--red)", bg: "var(--red-soft)" },
};
const SEVERITY_TONE = { severe: "red", warning: "orange", info: "blue" };
const HEALTH_TONE = { "ปกติ": "green", "เฝ้าระวัง": "orange", "ป่วย": "red", "ตาย": "red" };
const TASK_STATUS_TONE = { "รอทำ": "orange", "ทำอยู่": "blue", "เสร็จสิ้น": "green", "ยกเลิก": "red" };
const PRIORITY_LABEL = { low: "ต่ำ", normal: "ปกติ", high: "สูง", urgent: "เร่งด่วน" };
const PRIORITY_TONE = { low: "blue", normal: "green", high: "orange", urgent: "red" };

const OPERATION_TYPE_OPTIONS = ["รดน้ำ", "ใส่ปุ๋ย", "ฉีดพ่นทางใบ", "ตัดหญ้า", "ตัดแต่งกิ่ง", "กำจัดศัตรูพืช", "ตรวจสอบโรค", "ใส่สารปรับปรุงดิน"];
const TASK_STATUS_OPTIONS = ["รอทำ", "ทำอยู่", "เสร็จสิ้น", "ยกเลิก"];
const TASK_STATUS_DONE = "เสร็จสิ้น";
const VARIETY_OPTIONS = ["หมอนทอง", "ชะนี", "กระดุม", "ก้านยาว", "พวงมณี"];
const HEALTH_STATUS_OPTIONS = ["ปกติ", "เฝ้าระวัง", "ป่วย"];
const GRADE_OPTIONS = ["AB", "C", "ตำหนิ"];
const FINANCE_CATEGORY_OPTIONS = ["ค่าแรง", "ปุ๋ย", "สารปรับปรุงดิน", "สารป้องกันกำจัดศัตรูพืช", "น้ำมัน", "ค่าไฟ", "ระบบน้ำ", "ระบบฉีดยา", "เครื่องมือ"];
const SOIL_LAB_OPTIONS = ["สำนักวิทยาศาสตร์เพื่อการพัฒนาที่ดิน กรมพัฒนาที่ดิน", "ตรวจเอง"];
const PHOTO_CATEGORIES = [
  { value: "tree", label: "ต้นไม้" }, { value: "fruit", label: "ผล" },
  { value: "disease", label: "โรค/ศัตรูพืช" }, { value: "soil", label: "ดิน" },
  { value: "operation", label: "กิจกรรม" }, { value: "damage", label: "ความเสียหาย" },
  { value: "other", label: "อื่นๆ" },
];

/** คำนวณอายุต้น (ปี) จากวันที่ปลูก — แสดงผลอย่างเดียว ไม่มีคอลัมน์นี้ใน DB */
function calcAgeYears(plantedDate) {
  if (!plantedDate) return null;
  const planted = new Date(plantedDate);
  const now = new Date();
  let age = now.getFullYear() - planted.getFullYear();
  const m = now.getMonth() - planted.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < planted.getDate())) age--;
  return Math.max(age, 0);
}

/** แสดงวันที่แบบ วัน-เดือน-ปี(2หลัก) เช่น 24-03-26 — ใช้ทุกที่ที่แสดงวันที่ในตาราง/กราฟ */
function fmtDate(value) {
  if (!value) return "-";
  const d = new Date(value.length === 10 ? value + "T00:00:00" : value);
  if (isNaN(d.getTime())) return String(value);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}-${mm}-${yy}`;
}

const NAV_ITEMS = [
  { key: "dashboard", label: "ภาพรวม", icon: Home },
  { key: "trees", label: "สวน/ต้นไม้", icon: TreeDeciduous },
  { key: "tasks", label: "งานที่ต้องทำ", icon: CheckSquare },
  { key: "operations", label: "บันทึกกิจกรรม", icon: ClipboardList },
  { key: "harvest", label: "ผลผลิต", icon: Sprout },
  { key: "finance", label: "การเงิน", icon: Wallet },
  { key: "soil", label: "ดิน", icon: FlaskConical },
  { key: "weather", label: "สภาพอากาศ", icon: CloudSun },
  { key: "aichat", label: "AI Insights", icon: Bot },
  { key: "photos", label: "รูปภาพ", icon: ImageIcon },
];

/* ============================================================
   DATE RANGE FILTER — ใช้ร่วมกันทุกหน้าที่มีข้อมูลผูกวันที่
   ============================================================ */
const DATE_PRESETS = [
  { key: "1M", label: "1M" }, { key: "3M", label: "3M" }, { key: "6M", label: "6M" },
  { key: "1Y", label: "1Y" }, { key: "YTD", label: "YTD" }, { key: "ALL", label: "ALL" },
];
const PAGES_WITH_DATE_FILTER = ["dashboard", "operations", "harvest", "finance", "soil"];

function presetToRange(preset) {
  const today = new Date();
  const end = today.toISOString().slice(0, 10);
  let start = null;
  const d = new Date(today);
  switch (preset) {
    case "1M": d.setMonth(d.getMonth() - 1); start = d.toISOString().slice(0, 10); break;
    case "3M": d.setMonth(d.getMonth() - 3); start = d.toISOString().slice(0, 10); break;
    case "6M": d.setMonth(d.getMonth() - 6); start = d.toISOString().slice(0, 10); break;
    case "1Y": d.setFullYear(d.getFullYear() - 1); start = d.toISOString().slice(0, 10); break;
    case "YTD": start = `${today.getFullYear()}-01-01`; break;
    case "ALL": default: start = null;
  }
  return { start, end: preset === "ALL" ? null : end };
}

/** กรองแถวข้อมูลตามช่วงวันที่ที่เลือก — ใช้ได้กับทุกตารางที่มีฟิลด์วันที่ */
function filterByDate(rows, dateField, range) {
  if (!range.start && !range.end) return rows;
  return rows.filter(r => {
    const v = r[dateField];
    if (!v) return false;
    const d = v.slice(0, 10);
    if (range.start && d < range.start) return false;
    if (range.end && d > range.end) return false;
    return true;
  });
}

function DateRangeBar({ range, onChange }) {
  const [customOpen, setCustomOpen] = useState(false);

  function selectPreset(key) {
    onChange({ preset: key, ...presetToRange(key) });
    setCustomOpen(false);
  }

  return (
    <div className="dsf-filterbar">
      <div className="dsf-filterbar-presets">
        {DATE_PRESETS.map(p => (
          <button key={p.key} className={`dsf-preset-btn ${range.preset === p.key ? "active" : ""}`} onClick={() => selectPreset(p.key)}>
            {p.label}
          </button>
        ))}
        <button className={`dsf-preset-btn ${range.preset === "custom" ? "active" : ""}`} onClick={() => setCustomOpen(o => !o)}>
          กำหนดเอง
        </button>
      </div>
      {customOpen && (
        <div className="dsf-filterbar-dates">
          <input type="date" value={range.start || ""} onChange={e => onChange({ preset: "custom", start: e.target.value, end: range.end })} />
          <span className="muted">ถึง</span>
          <input type="date" value={range.end || ""} onChange={e => onChange({ preset: "custom", start: range.start, end: e.target.value })} />
        </div>
      )}
    </div>
  );
}

/* ============================================================
   SHARED PIECES
   ============================================================ */
function HealthChip({ health }) {
  const t = TONE[HEALTH_TONE[health] || "green"];
  return <span className="chip" style={{ background: t.bg, color: t.fg }}>{health || "-"}</span>;
}

function TaskStatusChip({ status }) {
  const t = TONE[TASK_STATUS_TONE[status] || "blue"];
  return <span className="chip" style={{ background: t.bg, color: t.fg }}>{status || "-"}</span>;
}

function PriorityChip({ priority }) {
  const t = TONE[PRIORITY_TONE[priority] || "green"];
  return <span className="chip" style={{ background: t.bg, color: t.fg }}>{PRIORITY_LABEL[priority] || priority}</span>;
}

/** dropdown เลือกจากลิสต์ หรือเลือก "อื่นๆ" แล้วพิมพ์เองได้ — ใช้กับ operation_type, variety, health_status, grade, category ฯลฯ */
function ComboBox({ value, onChange, options, placeholder = "เลือก..." }) {
  const isKnown = options.includes(value);
  const [customMode, setCustomMode] = useState(value !== "" && !isKnown);

  return (
    <div>
      <select
        className="dsf-input"
        value={customMode ? "__custom__" : value}
        onChange={e => {
          if (e.target.value === "__custom__") { setCustomMode(true); onChange(""); }
          else { setCustomMode(false); onChange(e.target.value); }
        }}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
        <option value="__custom__">อื่นๆ (พิมพ์เอง)</option>
      </select>
      {customMode && (
        <input className="dsf-input" style={{ marginTop: 6 }} placeholder="พิมพ์ค่าที่ต้องการ" value={value} onChange={e => onChange(e.target.value)} />
      )}
    </div>
  );
}

/** dropdown เลือกผู้ปฏิบัติงาน/ผู้บันทึก จากสมาชิกในสวน */
function MemberSelect({ value, onChange, members }) {
  return (
    <select className="dsf-input" value={value || ""} onChange={e => onChange(e.target.value || null)}>
      <option value="">-- ไม่ระบุ --</option>
      {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
    </select>
  );
}

function KpiCard({ label, value, unit, trend, icon: Icon, tone }) {
  const t = TONE[tone];
  const up = trend >= 0;
  return (
    <div className="dsf-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div className="chip" style={{ background: t.bg, color: t.fg }}><Icon size={13} /> {unit}</div>
        {trend !== undefined && trend !== 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 2, fontSize: 12, fontWeight: 700, color: up ? "var(--green)" : "var(--red)" }}>
            {up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}{Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="num" style={{ fontSize: 22, fontWeight: 700, marginTop: 10 }}>{value}</div>
      <div className="muted" style={{ marginTop: 2 }}>{label}</div>
    </div>
  );
}

const WEATHER_ICON_URL = (icon) => `https://openweathermap.org/img/wn/${icon}@2x.png`;
const DEFAULT_COORDS = { lat: 12.9236, lon: 100.8825 }; // Pattaya, Chon Buri — ใช้เมื่อสวนยังไม่ได้ตั้งพิกัด

function WeatherWidget({ farm }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const lat = farm?.latitude ?? DEFAULT_COORDS.lat;
  const lon = farm?.longitude ?? DEFAULT_COORDS.lon;
  const usingDefault = farm?.latitude == null;

  useEffect(() => {
    let alive = true;
    setLoading(true); setError("");
    getWeather(lat, lon)
      .then(w => { if (alive) setWeather(w); })
      .catch(e => { if (alive) setError(e.message); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [lat, lon]);

  return (
    <div className="dsf-card">
      <div className="dsf-card-title" style={{ marginBottom: 10 }}>สภาพอากาศ{weather?.locationName ? ` — ${weather.locationName}` : ""}</div>
      {loading && <div className="muted">กำลังโหลดสภาพอากาศ...</div>}
      {error && <div style={{ color: "var(--red)", fontSize: 12 }}>{error}</div>}
      {weather && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {weather.icon
              ? <img src={WEATHER_ICON_URL(weather.icon)} alt="" width={44} height={44} />
              : <Sun size={34} color="var(--orange)" />}
            <div>
              <div className="num" style={{ fontSize: 22, fontWeight: 700 }}>{weather.temp}°C</div>
              <div className="muted" style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                <Wind size={12} /> ลม {weather.windSpeed} ม./วิ <Droplets size={12} /> {weather.humidity}%
              </div>
              <div className="muted" style={{ textTransform: "capitalize" }}>{weather.description}</div>
            </div>
          </div>
          {weather.forecast?.length > 0 && (
            <div style={{ display: "flex", gap: 10, marginTop: 12, overflowX: "auto" }}>
              {weather.forecast.map((f, i) => (
                <div key={i} style={{ textAlign: "center", flexShrink: 0 }}>
                  <div className="muted">{f.date.slice(5)}</div>
                  {f.icon && <img src={WEATHER_ICON_URL(f.icon)} alt="" width={28} height={28} />}
                  <div className="num" style={{ fontSize: 12, fontWeight: 700 }}>{f.temp}°</div>
                </div>
              ))}
            </div>
          )}
          {usingDefault && <div className="muted" style={{ marginTop: 10 }}>สวนนี้ยังไม่ได้ตั้งพิกัด — แสดงข้อมูลอากาศของพัทยาแทน (ตั้งค่าพิกัดได้ตอนสร้าง/แก้ไขสวน)</div>}
        </>
      )}
    </div>
  );
}

/** กราฟดิน 2 แกน — ซ้าย: pH/OM/EC (สเกลเล็ก) ขวา: P/K/Ca/Mg (สเกลใหญ่กว่า) แสดง 7 ครั้งล่าสุด */
function SoilDualAxisChart({ soil, height = 220 }) {
  const trend = [...soil]
    .sort((a, b) => a.reading_date.localeCompare(b.reading_date))
    .slice(-7)
    .map(s => ({
      d: fmtDate(s.reading_date),
      ph: s.ph, om: s.om, ec: s.ec,
      p: s.p, k: s.k, ca: s.ca, mg: s.mg,
    }));

  if (trend.length === 0) {
    return <div className="muted" style={{ padding: "24px 0", textAlign: "center" }}>ยังไม่มีข้อมูลดิน</div>;
  }

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={trend} margin={{ left: 4, right: 4, top: 4, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="d" tick={{ fontSize: 10, fill: "var(--ink-soft)" }} axisLine={false} tickLine={false} />
          <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "var(--ink-soft)" }} axisLine={false} tickLine={false} width={30}
                 label={{ value: "pH/OM/EC", angle: -90, position: "insideLeft", fontSize: 10, fill: "var(--ink-soft)" }} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: "var(--ink-soft)" }} axisLine={false} tickLine={false} width={34}
                 label={{ value: "P/K/Ca/Mg", angle: 90, position: "insideRight", fontSize: 10, fill: "var(--ink-soft)" }} />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
          <Legend wrapperStyle={{ fontSize: 10.5 }} />
          <Line yAxisId="left" type="monotone" dataKey="ph" name="pH" stroke="var(--blue)" strokeWidth={2} dot={{ r: 2.5 }} />
          <Line yAxisId="left" type="monotone" dataKey="om" name="OM %" stroke="var(--green)" strokeWidth={2} dot={{ r: 2.5 }} />
          <Line yAxisId="left" type="monotone" dataKey="ec" name="EC" stroke="var(--orange)" strokeWidth={2} dot={{ r: 2.5 }} />
          <Line yAxisId="right" type="monotone" dataKey="p" name="P" stroke="#9B6FE0" strokeWidth={2} dot={{ r: 2.5 }} />
          <Line yAxisId="right" type="monotone" dataKey="k" name="K" stroke="#3CC4BD" strokeWidth={2} dot={{ r: 2.5 }} />
          <Line yAxisId="right" type="monotone" dataKey="ca" name="Ca" stroke="#1E8C86" strokeWidth={2} dot={{ r: 2.5 }} />
          <Line yAxisId="right" type="monotone" dataKey="mg" name="Mg" stroke="#D45233" strokeWidth={2} dot={{ r: 2.5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function SoilTrendWidget({ soil }) {
  return (
    <div className="dsf-card">
      <div className="dsf-card-title" style={{ marginBottom: 4 }}>แนวโน้มค่าวิเคราะห์ดิน</div>
      <SoilDualAxisChart soil={soil} height={190} />
    </div>
  );
}

const DONUT_COLORS = ["#2BA8A2", "#5DADE2", "#FFD23F", "#EF6C4A", "#1E8C86", "#3CC4BD", "#E6B800", "#D45233"];
const INCOME_DONUT_COLORS = ["#1E9E5A", "#27AE60", "#4FD188", "#2BA8A2", "#3CC4BD", "#7FE0B4"];
const EXPENSE_DONUT_COLORS = ["#EF6C4A", "#D45233", "#FF8A6A", "#E6B800", "#C0392B", "#F4A261"];

function DonutCard({ title, data, emptyLabel = "ยังไม่มีข้อมูล", colors = DONUT_COLORS }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="dsf-card">
      <div className="dsf-card-title" style={{ marginBottom: 4 }}>{title}</div>
      {total === 0 ? (
        <div className="muted" style={{ padding: "24px 0", textAlign: "center" }}>{emptyLabel}</div>
      ) : (
        <div style={{ height: 170 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" innerRadius={42} outerRadius={64} paddingAngle={2}>
                {data.map((entry, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v) => `฿${Number(v).toLocaleString()}`} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function IncomeExpenseDonuts({ transactions }) {
  const byCategory = (type) => {
    const buckets = {};
    transactions.filter(t => t.transaction_type === type).forEach(t => {
      buckets[t.category] = (buckets[t.category] || 0) + Number(t.amount || 0);
    });
    return Object.entries(buckets).map(([name, value]) => ({ name, value }));
  };
  return (
    <div className="dsf-two-col">
      <DonutCard title="สัดส่วนรายรับ" data={byCategory("income")} emptyLabel="ยังไม่มีรายรับในช่วงนี้" colors={INCOME_DONUT_COLORS} />
      <DonutCard title="สัดส่วนรายจ่าย" data={byCategory("expense")} emptyLabel="ยังไม่มีรายจ่ายในช่วงนี้" colors={EXPENSE_DONUT_COLORS} />
    </div>
  );
}


/* ============================================================
   EXPORT — CSV และ PDF (ผ่านหน้าต่างพิมพ์ของเบราว์เซอร์ เลือก "บันทึกเป็น PDF")
   ใช้ข้อมูลดิบทุกคอลัมน์ของแถว ไม่ใช่แค่ที่แสดงในตาราง (ครบถ้วนกว่าสำหรับเอาไปใช้ต่อ)
   ============================================================ */
function flattenExportValue(v) {
  if (v === null || v === undefined) return "";
  if (typeof v === "object") {
    if (v.tree_code) return v.tree_code;
    try { return JSON.stringify(v); } catch { return String(v); }
  }
  return v;
}

function exportRowsToCSV(filename, rows) {
  if (!rows.length) { window.alert("ไม่มีข้อมูลให้ export"); return; }
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(",")];
  rows.forEach(r => {
    lines.push(headers.map(h => `"${String(flattenExportValue(r[h])).replace(/"/g, '""')}"`).join(","));
  });
  const csv = "\uFEFF" + lines.join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

function exportRowsToPDF(title, rows) {
  if (!rows.length) { window.alert("ไม่มีข้อมูลให้ export"); return; }
  const headers = Object.keys(rows[0]);
  const headHtml = headers.map(h => `<th>${h}</th>`).join("");
  const bodyHtml = rows.map(r => `<tr>${headers.map(h => `<td>${flattenExportValue(r[h])}</td>`).join("")}</tr>`).join("");
  const win = window.open("", "_blank");
  if (!win) { window.alert("เบราว์เซอร์บล็อกป๊อปอัป กรุณาอนุญาตแล้วลองใหม่"); return; }
  win.document.write(`
    <html><head><title>${title}</title>
    <meta charset="utf-8" />
    <style>
      body { font-family: 'Noto Sans Thai', sans-serif; padding: 24px; }
      h2 { margin-bottom: 14px; }
      table { width: 100%; border-collapse: collapse; font-size: 11px; }
      th, td { border: 1px solid #ccc; padding: 5px 7px; text-align: left; white-space: nowrap; }
      th { background: #f0f0f0; }
    </style></head>
    <body>
      <h2>${title}</h2>
      <table><thead><tr>${headHtml}</tr></thead><tbody>${bodyHtml}</tbody></table>
      <script>window.onload = () => setTimeout(() => window.print(), 300);</script>
    </body></html>
  `);
  win.document.close();
}

function ListTable({ title, rows, columns, maxVisibleRows = 10, onAdd, addLabel = "เพิ่มรายการ", searchPlaceholder = "ค้นหา...", searchFn, onEdit, onDelete, extraHeader }) {
  const [q, setQ] = useState("");
  const [colFilters, setColFilters] = useState({});

  function cellFilterValue(col, r) {
    if (col.filterValue) return col.filterValue(r);
    const v = r[col.key];
    return v === null || v === undefined ? "" : String(v);
  }

  const bySearch = searchFn && q ? rows.filter(r => searchFn(r, q)) : rows;
  const filtered = bySearch.filter(r => {
    for (const col of columns) {
      const active = colFilters[col.key];
      if (!active) continue;
      if (cellFilterValue(col, r) !== active) return false;
    }
    return true;
  });

  const needsScroll = filtered.length > maxVisibleRows;
  const hasActions = !!(onEdit || onDelete);
  const hasColumnFilters = columns.some(c => c.filterable !== false);

  function uniqueValuesFor(col) {
    const vals = new Set();
    rows.forEach(r => { const v = cellFilterValue(col, r); if (v !== "") vals.add(v); });
    return Array.from(vals).sort();
  }

  return (
    <div className="dsf-card">
      <div className="dsf-card-head">
        <div className="dsf-card-title">{title} <span className="muted">({filtered.length})</span></div>
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          {extraHeader}
          <button className="dsf-icon-btn" style={{ width: "auto", padding: "0 10px" }} title="Export CSV"
                  onClick={() => exportRowsToCSV(`${title}.csv`, filtered)}>
            <Download size={13} /> <span style={{ fontSize: 11.5, marginLeft: 4 }}>CSV</span>
          </button>
          <button className="dsf-icon-btn" style={{ width: "auto", padding: "0 10px" }} title="Export PDF (พิมพ์)"
                  onClick={() => exportRowsToPDF(title, filtered)}>
            <Download size={13} /> <span style={{ fontSize: 11.5, marginLeft: 4 }}>PDF</span>
          </button>
          {onAdd && <button className="dsf-btn-primary-sm" onClick={onAdd}><Plus size={13} /> {addLabel}</button>}
        </div>
      </div>
      {searchFn && (
        <div className="dsf-search-inline">
          <Search size={14} />
          <input placeholder={searchPlaceholder} value={q} onChange={e => setQ(e.target.value)} />
        </div>
      )}
      {Object.values(colFilters).some(Boolean) && (
        <button onClick={() => setColFilters({})} className="chip" style={{ background: "var(--red-soft)", color: "var(--red)", border: "none", cursor: "pointer", marginBottom: 8 }}>
          <X size={11} /> ล้างตัวกรองคอลัมน์
        </button>
      )}
      <div className="dsf-table-wrap" style={needsScroll ? { maxHeight: maxVisibleRows * 42 + 68, overflowY: "auto" } : undefined}>
        <table className="dsf-table">
          <thead>
            <tr style={needsScroll ? { position: "sticky", top: 0, zIndex: 1 } : undefined}>
              {columns.map(c => <th key={c.key}>{c.label}</th>)}
              {hasActions && <th style={{ textAlign: "right" }}>จัดการ</th>}
            </tr>
            {hasColumnFilters && (
              <tr className="dsf-filter-row" style={needsScroll ? { position: "sticky", top: 32, zIndex: 1, background: "var(--surface)" } : undefined}>
                {columns.map(c => (
                  <th key={c.key}>
                    {c.filterable !== false && (
                      <select value={colFilters[c.key] || ""} onChange={e => setColFilters(f => ({ ...f, [c.key]: e.target.value }))}>
                        <option value="">ทั้งหมด</option>
                        {uniqueValuesFor(c).map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                    )}
                  </th>
                ))}
                {hasActions && <th />}
              </tr>
            )}
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td className="dsf-empty-cell" colSpan={columns.length + (hasActions ? 1 : 0)}>ยังไม่มีข้อมูล</td></tr>
            )}
            {filtered.map((r, i) => (
              <tr key={r.id ?? i}>
                {columns.map(c => <td key={c.key}>{c.render ? c.render(r) : (r[c.key] ?? "-")}</td>)}
                {hasActions && (
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    {onEdit && (
                      <button onClick={() => onEdit(r)} title="แก้ไข" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 7, padding: 5, marginRight: 4, cursor: "pointer" }}>
                        <Pencil size={12} color="var(--ink-soft)" />
                      </button>
                    )}
                    {onDelete && (
                      <button onClick={() => onDelete(r)} title="ลบ" style={{ background: "var(--red-soft)", border: "1px solid var(--red-soft)", borderRadius: 7, padding: 5, cursor: "pointer" }}>
                        <Trash2 size={12} color="var(--red)" />
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {needsScroll && <div className="muted" style={{ marginTop: 8 }}>เลื่อนดูรายการทั้งหมดในตาราง ({filtered.length} รายการ)</div>}
    </div>
  );
}

/* ============================================================
   SIDEBAR / TOPBAR
   ============================================================ */
function Sidebar({ page, onNavigate, open, onClose, farms, farmId, onFarmChange, onAddFarm, userEmail }) {
  return (
    <>
      <div className={`dsf-sidebar-overlay ${open ? "open" : ""}`} onClick={onClose} />
      <aside className={`dsf-sidebar ${open ? "open" : ""}`}>
        <div className="dsf-logo">
          <div className="dsf-logo-title"><TreeDeciduous size={20} color="var(--sidebar-accent)" /> Durian Smart Farm</div>
          <div className="dsf-logo-sub">Admin Dashboard</div>
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            <select className="dsf-farm-select" style={{ marginTop: 0, flex: 1 }} value={farmId || ""} onChange={e => onFarmChange(e.target.value)}>
              {farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
            <button onClick={onAddFarm} title="เพิ่มสวนใหม่" style={{ background: "var(--sidebar-bg-2)", border: "1px solid var(--sidebar-border)", borderRadius: 9, width: 32, flexShrink: 0, color: "var(--sidebar-accent)", cursor: "pointer" }}>
              <Plus size={15} />
            </button>
          </div>
        </div>

        <nav className="dsf-nav">
          {NAV_ITEMS.map(n => {
            const Icon = n.icon;
            return (
              <button key={n.key} className={`dsf-nav-item ${page === n.key ? "active" : ""}`} onClick={() => onNavigate(n.key)}>
                <Icon size={17} /> {n.label}
              </button>
            );
          })}
        </nav>

        <div>
          <div className="dsf-sidebar-divider" />
          <button className={`dsf-nav-item ${page === "settings" ? "active" : ""}`} onClick={() => onNavigate("settings")}>
            <Settings size={17} /> ตั้งค่า
          </button>
          <button className={`dsf-nav-item ${page === "support" ? "active" : ""}`} onClick={() => onNavigate("support")}>
            <LifeBuoy size={17} /> ช่วยเหลือ
          </button>
          <div className="dsf-user-card">
            <div className="dsf-user-avatar">{(userEmail || "?")[0].toUpperCase()}</div>
            <div style={{ minWidth: 0 }}>
              <div className="dsf-user-name" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{userEmail}</div>
              <div className="dsf-user-role">ผู้ดูแลสวน</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

function NotificationsPanel({ notifications, onMarkRead, onMarkAllRead }) {
  return (
    <div style={{ position: "absolute", top: 48, right: 0, width: 300, maxHeight: 380, overflowY: "auto", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 30 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>
        <span style={{ fontWeight: 700, fontSize: 13 }}>การแจ้งเตือน</span>
        <button onClick={onMarkAllRead} style={{ fontSize: 11, color: "var(--green)", background: "none", border: "none", cursor: "pointer" }}>อ่านทั้งหมด</button>
      </div>
      {notifications.length === 0 && <div style={{ padding: 16, fontSize: 12, color: "var(--ink-soft)" }}>ไม่มีการแจ้งเตือน</div>}
      {notifications.map(n => (
        <div key={n.id} onClick={() => onMarkRead(n.id)}
             style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)", cursor: "pointer", background: n.is_read ? "transparent" : "var(--green-soft)" }}>
          <div style={{ fontSize: 12.5, fontWeight: 600 }}>{n.title}</div>
          {n.body && <div style={{ fontSize: 11.5, color: "var(--ink-soft)" }}>{n.body}</div>}
          <div style={{ fontSize: 10, color: "var(--ink-soft)", marginTop: 2 }}>{new Date(n.created_at).toLocaleString("th-TH")}</div>
        </div>
      ))}
    </div>
  );
}

function DateFilterButton({ range, onChange }) {
  const [open, setOpen] = useState(false);
  const activeLabel = DATE_PRESETS.find(p => p.key === range.preset)?.label
    || (range.preset === "custom" ? "กำหนดเอง" : "ทั้งหมด");

  function selectPreset(key) {
    onChange({ preset: key, ...presetToRange(key) });
    setOpen(false);
  }

  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <button className="dsf-icon-btn" style={{ width: "auto", padding: "0 12px", gap: 6, display: "flex", alignItems: "center" }} onClick={() => setOpen(o => !o)}>
        <CalendarRange size={15} />
        <span style={{ fontSize: 12.5, fontWeight: 600 }}>{activeLabel}</span>
      </button>
      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 25 }} onClick={() => setOpen(false)} />
          <div style={{ position: "absolute", top: 44, right: 0, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 12, boxShadow: "var(--shadow-md)", zIndex: 30, width: 260 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
              {DATE_PRESETS.map(p => (
                <button key={p.key} className={`dsf-preset-btn ${range.preset === p.key ? "active" : ""}`} onClick={() => selectPreset(p.key)}>
                  {p.label}
                </button>
              ))}
            </div>
            <div className="muted" style={{ marginBottom: 4 }}>กำหนดช่วงเอง</div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <input type="date" style={{ flex: 1, minWidth: 0 }} value={range.start || ""} onChange={e => onChange({ preset: "custom", start: e.target.value, end: range.end })} />
              <span className="muted">ถึง</span>
              <input type="date" style={{ flex: 1, minWidth: 0 }} value={range.end || ""} onChange={e => onChange({ preset: "custom", start: range.start, end: e.target.value })} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Topbar({ onMenuClick, onQuickAdd, unread, notifOpen, setNotifOpen, notifications, onMarkRead, onMarkAllRead, onSignOut, showDateFilter, dateRange, onDateRangeChange }) {
  return (
    <div className="dsf-topbar">
      <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
        <button className="dsf-hamburger" onClick={onMenuClick}><Menu size={20} /></button>
        <div className="dsf-search">
          <Search size={14} />
          <input placeholder="ค้นหา..." />
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        {showDateFilter && <DateFilterButton range={dateRange} onChange={onDateRangeChange} />}
        <button className="dsf-btn-primary" onClick={onQuickAdd}>
          <Plus size={15} /> <span className="dsf-btn-label">เพิ่มข้อมูล</span>
        </button>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <button className="dsf-icon-btn" onClick={() => setNotifOpen(o => !o)}>
            <Bell size={16} />
            {unread > 0 && <span className="dsf-badge">{unread}</span>}
          </button>
          {notifOpen && (
            <>
              <div style={{ position: "fixed", inset: 0, zIndex: 25 }} onClick={() => setNotifOpen(false)} />
              <NotificationsPanel notifications={notifications} onMarkRead={onMarkRead} onMarkAllRead={onMarkAllRead} />
            </>
          )}
        </div>
        <button className="dsf-icon-btn" onClick={onSignOut} title="ออกจากระบบ" style={{ flexShrink: 0 }}><LogOut size={16} /></button>
      </div>
    </div>
  );
}

/* ============================================================
   DATA HOOK
   ============================================================ */
function useFarmData(farmId) {
  const [state, setState] = useState({
    loading: true, error: null,
    kpis: null, alerts: [], trees: [], operations: [], harvest: [], soil: [],
    tasks: [], transactions: [], members: [],
  });

  const refresh = useCallback(async () => {
    if (!farmId) return;
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const [kpis, alerts, trees, operations, harvest, soil, tasks, transactions, members] = await Promise.all([
        getDashboardKpis(farmId), listActiveAlerts(farmId), listTrees(farmId),
        listOperations(farmId), listHarvest(farmId), listSoilReadings(farmId),
        listTasks(farmId), listTransactions(farmId), listFarmMembers(farmId),
      ]);
      setState({ loading: false, error: null, kpis, alerts, trees, operations, harvest, soil, tasks, transactions, members });
    } catch (err) {
      setState(s => ({ ...s, loading: false, error: err.message }));
    }
  }, [farmId]);

  useEffect(() => { refresh(); }, [refresh]);

  return { ...state, refresh };
}

function monthlyYield(harvest) {
  const buckets = {};
  harvest.forEach(h => {
    const m = h.harvest_date?.slice(0, 7);
    if (!m) return;
    buckets[m] = (buckets[m] || 0) + Number(h.weight_kg || 0);
  });
  return Object.entries(buckets).sort().slice(-6).map(([m, kg]) => ({ m: m.slice(5), kg }));
}

/* ============================================================
   PAGE: DASHBOARD
   ============================================================ */
function DailyChecklist({ tasks, members, onToggle, onOpenQuick, onEdit, onDelete }) {
  const total = tasks.length;
  const done = tasks.filter(t => t.status === TASK_STATUS_DONE).length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="dsf-card">
      <div className="dsf-card-head">
        <div>
          <div className="dsf-card-title">เช็คลิสต์วันนี้</div>
          <div className="muted">{done}/{total} งานเสร็จแล้ว</div>
        </div>
        <div className="disp" style={{ fontSize: 22, fontWeight: 700, color: "var(--green)" }}>{pct}%</div>
      </div>
      <div className="dsf-progress-track" style={{ marginBottom: 10 }}>
        <div className="dsf-progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <div>
        {tasks.length === 0 && <div className="muted" style={{ padding: "10px 0" }}>ยังไม่มีงานในสวนนี้</div>}
        {tasks.slice(0, 6).map(t => {
          const isDone = t.status === TASK_STATUS_DONE;
          return (
            <div key={t.id} className="dsf-checklist-item">
              <button onClick={() => onToggle(t)} style={{ background: "none", border: "none", padding: 0, marginTop: 1, cursor: "pointer", color: isDone ? "var(--green)" : "var(--ink-soft)" }}>
                {isDone ? <CheckSquare size={17} /> : <Square size={17} />}
              </button>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, textDecoration: isDone ? "line-through" : "none", color: isDone ? "var(--ink-soft)" : "var(--ink)" }}>{t.title}</div>
                {t.description && <div className="muted">{t.description}</div>}
                <div style={{ display: "flex", gap: 6, marginTop: 4, alignItems: "center", flexWrap: "wrap" }}>
                  {t.due_date && <span className="muted">กำหนด {fmtDate(t.due_date)}</span>}
                  <PriorityChip priority={t.priority} />
                  <TaskStatusChip status={t.status} />
                  {t.assigned_to && <span className="muted">มอบหมาย: {memberName(members, t.assigned_to)}</span>}
                </div>
              </div>
              <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                <button onClick={() => onEdit(t)} title="แก้ไข" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 7, padding: 4, cursor: "pointer" }}>
                  <Pencil size={11} color="var(--ink-soft)" />
                </button>
                <button onClick={() => onDelete(t)} title="ลบ" style={{ background: "var(--red-soft)", border: "1px solid var(--red-soft)", borderRadius: 7, padding: 4, cursor: "pointer" }}>
                  <Trash2 size={11} color="var(--red)" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <button onClick={() => onOpenQuick("task")} style={{ width: "100%", marginTop: 10, border: "1px dashed var(--border)", background: "none", borderRadius: 10, padding: "8px", fontSize: 12.5, color: "var(--ink-soft)", cursor: "pointer" }}>
        + เพิ่มงาน
      </button>
    </div>
  );
}

function ActiveAlertsCard({ alerts }) {
  return (
    <div className="dsf-card">
      <div className="dsf-card-head">
        <div className="dsf-card-title">การแจ้งเตือนที่ต้องดำเนินการ</div>
        <span className="chip" style={{ background: "var(--red-soft)", color: "var(--red)" }}>{alerts.length} รายการ</span>
      </div>
      {alerts.length === 0 && <div className="muted" style={{ padding: "10px 0" }}>ไม่มีการแจ้งเตือนขณะนี้</div>}
      {alerts.map(a => {
        const t = TONE[SEVERITY_TONE[a.severity] || "blue"];
        return (
          <div key={a.id} style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: t.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <AlertTriangle size={15} color={t.fg} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{a.title}</div>
              <div className="muted">{a.message}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DashboardView({ data, dateRange, farm, onOpenQuick, onToggleTask, onEditTask, onDeleteTask }) {
  const { kpis, alerts, harvest, soil, transactions, tasks, members, loading } = data;

  const filteredHarvest = filterByDate(harvest, "harvest_date", dateRange);
  const filteredTransactions = filterByDate(transactions, "transaction_date", dateRange);
  const yieldSum = filteredHarvest.reduce((s, h) => s + Number(h.weight_kg || 0), 0);
  const revenueSum = filteredTransactions.filter(t => t.transaction_type === "income").reduce((s, t) => s + Number(t.amount || 0), 0);
  const expenseSum = filteredTransactions.filter(t => t.transaction_type === "expense").reduce((s, t) => s + Number(t.amount || 0), 0);

  const cards = kpis ? [
    { label: "ต้นทุเรียนทั้งหมด", value: kpis.total_trees, unit: "ต้น", icon: TreeDeciduous, tone: "green" },
    { label: "ผลผลิตในช่วงที่เลือก", value: yieldSum.toLocaleString(), unit: "กก.", icon: Sprout, tone: "green" },
    { label: "รายรับในช่วงที่เลือก", value: revenueSum.toLocaleString(), unit: "บาท", icon: Wallet, tone: "blue" },
    { label: "กำไรสุทธิในช่วงที่เลือก", value: (revenueSum - expenseSum).toLocaleString(), unit: "บาท", icon: TrendingUp, tone: "blue" },
    { label: "งานค้าง", value: kpis.open_tasks, unit: "รายการ", icon: ClipboardList, tone: "orange" },
    { label: "ต้นที่ป่วย", value: kpis.sick_trees, unit: "ต้น", icon: Leaf, tone: "red" },
  ] : [];

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div>
        <div className="disp" style={{ fontSize: 19, fontWeight: 700 }}>ภาพรวมสวน</div>
        <div className="spike" />
        {loading && !kpis ? <div className="muted">กำลังโหลดข้อมูล...</div> : (
          <div className="dsf-kpi-grid">{cards.map((k, i) => <KpiCard key={i} {...k} />)}</div>
        )}
      </div>

      <div className="dsf-two-col">
        <DailyChecklist tasks={tasks} members={members} onToggle={onToggleTask} onOpenQuick={onOpenQuick} onEdit={onEditTask} onDelete={onDeleteTask} />
        <ActiveAlertsCard alerts={alerts} />
      </div>

      <IncomeExpenseDonuts transactions={filteredTransactions} />

      <div className="dsf-three-col">
        <div className="dsf-card dsf-span-2">
          <div className="dsf-card-title" style={{ marginBottom: 4 }}>ผลผลิตรายเดือน (กก.)</div>
          <div style={{ height: 150 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyYield(filteredHarvest)}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="m" tick={{ fontSize: 11, fill: "var(--ink-soft)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--ink-soft)" }} axisLine={false} tickLine={false} width={30} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="kg" fill="var(--green)" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <WeatherWidget farm={farm} />
      </div>

      <div className="dsf-card">
        <div className="dsf-card-title" style={{ marginBottom: 4 }}>แนวโน้มค่าวิเคราะห์ดิน</div>
        <SoilDualAxisChart soil={soil} height={280} />
      </div>
    </div>
  );
}

/* ============================================================
   PAGE: TREES
   ============================================================ */
function memberName(members, id) {
  if (!id) return "-";
  return members.find(m => m.id === id)?.name || "-";
}

function TreesView({ trees, onOpenQuick, onEdit, onDelete }) {
  const healthCounts = {};
  trees.forEach(t => { healthCounts[t.health_status] = (healthCounts[t.health_status] || 0) + 1; });
  const healthData = Object.entries(healthCounts).map(([name, value]) => ({ name, value }));

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div className="dsf-two-col">
        <div className="dsf-card">
          <div className="dsf-card-title" style={{ marginBottom: 4 }}>สรุปสุขภาพต้นทุเรียน</div>
          {trees.length === 0 ? <div className="muted" style={{ padding: "24px 0", textAlign: "center" }}>ยังไม่มีข้อมูล</div> : (
            <div style={{ height: 170 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={healthData} dataKey="value" nameKey="name" innerRadius={42} outerRadius={64} paddingAngle={2}>
                    {healthData.map((entry, i) => {
                      const tone = TONE[HEALTH_TONE[entry.name] || "green"];
                      return <Cell key={i} fill={tone.fg} />;
                    })}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
        <div className="dsf-card" style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 8 }}>
          <div className="dsf-card-title">ภาพรวม</div>
          <div className="num" style={{ fontSize: 30, fontWeight: 800, color: "var(--green)" }}>{trees.length}</div>
          <div className="muted">ต้นทุเรียนทั้งหมดในสวนนี้</div>
        </div>
      </div>

      <ListTable
        title="สวน/ต้นไม้"
        rows={trees}
        onAdd={() => onOpenQuick("tree")}
        onEdit={onEdit}
        onDelete={onDelete}
        addLabel="ลงทะเบียนต้น"
        searchFn={(t, q) => (t.tree_code + t.variety).toLowerCase().includes(q.toLowerCase())}
        columns={[
          { key: "tree_code", label: "รหัส" },
          { key: "variety", label: "พันธุ์" },
          { key: "planted_date", label: "วันที่ปลูก", render: t => fmtDate(t.planted_date) },
          { key: "age", label: "อายุ (ปี)", render: t => calcAgeYears(t.planted_date) ?? "-" },
          { key: "health_status", label: "สุขภาพ", render: t => <HealthChip health={t.health_status} /> },
          { filterable: false, key: "coords", label: "พิกัด", render: t => (t.latitude && t.longitude) ? `${Number(t.latitude).toFixed(4)}, ${Number(t.longitude).toFixed(4)}` : "-" },
          { filterable: false, key: "notes", label: "หมายเหตุ" },
        ]}
      />
    </div>
  );
}

/* ============================================================
   PAGE: OPERATIONS (Activity Log)
   ============================================================ */
/* ============================================================
   PAGE: TASKS (งานที่ต้องทำ)
   ============================================================ */
function TasksView({ tasks, members, onOpenQuick, onToggle, onEdit, onDelete }) {
  const statusCounts = {};
  tasks.forEach(t => { statusCounts[t.status] = (statusCounts[t.status] || 0) + 1; });
  const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  const total = tasks.length;
  const done = tasks.filter(t => t.status === TASK_STATUS_DONE).length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div className="dsf-two-col">
        <div className="dsf-card">
          <div className="dsf-card-title" style={{ marginBottom: 4 }}>สรุปสถานะงาน</div>
          {tasks.length === 0 ? <div className="muted" style={{ padding: "24px 0", textAlign: "center" }}>ยังไม่มีงาน</div> : (
            <div style={{ height: 170 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={42} outerRadius={64} paddingAngle={2}>
                    {statusData.map((entry, i) => {
                      const tone = TONE[TASK_STATUS_TONE[entry.name] || "blue"];
                      return <Cell key={i} fill={tone.fg} />;
                    })}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
        <div className="dsf-card" style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 8 }}>
          <div className="dsf-card-title">ความคืบหน้ารวม</div>
          <div className="num" style={{ fontSize: 30, fontWeight: 800, color: "var(--green)" }}>{pct}%</div>
          <div className="dsf-progress-track"><div className="dsf-progress-fill" style={{ width: `${pct}%` }} /></div>
          <div className="muted">{done}/{total} งานเสร็จแล้ว</div>
        </div>
      </div>

      <ListTable
        title="งานที่ต้องทำ"
        rows={tasks}
        onAdd={() => onOpenQuick("task")}
        onEdit={onEdit}
        onDelete={onDelete}
        addLabel="เพิ่มงาน"
        searchFn={(t, q) => (t.title || "").toLowerCase().includes(q.toLowerCase())}
        columns={[
          { key: "toggle", label: "", render: t => (
            <button onClick={() => onToggle(t)} style={{ background: "none", border: "none", cursor: "pointer", color: t.status === TASK_STATUS_DONE ? "var(--green)" : "var(--ink-soft)" }}>
              {t.status === TASK_STATUS_DONE ? <CheckSquare size={16} /> : <Square size={16} />}
            </button>
          ) },
          { key: "title", label: "ชื่องาน" },
          { filterable: false, key: "description", label: "รายละเอียด" },
          { key: "due_date", label: "กำหนดเสร็จ", render: t => fmtDate(t.due_date) },
          { key: "priority", label: "ความสำคัญ", render: t => <PriorityChip priority={t.priority} />, filterValue: t => PRIORITY_LABEL[t.priority] || t.priority },
          { key: "status", label: "สถานะ", render: t => <TaskStatusChip status={t.status} /> },
          { key: "assigned_to", label: "ผู้ปฏิบัติงาน", render: t => memberName(members, t.assigned_to), filterValue: t => memberName(members, t.assigned_to) },
          { key: "created_by", label: "ผู้กำหนดงาน", render: t => memberName(members, t.created_by), filterValue: t => memberName(members, t.created_by) },
        ]}
      />
    </div>
  );
}

function OperationsView({ operations, dateRange, members, onOpenQuick, onEdit, onDelete }) {
  const rows = filterByDate(operations, "performed_at", dateRange);
  const typeCounts = {};
  rows.forEach(o => { typeCounts[o.operation_type] = (typeCounts[o.operation_type] || 0) + 1; });
  const typeData = Object.entries(typeCounts).map(([name, count]) => ({ name, count }));

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div className="dsf-card">
        <div className="dsf-card-title" style={{ marginBottom: 4 }}>จำนวนกิจกรรมแยกตามประเภท</div>
        {typeData.length === 0 ? <div className="muted" style={{ padding: "24px 0", textAlign: "center" }}>ยังไม่มีข้อมูล</div> : (
          <div style={{ height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10.5, fill: "var(--ink-soft)" }} axisLine={false} tickLine={false} interval={0} angle={-15} textAnchor="end" height={50} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "var(--ink-soft)" }} axisLine={false} tickLine={false} width={26} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="count" fill="var(--green)" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <ListTable
        title="Activity Log — บันทึกกิจกรรมสวน"
        rows={rows}
        onAdd={() => onOpenQuick("operation")}
        onEdit={onEdit}
        onDelete={onDelete}
        addLabel="บันทึกกิจกรรมใหม่"
        searchFn={(o, q) => (o.operation_type || "").toLowerCase().includes(q.toLowerCase())}
        columns={[
          { key: "date", label: "วันที่", render: o => fmtDate(o.performed_at) },
          { key: "type", label: "ประเภท", render: o => (
            <span className="chip" style={{ background: "var(--green-soft)", color: "var(--green)" }}>{o.operation_type}</span>
          ) },
          { key: "tree", label: "ต้น/แปลง", render: o => o.trees?.tree_code || "ทั้งสวน" },
          { key: "performed_by", label: "ผู้ปฏิบัติงาน", render: o => memberName(members, o.performed_by), filterValue: o => memberName(members, o.performed_by) },
          { filterable: false, key: "description", label: "หมายเหตุ" },
        ]}
      />
    </div>
  );
}

/* ============================================================
   PAGE: HARVEST
   ============================================================ */
function HarvestView({ harvest, dateRange, members, onOpenQuick, onEdit, onDelete }) {
  const rows = filterByDate(harvest, "harvest_date", dateRange);
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div className="dsf-card">
        <div className="dsf-card-title" style={{ marginBottom: 4 }}>ผลผลิตรายเดือน (กก.)</div>
        {rows.length === 0 ? <div className="muted" style={{ padding: "24px 0", textAlign: "center" }}>ยังไม่มีข้อมูล</div> : (
          <div style={{ height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyYield(rows)}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="m" tick={{ fontSize: 11, fill: "var(--ink-soft)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--ink-soft)" }} axisLine={false} tickLine={false} width={30} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="kg" fill="var(--green)" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <ListTable
        title="ผลผลิต"
        rows={rows}
        onAdd={() => onOpenQuick("harvest")}
        onEdit={onEdit}
        onDelete={onDelete}
        addLabel="บันทึกผลผลิต"
        searchFn={(h, q) => (h.grade || "").toLowerCase().includes(q.toLowerCase())}
        columns={[
          { key: "harvest_date", label: "วันที่ขาย", render: h => fmtDate(h.harvest_date) },
          { filterable: false, key: "weight_kg", label: "น้ำหนัก (กก.)" },
          { key: "grade", label: "เกรด" },
          { filterable: false, key: "price_per_kg", label: "ราคา/กก.", render: h => h.price_per_kg ? `฿${Number(h.price_per_kg).toLocaleString()}` : "-" },
          { filterable: false, key: "total_amount", label: "รวม", render: h => h.total_amount ? `฿${Number(h.total_amount).toLocaleString()}` : "-" },
          { key: "recorded_by", label: "ผู้บันทึก", render: h => memberName(members, h.recorded_by), filterValue: h => memberName(members, h.recorded_by) },
        ]}
      />
    </div>
  );
}

/* ============================================================
   PAGE: FINANCE
   ============================================================ */
function FinanceView({ transactions, dateRange, members, onOpenQuick, onEdit, onDelete }) {
  const rows = filterByDate(transactions, "transaction_date", dateRange);
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <IncomeExpenseDonuts transactions={rows} />
      <ListTable
        title="รายรับ-รายจ่าย"
        rows={rows}
        onAdd={() => onOpenQuick("expense")}
        onEdit={onEdit}
        onDelete={onDelete}
        addLabel="เพิ่มรายการ"
        searchFn={(t, q) => (t.category || "").toLowerCase().includes(q.toLowerCase())}
        columns={[
          { key: "transaction_date", label: "วันที่", render: t => fmtDate(t.transaction_date) },
          { key: "type", label: "ประเภท", render: t => (
            <span className="chip" style={{ background: t.transaction_type === "income" ? "var(--green-soft)" : "var(--red-soft)", color: t.transaction_type === "income" ? "var(--green)" : "var(--red)" }}>
              {t.transaction_type === "income" ? "รายรับ" : "รายจ่าย"}
            </span>
          ), filterValue: t => t.transaction_type === "income" ? "รายรับ" : "รายจ่าย" },
          { key: "category", label: "หมวด" },
          { filterable: false, key: "amount", label: "จำนวนเงิน", render: t => (
            <span className="num" style={{ fontWeight: 700, color: t.transaction_type === "income" ? "var(--green)" : "var(--red)" }}>
              {t.transaction_type === "income" ? "+" : "-"}฿{Number(t.amount).toLocaleString()}
            </span>
          ) },
          { filterable: false, key: "description", label: "หมายเหตุ" },
        ]}
      />
    </div>
  );
}

/* ============================================================
   PAGE: SOIL
   ============================================================ */
function SoilView({ soil, dateRange, members, onOpenQuick, onEdit, onDelete }) {
  const rows = filterByDate(soil, "reading_date", dateRange);
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div className="dsf-card">
        <div className="dsf-card-title" style={{ marginBottom: 4 }}>แนวโน้มค่าวิเคราะห์ดิน</div>
        <SoilDualAxisChart soil={rows} />
      </div>
      <ListTable
        title="ผลวิเคราะห์ดิน"
        rows={rows}
        onAdd={() => onOpenQuick("soil")}
        onEdit={onEdit}
        onDelete={onDelete}
        addLabel="บันทึกผล"
        columns={[
          { key: "reading_date", label: "วันที่", render: s => fmtDate(s.reading_date) },
          { key: "ph", label: "pH" }, { key: "ec", label: "EC" }, { key: "om", label: "OM" },
          { key: "p", label: "P" }, { key: "k", label: "K" }, { key: "ca", label: "Ca" }, { key: "mg", label: "Mg" },
          { key: "notes", label: "หน่วยงาน" },
          { key: "recorded_by", label: "ผู้บันทึก", render: s => memberName(members, s.recorded_by), filterValue: s => memberName(members, s.recorded_by) },
        ]}
      />
    </div>
  );
}

/* ============================================================
   PAGE: WEATHER (สรุปสภาพอากาศปัจจุบัน — ต่อ OpenWeatherMap ภายหลัง)
   ============================================================ */
function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="dsf-card" style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={18} color="var(--green)" />
      </div>
      <div style={{ minWidth: 0 }}>
        <div className="num" style={{ fontWeight: 700, fontSize: 15 }}>{value}</div>
        <div className="muted">{label}</div>
      </div>
    </div>
  );
}

function WindCompass({ deg = 0, speed }) {
  return (
    <svg viewBox="0 0 120 120" width="120" height="120">
      <circle cx="60" cy="60" r="52" fill="none" stroke="var(--border)" strokeWidth="2" />
      <circle cx="60" cy="60" r="34" fill="none" stroke="var(--border-soft)" strokeWidth="1" />
      <text x="60" y="15" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--ink-soft)">N</text>
      <text x="60" y="113" textAnchor="middle" fontSize="10" fill="var(--ink-soft)">S</text>
      <text x="9" y="64" textAnchor="middle" fontSize="10" fill="var(--ink-soft)">W</text>
      <text x="111" y="64" textAnchor="middle" fontSize="10" fill="var(--ink-soft)">E</text>
      <g transform={`rotate(${deg} 60 60)`}>
        <line x1="60" y1="60" x2="60" y2="22" stroke="var(--red)" strokeWidth="3" strokeLinecap="round" />
        <polygon points="60,14 54,26 66,26" fill="var(--red)" />
      </g>
      <circle cx="60" cy="60" r="4" fill="var(--ink)" />
    </svg>
  );
}

const AQI_LABEL = { 1: "ดีมาก", 2: "ดี", 3: "ปานกลาง", 4: "แย่", 5: "แย่มาก" };
const AQI_COLOR = { 1: "#27AE60", 2: "#8FCB6B", 3: "#FFD23F", 4: "#EF6C4A", 5: "#8B2F5B" };

function WeatherView({ farm }) {
  const [weather, setWeather] = useState(null);
  const [air, setAir] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const lat = farm?.latitude ?? DEFAULT_COORDS.lat;
  const lon = farm?.longitude ?? DEFAULT_COORDS.lon;
  const usingDefault = farm?.latitude == null;

  useEffect(() => {
    let alive = true;
    setLoading(true); setError("");
    Promise.all([getWeather(lat, lon), getAirQuality(lat, lon).catch(() => null)])
      .then(([w, a]) => { if (alive) { setWeather(w); setAir(a); } })
      .catch(e => { if (alive) setError(e.message); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [lat, lon]);

  const now = new Date();

  if (loading) return <div className="muted">กำลังโหลดสภาพอากาศ...</div>;
  if (error) return <div style={{ color: "var(--red)", fontSize: 13 }}>{error}</div>;
  if (!weather) return null;

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div>
        <div className="disp" style={{ fontSize: 19, fontWeight: 700 }}>
          {now.toLocaleDateString("th-TH", { weekday: "long" })}, {now.toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" })}
        </div>
        <div className="muted">อัปเดตล่าสุด {now.toLocaleTimeString("th-TH")}</div>
      </div>

      {usingDefault && (
        <div className="muted" style={{ padding: 10, background: "var(--surface-2)", borderRadius: 10 }}>
          สวนนี้ยังไม่ได้ตั้งพิกัด — แสดงข้อมูลของพัทยาแทน (ตั้งค่าพิกัดได้ตอนเพิ่ม/แก้ไขสวน)
        </div>
      )}

      <div className="dsf-two-col">
        <div className="dsf-card" style={{ background: "linear-gradient(160deg, #BFE3EF, #E8F6F5)", border: "none" }}>
          <div className="chip" style={{ background: "#fff", color: "var(--ink)" }}><MapPin size={12} /> {weather.locationName}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 14, flexWrap: "wrap" }}>
            {weather.icon ? <img src={WEATHER_ICON_URL(weather.icon)} alt="" width={76} height={76} /> : <Sun size={56} color="var(--orange)" />}
            <div>
              <div className="num" style={{ fontSize: 42, fontWeight: 800, lineHeight: 1 }}>{weather.temp}°C</div>
              <div style={{ textTransform: "capitalize", fontWeight: 600, marginTop: 4 }}>{weather.description}</div>
              <div className="muted">สูงสุด {weather.tempMax}° / ต่ำสุด {weather.tempMin}°</div>
            </div>
          </div>
        </div>

        <div className="dsf-card">
          <div className="dsf-card-title" style={{ marginBottom: 10 }}>พยากรณ์ล่วงหน้า</div>
          <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
            {weather.forecast.map((f, i) => (
              <div key={i} style={{ textAlign: "center", flexShrink: 0, minWidth: 62, padding: "8px 4px", borderRadius: 12, background: i === 0 ? "var(--green-soft)" : "var(--surface-2)" }}>
                <div className="muted" style={{ fontWeight: 700 }}>{new Date(f.date).toLocaleDateString("th-TH", { weekday: "short" })}</div>
                <div className="muted">{f.date.slice(8, 10)}</div>
                {f.icon && <img src={WEATHER_ICON_URL(f.icon)} alt="" width={30} height={30} />}
                <div className="num" style={{ fontSize: 12.5, fontWeight: 700 }}>{f.temp}°</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dsf-three-col">
        <StatCard icon={Sunrise} label="พระอาทิตย์ขึ้น" value={weather.sunrise ? weather.sunrise.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }) : "-"} />
        <StatCard icon={Thermometer} label="รู้สึกเหมือน" value={`${weather.feelsLike}°C`} />
        <StatCard icon={Wind} label="ความเร็วลม" value={`${weather.windSpeed} ม./วิ`} />
        <StatCard icon={Sunset} label="พระอาทิตย์ตก" value={weather.sunset ? weather.sunset.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }) : "-"} />
        <StatCard icon={Eye} label="ทัศนวิสัย" value={weather.visibility ? `${(weather.visibility / 1000).toFixed(1)} กม.` : "-"} />
        <StatCard icon={Droplets} label="ความชื้น" value={`${weather.humidity}%`} />
      </div>

      <div className="dsf-two-col">
        <div className="dsf-card" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div className="dsf-card-title" style={{ alignSelf: "flex-start", marginBottom: 8 }}>ทิศทางลม</div>
          <WindCompass deg={weather.windDeg} />
          <div className="muted" style={{ marginTop: 6 }}>{weather.windSpeed} ม./วิ</div>
        </div>
        <div className="dsf-card">
          <div className="dsf-card-title" style={{ marginBottom: 8 }}>ตำแหน่งสวน</div>
          <iframe
            title="farm-map"
            style={{ width: "100%", height: 180, border: "none", borderRadius: 12 }}
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.03}%2C${lat - 0.03}%2C${lon + 0.03}%2C${lat + 0.03}&layer=mapnik&marker=${lat}%2C${lon}`}
          />
        </div>
      </div>

      <div className="dsf-two-col">
        <div className="dsf-card">
          <div className="dsf-card-title" style={{ marginBottom: 4 }}>โอกาสฝนตก (%)</div>
          <div style={{ height: 150 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weather.forecast.map(f => ({ day: new Date(f.date).toLocaleDateString("th-TH", { weekday: "short" }), rain: f.rainChance }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--ink-soft)" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "var(--ink-soft)" }} axisLine={false} tickLine={false} width={30} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="rain" fill="var(--blue)" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="dsf-card">
          <div className="dsf-card-title" style={{ marginBottom: 4 }}>ดัชนีคุณภาพอากาศ (AQI)</div>
          {!air || air.daily.length === 0 ? (
            <div className="muted" style={{ padding: "24px 0", textAlign: "center" }}>ไม่มีข้อมูล</div>
          ) : (
            <div style={{ height: 150 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={air.daily.map(d => ({ day: new Date(d.date).toLocaleDateString("th-TH", { weekday: "short" }), aqi: d.aqi }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--ink-soft)" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 11, fill: "var(--ink-soft)" }} axisLine={false} tickLine={false} width={20} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v) => AQI_LABEL[v] || v} />
                  <Bar dataKey="aqi" radius={[5, 5, 0, 0]}>
                    {air.daily.map((d, i) => <Cell key={i} fill={AQI_COLOR[d.aqi] || "var(--blue)"} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   PAGE: PHOTOS
   ============================================================ */
/** บีบอัด/ย่อขนาดรูปฝั่ง client ก่อนอัปโหลด (กว้างสุด 1600px, JPEG คุณภาพ 80%)
 * ลดพื้นที่ Supabase Storage ที่ใช้ลงมาก โดยคุณภาพยังเพียงพอสำหรับดูในแอป */
function compressImage(file, maxDim = 1600, quality = 0.8) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) { resolve(file); return; }
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width > height) { height = Math.round((height * maxDim) / width); width = maxDim; }
        else { width = Math.round((width * maxDim) / height); height = maxDim; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(blob => {
        URL.revokeObjectURL(url);
        if (!blob) { reject(new Error("บีบอัดรูปไม่สำเร็จ")); return; }
        const newName = file.name.replace(/\.[^.]+$/, "") + ".jpg";
        resolve(new File([blob], newName, { type: "image/jpeg" }));
      }, "image/jpeg", quality);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("อ่านไฟล์รูปไม่สำเร็จ")); };
    img.src = url;
  });
}

function PhotosView({ farmId }) {
  const [photos, setPhotos] = useState([]);
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setPhotos(await listPhotos(farmId, { category: category || undefined })); }
    catch (e) { setError(e.message); } finally { setLoading(false); }
  }, [farmId, category]);

  useEffect(() => { load(); }, [load]);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setError("");
    try {
      const compressed = await compressImage(file);
      await uploadPhoto(farmId, compressed, { category: category || "other" });
      await load();
    }
    catch (err) { setError(err.message); }
    finally {
      setUploading(false);
      if (cameraInputRef.current) cameraInputRef.current.value = "";
      if (galleryInputRef.current) galleryInputRef.current.value = "";
    }
  }

  async function handleDelete(p) {
    try { await deletePhoto(p); setPhotos(ps => ps.filter(x => x.id !== p.id)); }
    catch (e) { setError(e.message); }
  }

  async function handleDownload(p) {
    try {
      const res = await fetch(p.url);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = p.storage_path?.split("/").pop() || "photo.jpg";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) { setError("ดาวน์โหลดไม่สำเร็จ: " + e.message); }
  }

  return (
    <div className="dsf-card">
      <div className="dsf-card-head">
        <div className="dsf-card-title">คลังภาพ ({photos.length})</div>
        <div style={{ display: "flex", gap: 6 }}>
          <label className="dsf-btn-primary-sm" style={{ cursor: "pointer" }}>
            <Camera size={13} /> {uploading ? "..." : "ถ่ายภาพ"}
            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleFile} disabled={uploading} style={{ display: "none" }} />
          </label>
          <label className="dsf-btn-primary-sm" style={{ cursor: "pointer", background: "var(--blue)" }}>
            <ImageIcon size={13} /> {uploading ? "..." : "เลือกจากคลังภาพ"}
            <input ref={galleryInputRef} type="file" accept="image/*" onChange={handleFile} disabled={uploading} style={{ display: "none" }} />
          </label>
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
        <button onClick={() => setCategory("")} className="chip" style={{ background: category === "" ? "var(--green-soft)" : "var(--surface-2)", color: category === "" ? "var(--green)" : "var(--ink-soft)", border: "none", cursor: "pointer" }}>ทั้งหมด</button>
        {PHOTO_CATEGORIES.map(c => (
          <button key={c.value} onClick={() => setCategory(c.value)} className="chip" style={{ background: category === c.value ? "var(--green-soft)" : "var(--surface-2)", color: category === c.value ? "var(--green)" : "var(--ink-soft)", border: "none", cursor: "pointer" }}>{c.label}</button>
        ))}
      </div>

      {error && <div style={{ color: "var(--red)", fontSize: 12, marginBottom: 8 }}>{error}</div>}
      {loading ? (
        <div className="muted">กำลังโหลด...</div>
      ) : photos.length === 0 ? (
        <div className="muted" style={{ textAlign: "center", padding: "24px 0" }}>ยังไม่มีรูปภาพในหมวดนี้</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 10 }}>
          {photos.map(p => (
            <div key={p.id} style={{ position: "relative", aspectRatio: "1", borderRadius: 10, overflow: "hidden", background: "var(--surface-2)" }}>
              {p.url && <img src={p.url} alt={p.caption || ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
              <div style={{ position: "absolute", top: 4, right: 4, display: "flex", gap: 4 }}>
                <button onClick={() => handleDownload(p)} title="ดาวน์โหลด" style={{ background: "rgba(0,0,0,0.5)", border: "none", borderRadius: 6, padding: 4, cursor: "pointer" }}>
                  <Download size={12} color="#fff" />
                </button>
                <button onClick={() => handleDelete(p)} title="ลบ" style={{ background: "rgba(0,0,0,0.5)", border: "none", borderRadius: 6, padding: 4, cursor: "pointer" }}>
                  <Trash2 size={12} color="#fff" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   PAGE: AI CHAT
   ============================================================ */
function AIChatView({ farmId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    (async () => {
      const history = await listChatHistory(farmId);
      const flat = history.flatMap(h => [{ role: "user", text: h.question }, ...(h.answer ? [{ role: "ai", text: h.answer }] : [])]);
      setMessages(flat);
    })();
  }, [farmId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function send() {
    const q = input.trim();
    if (!q || asking) return;
    setInput(""); setError("");
    setMessages(m => [...m, { role: "user", text: q }]);
    setAsking(true);
    try { const answer = await askAI(farmId, q); setMessages(m => [...m, { role: "ai", text: answer }]); }
    catch (e) { setError("ถามไม่สำเร็จ: " + e.message); }
    finally { setAsking(false); }
  }

  return (
    <div className="dsf-card" style={{ display: "flex", flexDirection: "column", height: "65vh" }}>
      <div className="dsf-card-title" style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
        <Bot size={16} color="var(--green)" /> AI Insights — ถามข้อมูลสวน
      </div>
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, paddingRight: 4 }}>
        {messages.length === 0 && <div className="muted">ลองถามเช่น "เดือนนี้ผลผลิตเท่าไหร่" หรือ "มีต้นไหนป่วยบ้าง"</div>}
        {messages.map((m, i) => (
          <div key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "85%" }}>
            <div style={{ background: m.role === "user" ? "var(--green)" : "var(--surface-2)", color: m.role === "user" ? "#fff" : "var(--ink)", borderRadius: 12, padding: "8px 12px", fontSize: 13, whiteSpace: "pre-wrap" }}>{m.text}</div>
          </div>
        ))}
        {asking && <div className="muted">กำลังคิด...</div>}
        <div ref={bottomRef} />
      </div>
      {error && <div style={{ color: "var(--red)", fontSize: 12, marginTop: 6 }}>{error}</div>}
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <input className="dsf-input" placeholder="พิมพ์คำถาม..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} />
        <button onClick={send} disabled={asking} style={{ background: "var(--green)", border: "none", borderRadius: 10, padding: "0 14px", display: "flex", alignItems: "center", cursor: "pointer" }}>
          <Send size={16} color="#fff" />
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   PAGE: SETTINGS / SUPPORT
   ============================================================ */
function TeamManagementCard({ farmId, members, currentUserId, onChanged }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("worker");
  const [inviting, setInviting] = useState(false);
  const [msg, setMsg] = useState("");

  const myRole = members.find(m => m.id === currentUserId)?.role;
  const isAdmin = myRole === "admin";

  const ROLE_LABEL = { admin: "ผู้ดูแล (Admin)", manager: "ผู้จัดการ (Manager)", worker: "ผู้ปฏิบัติงาน (Worker)" };

  async function handleInvite() {
    if (!email.trim()) return;
    setInviting(true); setMsg("");
    try {
      const result = await inviteMember(farmId, email.trim(), role);
      if (result === "invited") { setMsg("เพิ่มสมาชิกสำเร็จ"); setEmail(""); onChanged(); }
      else if (result === "not_found") setMsg("ยังไม่พบบัญชีนี้ในระบบ — ให้คนที่จะเชิญสมัครสมาชิกในเว็บนี้ก่อน แล้วค่อยเชิญอีกครั้ง");
      else if (result === "forbidden") setMsg("เฉพาะผู้ดูแล (Admin) เท่านั้นที่เชิญสมาชิกได้");
    } catch (e) { setMsg("เกิดข้อผิดพลาด: " + e.message); }
    finally { setInviting(false); }
  }

  async function handleRoleChange(memberId, newRole) {
    try { await updateMemberRole(farmId, memberId, newRole); onChanged(); }
    catch (e) { window.alert("เปลี่ยนสิทธิ์ไม่สำเร็จ: " + e.message); }
  }

  async function handleRemove(memberId) {
    if (!window.confirm("ยืนยันนำสมาชิกคนนี้ออกจากสวน?")) return;
    try {
      const result = await removeMember(farmId, memberId);
      if (result === "last_admin") window.alert("ลบไม่ได้ เพราะเป็น Admin คนสุดท้ายของสวนนี้");
      else onChanged();
    } catch (e) { window.alert("ลบไม่สำเร็จ: " + e.message); }
  }

  return (
    <div className="dsf-card" style={{ maxWidth: 560, marginTop: 16 }}>
      <div className="dsf-card-title" style={{ marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
        <Users size={16} /> ทีมงานในสวนนี้
      </div>
      <div className="muted" style={{ marginBottom: 12 }}>
        Admin จัดการทุกอย่างได้ทั้งหมด · Manager แก้ไข/ลบข้อมูลได้ (ยกเว้นจัดการทีม) · Worker บันทึกข้อมูลหน้างานได้ แต่แก้ไข/ลบไม่ได้
      </div>

      <div style={{ display: "grid", gap: 6, marginBottom: 14 }}>
        {members.map(m => (
          <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: "var(--surface-2)", borderRadius: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 999, background: "var(--green-soft)", color: "var(--green)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
              {m.name?.[0]?.toUpperCase() || "?"}
            </div>
            <div style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {m.name} {m.id === currentUserId && <span className="muted">(คุณ)</span>}
            </div>
            {isAdmin ? (
              <>
                <select className="dsf-input" style={{ width: 150 }} value={m.role} onChange={e => handleRoleChange(m.id, e.target.value)}>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="worker">Worker</option>
                </select>
                <button onClick={() => handleRemove(m.id)} title="นำออก" style={{ background: "var(--red-soft)", border: "none", borderRadius: 7, padding: 6, cursor: "pointer" }}>
                  <X size={13} color="var(--red)" />
                </button>
              </>
            ) : (
              <span className="chip" style={{ background: "var(--surface)", color: "var(--ink-soft)" }}>{ROLE_LABEL[m.role] || m.role}</span>
            )}
          </div>
        ))}
      </div>

      {isAdmin ? (
        <div style={{ borderTop: "1px dashed var(--border)", paddingTop: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>เชิญสมาชิกใหม่</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 140px auto", gap: 8 }}>
            <input className="dsf-input" placeholder="อีเมลที่เคยสมัครสมาชิกไว้" value={email} onChange={e => setEmail(e.target.value)} />
            <select className="dsf-input" value={role} onChange={e => setRole(e.target.value)}>
              <option value="worker">Worker</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
            <button disabled={inviting} onClick={handleInvite} className="dsf-btn-primary-sm">{inviting ? "..." : "เชิญ"}</button>
          </div>
          {msg && <div className="muted" style={{ marginTop: 8 }}>{msg}</div>}
        </div>
      ) : (
        <div className="muted">เฉพาะ Admin เท่านั้นที่เชิญ/จัดการสิทธิ์สมาชิกได้</div>
      )}
    </div>
  );
}

function SettingsView({ user, farms, farmId, members, onSignOut, onMembersChanged }) {
  return (
    <div>
      <div className="dsf-card" style={{ maxWidth: 480 }}>
        <div className="dsf-card-title" style={{ marginBottom: 12 }}>ตั้งค่า</div>
        <div style={{ display: "grid", gap: 10, fontSize: 13.5 }}>
          <div><span className="muted">อีเมล</span><div>{user?.email}</div></div>
          <div><span className="muted">สวนปัจจุบัน</span><div>{farms.find(f => f.id === farmId)?.name}</div></div>
        </div>
        <button onClick={onSignOut} className="dsf-btn-primary-sm" style={{ marginTop: 16, background: "var(--red)" }}>
          <LogOut size={13} /> ออกจากระบบ
        </button>
      </div>
      <TeamManagementCard farmId={farmId} members={members} currentUserId={user?.id} onChanged={onMembersChanged} />
    </div>
  );
}

function SupportView() {
  return (
    <div className="dsf-card" style={{ maxWidth: 480 }}>
      <div className="dsf-card-title" style={{ marginBottom: 8 }}>ช่วยเหลือ</div>
      <div className="muted">มีปัญหาการใช้งานหรือข้อเสนอแนะ ติดต่อผู้ดูแลระบบของสวนคุณได้โดยตรง</div>
    </div>
  );
}

/* ============================================================
   QUICK ACTION MODAL
   ============================================================ */
/* ============================================================
   ADD FARM MODAL — ตอบคำถาม "เพิ่มสวน ทำอย่างไร" ด้วย UI ในแอปโดยตรง
   ============================================================ */
function AddFarmModal({ onClose, onCreated }) {
  const [name, setName] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (!name.trim()) { setError("กรุณากรอกชื่อสวน"); return; }
    setSaving(true); setError("");
    try {
      const farm = await createFarm(name.trim(), {
        latitude: lat === "" ? null : Number(lat),
        longitude: lng === "" ? null : Number(lng),
      });
      onCreated(farm.id);
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(30,42,32,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60, padding: 16 }}>
      <div className="dsf" style={{ background: "var(--surface)", width: "100%", maxWidth: 380, borderRadius: 18, padding: 20 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div className="disp" style={{ fontWeight: 700, fontSize: 16 }}>เพิ่มสวนใหม่</div>
          <button onClick={onClose} style={{ background: "var(--surface-2)", border: "none", borderRadius: 8, padding: 6, cursor: "pointer" }}>
            <X size={16} color="var(--ink-soft)" />
          </button>
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          <div><label className="dsf-label">ชื่อสวน</label><input className="dsf-input" value={name} onChange={e => setName(e.target.value)} placeholder="เช่น สวนทุเรียนแปลง 2" /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div><label className="dsf-label">ละติจูด (ไม่บังคับ)</label><input className="dsf-input" value={lat} onChange={e => setLat(e.target.value)} /></div>
            <div><label className="dsf-label">ลองจิจูด (ไม่บังคับ)</label><input className="dsf-input" value={lng} onChange={e => setLng(e.target.value)} /></div>
          </div>
          <div className="muted">ใส่พิกัดเพื่อให้ widget สภาพอากาศแสดงข้อมูลจริงของสวนนี้ — ข้ามได้ ใส่ทีหลังได้</div>
          {error && <div style={{ color: "var(--red)", fontSize: 12 }}>{error}</div>}
          <button disabled={saving} onClick={submit} className="dsf-btn-primary" style={{ justifyContent: "center", padding: "11px" }}>
            {saving ? "กำลังสร้าง..." : "สร้างสวน"}
          </button>
        </div>
      </div>
    </div>
  );
}


function QuickActionModal({ mode, editRecord, farmId, trees, members, currentUserId, onClose, onSaved }) {
  const isEdit = !!editRecord;
  const [form, setForm] = useState(mode || "menu");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ---------- tree ----------
  const [treeCode, setTreeCode] = useState(editRecord?.tree_code || "");
  const [variety, setVariety] = useState(editRecord?.variety || "");
  const [plantedDate, setPlantedDate] = useState(editRecord?.planted_date || "");
  const [healthStatus, setHealthStatus] = useState(editRecord?.health_status || "ปกติ");
  const [treeLat, setTreeLat] = useState(editRecord?.latitude ?? "");
  const [treeLng, setTreeLng] = useState(editRecord?.longitude ?? "");
  const [treeNotes, setTreeNotes] = useState(editRecord?.notes || "");

  // ---------- soil ----------
  const [readingDate, setReadingDate] = useState(editRecord?.reading_date || "");
  const [ph, setPh] = useState(editRecord?.ph ?? "");
  const [ec, setEc] = useState(editRecord?.ec ?? "");
  const [om, setOm] = useState(editRecord?.om ?? "");
  const [p, setP] = useState(editRecord?.p ?? "");
  const [k, setK] = useState(editRecord?.k ?? "");
  const [ca, setCa] = useState(editRecord?.ca ?? "");
  const [mg, setMg] = useState(editRecord?.mg ?? "");
  const [soilLab, setSoilLab] = useState(editRecord?.notes || "");
  const [soilRecordedBy, setSoilRecordedBy] = useState(editRecord?.recorded_by || currentUserId || "");

  // ---------- operation ----------
  const [opTreeId, setOpTreeId] = useState(editRecord?.tree_id || "");
  const [opType, setOpType] = useState(editRecord?.operation_type || "");
  const [opDate, setOpDate] = useState(editRecord?.performed_at ? editRecord.performed_at.slice(0, 10) : "");
  const [opDesc, setOpDesc] = useState(editRecord?.description || "");
  const [opPerformedBy, setOpPerformedBy] = useState(editRecord?.performed_by || currentUserId || "");

  // ---------- task ----------
  const [taskTitle, setTaskTitle] = useState(editRecord?.title || "");
  const [taskDesc, setTaskDesc] = useState(editRecord?.description || "");
  const [taskDue, setTaskDue] = useState(editRecord?.due_date || "");
  const [taskPriority, setTaskPriority] = useState(editRecord?.priority || "normal");
  const [taskStatus, setTaskStatus] = useState(editRecord?.status || "รอทำ");
  const [taskAssignedTo, setTaskAssignedTo] = useState(editRecord?.assigned_to || "");
  const [taskCreatedBy, setTaskCreatedBy] = useState(editRecord?.created_by || currentUserId || "");

  // ---------- harvest ----------
  const [hvTreeId, setHvTreeId] = useState(editRecord?.tree_id || "");
  const [hvDate, setHvDate] = useState(editRecord?.harvest_date || "");
  const [hvWeight, setHvWeight] = useState(editRecord?.weight_kg ?? "");
  const [hvGrade, setHvGrade] = useState(editRecord?.grade || "");
  const [hvPrice, setHvPrice] = useState(editRecord?.price_per_kg ?? "");
  const [hvRecordedBy, setHvRecordedBy] = useState(editRecord?.recorded_by || currentUserId || "");

  // ---------- expense/transaction ----------
  const [txType, setTxType] = useState(editRecord?.transaction_type || "expense");
  const [txCategory, setTxCategory] = useState(editRecord?.category || "");
  const [txAmount, setTxAmount] = useState(editRecord?.amount ?? "");
  const [txDate, setTxDate] = useState(editRecord?.transaction_date || "");
  const [txDesc, setTxDesc] = useState(editRecord?.description || "");

  const Header = ({ title }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
      <div className="disp" style={{ fontWeight: 700, fontSize: 16 }}>{title}</div>
      <button onClick={onClose} style={{ background: "var(--surface-2)", border: "none", borderRadius: 8, padding: 6, cursor: "pointer" }}>
        <X size={16} color="var(--ink-soft)" />
      </button>
    </div>
  );

  async function submitTree() {
    setSaving(true); setError("");
    try {
      if (!treeCode) throw new Error("กรุณากรอกรหัสต้น");
      const payload = {
        tree_code: treeCode, variety, planted_date: plantedDate || null, health_status: healthStatus,
        latitude: treeLat === "" ? null : Number(treeLat), longitude: treeLng === "" ? null : Number(treeLng),
        notes: treeNotes,
      };
      if (isEdit) await updateTree(editRecord.id, payload);
      else await addTree(farmId, payload);
      onSaved();
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  }

  async function submitSoil() {
    setSaving(true); setError("");
    try {
      const phVal = ph === "" ? null : Number(ph);
      if (phVal !== null && (phVal < 0 || phVal > 14)) throw new Error("ค่า pH ต้องอยู่ระหว่าง 0–14");
      const payload = {
        reading_date: readingDate || new Date().toISOString().slice(0, 10),
        ph: phVal, ec: ec === "" ? null : Number(ec), om: om === "" ? null : Number(om),
        p: p === "" ? null : Number(p), k: k === "" ? null : Number(k),
        ca: ca === "" ? null : Number(ca), mg: mg === "" ? null : Number(mg),
        notes: soilLab, recorded_by: soilRecordedBy || null,
      };
      if (isEdit) await updateSoilReading(editRecord.id, payload);
      else await addSoilReading(farmId, payload);
      onSaved();
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  }

  async function submitOperation() {
    setSaving(true); setError("");
    try {
      if (!opType) throw new Error("กรุณาเลือกประเภทกิจกรรม");
      const payload = {
        tree_id: opTreeId || null, operation_type: opType, description: opDesc,
        performed_by: opPerformedBy || null,
        performed_at: opDate ? new Date(opDate).toISOString() : new Date().toISOString(),
      };
      if (isEdit) await updateOperation(editRecord.id, payload);
      else await addOperation(farmId, payload);
      onSaved();
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  }

  async function submitHarvest() {
    setSaving(true); setError("");
    try {
      if (!hvWeight) throw new Error("กรุณากรอกน้ำหนัก");
      const payload = {
        tree_id: hvTreeId || null,
        harvest_date: hvDate || new Date().toISOString().slice(0, 10),
        weight_kg: Number(hvWeight), grade: hvGrade,
        price_per_kg: hvPrice === "" ? null : Number(hvPrice),
        recorded_by: hvRecordedBy || null,
      };
      let saved;
      if (isEdit) saved = await updateHarvest(editRecord.id, payload);
      else saved = await addHarvest(farmId, payload);
      // สร้าง/อัปเดตรายรับในหน้าการเงินให้อัตโนมัติ ไม่ต้องกรอกซ้ำ
      // หมายเหตุ: Worker ไม่มีสิทธิ์เขียนตาราง transactions (ตาม RLS) — ถ้า sync ล้มเหลว
      // ไม่ควรทำให้การบันทึกผลผลิตที่สำเร็จแล้วดูเหมือนล้มเหลวไปด้วย
      try {
        await syncHarvestTransaction(farmId, saved);
      } catch (syncErr) {
        console.warn("sync harvest -> transaction ไม่สำเร็จ (อาจเป็นเพราะสิทธิ์ผู้ใช้):", syncErr.message);
      }
      onSaved();
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  }

  async function submitTask() {
    setSaving(true); setError("");
    try {
      if (!taskTitle) throw new Error("กรุณาเลือก/กรอกชื่องาน");
      const payload = {
        title: taskTitle, description: taskDesc, due_date: taskDue || null, priority: taskPriority,
        status: taskStatus, assigned_to: taskAssignedTo || null, created_by: taskCreatedBy || null,
      };
      const wasDone = editRecord?.status === TASK_STATUS_DONE;
      const nowDone = taskStatus === TASK_STATUS_DONE;
      if (isEdit) await updateTask(editRecord.id, payload);
      else await addTask(farmId, payload);
      // งานเพิ่งถูกทำเครื่องหมายว่าเสร็จสิ้น -> บันทึกลง Activity Log อัตโนมัติ
      if (nowDone && !wasDone) {
        await logTaskAsOperation(farmId, payload);
      }
      onSaved();
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  }

  async function submitExpense() {
    setSaving(true); setError("");
    try {
      if (!txAmount) throw new Error("กรุณากรอกจำนวนเงิน");
      if (!txCategory) throw new Error("กรุณาเลือก/กรอกหมวด");
      const payload = {
        transaction_type: txType, category: txCategory, amount: Number(txAmount),
        transaction_date: txDate || new Date().toISOString().slice(0, 10), description: txDesc,
      };
      if (isEdit) await updateTransaction(editRecord.id, payload);
      else await addTransaction(farmId, payload);
      onSaved();
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  }

  const harvestTotalPreview = (Number(hvWeight) || 0) * (Number(hvPrice) || 0);
  const treeAgePreview = calcAgeYears(plantedDate);
  const incomeCategoryOptions = ["ขายผลผลิต", ...FINANCE_CATEGORY_OPTIONS];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(30,42,32,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }}>
      <div className="dsf" style={{ background: "var(--surface)", width: "100%", maxWidth: 440, borderRadius: 18, padding: 20, maxHeight: "86vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
        {form === "menu" && (
          <>
            <Header title="เพิ่มข้อมูล" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { key: "operation", label: "บันทึกกิจกรรม", tone: "green" },
                { key: "task", label: "เพิ่มงาน", tone: "orange" },
                { key: "tree", label: "ลงทะเบียนต้น", tone: "green" },
                { key: "harvest", label: "บันทึกผลผลิต", tone: "green" },
                { key: "soil", label: "วิเคราะห์ดิน", tone: "blue" },
                { key: "expense", label: "รายรับ-รายจ่าย", tone: "orange" },
              ].map((o, i) => {
                const t = TONE[o.tone];
                return (
                  <button key={i} onClick={() => setForm(o.key)} style={{ background: t.bg, border: "none", borderRadius: 12, padding: 16, fontSize: 13, fontWeight: 700, color: t.fg, cursor: "pointer" }}>
                    {o.label}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {form === "tree" && (
          <>
            <Header title={isEdit ? "แก้ไขต้นทุเรียน" : "ลงทะเบียนต้นทุเรียน"} />
            <div style={{ display: "grid", gap: 10 }}>
              <div><label className="dsf-label">รหัสต้น</label><input className="dsf-input" placeholder="เช่น A-022" value={treeCode} onChange={e => setTreeCode(e.target.value)} /></div>
              <div><label className="dsf-label">พันธุ์</label><ComboBox value={variety} onChange={setVariety} options={VARIETY_OPTIONS} placeholder="เลือกสายพันธุ์" /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div><label className="dsf-label">วันที่ปลูก</label><input type="date" className="dsf-input" value={plantedDate} onChange={e => setPlantedDate(e.target.value)} /></div>
                <div><label className="dsf-label">อายุ (ปี) — คำนวณอัตโนมัติ</label><input className="dsf-input" disabled value={treeAgePreview ?? "-"} style={{ opacity: 0.7 }} /></div>
              </div>
              <div><label className="dsf-label">สถานะสุขภาพ</label><ComboBox value={healthStatus} onChange={setHealthStatus} options={HEALTH_STATUS_OPTIONS} placeholder="เลือกสถานะ" /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div><label className="dsf-label">ละติจูด</label><input className="dsf-input" value={treeLat} onChange={e => setTreeLat(e.target.value)} placeholder="12.9236" /></div>
                <div><label className="dsf-label">ลองจิจูด</label><input className="dsf-input" value={treeLng} onChange={e => setTreeLng(e.target.value)} placeholder="100.8825" /></div>
              </div>
              <div><label className="dsf-label">หมายเหตุ</label><input className="dsf-input" value={treeNotes} onChange={e => setTreeNotes(e.target.value)} /></div>
              {error && <div style={{ color: "var(--red)", fontSize: 12 }}>{error}</div>}
              <button disabled={saving} onClick={submitTree} className="dsf-btn-primary" style={{ justifyContent: "center", padding: "11px" }}>
                {saving ? "กำลังบันทึก..." : isEdit ? "บันทึกการแก้ไข" : "บันทึกต้นทุเรียน"}
              </button>
            </div>
          </>
        )}

        {form === "soil" && (
          <>
            <Header title={isEdit ? "แก้ไขผลวิเคราะห์ดิน" : "บันทึกผลวิเคราะห์ดิน"} />
            <div style={{ display: "grid", gap: 10 }}>
              <div><label className="dsf-label">วันที่เก็บตัวอย่าง</label><input type="date" className="dsf-input" value={readingDate} onChange={e => setReadingDate(e.target.value)} /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div><label className="dsf-label">pH (0–14)</label><input type="number" step="0.1" min="0" max="14" className="dsf-input" value={ph} onChange={e => setPh(e.target.value)} /></div>
                <div><label className="dsf-label">EC (dS/m)</label><input type="number" step="0.1" className="dsf-input" value={ec} onChange={e => setEc(e.target.value)} /></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div><label className="dsf-label">OM (%)</label><input type="number" step="0.1" className="dsf-input" value={om} onChange={e => setOm(e.target.value)} /></div>
                <div><label className="dsf-label">P (mg/kg)</label><input type="number" className="dsf-input" value={p} onChange={e => setP(e.target.value)} /></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div><label className="dsf-label">K (mg/kg)</label><input type="number" className="dsf-input" value={k} onChange={e => setK(e.target.value)} /></div>
                <div><label className="dsf-label">Ca (mg/kg)</label><input type="number" className="dsf-input" value={ca} onChange={e => setCa(e.target.value)} /></div>
              </div>
              <div><label className="dsf-label">Mg (mg/kg)</label><input type="number" className="dsf-input" value={mg} onChange={e => setMg(e.target.value)} /></div>
              <div><label className="dsf-label">หน่วยงานตรวจ</label><ComboBox value={soilLab} onChange={setSoilLab} options={SOIL_LAB_OPTIONS} placeholder="เลือกหน่วยงาน" /></div>
              <div><label className="dsf-label">ผู้บันทึก</label><MemberSelect value={soilRecordedBy} onChange={setSoilRecordedBy} members={members} /></div>
              {error && <div style={{ color: "var(--red)", fontSize: 12 }}>{error}</div>}
              <button disabled={saving} onClick={submitSoil} className="dsf-btn-primary" style={{ justifyContent: "center", padding: "11px", background: "var(--blue)" }}>
                {saving ? "กำลังบันทึก..." : isEdit ? "บันทึกการแก้ไข" : "บันทึกผลวิเคราะห์ดิน"}
              </button>
            </div>
          </>
        )}

        {form === "operation" && (
          <>
            <Header title={isEdit ? "แก้ไขกิจกรรมสวน" : "บันทึกกิจกรรมสวน"} />
            <div style={{ display: "grid", gap: 10 }}>
              <div><label className="dsf-label">ต้น (ไม่ระบุ = ทั้งสวน)</label>
                <select className="dsf-input" value={opTreeId} onChange={e => setOpTreeId(e.target.value)}>
                  <option value="">-- ไม่ระบุ --</option>
                  {trees.map(t => <option key={t.id} value={t.id}>{t.tree_code}</option>)}
                </select>
              </div>
              <div><label className="dsf-label">ประเภทกิจกรรม</label><ComboBox value={opType} onChange={setOpType} options={OPERATION_TYPE_OPTIONS} placeholder="เลือกประเภท" /></div>
              <div><label className="dsf-label">วันที่</label><input type="date" className="dsf-input" value={opDate} onChange={e => setOpDate(e.target.value)} /></div>
              <div><label className="dsf-label">ผู้ปฏิบัติงาน</label><MemberSelect value={opPerformedBy} onChange={setOpPerformedBy} members={members} /></div>
              <div><label className="dsf-label">หมายเหตุ</label><input className="dsf-input" value={opDesc} onChange={e => setOpDesc(e.target.value)} /></div>
              {error && <div style={{ color: "var(--red)", fontSize: 12 }}>{error}</div>}
              <button disabled={saving} onClick={submitOperation} className="dsf-btn-primary" style={{ justifyContent: "center", padding: "11px", background: "var(--orange)" }}>
                {saving ? "กำลังบันทึก..." : isEdit ? "บันทึกการแก้ไข" : "บันทึก"}
              </button>
            </div>
          </>
        )}

        {form === "harvest" && (
          <>
            <Header title={isEdit ? "แก้ไขผลผลิต" : "บันทึกผลผลิต"} />
            <div style={{ display: "grid", gap: 10 }}>
              <div><label className="dsf-label">ต้น (ไม่ระบุ = ทั้งสวน)</label>
                <select className="dsf-input" value={hvTreeId} onChange={e => setHvTreeId(e.target.value)}>
                  <option value="">-- ไม่ระบุ --</option>
                  {trees.map(t => <option key={t.id} value={t.id}>{t.tree_code}</option>)}
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div><label className="dsf-label">วันที่ขาย</label><input type="date" className="dsf-input" value={hvDate} onChange={e => setHvDate(e.target.value)} /></div>
                <div><label className="dsf-label">น้ำหนัก (กก.)</label><input type="number" className="dsf-input" value={hvWeight} onChange={e => setHvWeight(e.target.value)} /></div>
              </div>
              <div><label className="dsf-label">เกรด</label><ComboBox value={hvGrade} onChange={setHvGrade} options={GRADE_OPTIONS} placeholder="เลือกเกรด" /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div><label className="dsf-label">ราคา/กก. (บาท)</label><input type="number" className="dsf-input" value={hvPrice} onChange={e => setHvPrice(e.target.value)} /></div>
                <div><label className="dsf-label">ราคารวม — คำนวณอัตโนมัติ</label><input className="dsf-input" disabled value={`฿${harvestTotalPreview.toLocaleString()}`} style={{ opacity: 0.7 }} /></div>
              </div>
              <div><label className="dsf-label">ผู้บันทึก</label><MemberSelect value={hvRecordedBy} onChange={setHvRecordedBy} members={members} /></div>
              {error && <div style={{ color: "var(--red)", fontSize: 12 }}>{error}</div>}
              <button disabled={saving} onClick={submitHarvest} className="dsf-btn-primary" style={{ justifyContent: "center", padding: "11px" }}>
                {saving ? "กำลังบันทึก..." : isEdit ? "บันทึกการแก้ไข" : "บันทึกผลผลิต"}
              </button>
            </div>
          </>
        )}

        {form === "task" && (
          <>
            <Header title={isEdit ? "แก้ไขงาน" : "เพิ่มงาน"} />
            <div style={{ display: "grid", gap: 10 }}>
              <div><label className="dsf-label">ชื่องาน</label><ComboBox value={taskTitle} onChange={setTaskTitle} options={OPERATION_TYPE_OPTIONS} placeholder="เลือกชื่องาน" /></div>
              <div><label className="dsf-label">รายละเอียดงาน</label><input className="dsf-input" value={taskDesc} onChange={e => setTaskDesc(e.target.value)} /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div><label className="dsf-label">กำหนดเสร็จ</label><input type="date" className="dsf-input" value={taskDue} onChange={e => setTaskDue(e.target.value)} /></div>
                <div><label className="dsf-label">ความสำคัญ</label>
                  <select className="dsf-input" value={taskPriority} onChange={e => setTaskPriority(e.target.value)}>
                    <option value="low">ต่ำ</option><option value="normal">ปกติ</option><option value="high">สูง</option><option value="urgent">เร่งด่วน</option>
                  </select>
                </div>
              </div>
              <div><label className="dsf-label">สถานะ</label><ComboBox value={taskStatus} onChange={setTaskStatus} options={TASK_STATUS_OPTIONS} placeholder="เลือกสถานะ" /></div>
              <div><label className="dsf-label">ผู้ปฏิบัติงาน</label><MemberSelect value={taskAssignedTo} onChange={setTaskAssignedTo} members={members} /></div>
              <div><label className="dsf-label">ผู้กำหนดงาน</label><MemberSelect value={taskCreatedBy} onChange={setTaskCreatedBy} members={members} /></div>
              {error && <div style={{ color: "var(--red)", fontSize: 12 }}>{error}</div>}
              <button disabled={saving} onClick={submitTask} className="dsf-btn-primary" style={{ justifyContent: "center", padding: "11px", background: "var(--orange)" }}>
                {saving ? "กำลังบันทึก..." : isEdit ? "บันทึกการแก้ไข" : "เพิ่มงาน"}
              </button>
            </div>
          </>
        )}

        {form === "expense" && (
          <>
            <Header title={isEdit ? "แก้ไขรายรับ-รายจ่าย" : "รายรับ-รายจ่าย"} />
            <div style={{ display: "grid", gap: 10 }}>
              <div><label className="dsf-label">ประเภท</label>
                <select className="dsf-input" value={txType} onChange={e => { setTxType(e.target.value); setTxCategory(""); }}>
                  <option value="expense">รายจ่าย</option><option value="income">รายรับ</option>
                </select>
              </div>
              <div><label className="dsf-label">หมวด</label>
                <ComboBox value={txCategory} onChange={setTxCategory} options={txType === "expense" ? FINANCE_CATEGORY_OPTIONS : incomeCategoryOptions} placeholder="เลือกหมวด" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div><label className="dsf-label">วันที่</label><input type="date" className="dsf-input" value={txDate} onChange={e => setTxDate(e.target.value)} /></div>
                <div><label className="dsf-label">จำนวนเงิน (บาท)</label><input type="number" className="dsf-input" value={txAmount} onChange={e => setTxAmount(e.target.value)} /></div>
              </div>
              <div><label className="dsf-label">หมายเหตุ</label><input className="dsf-input" value={txDesc} onChange={e => setTxDesc(e.target.value)} /></div>
              {error && <div style={{ color: "var(--red)", fontSize: 12 }}>{error}</div>}
              <button disabled={saving} onClick={submitExpense} className="dsf-btn-primary" style={{ justifyContent: "center", padding: "11px", background: "var(--orange)" }}>
                {saving ? "กำลังบันทึก..." : isEdit ? "บันทึกการแก้ไข" : "บันทึก"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   ROOT
   ============================================================ */
/* ============================================================
   ERROR BOUNDARY — กันไม่ให้ error ในหน้าใดหน้าหนึ่งทำให้ทั้งแอปขึ้นจอขาว
   ============================================================ */
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error("Page error:", error, info); }
  render() {
    if (this.state.error) {
      return (
        <div className="dsf-card" style={{ borderColor: "var(--red-soft)" }}>
          <div style={{ fontWeight: 700, color: "var(--red)", marginBottom: 6 }}>เกิดข้อผิดพลาดในหน้านี้</div>
          <div className="muted" style={{ marginBottom: 12 }}>{String(this.state.error?.message || this.state.error)}</div>
          <button onClick={() => this.setState({ error: null })} className="dsf-btn-primary-sm">ลองใหม่</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function DurianDashboardContent() {
  const { user, farmId, farms, setFarmId, refreshFarms, signOut } = useAuth();
  const data = useFarmData(farmId);
  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quick, setQuick] = useState(null);
  const [editRecord, setEditRecord] = useState(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [dateRange, setDateRange] = useState({ preset: "ALL", start: null, end: null });
  const [addFarmOpen, setAddFarmOpen] = useState(false);

  const currentFarm = farms.find(f => f.id === farmId);
  const members = data.members || [];
  const myRole = members.find(m => m.id === user?.id)?.role;
  const canEditDelete = myRole === "admin" || myRole === "manager"; // แก้ไขได้ (ทุกตาราง — ตรงกับ RLS *_update)
  const canDeleteMost = myRole === "admin"; // trees/operations/harvest/soil/transactions ลบได้เฉพาะ admin ตาม RLS
  const canDeleteTask = myRole === "admin" || myRole === "manager"; // tasks ลบได้ admin+manager ตาม RLS

  const loadNotifications = useCallback(async () => {
    const [list, count] = await Promise.all([listNotifications(), unreadNotificationCount()]);
    setNotifications(list); setUnread(count);
  }, []);

  useEffect(() => { loadNotifications(); }, [loadNotifications]);
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToNotifications(user.id, () => loadNotifications());
    return unsub;
  }, [user, loadNotifications]);

  function navigate(key) { setPage(key); setSidebarOpen(false); }

  function openAdd(type) { setEditRecord(null); setQuick(type); }
  function openEdit(type, record) { setEditRecord(record); setQuick(type); }
  function closeModal() { setQuick(null); setEditRecord(null); }

  async function handleDelete(deleteFn, record, label) {
    if (!window.confirm(`ยืนยันลบ${label}นี้? การลบไม่สามารถย้อนกลับได้`)) return;
    try { await deleteFn(record.id); data.refresh(); }
    catch (e) { window.alert("ลบไม่สำเร็จ: " + e.message); }
  }

  async function handleToggleTask(task) {
    const wasDone = task.status === TASK_STATUS_DONE;
    const newStatus = wasDone ? "รอทำ" : TASK_STATUS_DONE;
    try {
      await updateTaskStatus(task.id, newStatus);
      if (!wasDone) {
        // เพิ่งทำเครื่องหมายว่าเสร็จสิ้น -> บันทึกลง Activity Log อัตโนมัติ
        await logTaskAsOperation(farmId, task);
      }
      data.refresh();
    } catch (e) { window.alert("อัปเดตสถานะไม่สำเร็จ: " + e.message); }
  }

  let body;
  switch (page) {
    case "trees":
      body = <TreesView trees={data.trees} onOpenQuick={openAdd}
        onEdit={canEditDelete ? r => openEdit("tree", r) : undefined}
        onDelete={canDeleteMost ? r => handleDelete(deleteTree, r, "ต้นทุเรียน") : undefined} />;
      break;
    case "tasks":
      body = <TasksView tasks={data.tasks} members={members} onOpenQuick={openAdd} onToggle={handleToggleTask}
        onEdit={canEditDelete ? r => openEdit("task", r) : undefined}
        onDelete={canDeleteTask ? r => handleDelete(deleteTask, r, "งาน") : undefined} />;
      break;
    case "operations":
      body = <OperationsView operations={data.operations} dateRange={dateRange} members={members} onOpenQuick={openAdd}
        onEdit={canEditDelete ? r => openEdit("operation", r) : undefined}
        onDelete={canDeleteMost ? r => handleDelete(deleteOperation, r, "กิจกรรม") : undefined} />;
      break;
    case "harvest":
      body = <HarvestView harvest={data.harvest} dateRange={dateRange} members={members} onOpenQuick={openAdd}
        onEdit={canEditDelete ? r => openEdit("harvest", r) : undefined}
        onDelete={canDeleteMost ? r => handleDelete(deleteHarvest, r, "ผลผลิต") : undefined} />;
      break;
    case "finance":
      body = <FinanceView transactions={data.transactions} dateRange={dateRange} members={members} onOpenQuick={openAdd}
        onEdit={canEditDelete ? r => openEdit("expense", r) : undefined}
        onDelete={canDeleteMost ? r => handleDelete(deleteTransaction, r, "รายการ") : undefined} />;
      break;
    case "soil":
      body = <SoilView soil={data.soil} dateRange={dateRange} members={members} onOpenQuick={openAdd}
        onEdit={canEditDelete ? r => openEdit("soil", r) : undefined}
        onDelete={canDeleteMost ? r => handleDelete(deleteSoilReading, r, "ผลวิเคราะห์ดิน") : undefined} />;
      break;
    case "weather": body = <WeatherView farm={currentFarm} />; break;
    case "aichat": body = <AIChatView farmId={farmId} />; break;
    case "photos": body = <PhotosView farmId={farmId} />; break;
    case "settings": body = <SettingsView user={user} farms={farms} farmId={farmId} members={members} onSignOut={signOut} onMembersChanged={data.refresh} />; break;
    case "support": body = <SupportView />; break;
    default:
      body = <DashboardView data={data} dateRange={dateRange} farm={currentFarm} onOpenQuick={openAdd} onToggleTask={handleToggleTask}
        onEditTask={canEditDelete ? r => openEdit("task", r) : undefined}
        onDeleteTask={canDeleteTask ? r => handleDelete(deleteTask, r, "งาน") : undefined} />;
  }

  return (
    <div className="dsf">
      <style>{TOKENS}</style>
      <div className="dsf-shell">
        <Sidebar page={page} onNavigate={navigate} open={sidebarOpen} onClose={() => setSidebarOpen(false)}
                 farms={farms} farmId={farmId} onFarmChange={setFarmId} onAddFarm={() => setAddFarmOpen(true)} userEmail={user?.email} />
        <div className="dsf-main">
          <Topbar
            onMenuClick={() => setSidebarOpen(o => !o)}
            onQuickAdd={() => openAdd("menu")}
            unread={unread}
            notifOpen={notifOpen}
            setNotifOpen={setNotifOpen}
            notifications={notifications}
            onMarkRead={async (id) => { await markNotificationRead(id); loadNotifications(); }}
            onMarkAllRead={async () => { await markAllNotificationsRead(); loadNotifications(); }}
            onSignOut={signOut}
            showDateFilter={PAGES_WITH_DATE_FILTER.includes(page)}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
          <div className="dsf-content">
            {data.error && (
              <div style={{ marginBottom: 16, padding: 10, background: "var(--red-soft)", color: "var(--red)", borderRadius: 10, fontSize: 13 }}>
                โหลดข้อมูลไม่สำเร็จ: {data.error}
              </div>
            )}
            <ErrorBoundary key={page}>{body}</ErrorBoundary>
          </div>
        </div>
      </div>

      {addFarmOpen && (
        <AddFarmModal
          onClose={() => setAddFarmOpen(false)}
          onCreated={async (newFarmId) => { await refreshFarms(); setFarmId(newFarmId); setAddFarmOpen(false); }}
        />
      )}

      {quick && (
        <QuickActionModal
          mode={quick === "menu" ? "menu" : quick}
          editRecord={editRecord}
          farmId={farmId}
          trees={data.trees}
          members={members}
          currentUserId={user?.id}
          onClose={closeModal}
          onSaved={() => { closeModal(); data.refresh(); }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthGate>
      <DurianDashboardContent />
    </AuthGate>
  );
}
