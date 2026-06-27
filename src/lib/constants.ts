export const SEED_ADMIN_EMAILS: string[] = (
  process.env.SEED_ADMIN_EMAILS ?? "kamthorn.sa@ksu.ac.th"
)
  .split(",")
  .map((e) => e.trim())
  .filter(Boolean);

/** อีเมลนี้ห้ามลด role ลงเด็ดขาด — ป้องกัน lockout */
export const PROTECTED_ADMIN_EMAIL =
  SEED_ADMIN_EMAILS[0] ?? "kamthorn.sa@ksu.ac.th";

/** Labels สำหรับ TeachingSubject enum (8 สาระหลัก + อื่นๆ) */
export const TEACHING_SUBJECT_LABELS: Record<string, string> = {
  THAI:         "ภาษาไทย",
  MATH:         "คณิตศาสตร์",
  SCIENCE:      "วิทยาศาสตร์และเทคโนโลยี",
  SOCIAL:       "สังคมศึกษาฯ",
  HEALTH_PE:    "สุขศึกษาและพลศึกษา",
  ART:          "ศิลปะ",
  CAREER_TECH:  "การงานอาชีพ",
  FOREIGN_LANG: "ภาษาต่างประเทศ",
  OTHER:        "อื่นๆ",
};

/** Slugs สงวนไว้ — ห้าม user ใช้ */
export const RESERVED_SLUGS = [
  "admin", "author", "api", "settings", "u",
  "login", "logout", "auth", "404", "500",
];
