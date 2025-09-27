"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import { Download, TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function PerformancePage() {
  const router = useRouter();
  const [dateRange, setDateRange] = useState("today");

  return (
    <ProtectedRoute requiredRoles={['admin']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Performance Dashboard</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              label="Download"
              variant="outlineDark"
              icon={<Download className="h-4 w-4" />}
            />
          </div>
        </div>

        {/* Date Range Selector */}
        <div className="bg-white dark:bg-gray-dark rounded-lg p-4 shadow-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              {["Today", "7d", "30d", "90d", "Custom"].map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range.toLowerCase())}
                  className={`px-3 py-1 text-sm font-medium rounded transition-all duration-200 ${
                    dateRange === range.toLowerCase() 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                ◀
              </button>
              <span>Sep 1-25, 2025</span>
              <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                ▶
              </button>
            </div>
          </div>
        </div>

        {/* Performance Overview */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Performance Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="bg-white dark:bg-gray-dark rounded-lg p-4 shadow-1 text-center">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Driver Score</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">87/100</p>
            </div>
            <div className="bg-white dark:bg-gray-dark rounded-lg p-4 shadow-1 text-center">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Vehicle Score</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">82/100</p>
            </div>
            <div className="bg-white dark:bg-gray-dark rounded-lg p-4 shadow-1 text-center">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Fleet Score</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">85/100</p>
            </div>
            <div className="bg-white dark:bg-gray-dark rounded-lg p-4 shadow-1 text-center">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Safety Score</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">92/100</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-dark rounded-lg p-4 shadow-1 text-center">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Eco Score</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">79/100</p>
            </div>
            <div className="bg-white dark:bg-gray-dark rounded-lg p-4 shadow-1 text-center">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Efficiency</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">83/100</p>
            </div>
            <div className="bg-white dark:bg-gray-dark rounded-lg p-4 shadow-1 text-center">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Utilization</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">76/100</p>
            </div>
            <div className="bg-white dark:bg-gray-dark rounded-lg p-4 shadow-1 text-center">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Maint. Score</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">88/100</p>
            </div>
          </div>
        </div>

        {/* Driver Performance */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Driver Performance</h2>
          <div className="bg-white dark:bg-gray-dark rounded-lg shadow-1 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Driver Rankings</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Driver</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Safety</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Eco</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Overall</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Trips</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Trend</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-dark divide-y divide-gray-200 dark:divide-gray-700">
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">Jane Doe</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">96</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">92</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">94</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">42</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      2%
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">Amir Khan</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">94</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">88</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">91</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">38</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      1%
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">Priya Sharma</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">90</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">86</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">88</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">35</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 flex items-center">
                      <Minus className="h-4 w-4 mr-1" />
                      0%
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">Raj Patel</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">83</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">91</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">87</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">40</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      3%
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">Sara Ahmed</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">89</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">81</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">85</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">31</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-red-600 flex items-center">
                      <TrendingDown className="h-4 w-4 mr-1" />
                      1%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
              <Button
                label="[View All Driver Performance]"
                variant="outlineDark"
                size="small"
                onClick={() => router.push('/driver-performance')}
              />
            </div>
          </div>
        </div>

        {/* Vehicle Performance */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Vehicle Performance</h2>
          <div className="bg-white dark:bg-gray-dark rounded-lg shadow-1 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Vehicle Rankings</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Vehicle</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Efficiency</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Health</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Overall</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Usage</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Trend</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-dark divide-y divide-gray-200 dark:divide-gray-700">
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">EV-5431</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">95</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">92</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">94</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">82%</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      1%
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">EV-9812</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">92</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">94</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">93</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">76%</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      2%
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">EV-3387</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">88</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">90</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">89</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">69%</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 flex items-center">
                      <Minus className="h-4 w-4 mr-1" />
                      0%
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">EV-8810</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">87</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">88</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">88</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">78%</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-red-600 flex items-center">
                      <TrendingDown className="h-4 w-4 mr-1" />
                      1%
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">EV-2198</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">89</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">82</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">86</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">72%</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-red-600 flex items-center">
                      <TrendingDown className="h-4 w-4 mr-1" />
                      2%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
              <Button
                label="[View All Vehicle Performance]"
                variant="outlineDark"
                size="small"
                onClick={() => router.push('/vehicle-performance')}
              />
            </div>
          </div>
        </div>

        {/* Performance Charts */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Performance Charts</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-dark rounded-lg p-4 shadow-1">
              <h3 className="text-lg font-semibold mb-4">Driver Performance Trend</h3>
              <div className="h-48 bg-gray-50 dark:bg-gray-800 rounded border">
                <div className="h-full flex items-end justify-between px-2">
                  <div className="w-8 h-16 bg-blue-500 rounded-t"></div>
                  <div className="w-8 h-20 bg-blue-500 rounded-t"></div>
                  <div className="w-8 h-24 bg-blue-500 rounded-t"></div>
                  <div className="w-8 h-28 bg-blue-500 rounded-t"></div>
                  <div className="w-8 h-32 bg-blue-500 rounded-t"></div>
                  <div className="w-8 h-30 bg-blue-500 rounded-t"></div>
                </div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">Apr May Jun Jul Aug Sep</div>
              <div className="mt-4">
                <Button
                  label="[View Detailed Trends]"
                  variant="outlineDark"
                  size="small"
                />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-dark rounded-lg p-4 shadow-1">
              <h3 className="text-lg font-semibold mb-4">Vehicle Efficiency Trend</h3>
              <div className="h-48 bg-gray-50 dark:bg-gray-800 rounded border">
                <div className="h-full flex items-end justify-between px-2">
                  <div className="w-8 h-12 bg-green-500 rounded-t"></div>
                  <div className="w-8 h-16 bg-green-500 rounded-t"></div>
                  <div className="w-8 h-20 bg-green-500 rounded-t"></div>
                  <div className="w-8 h-24 bg-green-500 rounded-t"></div>
                  <div className="w-8 h-28 bg-green-500 rounded-t"></div>
                  <div className="w-8 h-26 bg-green-500 rounded-t"></div>
                </div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">Apr May Jun Jul Aug Sep</div>
              <div className="mt-4">
                <Button
                  label="[View Detailed Trends]"
                  variant="outlineDark"
                  size="small"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Safety & Incident Metrics */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Safety & Incident Metrics</h2>
          <div className="bg-white dark:bg-gray-dark rounded-lg shadow-1 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Safety Incidents</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Event Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Count</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Change</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Top Driver</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-dark divide-y divide-gray-200 dark:divide-gray-700">
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">Harsh Braking</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">156</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600 flex items-center">
                      <TrendingDown className="h-4 w-4 mr-1" />
                      12%
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">Sara Ahmed (24)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">Speeding</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">112</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600 flex items-center">
                      <TrendingDown className="h-4 w-4 mr-1" />
                      8%
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">Raj Patel (18)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">Sharp Turn</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">89</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600 flex items-center">
                      <TrendingDown className="h-4 w-4 mr-1" />
                      5%
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">David Lee (15)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">Rapid Accel.</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">65</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600 flex items-center">
                      <TrendingDown className="h-4 w-4 mr-1" />
                      10%
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">Meera Singh (12)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                <div>• Safety incidents down 9% overall compared to previous period</div>
                <div>• 78% of drivers improved their safety score</div>
              </div>
              <Button
                label="[View Safety Report]"
                variant="outlineDark"
                size="small"
              />
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Recommendations</h2>
          <div className="bg-white dark:bg-gray-dark rounded-lg p-4 shadow-1">
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div>• Schedule coaching for bottom 5 drivers to improve scores</div>
              <div>• Investigate vehicles EV-1149, EV-4523 for efficiency issues</div>
              <div>• Consider driver rotation for high-utilization vehicles</div>
              <div>• Recognize top performers: Jane Doe, Amir Khan (drivers) and EV-5431, EV-9812 (vehicles)</div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
