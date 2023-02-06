import { Component, ComponentChild, Fragment, h } from "preact";
import { Device, Dictionary, StateFlags } from "../../types";
import style from "./style.css";
import UniversalEditor from "../universal-editor";
import actions, { Actions } from "../../actions";
import { Notyf } from "notyf";
import { connect } from "unistore/preact";
import { GlobalState } from "../../store";

interface PropsFromStore {
    device: Device | undefined;
}

type DeviceParamTuple = [string, unknown];


export class Options extends Component<PropsFromStore & Actions, {}> {
    setStateValue = async (name: string, value: unknown): Promise<void> => {
        const { setStateValue, device, getDeviceInfo } = this.props;
        await setStateValue(device.nwkAddr, name, value);
        new Notyf().success(`Successfully updated state value ${name}=${value}`);
        getDeviceInfo(device.nwkAddr);

    };

    render(): ComponentChild {
        const { device } = this.props;
        if (device) {
            return this.renderOptions();
        }
        return "Loading...";
    }

    refresh = async (name: string): Promise<void> => {
        const { device, refreshState } = this.props;
        await refreshState(device.nwkAddr, name);
        new Notyf().success(`Requested state update ${device.nwkAddr} ${name}`);
    }

    renderOptions(): ComponentChild {
        const { device } = this.props;
        const st_flags: Dictionary<number> = device.st_flags ?? {};
        const kv = Object.entries(device.st ?? {});

        return <table class="table table-striped table-borderless">
            <thead>
                <tr>
                    <th scope="col" />
                    <th scope="col">Value</th>
                </tr>
            </thead>
            <tbody>
                {kv.filter((param: DeviceParamTuple) => (st_flags[param[0]] & StateFlags.Option)).map((param: DeviceParamTuple) => (
                    <tr class={style["props-row"]}>
                        <th scope="row">{param[0]}</th>
                        <td>
                            <UniversalEditor
                                name={param[0]}
                                value={param[1]}
                                onChange={(value): Promise<void> => this.setStateValue(param[0], value)}
                                onRefresh={(): Promise<void> => this.refresh(param[0])}
                                titleRefresh={"Get"}
                                titleEdit={"Set"}
                            />
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>;
    }
}

const mappedProps = ["device", "forceRender"];

export default connect<{}, {}, GlobalState, PropsFromStore>(mappedProps, actions)(Options);