import type { SecurityEventType } from "@/types";

export function eventTypeLabel(t: SecurityEventType): string {
  const map: Record<SecurityEventType, string> = {
    identity_spoof: "伪造身份",
    downgrade: "降级攻击",
    replay: "重放攻击",
    signature_invalid: "签名异常",
  };
  return map[t] ?? t;
}

export function dispositionLabel(
  a: "block" | "ban" | "rollback"
): string {
  const map = { block: "阻断", ban: "封禁", rollback: "回滚" };
  return map[a] ?? a;
}

export function timelineStatusLabel(
  s: "open" | "handling" | "closed"
): string {
  const map = { open: "待处置", handling: "处理中", closed: "已关闭" };
  return map[s] ?? s;
}
