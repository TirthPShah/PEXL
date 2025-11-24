import { PaperType } from "./paper";

export interface PrintSettingsItem {
  serverId?: string;
  tempId: string;
  isB_W: boolean;
  isDoubleSided: boolean;
  pageCount?: number;
  paperType?: PaperType;
}
