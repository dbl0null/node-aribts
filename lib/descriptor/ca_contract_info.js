"use strict";

const TsReader = require("../reader");
const TsDescriptorBase = require("./base");

class TsDescriptorCaContractInfo extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode() {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {};

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.CA_system_id = reader.uimsbf(16);
        objDescriptor.CA_unit_id = reader.uimsbf(4);
        objDescriptor.num_of_component = reader.uimsbf(4);
        objDescriptor.components = [];

        for (let i = 0; i < objDescriptor.num_of_component; i++) {
            const component = {};

            component.component_tag = reader.uimsbf(8);

            objDescriptor.components.push(component);
        }

        objDescriptor.contract_verification_info_length = reader.uimsbf(8);
        objDescriptor.contract_verification_info = reader.readBytes(objDescriptor.contract_verification_info_length);
        objDescriptor.fee_name_length = reader.uimsbf(8);
        objDescriptor.fee_name = reader.readBytes(objDescriptor.fee_name_length);

        return objDescriptor;
    }
}

module.exports = TsDescriptorCaContractInfo;
