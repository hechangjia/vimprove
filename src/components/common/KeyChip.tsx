import type { KeyAtom } from '@/core/keyHistory.types';
import { useTranslationSafe } from '@/hooks/useI18n';
import { Tooltip } from './Tooltip';

type KeyChipProps = {
  keyAtom: KeyAtom;
  groupStatus?: 'pending' | 'applied' | 'ignored' | 'cancelled';
  showTooltip?: boolean;
};

const getKeyKindColor = (kind: KeyAtom['kind']): string => {
  switch (kind) {
    case 'operator':
    case 'replace':
      return 'bg-key-orange/20 text-key-orange-foreground border-key-orange-border/40';
    case 'motion':
    case 'findChar':
      return 'bg-key-blue/20 text-key-blue-foreground border-key-blue-border/40';
    case 'count':
      return 'bg-key-cyan/20 text-key-cyan-foreground border-key-cyan-border/40';
    case 'textObjectPrefix':
    case 'searchControl':
    case 'searchChar':
      return 'bg-key-purple/20 text-key-purple-foreground border-key-purple-border/40';
    case 'insert':
      return 'bg-key-green/20 text-key-green-foreground border-key-green-border/40';
    case 'escape':
      return 'bg-key-red/20 text-key-red-foreground border-key-red-border/40';
    case 'control':
      return 'bg-key-yellow/20 text-key-yellow-foreground border-key-yellow-border/40';
    case 'enter':
    default:
      return 'bg-key-neutral/20 text-key-neutral-foreground border-key-neutral-border/40';
  }
};

const getStatusStyle = (status: KeyAtom['status']): string => {
  switch (status) {
    case 'pending': return 'animate-pulse';
    case 'ignored': return 'opacity-40 line-through';
    case 'cancelled': return 'opacity-50';
    default: return '';
  }
};

export const KeyChip: React.FC<KeyChipProps> = ({ keyAtom, showTooltip = true }) => {
  const { t } = useTranslationSafe('keyHistory');

  const kindColor = getKeyKindColor(keyAtom.kind);
  const statusStyle = getStatusStyle(keyAtom.status);

  const getTooltipContent = () => {
    const role = keyAtom.roleInGroup || keyAtom.kind;
    const roleText = t(`role.${role}`, role, { ns: 'keyHistory' });
    const kindText = t(`kind.${keyAtom.kind}`, keyAtom.kind, { ns: 'keyHistory' });
    const desc = keyAtom.description || '';

    return (
      <div>
        <div className="font-bold text-logo mb-1">{keyAtom.display}</div>
        <div className="text-foreground-subtle">
          {roleText} <span className="text-foreground-faint">({kindText})</span>
        </div>
        {desc && <div className="mt-1 text-foreground-muted border-t border-border-stronger pt-1">{desc}</div>}
      </div>
    );
  };

  const chip = (
    <span
      className={`
        inline-flex items-center justify-center
        px-1.5 py-0.5 rounded
        text-[11px] font-mono
        border
        cursor-default
        ${kindColor}
        ${statusStyle}
        transition-all
      `}
    >
      {keyAtom.display}
    </span>
  );

  if (!showTooltip) {
    return chip;
  }

  return <Tooltip content={getTooltipContent()}>{chip}</Tooltip>;
};
