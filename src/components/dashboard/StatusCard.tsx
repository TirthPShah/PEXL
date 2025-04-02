interface StatusCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}

export function StatusCard({ title, value, icon }: StatusCardProps) {
  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">{title}</h3>
        <div className="p-2 bg-blue-50 rounded">{icon}</div>
      </div>
      <p className="text-3xl font-semibold">{value}</p>
      <div className="mt-4 text-sm text-gray-600">
        <div className="flex justify-between items-center">
          <span>B&W:</span>
          <span>&#8377; 2 per sheet</span>
        </div>
        <div className="flex justify-between items-center mt-1">
          <span>Color:</span>
          <span>&#8377; 7 per sheet</span>
        </div>
        <div className="text-xs text-gray-500 mt-2">
          *Each sheet can print 2 pages (front & back)
        </div>
      </div>
    </div>
  );
}
