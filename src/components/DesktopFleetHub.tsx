import React, { useState } from 'react';
import { DesktopDevice } from '../types/grc';
import {
  Laptop,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Clock,
  KeyRound,
  Download,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Terminal,
  Copy,
  Check,
  Eye,
  Send,
} from 'lucide-react';

interface DesktopFleetHubProps {
  devices: DesktopDevice[];
  onUpdateDevices: (devices: DesktopDevice[]) => void;
}

export const DesktopFleetHub: React.FC<DesktopFleetHubProps> = ({
  devices,
  onUpdateDevices,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [osFilter, setOsFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isScanning, setIsScanning] = useState(false);
  const [showInstallerModal, setShowInstallerModal] = useState(false);
  const [selectedInstallerOs, setSelectedInstallerOs] = useState<'mac' | 'win' | 'linux'>('mac');
  const [copiedToken, setCopiedToken] = useState(false);
  const [notifiedDeviceId, setNotifiedDeviceId] = useState<string | null>(null);

  const filteredDevices = devices.filter((dev) => {
    if (osFilter !== 'all' && dev.osType !== osFilter) return false;
    if (statusFilter !== 'all' && dev.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        dev.deviceName.toLowerCase().includes(q) ||
        dev.assignedEmployeeName.toLowerCase().includes(q) ||
        dev.assignedEmployeeEmail.toLowerCase().includes(q) ||
        dev.serialNumber.toLowerCase().includes(q) ||
        dev.osVersion.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const compliantCount = devices.filter((d) => d.status === 'compliant').length;
  const nonCompliantCount = devices.filter((d) => d.status === 'non_compliant').length;
  const offlineCount = devices.filter((d) => d.status === 'offline').length;
  const fleetCompliancePct = devices.length > 0 ? Math.round((compliantCount / devices.length) * 100) : 0;

  const handleRunFleetAudit = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      // Automatically refresh check-in times
      const updated = devices.map((d) => ({
        ...d,
        lastCheckIn: 'Just now',
      }));
      onUpdateDevices(updated);
    }, 1500);
  };

  const handleFixScreenLock = (deviceId: string) => {
    const updated = devices.map((d) => {
      if (d.id === deviceId) {
        return {
          ...d,
          status: 'compliant' as const,
          checks: {
            ...d.checks,
            screenLockSeconds: 300,
            passwordManagerActive: true,
            passwordManagerName: '1Password Enterprise (Managed)',
          },
        };
      }
      return d;
    });
    onUpdateDevices(updated);
  };

  const handleNotifyEmployee = (deviceId: string) => {
    setNotifiedDeviceId(deviceId);
    setTimeout(() => setNotifiedDeviceId(null), 3000);
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText('vanta_fleet_token_live_78942b918f4a');
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 bg-blue-50 text-blue-700 rounded-lg">
              <Laptop className="w-5 h-5" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              Vanta Desktop Agent Fleet Telemetry
            </span>
            <span className="text-xs text-slate-500 font-mono">SOC 2 CC6.8 · Continuous Endpoint Monitoring</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Workstation Fleet Telemetry & Security Agent
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Direct cryptographic telemetric monitoring across company workstations (macOS, Windows, Linux).
            Continuous verification of FileVault/BitLocker encryption, &le;5-min screen lock, EDR sensor presence, and password manager deployment.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowInstallerModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Download Agent Installer</span>
          </button>

          <button
            onClick={handleRunFleetAudit}
            disabled={isScanning}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Scanning Telemetry...' : 'Run Fleet Health Scan'}</span>
          </button>
        </div>
      </div>

      {/* Fleet Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Compliance Percentage */}
        <button
          onClick={() => setStatusFilter('all')}
          className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-blue-50/50 border-blue-300 ring-2 ring-blue-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
          } flex flex-col justify-between`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Overall Fleet Compliance</span>
            <span className="font-bold text-slate-900 font-mono text-sm">{fleetCompliancePct}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden my-2">
            <div
              className={`h-full transition-all duration-300 ${
                fleetCompliancePct >= 90 ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              style={{ width: `${fleetCompliancePct}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-500 flex justify-between">
            <span>{compliantCount} compliant</span>
            <span>{nonCompliantCount} need attention</span>
          </div>
        </button>

        {/* Compliant Devices */}
        <button
          onClick={() => setStatusFilter(statusFilter === 'compliant' ? 'all' : 'compliant')}
          className={`text-left p-4 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
            statusFilter === 'compliant'
              ? 'bg-emerald-50/50 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 font-mono">{compliantCount}</div>
            <div className="text-xs text-slate-500">Fully Compliant Workstations</div>
            <div className="text-[10px] text-emerald-600 font-medium">Click to filter compliant</div>
          </div>
        </button>

        {/* Non-Compliant Devices */}
        <button
          onClick={() => setStatusFilter(statusFilter === 'non_compliant' ? 'all' : 'non_compliant')}
          className={`text-left p-4 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
            statusFilter === 'non_compliant'
              ? 'bg-rose-50/50 border-rose-300 ring-2 ring-rose-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 font-mono">{nonCompliantCount}</div>
            <div className="text-xs text-slate-500">Non-Compliant (Action Needed)</div>
            <div className="text-[10px] text-red-600 font-medium">Click to filter non-compliant</div>
          </div>
        </button>

        {/* Offline Devices */}
        <button
          onClick={() => setStatusFilter(statusFilter === 'offline' ? 'all' : 'offline')}
          className={`text-left p-4 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
            statusFilter === 'offline'
              ? 'bg-slate-100 border-slate-400 ring-2 ring-slate-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 border border-slate-200">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 font-mono">{offlineCount}</div>
            <div className="text-xs text-slate-500">Offline &gt; 7 Days</div>
            <div className="text-[10px] text-slate-400">Click to filter offline</div>
          </div>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by device name, employee, serial number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          <select
            value={osFilter}
            onChange={(e) => setOsFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-700 font-medium"
          >
            <option value="all">All Operating Systems</option>
            <option value="macOS">macOS</option>
            <option value="Windows">Windows</option>
            <option value="Linux">Linux</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-700 font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="compliant">Compliant</option>
            <option value="non_compliant">Non-Compliant</option>
            <option value="offline">Offline</option>
          </select>
        </div>
      </div>

      {/* Workstations List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Device & Owner</th>
                <th className="py-3 px-4">OS & Serial</th>
                <th className="py-3 px-4">Disk Encryption</th>
                <th className="py-3 px-4">Screen Timeout</th>
                <th className="py-3 px-4">EDR & Passwords</th>
                <th className="py-3 px-4">Last Telemetry Sync</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDevices.map((dev) => {
                const isCompliant = dev.status === 'compliant';
                const isNonCompliant = dev.status === 'non_compliant';
                const isScreenLockOk = dev.checks.screenLockSeconds <= 300;

                return (
                  <tr
                    key={dev.id}
                    className={`hover:bg-slate-50/70 transition-colors ${
                      isNonCompliant ? 'bg-red-50/20' : ''
                    }`}
                  >
                    {/* Device & Owner */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`p-2 rounded-lg border shrink-0 ${
                            isCompliant
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                              : isNonCompliant
                              ? 'bg-red-50 text-red-600 border-red-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          <Laptop className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-semibold text-slate-900 block">{dev.deviceName}</span>
                          <span className="text-[11px] text-slate-600 font-medium block">
                            {dev.assignedEmployeeName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono block">
                            {dev.assignedEmployeeEmail}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* OS & Serial */}
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-800 block">{dev.osVersion}</span>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        SN: {dev.serialNumber}
                      </span>
                      <span className="text-[10px] text-slate-400 block">{dev.location}</span>
                    </td>

                    {/* Disk Encryption */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {dev.checks.diskEncryption ? (
                        <div className="flex items-center gap-1.5 text-emerald-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div>
                            <span className="font-semibold block">{dev.checks.diskEncryptionType}</span>
                            <span className="text-[10px] text-slate-400 font-mono block">AES-256 Active</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-red-700">
                          <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                          <span className="font-semibold">Unencrypted</span>
                        </div>
                      )}
                    </td>

                    {/* Screen Timeout */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {isScreenLockOk ? (
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {dev.checks.screenLockSeconds / 60}m (Passes &le;5m)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded font-bold">
                          <AlertTriangle className="w-3 h-3 text-red-600" />
                          {dev.checks.screenLockSeconds / 60}m (Violates &le;5m)
                        </span>
                      )}
                    </td>

                    {/* EDR & Passwords */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[11px]">
                          {dev.checks.edrAgentActive ? (
                            <span className="text-emerald-700 font-medium flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              CrowdStrike Active
                            </span>
                          ) : (
                            <span className="text-red-600 font-medium flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                              Missing EDR
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 text-[11px]">
                          {dev.checks.passwordManagerActive ? (
                            <span className="text-slate-600 font-mono text-[10px]">
                              1Password Active
                            </span>
                          ) : (
                            <span className="text-amber-600 font-mono text-[10px] font-semibold">
                              No Password Mgr
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Last Telemetry Sync */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-slate-600">
                      <div>{dev.lastCheckIn}</div>
                      <div className="text-[10px] text-slate-400">Agent {dev.agentVersion}</div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {isNonCompliant && (
                          <button
                            onClick={() => handleFixScreenLock(dev.id)}
                            className="px-2.5 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors"
                          >
                            Push MDM Policy Fix
                          </button>
                        )}
                        <button
                          onClick={() => handleNotifyEmployee(dev.id)}
                          className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          {notifiedDeviceId === dev.id ? 'Nudge Sent!' : 'Nudge User'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Download Agent Modal */}
      {showInstallerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
                  <Download className="w-4 h-4" />
                </span>
                <h3 className="font-semibold text-slate-900 text-sm">
                  Install Vanta Desktop Security Agent
                </h3>
              </div>
              <button
                onClick={() => setShowInstallerModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-700">
              <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-lg">
                <button
                  onClick={() => setSelectedInstallerOs('mac')}
                  className={`flex-1 py-1.5 rounded-md font-semibold text-center transition-colors ${
                    selectedInstallerOs === 'mac'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600'
                  }`}
                >
                  macOS (Apple Silicon & Intel)
                </button>
                <button
                  onClick={() => setSelectedInstallerOs('win')}
                  className={`flex-1 py-1.5 rounded-md font-semibold text-center transition-colors ${
                    selectedInstallerOs === 'win'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600'
                  }`}
                >
                  Windows (.MSI)
                </button>
                <button
                  onClick={() => setSelectedInstallerOs('linux')}
                  className={`flex-1 py-1.5 rounded-md font-semibold text-center transition-colors ${
                    selectedInstallerOs === 'linux'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600'
                  }`}
                >
                  Linux (.DEB / .RPM)
                </button>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Organization Enrollment Token (Auto-Generated)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value="vanta_fleet_token_live_78942b918f4a"
                    className="flex-1 p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-[11px] text-slate-700"
                  />
                  <button
                    onClick={handleCopyToken}
                    className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-600"
                    title="Copy Token"
                  >
                    {copiedToken ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Terminal Silent MDM Push Command (Jamf Pro / Intune)
                </label>
                <pre className="p-2.5 bg-slate-950 text-slate-100 rounded-lg font-mono text-[11px] overflow-x-auto">
                  {selectedInstallerOs === 'mac'
                    ? 'curl -fsSL https://download.vanta.com/agent/vanta-mac.pkg -o /tmp/vanta.pkg && sudo installer -pkg /tmp/vanta.pkg -target / --token vanta_fleet_token_live_78942b918f4a'
                    : selectedInstallerOs === 'win'
                    ? 'msiexec /i VantaAgent.msi /qn ENROLLMENT_TOKEN="vanta_fleet_token_live_78942b918f4a"'
                    : 'sudo bash -c "$(curl -fsSL https://download.vanta.com/agent/linux-install.sh)" -- --token vanta_fleet_token_live_78942b918f4a'}
                </pre>
              </div>
            </div>

            <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowInstallerModal(false)}
                className="px-3.5 py-1.5 text-xs text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  alert('Vanta Desktop Agent binary package downloaded successfully.');
                  setShowInstallerModal(false);
                }}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Package (.pkg)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
