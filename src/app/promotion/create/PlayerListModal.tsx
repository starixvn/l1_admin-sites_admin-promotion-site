interface PlayerListModalProps {
  showPlayerList: boolean;
  setShowPlayerList: (show: boolean) => void;
  offeredPlayerIds?: string[] | undefined;
}

export function PlayerListModal({
  showPlayerList,
  setShowPlayerList,
  offeredPlayerIds,
}: PlayerListModalProps) {
  if (!showPlayerList) {
    return null;
  }
  return (
    <div
      className="absolute left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center bg-white/60"
      onClick={() => setShowPlayerList(false)}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-[480px] p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Player List</h2>
          <button
            className="text-gray-400 hover:text-red-500 text-2xl font-bold transition"
            onClick={() => setShowPlayerList(false)}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="overflow-y-auto max-h-80 border">
          <table className="w-full text-base">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="px-4 py-2 text-center font-medium text-gray-700 border-r">
                  No.
                </th>
                <th className="px-4 py-2 text-center font-medium text-gray-700">
                  PlayerID
                </th>
              </tr>
            </thead>
            <tbody>
              {(offeredPlayerIds ?? []).map((id, idx) => (
                <tr key={id + idx} className="border-b last:border-b-0">
                  <td className="px-4 py-2 text-center border-r">{idx + 1}</td>
                  <td className="px-4 py-2 text-center">{id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end mt-6">
          <button
            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium shadow cursor-pointer"
            onClick={() => setShowPlayerList(false)}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
