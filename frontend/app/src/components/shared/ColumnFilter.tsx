import { useRef, useState } from 'react';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import Popover from '@material-ui/core/Popover';
import TextField from '@material-ui/core/TextField';
import FilterIcon from '@material-ui/icons/FilterList';
import { useAtlasStyles as useStyles } from './styles';

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

/** Botão-funil ao lado do nome da coluna: abre um campo que filtra só aquela coluna. */
export function ColumnFilter({ label, value, onChange }: Props) {
  const classes = useStyles();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <IconButton
        className={`${classes.columnFilterButton} ${value ? classes.columnFilterActive : ''}`}
        aria-label={`Filtrar por ${label}`}
        title={`Filtrar por ${label}`}
        onClick={event => setAnchor(event.currentTarget)}
      >
        <FilterIcon style={{ fontSize: 14 }} />
      </IconButton>
      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        PaperProps={{ className: classes.columnFilterPaper, elevation: 8 }}
        TransitionProps={{ onEntered: () => inputRef.current?.focus() }}
      >
        <Paper
          component="form"
          elevation={0}
          style={{ background: 'transparent' }}
          onSubmit={event => {
            // Enter no campo fecha o filtro (o valor já foi aplicado ao digitar).
            event.preventDefault();
            setAnchor(null);
          }}
        >
          <TextField
            inputRef={inputRef}
            fullWidth
            size="small"
            variant="outlined"
            placeholder={`Filtrar por ${label}`}
            value={value}
            onChange={event => onChange(event.target.value)}
          />
        </Paper>
        <div className={classes.columnFilterActions}>
          <button
            type="button"
            className={classes.button}
            onClick={() => {
              onChange('');
              setAnchor(null);
            }}
          >
            Limpar
          </button>
          <button type="button" className={classes.button} onClick={() => setAnchor(null)}>
            Fechar
          </button>
        </div>
      </Popover>
    </>
  );
}
