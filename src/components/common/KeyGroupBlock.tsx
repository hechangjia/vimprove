import type { KeyGroup } from '@/core/keyHistory.types';
import { KeyChip } from './KeyChip';
import { Tooltip } from './Tooltip';
import { useTranslationSafe } from '@/hooks/useI18n';

type KeyGroupBlockProps = {
  group: KeyGroup;
};

const getGroupTypeColor = (type: KeyGroup['type']): string => {
  switch (type) {
    case 'operatorMotion':
    case 'replaceChar':
      return 'bg-group-orange/40 border-group-orange-border/60';
    case 'findChar':
      return 'bg-group-blue/40 border-group-blue-border/60';
    case 'search':
      return 'bg-group-purple/40 border-group-purple-border/60';
    case 'countPrefix':
      return 'bg-group-cyan/40 border-group-cyan-border/60';
    case 'insertText':
      return 'bg-group-green/40 border-group-green-border/60';
    case 'standalone':
    default:
      return 'bg-group-neutral/40 border-group-neutral-border/60';
  }
};

const getGroupStatusBorder = (status: KeyGroup['status']): string => {
  switch (status) {
    case 'pending':
      return 'border-dashed border-warning-strong/80 shadow-warning-strong/20';
    case 'ignored':
      return 'border-border-stronger/40 opacity-50';
    case 'cancelled':
      return 'border-danger-strong/40 opacity-60';
    default: return '';
  }
};

export const KeyGroupBlock: React.FC<KeyGroupBlockProps> = ({ group }) => {
  const { t } = useTranslationSafe('keyHistory');

  const groupColor = getGroupTypeColor(group.type);
  const statusBorder = getGroupStatusBorder(group.status);

  // Single key without border
  if (group.keys.length === 1 && group.type === 'standalone') {
    return <KeyChip keyAtom={group.keys[0]} groupStatus={group.status} />;
  }

  const getTooltipContent = () => {
    const keysStr = group.keys.map(k => k.display).join('');
    const typeLabel = t(`groupType.${group.type}`, group.type, { ns: 'keyHistory' });

    let statusText = '';
    if (group.status === 'pending') {
      statusText = t(`pending.${group.pendingKind || 'unknown'}`, 'Waiting for input', { ns: 'keyHistory' });
    } else if (group.status === 'cancelled') {
      statusText = t('cancelled', 'Cancelled', { ns: 'keyHistory' });
    } else if (group.status === 'ignored') {
      statusText = t('ignored', 'No effect', { ns: 'keyHistory' });
    }

    // Aggregate key details
    const keyDetails = group.keys.map(k => {
      const role = k.roleInGroup || k.kind;
      const roleText = t(`role.${role}`, role, { ns: 'keyHistory' });
      return { display: k.display, role: roleText, desc: k.description };
    });

    return (
      <div>
        <div className="font-bold text-logo mb-1">{keysStr}</div>
        <div className="text-foreground-subtle text-[10px] mb-1">{typeLabel}</div>

        {/* Key breakdown */}
        <div className="space-y-0.5 text-[10px]">
          {keyDetails.map((k, i) => (
            <div key={i} className="flex gap-2">
              <span className="text-foreground font-mono">{k.display}</span>
              <span className="text-foreground-faint">{k.role}</span>
            </div>
          ))}
        </div>

        {statusText && <div className="text-warning mt-1.5 text-[10px]">{statusText}</div>}
        {group.summary && (
          <div className="mt-1.5 text-foreground-muted border-t border-border-stronger pt-1">{group.summary}</div>
        )}
      </div>
    );
  };

  return (
    <Tooltip content={getTooltipContent()}>
      <div
        className={`
          relative
          px-2 py-1.5
          rounded-md
          border
          cursor-default
          ${groupColor}
          ${statusBorder}
          transition-all
          hover:shadow-md
        `}
      >
        {/* Pending indicator */}
        {group.status === 'pending' && (
          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-warning-strong rounded-full animate-pulse" />
        )}

        {/* Cancelled indicator */}
        {group.status === 'cancelled' && (
          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-danger-strong/80 rounded-full flex items-center justify-center text-[9px] text-primary-foreground">
            ×
          </div>
        )}

        {/* Keys */}
        <div className="flex flex-wrap gap-0.5 items-center">
          {group.keys.map((key) => (
            <KeyChip key={key.id} keyAtom={key} groupStatus={group.status} showTooltip={false} />
          ))}
        </div>

        {/* Summary text (optional, for better UX) */}
        {group.status === 'pending' && (
          <div className="mt-1 text-[9px] text-warning/80">
            {t(`pending.${group.pendingKind || 'unknown'}`, '...', { ns: 'keyHistory' })}
          </div>
        )}
      </div>
    </Tooltip>
  );
};
