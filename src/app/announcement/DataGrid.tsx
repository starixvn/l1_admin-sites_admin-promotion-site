import React from "react";

function getStatusColor(status: string) {
  switch (status) {
    case "Running":
      return "text-blue-500";
    case "Upcoming":
      return "text-green-400";
    case "Completed":
      return "text-red-400";
    default:
      return "text-gray-500";
  }
}

export default function DataGrid({ announcements }: { announcements: any[] }) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
      <div className="w-full" style={{ maxHeight: '68vh', overflowY: 'auto' }}>
        <table className="w-full border-collapse min-w-[1200px]">
          <thead className="sticky top-0 z-10 bg-gray-50">
            <tr>
              <th className="w-[4%] px-4 py-3 bg-gray-50 text-center text-sm font-semibold text-gray-700 border-b border-r border-gray-200">No.</th>
              <th className="w-[16%] px-4 py-3 bg-gray-50 text-left text-sm font-semibold text-gray-700 border-b border-r border-gray-200">Promotion Title</th>
              <th className="w-[20%] px-4 py-3 bg-gray-50 text-left text-sm font-semibold text-gray-700 border-b border-r border-gray-200">Banner Content</th>
              <th className="w-[20%] px-4 py-3 bg-gray-50 text-left text-sm font-semibold text-gray-700 border-b border-r border-gray-200">Terms & Conditions</th>
              <th className="w-[9%] px-4 py-3 bg-gray-50 text-center text-sm font-semibold text-gray-700 border-b border-r border-gray-200">Display Date (GMT + 7)</th>
              <th className="w-[10%] px-4 py-3 bg-gray-50 text-center text-sm font-semibold text-gray-700 border-b border-r border-gray-200">Promotion Mapping</th>
              <th className="w-[5%] px-4 py-3 bg-gray-50 text-center text-sm font-semibold text-gray-700 border-b border-r border-gray-200">Status</th>
              <th className="w-[3%] px-4 py-3 bg-gray-50 text-center text-sm font-semibold text-gray-700 border-b border-gray-200">Action</th>
            </tr>
          </thead>
          <tbody>
            {announcements.map((a, idx) => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm border-b border-r border-gray-200 text-center">{idx + 1}</td>
                <td className="px-4 py-3 text-sm border-b border-r border-gray-200 relative">
                  {a.title}
                  <span className="absolute bottom-2 right-2">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="9" stroke="#222" strokeWidth="1.5" fill="none" />
                      <ellipse cx="10" cy="10" rx="5" ry="9" stroke="#222" strokeWidth="1.2" fill="none" />
                      <ellipse cx="10" cy="10" rx="9" ry="3.5" stroke="#222" strokeWidth="1.2" fill="none" />
                      <path d="M10 1v18" stroke="#222" strokeWidth="1.2" />
                      <path d="M2 10h16" stroke="#222" strokeWidth="1.2" />
                    </svg>
                  </span>
                </td>
                <td className="px-4 py-3 text-sm border-b border-r border-gray-200 relative">
                  {a.banner}
                  <span className="absolute bottom-2 right-2">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="9" stroke="#222" strokeWidth="1.5" fill="none" />
                      <ellipse cx="10" cy="10" rx="5" ry="9" stroke="#222" strokeWidth="1.2" fill="none" />
                      <ellipse cx="10" cy="10" rx="9" ry="3.5" stroke="#222" strokeWidth="1.2" fill="none" />
                      <path d="M10 1v18" stroke="#222" strokeWidth="1.2" />
                      <path d="M2 10h16" stroke="#222" strokeWidth="1.2" />
                    </svg>
                  </span>
                </td>
                <td className="px-4 py-3 text-sm border-b border-r border-gray-200 relative">
                  {a.terms}
                  <span className="absolute bottom-2 right-2">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="9" stroke="#222" strokeWidth="1.5" fill="none" />
                      <ellipse cx="10" cy="10" rx="5" ry="9" stroke="#222" strokeWidth="1.2" fill="none" />
                      <ellipse cx="10" cy="10" rx="9" ry="3.5" stroke="#222" strokeWidth="1.2" fill="none" />
                      <path d="M10 1v18" stroke="#222" strokeWidth="1.2" />
                      <path d="M2 10h16" stroke="#222" strokeWidth="1.2" />
                    </svg>
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-sm border-b border-r border-gray-200 whitespace-nowrap">
                  <div>From {a.displayDate.from}</div>
                  <div>To {a.displayDate.to}</div>
                </td>
                <td className="px-4 py-3 text-sm border-b border-r border-gray-200 text-blue-500 text-center cursor-pointer">{a.mapping}</td>
                <td className={`px-4 py-3 text-sm border-b border-r border-gray-200 text-center font-semibold ${getStatusColor(a.status)}`}>{a.status}</td>
                <td className="px-4 py-3 text-sm border-b border-gray-200 ">
                  <div className="flex flex-col gap-2 items-center">
                    <button
                      className={`w-full min-w-[60px] px-3 py-1 rounded text-xs font-medium ${a.status === "Completed" ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-emerald-500 text-white hover:bg-emerald-600 cursor-pointer"}`}
                      disabled={a.status === "Completed"}
                    >
                      Edit
                    </button>
                    <button
                      className={`w-full min-w-[60px] px-3 py-1 rounded text-xs font-medium ${a.status === "Completed" || a.status === "Running" ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-red-500 text-white hover:bg-red-600 cursor-pointer"}`}
                      disabled={a.status === "Completed" || a.status === "Running"}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
