import style from "./style.css";
import { Component, ComponentChild, h } from "preact";
import Button from "../button";
import orderBy from "lodash/orderBy";
import DeviceControlGroup from "../device-control";
import cx from "classnames";
import { Device, DeviceSupportStatus, inteviewsCount, SortDirection } from "../../types";
import { genDeviceDetailsLink, genDeviceImageUrl, lastSeen } from "../../utils";
import SafeImg from "../safe-image";
import { Notyf } from "notyf";
import PowerSource from "../power-source";
import { connect } from "unistore/preact";
import { GlobalState } from "../../store";
import actions, { Actions } from "../../actions";
import ActionTH from "./ActionTH";
import { isLeaveReqSend } from "../../binaryUtils";

//TODO: proper type alias
type SortColumns =
    "st.last_seen"
    | "friendly_name"
    | "ieeeAddr"
    | "ManufName"
    | "st.linkquality"
    | "ModelId"
    | "cid"
    | "Interview.State"
    | "PowerSource";


interface ZigbeeTableState {
    sortDirection: SortDirection;
    sortColumn: SortColumns;
    currentTime: number;
}




const storeKey = "ZigbeeTableState";

export class ZigbeeTable extends Component<Actions & GlobalState, ZigbeeTableState> {
    currentTimeUpdateTimer: ReturnType<typeof setInterval> | undefined;

    constructor() {
        super();
        this.state = {
            sortDirection: "desc",
            sortColumn: "st.last_seen",
            currentTime: Math.round(Date.now() / 1000), // in seconds
        };
    }

    restoreState(): void {
        const storedState = localStorage.getItem(storeKey);
        if (storedState) {
            try {
                const restored: Partial<ZigbeeTableState> = JSON.parse(storedState);
                this.setState(restored);
            } catch (e) {
                new Notyf().error(e.toString());
            }
        }
    }

    saveState = (): void => {
        const { sortDirection, sortColumn } = this.state;
        const storeData = {
            sortDirection,
            sortColumn
        };
        //in private mode localstorage access can throw exceptions
        try {
            localStorage.setItem(storeKey, JSON.stringify(storeData));
        } catch (e) {
            new Notyf().error(e.toString());
        }
    };

    loadData = async (showLoading = true): Promise<void> => {
        const {getZigbeeDevicesList, fetchTimeInfo} = this.props;
        getZigbeeDevicesList(showLoading);
        await fetchTimeInfo();
        this.currentTimeUpdateTimer = setInterval(() => {
            const currentTime = Math.round(Date.now() / 1000) - this.props.timeOffset;
            this.setState( { currentTime });
        }, 5000);
    };


    componentDidMount(): void {
        this.restoreState();
        this.loadData();
    }

    componentWillUnmount(): void {
        if (this.currentTimeUpdateTimer) {
            clearInterval(this.currentTimeUpdateTimer);
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onInterviewClick = async (device: Device): Promise<void> => {
        const { startInterview } = this.props;
        if (confirm("Start Interview?")) {
            await startInterview(device.nwkAddr, device?.Interview?.State)
            new Notyf().success("Started interview");
        }
    };

    onSortChange = (column: SortColumns, sortDir: SortDirection | undefined = undefined): void => {
        const { sortColumn } = this.state;
        let { sortDirection } = this.state;

        if (sortColumn === column) {
            if (sortDir) {
                sortDirection = sortDir;
            } else if (sortDirection == "asc") {
                sortDirection = "desc";
            } else {
                sortDirection = "asc";
            }
        }

        this.setState({ sortColumn: column, sortDirection }, this.saveState);
    };

    render(): ComponentChild {
        const { devices, isLoading } = this.props;
        if (isLoading) {
            return <div className="d-flex justify-content-center">
                <div className="spinner-border" role="status">
                    <span className="sr-only">Loading...</span>
                </div>
            </div>;
        }
        return (devices.length ? this.renderDevicesTable() : <div>No data</div>);
    }

    renderInterviewState(device: Device): ComponentChild {
        const { onInterviewClick } = this;
        const interviewTrigger = <Button<Device> className="btn btn-normal btn-sm" onClick={onInterviewClick}
                                                 item={device}><i className="fa fa-play" /></Button>;

        if (device.Interview) {
            if (inteviewsCount === device.Interview.State) {
                return "Ok";
            }
            return <div>{device.Interview.State ?? 0}/{inteviewsCount} {interviewTrigger}</div>;
        }
        return <div>N/A {interviewTrigger}</div>;
    }

    getSupportTitle(device: Device): string {
        switch (device.supported) {
            case DeviceSupportStatus.Supported:
                return "Supported";
            case DeviceSupportStatus.Unknown:
                return "Support unknown";
            case DeviceSupportStatus.UnSupported:
                return "Unsupported";
            default:
                return "";
        }
    }

    renderDevicesTable(): ComponentChild {
        const { sortColumn, sortDirection, currentTime } = this.state;
        const { devices } = this.props;
        const sortedDevices = orderBy<Device>(devices, [sortColumn], [sortDirection]);
        const { onSortChange } = this;

        return (
            <table className={`table table-striped table-borderless ${style.adaptive} ${style.zigbee}`}>
                <thead>
                <tr className="text-nowrap">
                    <th>#</th>
                    <th>Pic</th>
                    <ActionTH<SortColumns> className={cx(style["addr"], style["action-column"])} column="ieeeAddr"
                                           currentDirection={sortDirection} current={sortColumn}
                                           onClick={onSortChange}>Address</ActionTH>
                    <ActionTH<SortColumns> className={style["action-column"]} column="friendly_name"
                                           currentDirection={sortDirection} current={sortColumn}
                                           onClick={onSortChange}>Friendly Name</ActionTH>
                    <ActionTH<SortColumns> className={cx(style["manu-name"], style["action-column"])} column="ManufName" title="Manufacturer name"
                                           currentDirection={sortDirection} current={sortColumn}
                                           onClick={onSortChange} titile="ManufName">Manuf</ActionTH>
                    <ActionTH<SortColumns> className={style["action-column"]} column="ModelId"
                                           currentDirection={sortDirection} current={sortColumn}
                                           onClick={onSortChange}>ModelId</ActionTH>
                    <ActionTH<SortColumns> className={style["action-column"]} column="cid" title="Converter ID"
                                           currentDirection={sortDirection} current={sortColumn}
                                           onClick={onSortChange}>CID</ActionTH>
                    <ActionTH<SortColumns> className={style["action-column"]} column="st.linkquality"
                                           currentDirection={sortDirection} current={sortColumn}
                                           onClick={onSortChange} title="Link quality">Link</ActionTH>
                    <ActionTH<SortColumns> className={style["action-column"]} column="Interview.State"
                                           currentDirection={sortDirection} current={sortColumn}
                                           onClick={onSortChange}>Interview</ActionTH>
                    <ActionTH<SortColumns> className={style["action-column"]} column="st.last_seen"
                                           currentDirection={sortDirection} current={sortColumn}
                                           onClick={onSortChange}>Last Seen</ActionTH>
                    <th>Routes</th>
                    <ActionTH<SortColumns> className={style["action-column"]} column="PowerSource" title="Power source"
                                           currentDirection={sortDirection} current={sortColumn}
                                           onClick={onSortChange}>PS</ActionTH>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {sortedDevices.map((device: Device, index) =>
                <tr className={cx({
                    "table-danger": !device.ieeeAddr,
                    "table-warning": isLeaveReqSend(device.flags)
                })} key={device.ieeeAddr + device.nwkAddr}>
                    <td className="font-weight-bold">{index + 1}</td>
                    <td className={style["device-pic"]}><SafeImg class={cx(style["device-image"])}
                                                                 src={genDeviceImageUrl(device)} />
                    </td>
                    <td className={style["addr"]}>
                        <a href={genDeviceDetailsLink(device.nwkAddr)}>
                            {device.ieeeAddr ? device.ieeeAddr : "<corrupted>"} ({device.nwkAddr})
                        </a>
                    </td>
                    <td>{device.friendly_name}</td>
                    <td title={device.ManufName}
                        className={cx(style["manu-name"], "text-truncate", "text-nowrap", "position-relative")}>{device.ManufName}</td>
                    <td title={this.getSupportTitle(device)} className={cx("text-nowrap", {
                        "table-danger": device.supported == DeviceSupportStatus.UnSupported,
                        "table-warning": device.supported == DeviceSupportStatus.Unknown
                    })}>
                        {device.ModelId}
                    </td>
                    <td>
                        {device.cid > 0 ?
                        <a href={`https://slsys.io/action/supported_devices.html?device=${device.cid}`}
                            rel="noopener noreferrer" target="_blank">
                            {device.cid}
                        </a>
                         : 0}
                    </td>
                    <td>{device.st?.linkquality}</td>
                    <td className={cx({
                        "table-warning": device.Interview?.State !== 4
                    })}>{this.renderInterviewState(device)}</td>
                    <td>{lastSeen(device, currentTime)}</td>
                    <td>{device?.Rtg?.map((route) => <a className={"d-block"}
                        href={genDeviceDetailsLink(route)}>{route}</a>)}</td>
                    <td className="text-left"><PowerSource source={device.PowerSource} battery={device.st?.battery} /></td>
                    <td>
                        <DeviceControlGroup device={device} simple={true} />
                    </td>
                </tr>)}

                </tbody>
            </table>

        );
    }
}

const mappedProps = ["isLoading", "timeOffset", "devices", "forceRender"];
const ConnectedDevicePage = connect<{}, ZigbeeTableState, GlobalState, Actions>(mappedProps, actions)(ZigbeeTable);
export default ConnectedDevicePage;
