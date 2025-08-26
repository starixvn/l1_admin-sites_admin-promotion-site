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
        clickable 
          ? 'cursor-pointer hover:shadow-md hover:bg-gray-50 transition-all duration-200 border-2 border-transparent hover:border-blue-200 group' 
          : ''
      }`}
      onClick={clickable ? onClick : undefined}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            {clickable && (
              <svg 
                className="w-4 h-4 text-blue-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
                />
              </svg>
            )}
          </div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <Icon className={`w-8 h-8 ${iconColor} ${clickable ? 'group-hover:scale-110 transition-transform' : ''}`} />
      </div>
    </div>
  );
}
