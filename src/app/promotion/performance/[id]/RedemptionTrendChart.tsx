import { LineChart } from '@mui/x-charts/LineChart';

interface DailyBonusData {
  date: string;
  bonusIssued: number;
  bonusRedeemed: number;
  redemptionRate: number;
  [key: string]: string | number;
}

interface RedemptionTrendChartProps {
  data: DailyBonusData[];
}

export default function RedemptionTrendChart({ data }: RedemptionTrendChartProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Bonus Redemption Rate Trend</h3>
      <div className="h-64">
        <LineChart
          dataset={data}
          xAxis={[{
            dataKey: 'date',
            scaleType: 'point',
          }]}
          series={[{
            dataKey: 'redemptionRate',
            label: 'Redemption Rate (%)',
            color: '#8b5cf6',
            curve: 'linear',
            showMark: true,
          }]}
          yAxis={[{
            min: Math.floor(Math.min(...data.map(item => item.redemptionRate)) / 10) * 10,
            max: Math.ceil(Math.max(...data.map(item => item.redemptionRate)) / 10) * 10,
          }]}
          height={256}
          grid={{ vertical: true, horizontal: true }}
          margin={{ top: 20, bottom: 30, left: 40, right: 20 }}
        />
      </div>
    </div>
  );
}
