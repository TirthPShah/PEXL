"use client";

import { FileWithProgress } from "@/types/files";
import { FileItem } from "./FileItem";

interface FileListProps {
  files: FileWithProgress[];
}

export function FileList({ files }: FileListProps) {
  if (files.length === 0) return null;

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      {files.map((file) => (
        <FileItem key={file.id} file={file} />
      ))}
    </div>
  );
}
