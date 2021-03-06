"use strict";

const TsReader = require("../reader");
const TsDescriptorBase = require("./base");

class TsDescriptorCaStartup extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode() {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {};

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.CA_system_ID = reader.uimsbf(16);
        reader.next(3);    // '111'
        objDescriptor.CA_program_ID = reader.uimsbf(13);
        objDescriptor.second_load_flag = reader.bslbf(1);
        objDescriptor.load_indicator = reader.bslbf(7);

        if (objDescriptor.second_load_flag === 1) {
            reader.next(3);    // '111'
            objDescriptor.CA_program_ID = reader.uimsbf(13);
            reader.next(1);    // '1'
            objDescriptor.load_indicator = reader.bslbf(7);
        }

        objDescriptor.exclusion_ID_num = reader.uimsbf(8);
        objDescriptor.exclusion_ID = [];

        for (let i = 0; i < objDescriptor.exclusion_ID_num; i++) {
            const id = {};

            reader.next(3);    // '111'
            id.exclusion_CA_program_ID = reader.uimsbf(13);

            objDescriptor.exclusion_ID.push(id);
        }

        objDescriptor.load_security_info_len = reader.uimsbf(8);
        objDescriptor.load_security_info = reader.readBytes(objDescriptor.load_security_info_len);

        objDescriptor.private_data = reader.readBytes(2 + objDescriptor.descriptor_length - (reader.position >> 3));

        return objDescriptor;
    }
}

module.exports = TsDescriptorCaStartup;
