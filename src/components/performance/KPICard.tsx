import { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  iconColor: string;
  onClick?: () => void;
  clickable?: boolean;
}

export default function KPICard({ 
  title, 
  value, 
  icon: Icon, 
  iconColor, 
  onClick, 
  clickable = false 
}: KPICardProps) {
  return (
    <div 
      className={`bg-white rounded-lg shadow-sm p-6 ${
        clickable ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
      }`}
      onClick={clickable ? onClick : undefined}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <Icon className={`w-8 h-8 ${iconColor}`} />
      </div>
    </div>
  );
}
