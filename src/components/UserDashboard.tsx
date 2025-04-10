"use client";

import { useSession } from "next-auth/react";
import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { FileWithProgress } from "@/types/files";
import { UserHeader } from "./dashboard/UserHeader";
import { FileUploadZone } from "./dashboard/FileUploadZone";
import { FileList } from "./dashboard/FileList";
import { useRouter } from "next/navigation";
import { PrintSettingsItem } from "@/types/printSettings";

interface UserDashboardProps extends React.HTMLAttributes<HTMLDivElement> {}

export default function UserDashboard({
  className,
  ...props
}: UserDashboardProps) {
  const { data: session } = useSession();
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const [isCountingPages, setIsCountingPages] = useState(false);
  const router = useRouter();

  const checkIfAllPagesCount = useCallback(
    (currentFiles: FileWithProgress[]) => {
      const allPagesCountedAndComplete = currentFiles.every(
        (f) => f.status === "completed" && typeof f.pageCount === "number"
      );
      setIsCountingPages(!allPagesCountedAndComplete);
    },
    []
  );

  const handleFilesAccepted = useCallback((newFiles: FileWithProgress[]) => {
    setFiles((prev) => {
      const updatedFiles = [
        ...prev,
        ...newFiles.map((file) => ({
          ...file,
          pageCount: undefined, // Reset page count for new files
        })),
      ];
      return updatedFiles;
    });
    setIsCountingPages(true); // Start counting pages
  }, []);

  const updateFileProgress = useCallback((fileId: string, progress: number) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === fileId
          ? {
              ...f,
              progress,
              status: progress === 100 ? "completed" : "uploading",
            }
          : f
      )
    );
  }, []);

  const updateFileError = useCallback(
    (fileId: string) => {
      setFiles((prev) => {
        const updatedFiles = prev.map((f) =>
          f.id === fileId
            ? {
                ...f,
                status: "error" as const,
              }
            : f
        );
        checkIfAllPagesCount(updatedFiles);
        return updatedFiles;
      });
    },
    [checkIfAllPagesCount]
  );

  const handleUploadComplete = useCallback(
    (tempFileId: string, mongoDbId: string, pageCount?: number) => {
      setFiles((prev) => {
        const updatedFiles = prev.map((f) => {
          if (f.id === tempFileId) {
            const settings: PrintSettingsItem[] = JSON.parse(
              localStorage.getItem("printSettingsArray") || "[]"
            );

            const updatedSettings = settings.map((setting) => {
              if (setting.tempId === tempFileId) {
                return {
                  ...setting,
                  serverId: mongoDbId,
                  pageCount: pageCount || setting.pageCount,
                };
              }
              return setting;
            });

            localStorage.setItem(
              "printSettingsArray",
              JSON.stringify(updatedSettings)
            );

            return {
              ...f,
              serverId: mongoDbId,
              status: "completed" as const,
              progress: 100,
              pageCount,
            };
          }
          return f;
        });

        checkIfAllPagesCount(updatedFiles);
        return updatedFiles;
      });
    },
    [checkIfAllPagesCount]
  );

  const handleNextClick = () => {
    const filesToStore = files.map((file) => ({
      ...file,
      id: file.serverId || file.id,
      file: undefined,
    }));
    localStorage.setItem("printFiles", JSON.stringify(filesToStore));
    router.push("/stationary");
  };

  if (!session) return null;

  const hasCompletedFiles =
    files.length > 0 && files.every((f) => f.status === "completed");

  return (
    <main className={cn("px-8", className)} {...props}>
      <div className="max-w-7xl mx-auto">
        <UserHeader />
        <div className="max-w-7xl mx-auto mt-9">
          <FileUploadZone
            onFilesAccepted={handleFilesAccepted}
            onProgress={updateFileProgress}
            onError={updateFileError}
            onUploadComplete={handleUploadComplete}
          />
          <FileList files={files} />
          {hasCompletedFiles && (
            <div className="flex justify-end mt-6">
              <button
                onClick={handleNextClick}
                disabled={isCountingPages}
                className={cn(
                  "px-6 py-2 rounded-lg transition-colors",
                  isCountingPages
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                )}
              >
                {isCountingPages ? "Counting Pages..." : "Choose Stationary"}
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
