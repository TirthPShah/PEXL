"use client";

import { Upload } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { FileWithProgress } from "@/types/files";
import { PrintSettingsItem } from "@/types/printSettings";

interface FileUploadZoneProps {
  onFilesAccepted: (files: FileWithProgress[]) => void;
  onProgress: (fileId: string, progress: number) => void;
  onError: (fileId: string) => void;
  onUploadComplete?: (
    fileId: string,
    serverId: string,
    pageCount?: number
  ) => void;
}

export function FileUploadZone({
  onFilesAccepted,
  onProgress,
  onError,
  onUploadComplete,
}: FileUploadZoneProps) {
  const onDrop = async (acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      name: file.name || "Unnamed File",
      size: file.size || 0,
      type: file.type || "application/octet-stream",
      progress: 0,
      status: "uploading" as const,
      id: `temp-${Math.random().toString(36).substring(7)}`,
      file: file,
    }));

    // Initialize print settings for each new file
    const existingSettings: PrintSettingsItem[] = JSON.parse(
      localStorage.getItem("printSettingsArray") || "[]"
    );

    const updatedSettings = [
      ...existingSettings,
      ...newFiles.map((file) => ({
        tempId: file.id,
        serverId: undefined,
        isB_W: false,
        isDoubleSided: true,
        pageCount: undefined,
      })),
    ];

    localStorage.setItem("printSettingsArray", JSON.stringify(updatedSettings));
    onFilesAccepted(newFiles);

    // Upload each file
    for (const fileData of newFiles) {
      try {
        const formData = new FormData();
        formData.append("file", fileData.file);

        const xhr = new XMLHttpRequest();

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded * 100) / event.total);
            onProgress(fileData.id, progress);
          }
        };

        xhr.onerror = () => {
          console.error("XHR Error");
          onError(fileData.id);
        };

        xhr.open("POST", "/api/upload");
        xhr.setRequestHeader("Accept", "application/json");

        await new Promise<void>((resolve, reject) => {
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const response = JSON.parse(xhr.responseText);
                console.log("Upload response:", response);
                if (response.success && response.fileId && onUploadComplete) {
                  // Update the print settings with server ID and page count
                  const currentSettings: PrintSettingsItem[] = JSON.parse(
                    localStorage.getItem("printSettingsArray") || "[]"
                  );

                  const updatedSettings = currentSettings.map((setting) => {
                    if (setting.tempId === fileData.id) {
                      return {
                        ...setting,
                        serverId: response.fileId.toString(),
                        pageCount: response.file.pageCount || 1,
                      };
                    }
                    return setting;
                  });

                  localStorage.setItem(
                    "printSettingsArray",
                    JSON.stringify(updatedSettings)
                  );

                  // Pass the MongoDB ObjectId and update the file ID
                  onUploadComplete(
                    fileData.id, // Original temp ID for tracking
                    response.fileId.toString(), // MongoDB ObjectId
                    response.file.pageCount
                  );
                } else {
                  console.error("Invalid response format:", response);
                  onError(fileData.id);
                }
              } catch (parseError) {
                console.error("Response parse error:", parseError);
                onError(fileData.id);
              }
              resolve();
            } else {
              console.error("Upload failed with status:", xhr.status);
              try {
                const errorResponse = JSON.parse(xhr.responseText);
                console.error("Server error response:", errorResponse);
              } catch (e) {
                console.error("Raw error response:", xhr.responseText);
              }
              onError(fileData.id);
              reject(new Error(`Upload failed with status: ${xhr.status}`));
            }
          };

          xhr.onerror = () => {
            console.error("Network error during upload");
            onError(fileData.id);
            reject(new Error("Network error during upload"));
          };

          xhr.send(formData);
        });
      } catch (error) {
        console.error("Upload error:", error);
        onError(fileData.id);
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".tiff", ".webp"],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-2">Upload Files</h1>
        <p className="text-gray-600">Upload files to be printed</p>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 max-w-6xl mx-auto border-dashed rounded-lg p-8 mb-6 mt-10 text-center cursor-pointer transition-colors
          ${
            isDragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
      >
        <input {...getInputProps()} />
        <div className="w-[120px] h-[120px] mx-auto mb-4 bg-gray-50 rounded-full flex items-center justify-center">
          <Upload className="h-16 w-16 text-gray-400" />
        </div>
        <p className="text-lg font-medium">Upload files to be printed</p>
        <p className="text-gray-500 mt-2">Maximum file size: 50 MB</p>
        <p className="text-gray-500">
          Accepted formats: PDF, PNG, JPG, JPEG, GIF, BMP, TIFF, WEBP
        </p>
      </div>
    </div>
  );
}
