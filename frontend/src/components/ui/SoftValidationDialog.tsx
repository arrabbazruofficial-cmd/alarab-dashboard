import { AlertCircle } from 'lucide-react';

interface SoftValidationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
  missingFields?: string[];
}

export function SoftValidationDialog({ isOpen, onClose, onConfirm, isSubmitting, missingFields }: SoftValidationDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-border">
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 text-amber-600 mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Incomplete Data</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Some required fields are missing or invalid. Do you want to submit this request anyway? It will be marked as <span className="font-bold text-amber-600">INCOMPLETE</span> and you can update it later.
          </p>
          {missingFields && missingFields.length > 0 && (
            <div className="bg-secondary/10 p-3 rounded-lg mb-6 max-h-32 overflow-y-auto">
              <p className="text-xs font-semibold mb-2">Missing Information:</p>
              <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1">
                {missingFields.map((field, i) => (
                  <li key={i}>{field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium hover:bg-secondary rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Anyway'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
