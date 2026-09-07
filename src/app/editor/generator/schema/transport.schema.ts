export const BLE_SERVICE_UUID = '0000ffe0-0000-1000-8000-00805f9b34fb';
export const BLE_COMMAND_WRITE_CHARACTERISTIC_UUID = '0000ffe1-0000-1000-8000-00805f9b34fb';
export const BLE_RESPONSE_CHARACTERISTIC_UUID = '0000ffe2-0000-1000-8000-00805f9b34fb';
export const BLE_STATE_CHARACTERISTIC_UUID = '0000ffe3-0000-1000-8000-00805f9b34fb';

export const BLE_COMMAND_WRITE_WITH_RESPONSE = true;
export const BLE_COMMAND_MAX_PAYLOAD_BYTES = 20;
export const BLE_COMMAND_TERMINATOR = '\n';
export const BLE_COMMAND_ONE_WRITE_IS_ONE_LINE = true;
export const BLE_FRAGMENT_BUFFER_BYTES = BLE_COMMAND_MAX_PAYLOAD_BYTES;
export const BLE_ACK_PREFIX = 'ack';
export const BLE_ERROR_PREFIX = 'err';
export const BLE_REQUEST_ID_MAX = 65535;
export const BLE_STATE_PAYLOAD_VERSION = 1;
export const BLE_STATE_BYTE_ORDER = 'little-endian';
export const BLE_STATE_PAYLOAD_LENGTH = 10;
export const BLE_COMMAND_TIMEOUT_MS = 3000;

export interface BleResponse {
    readonly kind: 'ack' | 'error';
    readonly requestId: number;
    readonly message: string;
}

export function parseBleResponse(payload: string): BleResponse {
    const tokens = payload.trim().split(/\s+/);
    if (tokens.length < 3 || (tokens[0] !== BLE_ACK_PREFIX && tokens[0] !== BLE_ERROR_PREFIX)) {
        throw new Error(`Invalid BLE response: ${payload}`);
    }
    const requestId = Number(tokens[1]);
    if (!Number.isInteger(requestId) || requestId < 0 || requestId > BLE_REQUEST_ID_MAX) {
        throw new Error(`Invalid BLE response request id: ${tokens[1]}`);
    }
    return { kind: tokens[0] === BLE_ACK_PREFIX ? 'ack' : 'error', requestId, message: tokens.slice(2).join(' ') };
}
