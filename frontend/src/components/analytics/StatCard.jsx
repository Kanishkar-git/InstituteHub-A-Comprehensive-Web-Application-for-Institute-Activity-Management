import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

export default function StatCard({ title, value, subtitle, trend, trendValue, icon: Icon, colorClass }) {
  const isPositive = trend === 'up'
  const isNeutral = trend === 'neutral'

  return (
    <div className="bg-white overflow-hidden rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-200">
      <div className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-500 truncate">{title}</p>
            <div className="mt-1 flex items-baseline">
              <p className="text-3xl font-bold text-slate-900">{value}</p>
              {subtitle && <p className="ml-2 text-sm text-slate-500">{subtitle}</p>}
            </div>
          </div>
          <div className={`p-3 rounded-xl ${colorClass}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
        
        {trendValue && (
          <div className="mt-4 flex items-center text-sm">
            {isPositive && <ArrowUpRight className="h-4 w-4 text-emerald-500 mr-1" />}
            {!isPositive && !isNeutral && <ArrowDownRight className="h-4 w-4 text-rose-500 mr-1" />}
            <span className={`font-medium ${isPositive ? 'text-emerald-600' : isNeutral ? 'text-slate-500' : 'text-rose-600'}`}>
              {trendValue}
            </span>
            <span className="ml-2 text-slate-500">vs last semester</span>
          </div>
        )}
      </div>
    </div>
  )
}
