"use strict";

const TsReader = require("../reader");
const TsDescriptorBase = require("./base");

class TsDescriptorVideoStream extends TsDescriptorBase {
    constructor(buffer) {
        super(buffer);
    }

    decode() {
        const reader = new TsReader(this._buffer);
        const objDescriptor = {};

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.multiple_frame_rate_flag = reader.bslbf(1);
        objDescriptor.frame_rate_code = reader.uimsbf(4);
        objDescriptor.MPEG_1_only_flag = reader.bslbf(1);
        objDescriptor.constrained_parameter_flag = reader.bslbf(1);
        objDescriptor.still_picture_flag = reader.bslbf(1);

        if (objDescriptor.MPEG_1_only_flag === 0) {
            objDescriptor.profile_and_level_indication = reader.uimsbf(8);
            objDescriptor.chroma_format = reader.uimsbf(2);
            objDescriptor.frame_rate_extension_flag = reader.bslbf(1);
            reader.next(5);    // reserved
        }

        return objDescriptor;
    }
}

module.exports = TsDescriptorVideoStream;
