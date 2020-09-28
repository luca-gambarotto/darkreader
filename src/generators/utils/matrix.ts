import {clamp, multiplyMatrices, addMatrices, multiplyMatrixScalar, substractMatrices} from '../../utils/math';
import {FilterConfig, Theme} from '../../definitions';

export function createFilterMatrix(config: FilterConfig) {
    let m = Matrix.identity();
    if (config.sepia !== 0) {
        m = multiplyMatrices(m, Matrix.sepia(config.sepia / 100));
    }
    if (config.grayscale !== 0) {
        m = multiplyMatrices(m, Matrix.grayscale(config.grayscale / 100));
    }
    if (config.contrast !== 100) {
        m = multiplyMatrices(m, Matrix.contrast(config.contrast / 100));
    }
    if (config.brightness !== 100) {
        m = multiplyMatrices(m, Matrix.brightness(config.brightness / 100));
    }
    if (config.mode === 1) {
        m = multiplyMatrices(m, Matrix.invertNHue());
    }
    return m;
}

export function createColorBlindMatrix(config: Theme) {
    let m = Matrix.identity3x3();
    m = multiplyMatrices(m, getColorBlindMatrix(config.colorBlind.mode, config.colorBlind.strength, config.colorBlind.correction));
    return m;
}

const protanomaly = {
    standard: [
        [0.0, 0.0, 0.0],
        [0.7, 1.0, 0.0],
        [0.7, 0.0, 1.0]
    ],
    correction: [
        [0.0, 0.0, 0.0],
        [0.3, 0.0, 0.0],
        [-0.3, 0.0, 0.0]
    ],
    simulate: [
        [0.4720, -1.2946, 0.9857],
        [-0.6128, 1.6326, 0.0187],
        [0.1407, -0.3380, -0.0044],
        [-0.1420, 0.2488, 0.0044],
        [0.1872, -0.3908, 0.9942],
        [-0.0451, 0.1420, 0.0013],
        [0.0222, -0.0253, -0.0004],
        [-0.0290, -0.0201, 0.0006],
        [0.0068, 0.0454, 0.9990]
    ]
};

const deuteranomaly = {
    standard: [
        [0.0, 0.0, 0.0],
        [0.7, 1.0, 0.0],
        [0.7, 0.0, 1.0]
    ],
    correction: [
        [0.0, 0.0, 0.0],
        [0.3, 0.0, 0.0],
        [-0.3, 0.0, 0.0]
    ],
    simulate: [
        [0.5442, -1.1454, 0.9818],
        [-0.7091, 1.5287, 0.0238],
        [0.1650, -0.3833, -0.0055],
        [-0.1664, 0.4368, 0.0056],
        [0.2178, -0.5327, 0.9927],
        [-0.0514, 0.0958, 0.0017],
        [0.0180, -0.0288, -0.0006],
        [-0.0232, -0.0649, 0.0007],
        [0.0052, 0.0360, 0.9998]
    ]
};
const tritanomaly = {
    standard: [
        [1.0, 0.0, 0.7],
        [0.0, 1.0, 0.7],
        [0.0, 0.0, 0.0]
    ],
    correction: [
        [0.0, 0.0, 0.3],
        [0.0, 0.0, -0.3],
        [0.0, 0.0, 0.0]
    ],
    simulate: [
        [0.4275, -0.0181, 0.9307],
        [-0.2454, 0.0013, 0.0827],
        [-0.1821, 0.0168, -0.0134],
        [-0.1280, 0.0047, 0.0202],
        [0.0233, -0.0398, 0.9728],
        [0.1048, 0.0352, 0.0070],
        [-0.0156, 0.0061, 0.0071],
        [0.3841, 0.2947, 0.0151],
        [-0.3685, -0.3008, 0.9778]
    ]
};

function getColorBlindModeMatrix(mode: string) {
    switch (mode) {
        case 'protanomaly':
            return protanomaly;
        case 'deuteranomaly':
            return deuteranomaly;
        case 'tritanomaly':
            return tritanomaly;
    }
}

function getColorBlindMatrix(mode: string, strength: number, correction: number) {
    const modeMatrix = getColorBlindModeMatrix(mode);
    const cvdSimulationParam = modeMatrix.simulate;
    const severity2 = strength * strength;
    let effectiveMatrix = [];
    for (let i = 0; i < 3; i++) {
        const row = [];
        for (let j = 0; j < 3; j++) {
            const paramRow = i * 3 + j;
            const val = cvdSimulationParam[paramRow][0] * severity2
                + cvdSimulationParam[paramRow][1] * strength
                + cvdSimulationParam[paramRow][2];
            row.push(val);
        }
        effectiveMatrix.push(row);
    }
    const correctedMatrix = addMatrices(modeMatrix.standard, multiplyMatrixScalar(modeMatrix.correction, correction));
    const correctionMatrix = multiplyMatrices(effectiveMatrix, correctedMatrix);
    effectiveMatrix = substractMatrices(addMatrices(Matrix.identity3x3(), correctedMatrix), correctionMatrix);
    return effectiveMatrix;
}

export function applyColorMatrix([r, g, b]: number[], matrix: number[][]) {
    const rgb = [[r / 255], [g / 255], [b / 255], [1], [1]];
    const result = multiplyMatrices(matrix, rgb);
    return [0, 1, 2].map((i) => clamp(Math.round(result[i][0] * 255), 0, 255));
}

export const Matrix = {

    identity() {
        return [
            [1, 0, 0, 0, 0],
            [0, 1, 0, 0, 0],
            [0, 0, 1, 0, 0],
            [0, 0, 0, 1, 0],
            [0, 0, 0, 0, 1]
        ];
    },

    identity3x3() {
        return [
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, 1]
        ];
    },

    invertNHue() {
        return [
            [0.333, -0.667, -0.667, 0, 1],
            [-0.667, 0.333, -0.667, 0, 1],
            [-0.667, -0.667, 0.333, 0, 1],
            [0, 0, 0, 1, 0],
            [0, 0, 0, 0, 1]
        ];
    },

    brightness(v: number) {
        return [
            [v, 0, 0, 0, 0],
            [0, v, 0, 0, 0],
            [0, 0, v, 0, 0],
            [0, 0, 0, 1, 0],
            [0, 0, 0, 0, 1]
        ];
    },

    contrast(v: number) {
        const t = (1 - v) / 2;
        return [
            [v, 0, 0, 0, t],
            [0, v, 0, 0, t],
            [0, 0, v, 0, t],
            [0, 0, 0, 1, 0],
            [0, 0, 0, 0, 1]
        ];
    },

    sepia(v: number) {
        return [
            [(0.393 + 0.607 * (1 - v)), (0.769 - 0.769 * (1 - v)), (0.189 - 0.189 * (1 - v)), 0, 0],
            [(0.349 - 0.349 * (1 - v)), (0.686 + 0.314 * (1 - v)), (0.168 - 0.168 * (1 - v)), 0, 0],
            [(0.272 - 0.272 * (1 - v)), (0.534 - 0.534 * (1 - v)), (0.131 + 0.869 * (1 - v)), 0, 0],
            [0, 0, 0, 1, 0],
            [0, 0, 0, 0, 1]
        ];
    },

    grayscale(v: number) {
        return [
            [(0.2126 + 0.7874 * (1 - v)), (0.7152 - 0.7152 * (1 - v)), (0.0722 - 0.0722 * (1 - v)), 0, 0],
            [(0.2126 - 0.2126 * (1 - v)), (0.7152 + 0.2848 * (1 - v)), (0.0722 - 0.0722 * (1 - v)), 0, 0],
            [(0.2126 - 0.2126 * (1 - v)), (0.7152 - 0.7152 * (1 - v)), (0.0722 + 0.9278 * (1 - v)), 0, 0],
            [0, 0, 0, 1, 0],
            [0, 0, 0, 0, 1]
        ];
    },
};
