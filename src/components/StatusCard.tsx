import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";

interface StatusCardProps {
  name: string;
  status?: string;
  pages?: number;
  bwPrice?: number;
  colorPrice?: number;
  location?: string;
}

export default function StatusCard({
  name,
  status,
  pages,
  bwPrice,
  colorPrice,
  location,

}: StatusCardProps) {
  return (
    <Card className="relative w-full  p-4 flex justify-between bg-white rounded-2xl border border-gray-300 cursor-pointer">
      {/* Left Side: Name + Price + Status */}
      <div className="flex flex-col">
        <h3 className="text-lg font-semibold text-gray-900">{name}</h3>

        {/* Pricing Information */}
        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1 mb-1">
          {bwPrice !== undefined && (
            <span className="font-medium">B&W: ₹{bwPrice}/sheet</span>
          )}
          {colorPrice !== undefined && (
            <span className="font-medium">Color: ₹{colorPrice}/sheet</span>
          )}
        </div>

        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1 mb-1">
          {location && (
            <span className="font-medium">
              Location: {location}
            </span>
          )}
        </div>

        {/* Show Online Status */}
        {status === "Online" && (
          <div className="flex items-center space-x-2 mt-1">
            <CheckCircle className="text-green-500" size={20} />
            <span className="text-green-600 font-medium">{status}</span>
          </div>
        )}

        {/* Show Offline Status */}
        {status === "Offline" && (
          <div className="flex items-center space-x-2 mt-1">
            <XCircle className="text-red-500" size={20} />
            <span className="text-red-600 font-medium">{status}</span>
          </div>
        )}
      </div>

      {/* Right Side: Badge (Only if status is "Online") */}
      {status === "Online" && pages !== undefined && (
        <div className="absolute top-6 right-4">
          <Badge className="bg-gray-200 text-gray-900 px-4 py-2 mt-auto rounded-lg text-sm font-medium">
            {pages} pages in queue
          </Badge>
        </div>
      )}
    </Card>
  );
}
