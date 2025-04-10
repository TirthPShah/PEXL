export interface FileWithProgress {
  name: string;
  size: number;
  progress: number;
  status: "uploading" | "completed" | "error";
  id: string;
  type: string;
  file?: File;
  serverId?: string; // MongoDB ObjectId after successful upload
  pageCount?: number; // Number of pages in the document
  tempId?: string
}
