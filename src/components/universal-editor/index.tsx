import { FunctionalComponent, h, RefObject, Fragment } from "preact";
import { forwardRef } from "preact/compat";

interface UniversalEditorProps {
    value: unknown;
    onChange(value: unknown): void;
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

const UniversalEditor: FunctionalComponent<UniversalEditorProps> = forwardRef((props, ref: RefObject<HTMLInputElement>) => {
    const { value, onChange, onRefresh, allowEmpty, titleEdit, titleRefresh, ...rest } = props;
    /* const isToggleParameter = togglePairs.has(value as string | boolean); */
	
    const changeHandler = (event) => {
        const { target } = event;
        switch (target.type) {
            case "checkbox":
                onChange(target.checked);
                break;
            case "number":
                target.valueAsNumber != value && onChange(target.valueAsNumber);
                break;
            default:
                target.value != value && onChange(target.value);
                break;
        }
    };

    const editHandler = async (): Promise<void> => {
        const newVal = prompt("Enter new value", value as string);
        if (newVal !== null && (newVal !== "" || allowEmpty)) {
          onChange(newVal);
        }
    };

    switch (typeof value) {
        case "boolean":
            return <div class="d-inline-flex align-items-center">
                       {onRefresh ? <button type="button" title={titleRefresh} class="btn btn-sm"><i class="fas fa-sync" onClick={onRefresh} /></button> : null }
                       <input ref={ref} {...rest} type="checkbox" checked={value} onChange={changeHandler} />
                   </div>;
        case "number":
            /* return <input step="any" ref={ref} {...rest} type="number" value={value} onBlur={changeHandler} />; */
        default:            
			/*if (isToggleParameter) {
				return <div class="custom-control custom-switch"><input ref={ref} class="custom-control-input" type="checkbox" onChange={changeHandler}/>
				<label class="custom-control-label">{value as string}</label>
				</div>;
			};*/

            /* return <input ref={ref} {...rest} type="text" value={value as string} onBlur={changeHandler} />; */
            return <div class="d-inline-flex align-items-baseline">
                       {onRefresh ? <button type="button" title={titleRefresh} class="btn btn-sm"><i class="fas fa-sync" onClick={onRefresh} /></button> : null }
                       <button type="button" title={titleEdit} class="btn btn-sm"><i class="fas fa-edit" onClick={editHandler} /></button>
                       <div>{value as string}</div>
                   </div>;
    }
});
export default UniversalEditor;