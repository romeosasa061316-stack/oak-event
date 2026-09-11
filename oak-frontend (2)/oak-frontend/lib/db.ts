

import type {
  Attendee,
  CheckIn,
  Partner,
  PublicAttendee,
  Resource,
  Role,
  Session,
  SessionNote,
} from "./types";

const KEYS = {
  attendees: "oak_attendees",
  checkins: "oak_checkins",
  seeded: "oak_seeded_v1",
};


function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function generateQrCode() {
  const block = () => Math.floor(1000 + Math.random() * 9000);
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `OAK-2026-${block()}-${suffix}`;
}

function delay<T>(value: T, ms = 120): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}


const SEED_ATTENDEES: Attendee[] = [
  {
    id: "att_maria",
    qrCode: "OAK-2026-7842-XKPH",
    firstName: "Maria",
    lastName: "Schmidt",
    organisation: "Open Society Foundations",
    role: "Partner",
    email: "m.schmidt@osf.org",
    phone: "+41 79 555 0102",
    dietary: "Vegetarian",
    accessibility: "",
    travel: "Flight from Geneva, hotel needed",
    consentAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: "att_james",
    qrCode: "OAK-2026-1103-7XQH",
    firstName: "James",
    lastName: "Odhiambo",
    organisation: "OAK Foundation",
    role: "OAK Staff",
    email: "j.odhiambo@oakfnd.org",
    consentAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: "att_awa",
    qrCode: "OAK-2026-3728-40CE",
    firstName: "Awa",
    lastName: "Diallo",
    organisation: "Geneva Secretariat",
    role: "Coordination Team",
    email: "a.diallo@oakfnd.org",
    consentAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: "att_fatima",
    qrCode: "OAK-2026-5302-PMH6",
    firstName: "Fatima",
    lastName: "Z. Benali",
    organisation: "MENA Rights Group",
    role: "Partner",
    email: "f.benali@menarights.org",
    consentAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
];

const SEED_PARTNERS: Partner[] = [
  {
    id: "p_osf",
    code: "OSF",
    name: "Open Society Foundations",
    region: "Global",
    category: "Foundation",
    tags: ["Democracy", "Human Rights", "Justice"],
    partnerSince: 2018,
    website: "https://opensocietyfoundations.org",
    about:
      "Open Society Foundations builds vibrant and tolerant democracies. OAK partnership covers digital rights and justice initiatives across Eastern Europe and Central Asia.",
    contactName: "Maria Schmidt",
    contactEmail: "m.schmidt@osf.org",
    isSubPartner: true,
  },
  {
    id: "p_aca",
    code: "ACA",
    name: "Africa Climate Alliance",
    region: "Sub-Saharan Africa",
    category: "NGO",
    tags: ["Climate Justice", "Youth Advocacy"],
    partnerSince: 2020,
    website: "https://africaclimatealliance.org",
    about:
      "Africa Climate Alliance mobilises youth-led climate justice campaigns across Sub-Saharan Africa, working with OAK on grassroots advocacy funding.",
    contactName: "Kwame Boateng",
    contactEmail: "k.boateng@africaclimatealliance.org",
    isSubPartner: true,
  },
  {
    id: "p_nec",
    code: "NEC",
    name: "Nordic Evaluation Centre",
    region: "Northern Europe",
    category: "Research",
    tags: ["Evaluation", "Learning"],
    partnerSince: 2021,
    website: "https://nordicevaluation.org",
    about:
      "Nordic Evaluation Centre supports OAK's portfolio with independent monitoring, evaluation, and shared-learning frameworks.",
    contactName: "Ingrid Holm",
    contactEmail: "i.holm@nordicevaluation.org",
    isSubPartner: true,
  },
  {
    id: "p_mrg",
    code: "MRG",
    name: "MENA Rights Group",
    region: "Middle East & North Africa",
    category: "NGO",
    tags: ["Human Rights", "Documentation"],
    partnerSince: 2019,
    website: "https://menarights.org",
    about:
      "MENA Rights Group documents human rights violations and supports rights-based advocacy across the Middle East and North Africa.",
    contactName: "Fatima Z. Benali",
    contactEmail: "f.benali@menarights.org",
  },
  {
    id: "p_dfi",
    code: "DFI",
    name: "Digital Frontiers Institute",
    region: "East Africa",
    category: "Research",
    tags: ["Digital Rights", "Internet Freedom"],
    partnerSince: 2022,
    website: "https://digitalfrontiers.org",
    about:
      "Digital Frontiers Institute researches internet freedom and digital rights protections across East Africa.",
    contactName: "Li Wei",
    contactEmail: "l.wei@digitalfrontiers.org",
  },
  {
    id: "p_gal",
    code: "GAL",
    name: "Global Advocacy Lab",
    region: "Global",
    category: "NGO",
    tags: ["Communications", "Campaigns"],
    partnerSince: 2023,
    website: "https://globaladvocacylab.org",
    about:
      "Global Advocacy Lab builds strategic communications capacity for grantees across OAK's portfolio.",
    contactName: "Rashida Karim",
    contactEmail: "r.karim@globaladvocacylab.org",
  },
  {
    id: "p_sp",
    code: "SP",
    name: "Sciences Po Paris",
    region: "Western Europe",
    category: "Network",
    tags: ["Environment", "Climate"],
    partnerSince: 2020,
    website: "https://sciencespo.fr",
    about:
      "Sciences Po Paris contributes research on environmental policy and climate governance to the OAK network.",
    contactName: "Prof. Amara Diallo",
    contactEmail: "a.diallo@sciencespo.fr",
  },
];

const SEED_SESSIONS: Session[] = [
  { id: "s1", day: 1, start: "09:00", end: "10:30", title: "Opening Plenary: Pathways to Impact", speaker: "Dr. Helena Moreau", speakerOrg: "OAK Foundation", location: "Main Hall A", type: "Plenary", featured: true },
  { id: "s2", day: 1, start: "10:50", end: "12:00", title: "Thematic Dialogue: Climate Justice & Grantmaking", speaker: "Samuel Okafor", speakerOrg: "Africa Climate Alliance", location: "Conference Room B2", type: "Breakout" },
  { id: "s3", day: 1, start: "10:50", end: "13:00", title: "Workshop: Measuring Long-term Change", speaker: "Dr. Ingrid Holm", speakerOrg: "Nordic Evaluation Centre", location: "Workshop Room C", type: "Workshop" },
  { id: "s4", day: 1, start: "13:30", end: "14:30", title: "Partner Spotlight: Rights-Based Approaches", speaker: "Fatima Zahra Benali", speakerOrg: "MENA Rights Group", location: "Main Hall A", type: "Plenary" },
  { id: "s5", day: 1, start: "14:45", end: "16:00", title: "Digital Rights in Authoritarian Contexts", speaker: "Li Wei", speakerOrg: "Digital Frontiers Institute", location: "Conference Room B1", type: "Breakout" },
  { id: "s6", day: 1, start: "18:00", end: "20:00", title: "Welcome Reception & Dinner", location: "Rooftop Terrace", type: "Social" },
  { id: "s7", day: 2, start: "09:00", end: "10:15", title: "Strategic Communications Workshop", speaker: "Rashida Karim", speakerOrg: "Global Advocacy Lab", location: "Workshop Room C", type: "Workshop" },
  { id: "s8", day: 2, start: "10:30", end: "12:00", title: "Fishbowl: Rethinking Time Horizons in Philanthropy", speaker: "Prof. Amara Diallo", speakerOrg: "Sciences Po Paris", location: "Main Hall A", type: "Plenary" },
  { id: "s9", day: 3, start: "09:30", end: "10:30", title: "Closing Plenary & Action Planning", location: "Main Hall A", type: "Plenary", featured: true },
];

const SEED_NOTES: SessionNote[] = [
  { id: "n1", day: 1, time: "14:32", authorName: "Maria Schmidt", authorOrg: "Open Society Foundations", text: "The rights-based approaches session surfaced strong demand for a shared learning platform. OSF will follow up with MENA Rights Group on joint programming opportunities in the Mediterranean region." },
  { id: "n2", day: 1, time: "16:50", authorName: "James Odhiambo", authorOrg: "OAK Foundation", text: "Digital Rights breakout: participants want a working group to share tools for operating in restricted digital environments. Interested orgs: Digital Frontiers, Access Now, EFF." },
  { id: "n3", day: 2, time: "11:15", authorName: "Awa Diallo", authorOrg: "Geneva Secretariat", text: "Strategic communications workshop highly rated. Rashida's adaptive messaging framework is directly applicable across 60% of the portfolio. Requesting follow-up toolkit." },
  { id: "n4", day: 2, time: "16:00", authorName: "Prof. Amara Diallo", authorOrg: "Sciences Po Paris", text: "Fishbowl revealed consensus: philanthropy needs to accept longer time horizons (10+ years) and better shared learning. Key ask: OAK to publish failure cases alongside success stories." },
];

const SEED_PHOTOS: { id: string; day: 1 | 2 | 3 }[] = [
  { id: "ph1", day: 1 },
  { id: "ph2", day: 1 },
  { id: "ph3", day: 2 },
  { id: "ph4", day: 2 },
  { id: "ph5", day: 3 },
  { id: "ph6", day: 3 },
];

const SEED_RESOURCES: Resource[] = [
  { id: "r1", name: "Opening Plenary Presentation", fileType: "PDF", size: "3.2 MB", day: "Day 1" },
  { id: "r2", name: "OAK Portfolio Overview 2024–26", fileType: "PDF", size: "1.8 MB", day: "Day 2" },
  { id: "r3", name: "Action Planning Workbook", fileType: "DOCX", size: "0.9 MB", day: "Day 3" },
  { id: "r4", name: "Partner Contact Directory", fileType: "XLSX", size: "0.4 MB", day: "All Days" },
  { id: "r5", name: "Photo Gallery (High Res)", fileType: "ZIP", size: "184 MB", day: "All Days" },
];

const KEY_TAKEAWAYS = [
  "Philanthropy needs to accept 10+ year time horizons for systemic change",
  "Shared learning infrastructure is the most requested resource across the portfolio",
  "Digital rights must be integrated into all programme areas, not siloed",
  "Rights-based framing significantly improves grantee advocacy effectiveness",
  "Peer exchange is rated more valuable than expert-led sessions (92% vs 74%)",
];

export const EVENT = {
  name: "OAK Partner Convening 2026",
  location: "Cresta Lodge, Msasa, Harare",
  city: "Harare, Zimbabwe",
  dateRange: "9–11 November 2026",
  expectedAttendees: 110,
  sessionCount: SEED_SESSIONS.length + 15,
  partnerCount: 38,
};

function seedIfNeeded() {
  if (typeof window === "undefined") return;
  if (window.localStorage.getItem(KEYS.seeded)) return;
  write(KEYS.attendees, SEED_ATTENDEES);
  write(KEYS.checkins, [] as CheckIn[]);
  window.localStorage.setItem(KEYS.seeded, "1");
}


import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

// Public-safe list (e.g. for "simulate scan" demo picker) — no contact/dietary/travel data.
export async function getPublicAttendeeList(): Promise<PublicAttendee[]> {
  seedIfNeeded();
  const attendees = read<Attendee[]>(KEYS.attendees, []);
  return delay(
    attendees.map(({ id, qrCode, firstName, lastName, organisation, role }) => ({
      id,
      qrCode,
      firstName,
      lastName,
      organisation,
      role,
    }))
  );
}

export interface CheckInResult {
  ok: boolean;
  reason?: "not_found" | "already_checked_in";
  attendee?: Attendee;
  checkIn?: CheckIn;
  totalCheckedInToday?: number;
}

export async function checkInByQr(qrCode: string, day: 1 | 2 | 3 = 1, venue = "Main Entrance"): Promise<CheckInResult> {
  seedIfNeeded();
  const attendee = await getAttendeeByQr(qrCode);
  if (!attendee) {
    return delay({ ok: false, reason: "not_found" });
  }
  const checkins = read<CheckIn[]>(KEYS.checkins, []);
  const already = checkins.find((c) => c.attendeeId === attendee.id && c.day === day);
  if (already) {
    const totalCheckedInToday = checkins.filter((c) => c.day === day).length;
    return delay({ ok: false, reason: "already_checked_in", attendee, checkIn: already, totalCheckedInToday });
  }
  const checkIn: CheckIn = {
    id: uid("chk"),
    attendeeId: attendee.id,
    day,
    timestamp: new Date().toISOString(),
    venue,
  };
  checkins.push(checkIn);
  write(KEYS.checkins, checkins);
  const totalCheckedInToday = checkins.filter((c) => c.day === day).length;
  return delay({ ok: true, attendee, checkIn, totalCheckedInToday });
}

export async function getCheckinsForDay(day: 1 | 2 | 3): Promise<(CheckIn & { attendee: Attendee })[]> {
  seedIfNeeded();
  const checkins = read<CheckIn[]>(KEYS.checkins, []);
  const attendees = read<Attendee[]>(KEYS.attendees, []);
  const rows = checkins
    .filter((c) => c.day === day)
    .map((c) => ({ ...c, attendee: attendees.find((a) => a.id === c.attendeeId)! }))
    .filter((r) => r.attendee)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  return delay(rows);
}

export async function getAttendanceSummary(day: 1 | 2 | 3) {
  seedIfNeeded();
  const attendees = read<Attendee[]>(KEYS.attendees, []);
  const checkins = read<CheckIn[]>(KEYS.checkins, []);
  const checkedIn = checkins.filter((c) => c.day === day).length;
  return delay({
    expected: Math.max(EVENT.expectedAttendees, attendees.length),
    checkedIn,
    pending: Math.max(EVENT.expectedAttendees, attendees.length) - checkedIn,
  });
}

export async function getSessions(day: 1 | 2 | 3): Promise<Session[]> {
  return delay(SEED_SESSIONS.filter((s) => s.day === day));
}

export async function getSessionNotes(day: 1 | 2 | 3): Promise<SessionNote[]> {
  return delay(SEED_NOTES.filter((n) => n.day === day));
}

export async function addSessionNote(note: Omit<SessionNote, "id">): Promise<SessionNote> {
  const created = { ...note, id: uid("note") };
  SEED_NOTES.unshift(created);
  return delay(created);
}

export async function getPhotos(day: 1 | 2 | 3) {
  return delay(SEED_PHOTOS.filter((p) => p.day === day));
}

export async function getKeyTakeaways() {
  return delay(KEY_TAKEAWAYS);
}

export async function getResources(): Promise<Resource[]> {
  return delay(SEED_RESOURCES);
}

export async function getAttendeeById(id: string): Promise<Attendee | null> {
  seedIfNeeded();
  const attendees = read<Attendee[]>(KEYS.attendees, []);
  return delay(attendees.find((a) => a.id === id) ?? null);
}

export async function getAttendeeByQr(qrCode: string): Promise<Attendee | null> {
  seedIfNeeded();
  const normalized = qrCode.trim().toUpperCase();
  const attendees = read<Attendee[]>(KEYS.attendees, []);
  return delay(attendees.find((a) => a.qrCode.toUpperCase() === normalized) ?? null);
}

export async function registerAttendee(
  input: Omit<Attendee, "id" | "qrCode" | "createdAt" | "consentAt">
): Promise<Attendee> {
  seedIfNeeded();
  const attendees = read<Attendee[]>(KEYS.attendees, []);
  const now = new Date().toISOString();
  const attendee: Attendee = {
    ...input,
    id: uid("att"),
    qrCode: generateQrCode(),
    consentAt: now,
    createdAt: now,
  };
  attendees.unshift(attendee);
  write(KEYS.attendees, attendees);
  return delay(attendee);
}

export async function getPartners(): Promise<Partner[]> {
  return delay(SEED_PARTNERS);
}

export async function getPartnerById(id: string): Promise<Partner | null> {
  return delay(SEED_PARTNERS.find((p) => p.id === id) ?? null);
}

export function roleColor(role: Role) {
  switch (role) {
    case "Partner":
      return { dot: "bg-navy", bg: "bg-navy/5", text: "text-navy" };
    case "OAK Staff":
      return { dot: "bg-success", bg: "bg-success-bg", text: "text-success" };
    case "Coordination Team":
      return { dot: "bg-warn", bg: "bg-warn-bg", text: "text-warn" };
    case "Presenter":
      return { dot: "bg-purple-500", bg: "bg-purple-50", text: "text-purple-600" };
    default:
      return { dot: "bg-ink-faint", bg: "bg-gray-100", text: "text-ink-muted" };
  }
}
