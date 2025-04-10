"use client";

import { Upload } from "lucide-react";
import { FileWithProgress } from "@/types/files";
import { PrintSettingsItem } from "@/types/printSettings";
import * as Switch from "@radix-ui/react-switch";
import { useState, useEffect } from "react";

interface FileItemProps {
  file: FileWithProgress;
}

export function FileItem({ file }: FileItemProps) {
  const [isColor, setIsColor] = useState(false);
  const [isDoubleSided, setIsDoubleSided] = useState(true);

  // Load initial settings from printSettingsArray
  useEffect(() => {
    const loadSettings = () => {
      const settingsArray: PrintSettingsItem[] = JSON.parse(
        localStorage.getItem("printSettingsArray") || "[]"
      );

      // Find the settings for this file by either tempId or serverId
      const fileSettings = settingsArray.find(
        (setting) => setting.tempId === file.id || setting.serverId === file.id
      );

      if (fileSettings) {
        // Update state based on the found settings
        // Note: isColor is the opposite of isB_W
        setIsColor(!fileSettings.isB_W);
        setIsDoubleSided(fileSettings.isDoubleSided);
      }
    };

    loadSettings();
  }, [file.id]);

  // Update settings when toggles change
  useEffect(() => {
    // Update the new printSettingsArray format
    const settingsArray: PrintSettingsItem[] = JSON.parse(
      localStorage.getItem("printSettingsArray") || "[]"
    );

    const updatedSettingsArray = settingsArray.map((setting) => {
      if (setting.tempId === file.id || setting.serverId === file.id) {
        return {
          ...setting,
          isB_W: !isColor, // Convert isColor to isB_W (they're opposites)
          isDoubleSided: isDoubleSided,
        };
      }
      return setting;
    });

    localStorage.setItem(
      "printSettingsArray",
      JSON.stringify(updatedSettingsArray)
    );

    // Also maintain the old format for backward compatibility
    const printSettings = localStorage.getItem("printSettings") || "{}";
    const settings = JSON.parse(printSettings);
    settings[file.id] = {
      isBlackAndWhite: !isColor,
      isDoubleSided: isDoubleSided,
    };
    localStorage.setItem("printSettings", JSON.stringify(settings));
  }, [isColor, isDoubleSided, file.id]);

  const formatFileSize = (bytes: number): string => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="bg-white rounded-lg border p-4 px- relative">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-50 rounded">
            <Upload className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="font-medium">{file.name}</p>
            <p className="text-sm text-gray-500">
              {formatFileSize(file.size)}
              {file.pageCount && ` • ${file.pageCount} pages`}
              {file.status === "uploading" &&
                ` • ${Math.min(file.progress, 100)}% uploaded`}
              {file.status === "error" && " • Upload failed"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Color toggle */}
          <div className="flex items-center gap-2">
            <label
              className="text-sm font-medium text-gray-700"
              htmlFor={`color-toggle-${file.id}`}
            >
              {!isColor ? "B&W" : "Colour"}
            </label>
            <Switch.Root
              id={`color-toggle-${file.id}`}
              checked={isColor}
              onCheckedChange={setIsColor}
              className={`w-[42px] h-[25px] rounded-full relative outline-none cursor-pointer transition-colors duration-200 ${
                !isColor ? "bg-black" : "bg-blue-600"
              }`}
            >
              <Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full transition-transform duration-200 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[19px] shadow-lg" />
            </Switch.Root>
          </div>

          {/* Double-sided toggle */}
          <div className="flex items-center gap-2">
            <label
              className="text-sm font-medium text-gray-700"
              htmlFor={`sides-toggle-${file.id}`}
            >
              {isDoubleSided ? "Double" : "Single"}
            </label>
            <Switch.Root
              id={`sides-toggle-${file.id}`}
              checked={isDoubleSided}
              onCheckedChange={setIsDoubleSided}
              className={`w-[42px] h-[25px] rounded-full relative outline-none cursor-pointer transition-colors duration-200 ${
                isDoubleSided ? "bg-green-600" : "bg-blue-50"
              }`}
            >
              <Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full transition-transform duration-200 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[19px] shadow-lg" />
            </Switch.Root>
          </div>
        </div>
      </div>
      {file.status === "uploading" && (
        <div className="mt-3 w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(file.progress, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}
