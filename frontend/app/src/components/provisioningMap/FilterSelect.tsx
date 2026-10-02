import { useMemo, useRef, useState, type KeyboardEvent } from 'react';

let sequencia = 0;
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import IconButton from '@material-ui/core/IconButton';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import ClearIcon from '@material-ui/icons/Close';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { contem } from './helpers';
import { useStyles } from './styles';

type Props = {
  label: string;
  /** `''` = "Todos". */
  value: string;
  options: string[];
  onChange: (value: string) => void;
  /** Rótulo da opção vazia. */
  allLabel?: string;
  /** Mostra o × para voltar à opção vazia. */
  clearable?: boolean;
};

/**
 * Filtro de seleção com busca, no estilo react-select: digita para filtrar a
 * lista, × volta para "Todos", ↑ ↓ Enter Esc no teclado. Só MUI v4 core.
 */
export function FilterSelect({ label, value, options, onChange, allLabel = 'Todos', clearable = true }: Props) {
  const classes = useStyles();
  const anchorRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [menuId] = useState(() => `filtro-opcoes-${++sequencia}`);

  const all = useMemo(() => [{ value: '', label: allLabel }, ...options.map(option => ({ value: option, label: option }))], [options, allLabel]);
  const shown = useMemo(() => (query ? all.filter(option => contem(option.label, query)) : all), [all, query]);
  const selected = all.find(option => option.value === value) ?? all[0];

  const close = () => {
    setOpen(false);
    setQuery('');
  };
  const choose = (next: string) => {
    onChange(next);
    close();
  };
  const openMenu = () => {
    setOpen(true);
    setActive(Math.max(0, all.findIndex(option => option.value === value)));
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) {
        openMenu();
        return;
      }
      const step = event.key === 'ArrowDown' ? 1 : -1;
      setActive(current => (shown.length ? (current + step + shown.length) % shown.length : 0));
    } else if (event.key === 'Enter' && open && shown[active]) {
      event.preventDefault();
      choose(shown[active].value);
    } else if (event.key === 'Escape' && open) {
      event.preventDefault();
      close();
    } else if (event.key === 'Tab') {
      close();
    }
  };

  return (
    <ClickAwayListener onClickAway={close}>
      <div className={classes.select}>
        <span className={classes.selectLabel}>{label}</span>
        <div className={classes.selectControl} ref={anchorRef}>
          <input
            ref={inputRef}
            role="combobox"
            aria-label={label}
            aria-expanded={open}
            aria-controls={menuId}
            autoComplete="off"
            value={open ? query : selected.label}
            placeholder={open ? selected.label : undefined}
            onMouseDown={() => !open && openMenu()}
            onChange={event => {
              setQuery(event.target.value);
              setActive(0);
              if (!open) setOpen(true);
            }}
            onKeyDown={onKeyDown}
          />
          {clearable && value && (
            <IconButton
              className={classes.selectIcon}
              aria-label="Limpar"
              title="Limpar"
              onClick={() => {
                onChange('');
                inputRef.current?.focus();
              }}
            >
              <ClearIcon style={{ fontSize: 16 }} />
            </IconButton>
          )}
          <span className={classes.selectSep} aria-hidden />
          <IconButton
            className={classes.selectIcon}
            tabIndex={-1}
            aria-label="Abrir opções"
            onMouseDown={event => {
              event.preventDefault();
              if (open) close();
              else {
                inputRef.current?.focus();
                openMenu();
              }
            }}
          >
            <ExpandMoreIcon style={{ fontSize: 18, transform: open ? 'rotate(180deg)' : undefined }} />
          </IconButton>
        </div>
        <Popper open={open} anchorEl={anchorRef.current} placement="bottom-start" className={classes.selectMenu} disablePortal>
          <Paper className={classes.selectPaper} style={{ minWidth: anchorRef.current?.offsetWidth }}>
            {shown.length === 0 ? (
              <div className={classes.selectEmpty}>Nada encontrado</div>
            ) : (
              <MenuList id={menuId} dense disablePadding>
                {shown.map((option, index) => (
                  <MenuItem
                    key={option.value || '__todos'}
                    className={classes.selectOption}
                    selected={option.value === value}
                    style={index === active ? { background: 'rgba(148,163,184,0.16)' } : undefined}
                    onMouseEnter={() => setActive(index)}
                    onMouseDown={event => {
                      event.preventDefault();
                      choose(option.value);
                    }}
                  >
                    {option.label}
                  </MenuItem>
                ))}
              </MenuList>
            )}
          </Paper>
        </Popper>
      </div>
    </ClickAwayListener>
  );
}
