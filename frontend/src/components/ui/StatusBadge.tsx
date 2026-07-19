import { Clock, CheckCircle2, XCircle, AlertCircle, FileEdit, HelpCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getBadgeStyle = () => {
    switch (status.toUpperCase()) {
      case 'APPROVED':
      case 'COMPLETED':
        return {
          bg: 'bg-emerald-100',
          text: 'text-emerald-700',
          border: 'border-emerald-200',
          icon: <CheckCircle2 className="w-3.5 h-3.5" />
        };
      case 'REJECTED':
        return {
          bg: 'bg-rose-100',
          text: 'text-rose-700',
          border: 'border-rose-200',
          icon: <XCircle className="w-3.5 h-3.5" />
        };
      case 'PROCESSING':
      case 'UNDER_REVIEW':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-700',
          border: 'border-blue-200',
          icon: <Clock className="w-3.5 h-3.5" />
        };
      case 'SUBMITTED':
        return {
          bg: 'bg-sky-100',
          text: 'text-sky-700',
          border: 'border-sky-200',
          icon: <FileEdit className="w-3.5 h-3.5" />
        };
      case 'INCOMPLETE':
      case 'DRAFT':
        return {
          bg: 'bg-amber-100',
          text: 'text-amber-700',
          border: 'border-amber-200',
          icon: <AlertCircle className="w-3.5 h-3.5" />
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-700',
          border: 'border-gray-200',
          icon: <HelpCircle className="w-3.5 h-3.5" />
        };
    }
  };

  const style = getBadgeStyle();

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border ${style.bg} ${style.text} ${style.border} shadow-sm`}>
      {style.icon} {status.replace('_', ' ')}
    </span>
  );
}
