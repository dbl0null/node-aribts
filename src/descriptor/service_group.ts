import TsReader from "../reader";
import TsDescriptorBase, { Descriptor } from "./base";

export interface ServiceGroup extends Descriptor {
    service_group_type: number;
    service_groups?: Group[];
    private_data?: Buffer;
}

export interface Group {
    primary_service_id: number;
    secondary_service_id: number;
}

export default class TsDescriptorServiceGroup extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode(): ServiceGroup {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {} as any as ServiceGroup;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.service_group_type = reader.uimsbf(4);
        reader.next(4);    // reserved_future_use

        if (objDescriptor.service_group_type === 1) {
            objDescriptor.service_groups = [];

            for (const l = 2 + objDescriptor.descriptor_length; reader.position >> 3 < l; ) {
                const service_group = {} as any as Group;

                service_group.primary_service_id = reader.uimsbf(16);
                service_group.secondary_service_id = reader.uimsbf(16);

                objDescriptor.service_groups.push(service_group);
            }
        } else {
            objDescriptor.private_data = reader.readBytes(2 + objDescriptor.descriptor_length - (reader.position >> 3));
        }

        return objDescriptor;
    }
}
