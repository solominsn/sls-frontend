import { FunctionalComponent, h, RefObject } from "preact";
import { forwardRef } from "preact/compat";

interface UniversalEditorProps {
    value: unknown;
    onChange(value: unknown): void;
    [k: string]: unknown;
}

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

const UniversalEditor: FunctionalComponent<UniversalEditorProps> = forwardRef((props, ref: RefObject<HTMLInputElement>) => {
    const { value, onChange, ...rest } = props;
	const isToggleParameter = togglePairs.has(value as string | boolean);
	
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
    switch (typeof value) {
        case "boolean":
            return <input ref={ref} {...rest} type="checkbox" checked={value} onChange={changeHandler}
                          class="form-check-input" />;
        case "number":
            return <input step="any" ref={ref} {...rest} type="number" value={value} onBlur={changeHandler} />;
        default:            
			/*if (isToggleParameter) {
				return <div class="custom-control custom-switch"><input ref={ref} class="custom-control-input" type="checkbox" onChange={changeHandler}/>
				<label class="custom-control-label">{value as string}</label>
				</div>;
			};*/

            return <input ref={ref} {...rest} type="text" value={value as string} onBlur={changeHandler} />;
    }
});
export default UniversalEditor;