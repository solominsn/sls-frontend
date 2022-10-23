import { NodeI } from "./types";
import style from "./tooltip.css";
import { FunctionalComponent, h } from "preact";
import { isOnline } from "./nodes";
import { Device } from "../../types";
import { lastSeen } from "../../utils";
import { TimeInfo } from "../discovery/types";

interface TooltipProps {
    info: NodeI;
    time: TimeInfo;
}

const getTooltip = (device: Device, timeInfo: TimeInfo): string[] => {
    const strings: string[] = [];
    if (device.ManufName) {
        if (device.ModelId) {
            strings.push(`${device.ManufName} ${device.ModelId}`);
        } else {
            strings.push(device.ManufName);
        }
    }
    if (device.ieeeAddr) {
        strings.push(device.ieeeAddr);
    }
    if (device?.st?.linkquality) {
        strings.push(`LinkQuality: ${device.st.linkquality}`);
    }
    if (strings.length == 0) {
        strings.push("A very strange device...");
    }
    if (device.type !== "Coordinator") {
        const deviceLastSeen = lastSeen(device, timeInfo.ts);
        if (deviceLastSeen) {
            strings.push(`Last seen: ${deviceLastSeen}`);
        }
        if (!isOnline(device, timeInfo)) {
            strings.push("Offline");
        }
    }
    return strings;
};

const Tooltip: FunctionalComponent<TooltipProps> = (props: TooltipProps) => {
    const { info, time } = props;
    const { device } = info;
    return (
        <div className={style.tooltip}>
            {getTooltip(device, time).map((s) => <div>{s}</div>)}
        </div>

    );
};
export default Tooltip;