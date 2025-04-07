"use client";

import { useSession } from "next-auth/react";
import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { FileWithProgress } from "@/types/files";
import { UserHeader } from "./dashboard/UserHeader";
import { FileUploadZone } from "./dashboard/FileUploadZone";
import { FileList } from "./dashboard/FileList";
import { useRouter } from "next/navigation";

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
    (fileId: string, serverId: string, pageCount?: number) => {
      setFiles((prev) => {
        const newFiles = prev.map((f) =>
          f.id === fileId
            ? {
                ...f,
                serverId, // Store the MongoDB ObjectId as serverId
                id: serverId, // Update the temporary id with the MongoDB ObjectId
                status: "completed" as const,
                pageCount: pageCount || 1, // Default to 1 if pageCount is not provided
              }
            : f
        );
        // Check if all files have page counts after updating
        checkIfAllPagesCount(newFiles);
        return newFiles;
      });
    },
    [checkIfAllPagesCount]
  );

  const handleNextClick = () => {
    // Store files in localStorage to access them on the checkout page
    // Make sure we use the MongoDB IDs for the files
    const filesToStore = files.map((file) => ({
      ...file,
      id: file.serverId || file.id, // Use the MongoDB ObjectId (serverId) if available
      file: undefined, // Remove the File object as it can't be serialized
    }));
    localStorage.setItem("printFiles", JSON.stringify(filesToStore));
    // Change from /instructions to /stationary
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
