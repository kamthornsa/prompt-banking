export const SEED_ADMIN_EMAILS: string[] = (
  process.env.SEED_ADMIN_EMAILS ?? "kamthorn.sa@ksu.ac.th"
)
  .split(",")
  .map((e) => e.trim())
  .filter(Boolean);

/** อีเมลนี้ห้ามลด role ลงเด็ดขาด — ป้องกัน lockout */
export const PROTECTED_ADMIN_EMAIL =
  SEED_ADMIN_EMAILS[0] ?? "kamthorn.sa@ksu.ac.th";
