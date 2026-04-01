export interface UserProfile {
  id: string;
  name: string;
  role: "admin" | "operator" | "auditor";
  avatar?: string;
}
