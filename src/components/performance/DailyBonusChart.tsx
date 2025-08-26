import { BarChart } from '@mui/x-charts/BarChart';

interface DailyBonusData {
  date: string;
  bonusIssued: number;
  bonusRedeemed: number;
  redemptionRate: number;
  [key: string]: string | number;
}

interface DailyBonusChartProps {
  data: DailyBonusData[];
}

export default function DailyBonusChart({ data }: DailyBonusChartProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Bonus Issued vs. Redeemed</h3>
      <div className="h-64">
        <BarChart
          dataset={data}
          xAxis={[{
            dataKey: 'date',
            scaleType: 'band',
          }]}
          series={[
            {
              dataKey: 'bonusIssued',
              label: 'Bonus Issued',
              color: '#33CCCC',
            },
            {
              dataKey: 'bonusRedeemed',
              label: 'Bonus Redeemed',
              color: '#00CC66',
            }
          ]}
          yAxis={[{
            min: 0,
            max: Math.max(...data.map(item => Math.max(Number(item.bonusIssued), Number(item.bonusRedeemed)))) * 1.1,
          }]}
          height={256}
          grid={{ vertical: true, horizontal: true }}
          margin={{ top: 20, bottom: 40, left: 50, right: 30 }}
        />
      </div>
    </div>
  );
}
