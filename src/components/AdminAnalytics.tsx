/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { Product, Order, Subscription, BackupLog, ERPIntegrationLog } from '../types';
import { Database, RefreshCw, FileSpreadsheet, Eye, Grid, CloudRain, HeartHandshake, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface AdminAnalyticsProps {
  products: Product[];
  orders: Order[];
  subscriptions: Subscription[];
  backups: BackupLog[];
  erpLogs: ERPIntegrationLog[];
  onTriggerBackup: () => void;
  onRestoreFromBackup: () => void;
  onManualERPSync: (system: string) => void;
}

export default function AdminAnalytics({
  products,
  orders,
  subscriptions,
  backups,
  erpLogs,
  onTriggerBackup,
  onRestoreFromBackup,
  onManualERPSync
}: AdminAnalyticsProps) {
  // Widget Customization Config
  const [enabledWidgets, setEnabledWidgets] = useState({
    stockBarChart: true,
    weeklySalesChart: true,
    cloudBackups: true,
    erpLedger: true,
    kpiCards: true
  });

  const [erpTargetSystem, setErpTargetSystem] = useState<string>('QuickBooks');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Toggle dynamic widget configurations
  const toggleWidget = (key: keyof typeof enabledWidgets) => {
    setEnabledWidgets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Convert categories stock numbers for charting
  const categories = ['Vegetables', 'Fruits', 'Herbs', 'Grains', 'Dairy'];
  const chartData = categories.map(cat => {
    const crops = products.filter(p => p.category === cat);
    const totalStock = crops.reduce((acc, c) => acc + c.stock, 0);
    const avgPrice = crops.length > 0 ? (crops.reduce((acc, c) => acc + c.price, 0) / crops.length) : 0;
    return {
      category: cat,
      CropsCount: crops.length,
      StockLevel: totalStock,
      AveragePrice: parseFloat(avgPrice.toFixed(2))
    };
  });

  // Convert chronological area charts for sales transactions
  const salesHistoryData = orders
    .slice()
    .reverse()
    .map(o => ({
      date: new Date(o.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit' }),
      orderAmount: o.totalAmount,
    }));

  // Exportable CSV Spreadsheet Generation
  const handleExportCSV = () => {
    let csvHeader = "ID,Name,Category,Original Farm,Current Stocks,Minimum Limits,Price\n";
    let csvLines = products.map(p => {
      // Clean string elements to prevent comma disruption
      const cleanName = p.name.replace(/,/g, '');
      const cleanFarm = p.origin.replace(/,/g, '');
      return `${p.id},${cleanName},${p.category},${cleanFarm},${p.stock},${p.minStockThreshold},₦${p.price.toFixed(2)}`;
    }).join("\n");

    const csvContent = "data:text/csv;charset=utf-8," + csvHeader + csvLines;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `josfresh_live_stock_ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    setTimeout(() => {
      setDownloadSuccess(false);
    }, 2500);
  };

  // Safe chart data fallbacks
  const safeSalesData = salesHistoryData.length > 0 
    ? salesHistoryData 
    : [{ date: 'Initial', orderAmount: 0 }];

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Database className="w-5.5 h-5.5 text-emerald-500" />
            Supply Chain Insights & Systems Admin
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Synchronize external accounting routers, oversee cloud redundancy systems, and customize visual widgets.
          </p>
        </div>

        {/* System Customize Config Drawer Toggle */}
        <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
            <Grid className="w-4 h-4 text-emerald-500" />
            Customize Layout:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(enabledWidgets) as Array<keyof typeof enabledWidgets>).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => toggleWidget(key)}
                className={`py-1 px-2.5 rounded-lg text-[10px] font-bold border transition ${
                  enabledWidgets[key]
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                    : 'bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {String(key).replace(/([A-Z])/g, ' $1').replace(/^\w/, c => c.toUpperCase())}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards (Conditional Widget 1) */}
      {enabledWidgets.kpiCards && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
            <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Live Active Catalog</span>
            <div className="text-3xl font-black text-slate-800 dark:text-white mt-1">{products.length}</div>
            <p className="text-[10px] text-slate-500 mt-1">Crops across 5 categories</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
            <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Recurring Subscribers</span>
            <div className="text-3xl font-black text-emerald-605 dark:text-emerald-450 mt-1">
              {subscriptions.filter(s => s.status === 'active').length}
            </div>
            <p className="text-[10px] text-slate-450 mt-1">Weekly fulfillment safety</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
            <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Cloud Backups Ready</span>
            <div className="text-3xl font-black text-slate-800 dark:text-white mt-1">
              {backups.filter(b => b.status === 'success').length}
            </div>
            <p className="text-[10px] text-emerald-500 mt-1">✓ Safe remote recovery nodes</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
            <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Sales Turnover value</span>
            <div className="text-3xl font-black text-emerald-650 dark:text-emerald-450 mt-1">
              ₦{orders.reduce((acc, o) => acc + o.totalAmount, 0).toFixed(2)}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Cleared & ledger matched</p>
          </div>
        </div>
      )}

      {/* Main Statistics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Widget 2: Stocks Category Level */}
        {enabledWidgets.stockBarChart && (
          <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Crops Storage Capacities (Category kg)</h3>
                <p className="text-[10px] text-slate-500">Live tonnage from Jos regional cooperative depots</p>
              </div>
              <button
                onClick={handleExportCSV}
                className="bg-slate-100 hover:bg-slate-250 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] md:text-xs font-bold py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Export CSV Report
              </button>
            </div>

            <div className="w-full h-64 text-xs font-mono">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eaeaea" />
                  <XAxis dataKey="category" stroke="#999999" />
                  <YAxis stroke="#999999" />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #ccc', fontSize: '11px', fontFamily: 'monospace' }}
                    labelClassName="font-extrabold text-slate-805"
                  />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Bar dataKey="StockLevel" fill="#10b981" name="Storage Stock (kg/units)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="CropsCount" fill="#3b82f6" name="Unique Crop Varieties" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {downloadSuccess && (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-300 font-bold text-center mt-2 animate-bounce">
                ✓ Report Generated: downloaded jo_fresh_ledger to standard export folders.
              </p>
            )}
          </div>
        )}

        {/* Widget 3: Weekly Sales Area Charts */}
        {enabledWidgets.weeklySalesChart && (
          <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-2">Checkout Sales Turnovers</h3>
            <p className="text-[10px] text-slate-500 mb-4">Volume transitions and timeline verification values</p>
            
            <div className="w-full h-64 text-xs font-mono">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={safeSalesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eaeaea" vertical={false} />
                  <XAxis dataKey="date" stroke="#999999" />
                  <YAxis stroke="#999999" />
                  <Tooltip contentStyle={{ fontSize: '11px', fontFamily: 'monospace', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="orderAmount" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" name="Voucher Total (₦)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

      </div>

      {/* Cloud Backup & Automated Recovery Control Widget 4 */}
      {enabledWidgets.cloudBackups && (
        <div className="bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100 dark:border-slate-850">
            <div>
              <h3 className="text-sm font-extrabold text-slate-850 dark:text-slate-100 flex items-center gap-1.5">
                <CloudRain className="w-4 h-4 text-emerald-500" />
                Cloud-Based Database Backup & Recovery Engine
              </h3>
              <p className="text-[11px] text-slate-500">
                Synchronous local memory snapshots dispatched automatically to remote secure AWS bucket clusters.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={onTriggerBackup}
                className="bg-slate-900 dark:bg-emerald-600 text-white font-bold text-xs py-1.5 px-4 rounded-lg hover:bg-emerald-700 transition shadow"
              >
                Trigger Snapshot Backup
              </button>
              <button
                onClick={onRestoreFromBackup}
                className="bg-amber-600 text-white font-bold text-xs py-1.5 px-4 rounded-lg hover:bg-amber-700 transition shadow flex items-center gap-1"
                title="Automated disaster recovery"
              >
                <HeartHandshake className="w-3.5 h-3.5" /> Simulated Disaster Restore
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Backup history logs table */}
            <div className="border border-slate-150 dark:border-slate-800 rounded-lg p-3 bg-slate-50 dark:bg-slate-950 text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block mb-2">AWS Snapshots Ledger</span>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {backups.map(bak => (
                  <div key={bak.id} className="flex items-center justify-between text-xs p-2 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{bak.id}</span>
                      <span className="text-slate-400 font-normal">({bak.triggeredBy})</span>
                    </div>
                    <div className="flex items-center gap-3 font-mono text-[10px] text-slate-500">
                      <span>{bak.recordCount} items</span>
                      <span className="font-semibold text-emerald-600">{bak.sizeKB} KB</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Disaster Recovery Policy and Info */}
            <div className="bg-emerald-50/20 dark:bg-slate-950/20 border border-emerald-100 dark:border-slate-800 rounded-lg p-3 text-left space-y-2 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-widest font-mono">Disaster Recovery Protocol</span>
                <p className="text-[11px] text-slate-650 dark:text-slate-350 leading-relaxed mt-1">
                  JosFresh implements hourly cold backups and differential transactional logs. The Restore trigger automatically corrects stock exhaustion, restores catalogs, and resolves active threshold alerts to guarantee continuous regional production.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" /> Continuous replication nodes: active & verified
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Widget 5: Third-Party Shipping Logistics & Accounting (ERP) Logs */}
      {enabledWidgets.erpLedger && (
        <div className="bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100 dark:border-slate-850">
            <div>
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Third-Party ERP & Accounting Connectors</h3>
              <p className="text-[10px] text-slate-500">Ledger synchronization with accounting structures (SAP/QuickBooks)</p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={erpTargetSystem}
                onChange={(e) => setErpTargetSystem(e.target.value)}
                className="text-xs p-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-250 rounded-lg focus:outline-none"
              >
                <option value="QuickBooks">QuickBooks</option>
                <option value="SAP Business One">SAP Business One</option>
                <option value="Local Accounting">Local Accounting</option>
              </select>

              <button
                onClick={() => onManualERPSync(erpTargetSystem)}
                className="bg-emerald-600 text-white font-bold text-xs py-1.5 px-3 rounded-lg hover:bg-emerald-700 transition flex items-center gap-1 shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reconcile Logs
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {erpLogs.map(log => {
              const isSuccess = log.status === 'success';
              return (
                <div key={log.id} className="flex items-start gap-3 p-2 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200/50 dark:border-slate-800 text-xs">
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                    isSuccess 
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                      : 'bg-red-100 text-red-050 dark:bg-red-950 dark:text-red-300'
                  }`}>
                    {log.system}
                  </span>

                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-slate-400">{log.endpoint}</span>
                      <span className="text-[9px] text-slate-400 font-mono">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-700 dark:text-slate-300 mt-0.5 font-medium leading-normal">
                      {log.message}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
