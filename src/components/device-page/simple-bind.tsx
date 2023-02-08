import { Component, ComponentChild, h } from "preact";
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


export class SimpleBind extends Component<PropsFromStore & Actions, {}> {
    setStateValue = async (name: string, value: unknown): Promise<void> => {
        const { setStateValue, device } = this.props;
        await setStateValue(device.nwkAddr, name, value);
        new Notyf().success(`Successfully updated state value ${name}=${value}`);

    };
    setSimpleBind = async (name: string, value: unknown): Promise<void> => {
        const { device, setSimpleBindValue, getDeviceInfo } = this.props;
        await setSimpleBindValue(device.nwkAddr, name, value);
        new Notyf().success(`Successfully updated simple bind value ${name}=${value}`);
        getDeviceInfo(device.nwkAddr);
    };

    render(): ComponentChild {
        const { device } = this.props;
        if (device) {
            return this.renderSimpleBinds();
        }
        return "Loading...";
    }

    refresh = async (name: string): Promise<void> => {
        const { device, refreshState } = this.props;
        await refreshState(device.nwkAddr, name);
        new Notyf().success(`Requested state update ${device.nwkAddr} ${name}`);
    }

    renderSimpleBinds(): ComponentChild {
        const { device } = this.props;
        const simpleBindRules: Dictionary<string> = device.SB ?? {};
        const st_flags: Dictionary<number> = device.st_flags ?? {};
        const kv = Object.entries(device.st ?? {});


        return <table class="table table-striped table-borderless">
            <thead>
                <tr>
                    <th scope="col" />
                    <th scope="col">Value</th>
                    <th scope="col">SB rule</th>
                </tr>
            </thead>
            <tbody>
                {kv.filter((param: DeviceParamTuple) => ((st_flags[param[0]] & StateFlags.Option) == 0)).map((param: DeviceParamTuple) => (
                    <tr class={style["props-row"]}>
                        <th scope="row">{param[0]}</th>
                        <td>
                            <UniversalEditor
                                name={param[0] as string}
                                value={param[1]}
                                onChange={(value): Promise<void> => this.setStateValue(param[0], value)}
                                onRefresh={(): Promise<void> => this.refresh(param[0])}
                                titleRefresh={"Get"}
                                titleEdit={"Set"}
                            />
                        </td>
                        <td>
                            <UniversalEditor
                                name={param[0] as string}
                                value={simpleBindRules[param[0]] || ""}
                                onChange={(value): Promise<void> => this.setSimpleBind(param[0], value)}
                                allowEmpty={true}
                                titleEdit={"Edit"}
                            />
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>;

    }
}

const mappedProps = ["device", "forceRender"];

export default connect<{}, {}, GlobalState, PropsFromStore>(mappedProps, actions)(SimpleBind);