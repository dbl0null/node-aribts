import TsCrc32 from "../crc32";
import TsReader from "../reader";
import TsWriter from "../writer";
import TsSectionBase, { Section } from "./base";

export interface ProgramAssociation extends Section {
    programs: Program[];
}

export interface Program {
    program_number: number;
    network_PID?: number;
    program_map_PID?: number;
}

export default class TsSectionProgramAssociation extends TsSectionBase {
    constructor(buffer, pid) {
        super(buffer, pid);
    }

    decode(): ProgramAssociation {
        const reader = new TsReader(this._buffer);
        const objSection = {} as any as ProgramAssociation;

        objSection.table_id = reader.uimsbf(8);
        objSection.section_syntax_indicator = reader.bslbf(1);
        reader.next(1);    // '0'
        reader.next(2);    // reserved
        objSection.section_length = reader.uimsbf(12);
        objSection.transport_stream_id = reader.uimsbf(16);
        reader.next(2);    // reserved
        objSection.version_number = reader.uimsbf(5);
        objSection.current_next_indicator = reader.bslbf(1);
        objSection.section_number = reader.uimsbf(8);
        objSection.last_section_number = reader.uimsbf(8);

        objSection.programs = [];

        for (const l = 3 + objSection.section_length - 4; reader.position >> 3 < l; ) {
            const program = {} as any as Program;

            program.program_number = reader.uimsbf(16);
            reader.next(3);    // reserved
            if (program.program_number === 0) {
                program.network_PID = reader.uimsbf(13);
            } else {
                program.program_map_PID = reader.uimsbf(13);
            }

            objSection.programs.push(program);
        }

        objSection.CRC_32 = reader.readBytes(4);

        return objSection;
    }

    encode(objSection: ProgramAssociation): void {
        const buffer = Buffer.alloc(0x400);

        const writer = new TsWriter(buffer);

        writer.uimsbf(8, objSection.table_id);
        writer.bslbf(1, objSection.section_syntax_indicator);
        writer.bslbf(1, 0);    // '0'
        writer.bslbf(2, 0b11);    // reserved
        writer.uimsbf(12, 5 + objSection.programs.length * 4 + 4);
        writer.uimsbf(16, objSection.transport_stream_id);
        writer.bslbf(2, 0b11);    // reserved
        writer.uimsbf(5, objSection.version_number);
        writer.bslbf(1, objSection.current_next_indicator);
        writer.uimsbf(8, objSection.section_number);
        writer.uimsbf(8, objSection.last_section_number);

        objSection.programs.forEach(program => {
            writer.uimsbf(16, program.program_number);
            writer.bslbf(3, 0);    // reserved
            if (program.program_number === 0) {
                writer.uimsbf(13, program.network_PID);
            } else {
                writer.uimsbf(13, program.program_map_PID);
            }
        });

        writer.writeBytes(4, TsCrc32.calcToBuffer(buffer.slice(0, writer.position >> 3)));

        this._buffer = buffer.slice(0, writer.position >> 3);
    }

    checkCrc32(): boolean {
        return TsCrc32.calc(this._buffer) === 0;
    }

    getTransportStreamId(): number {
        return this._buffer[3] << 8 | this._buffer[4];
    }

    getVersionNumber(): number {
        return (this._buffer[5] & 0x3E) >> 1;
    }

    getCurrentNextIndicator(): number {
        return this._buffer[5] & 0x01;
    }

    getSectionNumber(): number {
        return this._buffer[6];
    }

    getLastSectionNumber(): number {
        return this._buffer[7];
    }
}
