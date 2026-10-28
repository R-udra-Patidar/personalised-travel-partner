import type { BudgetEstimate } from '../../types';
import { formatCurrency } from '../../utils/formatters';

const BUDGET_ROWS = [
  { key: 'accommodation_estimate', label: 'Accommodation', icon: '🏨' },
  { key: 'food_estimate',          label: 'Food & Dining',  icon: '🍽️' },
  { key: 'activities_estimate',    label: 'Activities',     icon: '🎯' },
  { key: 'transport_estimate',     label: 'Transportation', icon: '🚌' },
] as const;

interface BudgetSummaryProps {
  budget: BudgetEstimate;
}

export default function BudgetSummary({ budget }: BudgetSummaryProps) {
  return (
    <div className="budget-card animate-fade">
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
          Total Estimated Budget
        </div>
        <div className="budget-total">{formatCurrency(budget.total_estimate, budget.currency || 'USD')}</div>
        {budget.notes && (
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-2)', lineHeight: 1.5 }}>
            ⚠️ {budget.notes}
          </p>
        )}
      </div>

      <div>
        {BUDGET_ROWS.map(({ key, label, icon }) => {
          const amount = budget[key as keyof BudgetEstimate] as number;
          if (amount == null) return null;
          const pct = budget.total_estimate
            ? Math.round((amount / budget.total_estimate) * 100)
            : 0;
          return (
            <div key={key} className="budget-row">
              <div className="budget-label">
                <span>{icon}</span>
                <span>{label}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <div style={{
                  width: 60,
                  height: 4,
                  background: 'var(--color-border)',
                  borderRadius: 4,
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${pct}%`,
                    background: 'var(--gradient-teal)',
                    borderRadius: 4,
                    transition: 'width 0.6s ease'
                  }} />
                </div>
                <div className="budget-amount">{formatCurrency(amount)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
