import React, { useState } from 'react';
import { Employee } from '../types/grc';
import {
  Users,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Laptop,
  KeyRound,
  FileCheck,
  Send,
  UserCheck,
  UserX,
} from 'lucide-react';

interface PersonnelComplianceProps {
  employees: Employee[];
  onUpdateEmployees: (employees: Employee[]) => void;
}

export const PersonnelCompliance: React.FC<PersonnelComplianceProps> = ({
  employees,
  onUpdateEmployees,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [reminderNudgeId, setReminderNudgeId] = useState<string | null>(null);

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = filterDepartment === 'all' || emp.department === filterDepartment;
    return matchesSearch && matchesDept;
  });

  const handleSendNudge = (empId: string) => {
    setReminderNudgeId(empId);
    setTimeout(() => {
      setReminderNudgeId(null);
    }, 2000);
  };

  const handleRemediateEmp = (empId: string) => {
    onUpdateEmployees(
      employees.map((e) =>
        e.id === empId
          ? {
              ...e,
              securityTrainingStatus: 'Completed',
              policiesSigned: true,
              mdmEnrolled: true,
              mfaActive: true,
            }
          : e
      )
    );
  };

  const allCompliantCount = employees.filter(
    (e) =>
      e.backgroundCheckStatus === 'Completed' &&
      e.securityTrainingStatus === 'Completed' &&
      e.policiesSigned &&
      e.mdmEnrolled &&
      e.mfaActive
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Workforce Security Governance</span>
            <span aria-hidden="true">·</span>
            <span>Continuous HR & Identity Audit</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Personnel Security & Compliance</h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Track background checks, security awareness training, MDM device encryption, and signed policies across your workforce.
          </p>
        </div>

        {/* Readiness Badge */}
        <div className="flex items-center gap-4 text-xs">
          <div className="bg-white border border-slate-200 px-3.5 py-2 rounded-lg shadow-2xs">
            <span className="text-slate-500 block">Fully Compliant Staff</span>
            <span className="font-semibold text-slate-900 text-sm font-mono tabular-nums">
              {allCompliantCount} / {employees.length} ({Math.round((allCompliantCount / employees.length) * 100)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setFilterDepartment('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filterDepartment === 'all'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            All Departments ({employees.length})
          </button>
          {['Engineering', 'DevOps & SRE', 'SecOps', 'Security & Compliance', 'Product Engineering'].map((dept) => (
            <button
              key={dept}
              onClick={() => setFilterDepartment(dept)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                filterDepartment === dept
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search employee name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Department & Role</th>
                <th className="py-3 px-4 text-center">Background Check</th>
                <th className="py-3 px-4 text-center">Security Training</th>
                <th className="py-3 px-4 text-center">Policies Signed</th>
                <th className="py-3 px-4 text-center">MDM Enrolled</th>
                <th className="py-3 px-4 text-center">MFA Active</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.map((emp) => {
                const isFullyCompliant =
                  emp.backgroundCheckStatus === 'Completed' &&
                  emp.securityTrainingStatus === 'Completed' &&
                  emp.policiesSigned &&
                  emp.mdmEnrolled &&
                  emp.mfaActive;

                return (
                  <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Employee */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{emp.name}</div>
                      <div className="text-[11px] font-mono text-slate-500">{emp.email}</div>
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-4">
                      <div className="text-slate-800">{emp.role}</div>
                      <div className="text-[11px] text-slate-400">{emp.department}</div>
                    </td>

                    {/* Background Check */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                        emp.backgroundCheckStatus === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {emp.backgroundCheckStatus}
                      </span>
                    </td>

                    {/* Training */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                        emp.securityTrainingStatus === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : emp.securityTrainingStatus === 'In Progress'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {emp.securityTrainingStatus}
                      </span>
                    </td>

                    {/* Policies Signed */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {emp.policiesSigned ? (
                        <span className="text-emerald-700 font-semibold text-xs">Yes</span>
                      ) : (
                        <span className="text-red-600 font-semibold text-xs">Pending</span>
                      )}
                    </td>

                    {/* MDM */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {emp.mdmEnrolled ? (
                        <span className="text-emerald-700 font-semibold text-xs">Active</span>
                      ) : (
                        <span className="text-red-600 font-semibold text-xs">Missing</span>
                      )}
                    </td>

                    {/* MFA */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {emp.mfaActive ? (
                        <span className="text-emerald-700 font-semibold text-xs">Enforced</span>
                      ) : (
                        <span className="text-red-600 font-semibold text-xs">Bypassed</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {!isFullyCompliant ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleSendNudge(emp.id)}
                            className="px-2 py-1 text-[11px] text-slate-600 hover:text-slate-900 border border-slate-200 rounded-md hover:bg-slate-100"
                          >
                            {reminderNudgeId === emp.id ? 'Nudge Sent!' : 'Send Nudge'}
                          </button>
                          <button
                            onClick={() => handleRemediateEmp(emp.id)}
                            className="px-2 py-1 text-[11px] text-blue-700 font-medium bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md"
                          >
                            Mark Fixed
                          </button>
                        </div>
                      ) : (
                        <span className="text-emerald-600 font-mono text-[11px]">Audit Ready</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
