export type SecurityEventType =
  | "identity_spoof"
  | "downgrade"
  | "replay"
  | "signature_invalid";

export type DispositionAction = "block" | "ban" | "rollback";

export type TimelineStatus = "open" | "handling" | "closed";

export interface SecurityEventRecord {
  id: string;
  at: string;
  deviceId: string;
  type: SecurityEventType;
  action: DispositionAction;
  status: TimelineStatus;
  attackPath: string[];
  auditJson: Record<string, unknown>;
}

export interface DashboardAnomalyItem {
  id: string;
  at: string;
  deviceId: string;
  type: SecurityEventType;
  status: TimelineStatus;
  attackPath: string[];
}
