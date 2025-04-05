import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { StatCardProps } from "@/types";
import { TREND_COLORS, TREND_ICONS } from "@/lib/constants";

export default function StatCard({
  icon,
  iconBgColor,
  iconColor,
  title,
  value,
  trend,
  trendValue
}: StatCardProps) {
  return (
    <Card>
      <CardContent className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <div className={`flex-shrink-0 ${iconBgColor} rounded-md p-3`}>
            <span className={`material-icons ${iconColor}`}>{icon}</span>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                <div className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">{value}</div>
                  <div className={`ml-2 flex items-baseline text-sm font-semibold ${TREND_COLORS[trend]}`}>
                    <span className="material-icons text-xs">{TREND_ICONS[trend]}</span>
                    <span className="sr-only">
                      {trend === 'up' ? 'Increased by' : trend === 'down' ? 'Decreased by' : 'No change'}
                    </span>
                    {trendValue}
                  </div>
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
