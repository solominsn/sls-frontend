import { FunctionalComponent, h, RefObject } from "preact";
import { forwardRef, useState } from "preact/compat";
import styles from "./style.css";

interface UniversalEditorProps {
    name: string;
    value: unknown;
    onChange(value: unknown): Promise<void>;
    onRefresh?(): void;
    allowEmpty?: boolean;
    titleEdit?: string;
    titleRefresh?: string;
    [k: string]: unknown;
}

/*
const togglePairs = new Map<string | boolean, string | boolean>([
    ['ON', 'OFF'],
    ['OFF', 'ON'],
    ['OPEN', 'CLOSE'],
    ['CLOSE', 'OPEN'],
    ['LOCK', 'UNLOCK'],
    ['UNLOCK', 'LOCK'],
    [true, false],
    [false, true]
]);
*/

// eslint-disable-next-line react/display-name
const UniversalEditor: FunctionalComponent<UniversalEditorProps> = forwardRef((props, ref: RefObject<HTMLInputElement>) => {
    const { name, value, onChange, onRefresh, allowEmpty, titleEdit, titleRefresh, ...rest } = props;
    /* const isToggleParameter = togglePairs.has(value as string | boolean); */

    const [isDisabled, setIsDisabled] = useState(false);

    const editorType = typeof value === 'boolean'
        ? 'checkbox'
        : (name.startsWith('state') && typeof value === 'string' && /^ON|OFF$/i.test(value))
            ? 'switch'
            : 'default';

    const changeHandler = async (event): Promise<void> => {
        const { target } = event;
        try {
            setIsDisabled(true);
            switch (editorType) {
                case "checkbox":
                    await onChange(target.checked);
                    break;
                case "switch":
                    await onChange(target.checked ? "ON" : "OFF");
                    break;
                // case "number":
                //     target.valueAsNumber != value && await onChange(target.valueAsNumber);
                //     break;
                default:
                    target.value != value && await onChange(target.value);
                    break;
            }
        } finally {
            setIsDisabled(false);
        }
    };

    const editHandler = async (): Promise<void> => {
        const newVal = prompt("Enter new value", value as string);
        if (newVal !== null && (newVal !== "" || allowEmpty)) {
            onChange(newVal);
        }
    };

    switch (editorType) {
        case "checkbox":
            return <div class="d-inline-flex align-items-center">
                       {onRefresh ? <button type="button" title={titleRefresh} class="btn btn-sm"><i class="fas fa-sync" onClick={onRefresh} /></button> : null}
                       <input ref={ref} {...rest} disabled={isDisabled} type="checkbox" checked={value as boolean} onChange={changeHandler} />
                   </div>;
        // case "number":
        /* return <input step="any" ref={ref} {...rest} type="number" value={value} onBlur={changeHandler} />; */
        case "switch":
            return <div class="d-inline-flex align-items-center">
                       {onRefresh ? <button type="button" title={titleRefresh} class="btn btn-sm"><i class="fas fa-sync" onClick={onRefresh} /></button> : null}
                       <button type="button" title={titleEdit} disabled={isDisabled} class="btn btn-sm"><i class="fas fa-edit" onClick={editHandler} /></button>
                       <div class={`custom-control custom-switch ${styles['custom-switch']} ml-2`}>
                           <input ref={ref} {...rest} disabled={isDisabled} type="checkbox" class={`custom-control-input ${styles['custom-control-input']}`} id={`${name}switch`} checked={value !== 'OFF'} onChange={changeHandler} />
                           <label class={`custom-control-label ${styles['custom-control-label']}`} for={`${name}switch`}>{value as string}</label>
                       </div>
                   </div>;
        default:
            return <div class="d-inline-flex align-items-baseline">
                       {onRefresh ? <button type="button" title={titleRefresh} class="btn btn-sm"><i class="fas fa-sync" onClick={onRefresh} /></button> : null}
                       <button type="button" title={titleEdit} disabled={isDisabled} class="btn btn-sm"><i class="fas fa-edit" onClick={editHandler} /></button>
                       <div>{value as string}</div>
                   </div>;
    }
});
export default UniversalEditor;