"use strict";
/* eslint-disable no-bitwise */
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Wrapper_target;
const buffers = new WeakMap();
const keys = new WeakMap();
const coord = (index) => {
    return [
        index >> 5,
        1 << (index & 31), // modulo 32
    ];
};
const handlers = {
    get(target, key) {
        if (typeof key === 'string') {
            const index = Number(key);
            if (!Number.isNaN(index)) {
                const [i, mask] = coord(index);
                const buffer = buffers.get(target.buffer);
                if (buffer !== undefined) {
                    return Number(Boolean(buffer[i] & mask));
                }
            }
        }
        return Reflect.get(target, key);
    },
    set(target, key, value) {
        if (typeof key === 'string') {
            const index = Number(key);
            if (!Number.isNaN(index)) {
                const buffer = buffers.get(target.buffer);
                if (buffer !== undefined) {
                    const [i, mask] = coord(index);
                    buffer[i] = value ? buffer[i] | mask : buffer[i] & ~mask;
                    return true;
                }
            }
        }
        return Reflect.set(target, key, value);
    },
    ownKeys: (target) => {
        let key = keys.get(target);
        if (!key) {
            keys.set(target, (key = Array(target.length)
                .fill(undefined)
                .map((_, i) => i.toString())));
        }
        return key;
    },
    getOwnPropertyDescriptor: ( /* target: BitArray, prop */) => ({
        enumerable: true,
        configurable: true,
    }),
};
class BitArray {
    constructor(arg) {
        const length = Number(arg);
        this.length = length;
        this.buffer = new ArrayBuffer((((length - 1) >> 5) + 1) * 4);
        buffers.set(this.buffer, new Uint32Array(this.buffer));
        // eslint-disable-next-line no-constructor-return
        return Reflect.construct(Proxy, [this, handlers]);
    }
    at(index) {
        return this[index];
    }
    set(value, offset = 0) {
        for (let i = 0; i < value.length; i += 1) {
            this[offset + i] = value[i] ? 1 : 0;
        }
    }
    toString() {
        let str = '';
        for (let i = 0; i < this.length; i += 1) {
            str += this[i];
        }
        return str;
    }
}
Symbol.iterator;
class Wrapper {
    constructor(target) {
        _Wrapper_target.set(this, void 0);
        __classPrivateFieldSet(this, _Wrapper_target, target, "f");
        this.position = 0;
    }
    read(value) {
        for (let i = 0; i < value.length; i += 1) {
            // eslint-disable-next-line no-param-reassign
            value[i] = __classPrivateFieldGet(this, _Wrapper_target, "f")[this.position + i];
        }
        this.position += value.length;
    }
    write(value) {
        __classPrivateFieldGet(this, _Wrapper_target, "f").set(value, this.position);
        this.position += value.length;
    }
    seek(position) {
        this.position = position;
    }
}
_Wrapper_target = new WeakMap();
class Crc {
    constructor(polynomial, initial, final) {
        this.polynomial = polynomial;
        this.initial = initial;
        this.final = final;
    }
    makeTable() {
        this.table = new Array(256);
        for (let i = 0; i < 256; i += 1) {
            let curr = i;
            for (let bit = 0; bit < 8; bit += 1) {
                if ((curr & 0x80) !== 0) {
                    curr = ((curr << 1) ^ this.polynomial) % 256;
                }
                else {
                    curr = (curr << 1) % 256;
                }
            }
            this.table[i] = curr;
        }
    }
    compute(bytes) {
        if (!this.table)
            this.makeTable();
        if (!this.table)
            return 0x00;
        let crc = this.initial;
        for (let i = 0; i < bytes.length; i += 1) {
            crc = this.table[(crc ^ bytes[i]) % 256];
        }
        return crc ^ this.final;
    }
    static default() {
        if (!Crc.singleton) {
            Crc.singleton = new Crc(0xa6, 0x00, 0x00);
        }
        return Crc.singleton;
    }
}
const encode = (data) => {
    // 22.5 bytes: 18 bits meta1, 8 bytes data1, 1 byte checksum, 2 bytes meta2, 8 bytes data2
    // 1          001              00            01              1              0
    // ^ reserved ^ version number ^ data format ^ checksum type ^ use xor mask ^ use pos mark
    //                               00: raw       01: crc8
    // 10110011
    // ^ mask 1 for nft id
    // 10110110
    // ^ mask 2 for nft id
    const head = [1, 0, 0, 1, 0, 0, 0, 1, 1, 0];
    const mask1 = [1, 0, 1, 1, 0, 0, 1, 1];
    const mask2 = [1, 0, 1, 1, 0, 1, 1, 0];
    const mask3 = [1, 0, 1, 1, 1, 1, 0, 0];
    const parts = ((data.length - 1) >> 6) + 1;
    const codec = new BitArray(parts * 90);
    const wrapper = new Wrapper(codec);
    for (let i = 0; i < parts; i += 1) {
        wrapper.write(head);
        let mask = [];
        switch (i & 3) {
            case 1:
                mask = mask2;
                break;
            case 2:
                mask = mask3;
                break;
            default:
                mask = mask1;
                break;
        }
        wrapper.write(mask);
        let u8 = 0;
        const u8a = [];
        for (let j = 0; j < 64; j += 1) {
            const bit = data[j + (i << 6)];
            if (bit !== undefined) {
                const m = j & 7;
                const out = (bit ^ mask[m]) & 1;
                u8 |= out << m;
                if (m === 7) {
                    u8a.push(u8);
                    u8 = 0;
                }
                wrapper.write([Boolean(out)]);
            }
        }
        const crc = Crc.default().compute(u8a);
        for (let j = 0; j < 8; j += 1) {
            const bit = (crc >> (7 - j)) & 1;
            wrapper.write([Boolean(bit)]);
        }
    }
    return codec;
};
const decode = (codec) => {
    const head = new Array(10);
    const mask = new Array(8);
    const parts = Math.trunc((codec.length - 1) / 90) + 1;
    const data = new BitArray(parts << 6);
    const wrapper = new Wrapper(codec);
    for (let i = 0; i < parts; i += 1) {
        wrapper.read(head);
        wrapper.read(mask);
        let u8 = 0;
        const u8a = [];
        const part = new Array(64);
        wrapper.read(part);
        for (let j = 0; j < 64; j += 1) {
            const m = j & 7;
            const bit = part[j] ? 1 : 0;
            const out = (bit ^ mask[m]) & 1;
            u8 |= bit << m;
            if (m === 7) {
                u8a.push(u8);
                u8 = 0;
            }
            part[j] = out ? 1 : 0;
        }
        const crc = Crc.default().compute(u8a);
        let cs = 0;
        const byte = new Array(8);
        wrapper.read(byte);
        for (let j = 0; j < 8; j += 1) {
            cs |= byte[j] << (7 - j);
        }
        if (crc === cs) {
            data.set(part, i << 6);
        }
    }
    return data;
};
function rgb2light(red, green, blue) {
    const r = red / 255;
    const g = green / 255;
    const b = blue / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    return l;
}
const parse = (image) => {
    console.log('parsing image', 'width:', image.width, 'height:', image.height);
    if (image.width !== image.height || image.width < 220) {
        throw new Error('image is not square or too small');
    }
    const cvs = document.createElement('canvas');
    cvs.width = image.width;
    cvs.height = image.height;
    const ctx = cvs.getContext('2d');
    if (ctx === null) {
        throw new Error('canvas is not supported');
    }
    ctx.drawImage(image, 0, 0);
    const codec = new BitArray(360);
    const threshold = 0.8;
    codec.set(new Array(180).fill(1));
    codec.set(new Array(180).fill(0), 180);
    // inner
    let r = Math.round(((324 * image.width) / 640) * 10) / 10;
    let step = (10 * Math.PI) / 9 / 180;
    let angle = Math.PI / 9 + step / 2;
    for (let i = 0; i < 180; i += 1) {
        const x = image.width / 2 + r * Math.cos(angle);
        const y = image.height / 2 + r * Math.sin(angle);
        const pixel = ctx.getImageData(x, y, 1, 1);
        const { data } = pixel;
        const light = rgb2light(data[0], data[1], data[2]);
        if (light >= threshold) {
            codec.set([0], i);
        }
        angle += step;
        if ((i + 1) % 45 === 0) {
            angle += (2 * Math.PI) / 9;
        }
    }
    // outer
    r = Math.round(((342 * image.width) / 640) * 10) / 10;
    step = (2 * Math.PI) / 3 / 180;
    angle = Math.PI / 6 + step / 2;
    for (let i = 0; i < 180; i += 1) {
        const x = image.width / 2 + r * Math.cos(angle);
        const y = image.height / 2 + r * Math.sin(angle);
        const pixel = ctx.getImageData(x, y, 1, 1);
        const { data } = pixel;
        const light = rgb2light(data[0], data[1], data[2]);
        if (light >= threshold) {
            codec.set([1], i + 180);
        }
        angle += step;
        if ((i + 1) % 45 === 0) {
            angle += (2 * Math.PI) / 6;
        }
    }
    return decode(codec);
};
const write = (image, raw) => {
    if (image.width !== image.height || image.width < 220) {
        throw new Error('image is not square or too small');
    }
    const r = 320;
    const cvs = document.createElement('canvas');
    cvs.width = r * 2;
    cvs.height = r * 2;
    const ctx = cvs.getContext('2d');
    if (ctx === null) {
        throw new Error('canvas is not supported');
    }
    ctx.save();
    const gradient = ctx.createLinearGradient(0, r * 2, r * 2, 0);
    gradient.addColorStop(0, '#FE2105');
    gradient.addColorStop(1, '#96E9EA');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.rect(0, 0, r * 2, r * 2);
    ctx.fill();
    ctx.save();
    ctx.restore();
    ctx.beginPath();
    ctx.arc(r, r, r - 40, 0, 2 * Math.PI);
    ctx.clip();
    ctx.drawImage(image, 40, 40, r * 2 - 80, r * 2 - 80);
    ctx.restore();
    const codec = encode(raw);
    // inner
    let angle = Math.PI / 9;
    ctx.lineWidth = 8;
    for (let i = 0; i < 180; i += 1) {
        ctx.save();
        ctx.beginPath();
        if (codec[i] === 0) {
            ctx.strokeStyle = 'white';
        }
        else {
            ctx.strokeStyle = 'transparent';
        }
        ctx.arc(r, r, r + 4, angle, angle + (10 * Math.PI) / 9 / 180, false);
        angle += (10 * Math.PI) / 9 / 180;
        if ((i + 1) % 45 === 0) {
            angle += (2 * Math.PI) / 9;
        }
        ctx.stroke();
    }
    // outer
    angle = Math.PI / 6;
    ctx.lineWidth = 7;
    for (let i = 0; i < 180; i += 1) {
        ctx.save();
        ctx.beginPath();
        if (codec[i + 180] === 1) {
            ctx.strokeStyle = 'white';
        }
        else {
            ctx.strokeStyle = 'transparent';
        }
        ctx.arc(r, r, r + 22, angle, angle + (2 * Math.PI) / 3 / 180, false);
        angle += (2 * Math.PI) / 3 / 180;
        if ((i + 1) % 45 === 0) {
            angle += (2 * Math.PI) / 6;
        }
        ctx.stroke();
    }
    return cvs;
};
