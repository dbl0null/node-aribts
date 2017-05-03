import TsBase from "./base";
import TsBuffer from "./buffer";
import TsPacket from "./packet";

export interface Options {
    packetSize: number;
}

export default class TsPacketParser extends TsBase {
    _options: Options;
    _packetSize: number;
    _packetIgnoreSize: number;
    _buffer: TsBuffer;

    constructor(options: Options) {
        super();

        this._options = Object.assign({
            packetSize: 188
        }, options || {});

        this._buffer = new TsBuffer();

        this._packetSize = 188;
        this._packetIgnoreSize = this._options.packetSize - 188;
    }

    _process(chunk: Buffer, callback: Function) {
        let bytesRead = 0;

        if (this._buffer.length !== 0) {
            if (this._buffer.length + chunk.length < this._packetSize) {
                // Add chunk
                this._buffer.add(chunk);

                callback();
                return;
            } else {
                // Get part
                const part = chunk.slice(0, this._packetSize - this._buffer.length);

                // Add part
                this._buffer.add(part);
                bytesRead += part.length;

                // Push packet
                this.push(new TsPacket(this._buffer.concat()));

                // Clear buffer
                this._buffer.clear();
            }
        }

        for (const l = chunk.length; bytesRead < l; ) {
            if (chunk[bytesRead + this._packetIgnoreSize] === 0x47) {
                // Skip ignore size
                bytesRead += this._packetIgnoreSize;
            } else {
                // Find sync_byte
                bytesRead = chunk.indexOf(0x47, bytesRead);

                // Can't find sync_byte
                if (bytesRead === -1) {
                    break;
                }
            }

            if (chunk.length - bytesRead < this._packetSize) {
                // Add buffer
                this._buffer.add(chunk.slice(bytesRead));

                break;
            }

            // Push packet
            this.push(new TsPacket(chunk.slice(bytesRead, bytesRead + this._packetSize)));

            bytesRead += this._packetSize;
        }

        callback();
    }
}
