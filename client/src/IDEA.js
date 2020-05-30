const IDEA_ADD_MODULAR = 65536;
const IDEA_MP_MODULAR = 65537;
const IDEA_KEY_LENGTH = 128;
const IDEA_DATA_SIZE = 64;
const IDEA_SUB_DATA_SIZE = 16;

const addMod = (a, b) => {
    return (a + b) % IDEA_ADD_MODULAR; 
}

const mpMod = (a, b) => {
    const tmpA = a === 0 ? (1 << 16) : a;
    const tmpB = b === 0 ? (1 << 16) : b;
    return (tmpA * tmpB) % IDEA_MP_MODULAR;
}

const xor = (a, b) => {
    return a ^ b;
}

const ma = (maIn, subKeys) => {
    let tmp = [];
    tmp.push(mpMod(maIn[0], subKeys[0]));
    tmp.push(addMod(maIn[1], tmp[0]));
    let maOut = [0, 0];
    maOut[1] = mpMod(tmp[1], subKeys[1]);
    maOut[0] = addMod(tmp[0], maOut[1]);
    return maOut;
}

const subKeyGeneration = (key) => {
    let subKeys = [];
    for (let i = 0; i < 6; ++i) {
        for(let j = 0; j < 8; ++j) {
            subKeys.push(parseInt(key.substring(j * 16, (j + 1) * 16), 2));
        }
        key = key.substring(25, 128) + key.substring(0, 25);
    }
    for(let i = 0; i < 4; ++i) {
        subKeys.push(parseInt(key.substring(i * 16, (i + 1) * 16), 2));
    }
    let ans = [];
    for (let i = 0; i < 8; ++i) {
        let g = [];
        for (let j = 0; j < 6; ++j) {
            g.push(subKeys[i * 6 + j]);
        }
        ans.push(g);
    }
    ans.push([subKeys[48], subKeys[49], subKeys[50], subKeys[51]]);
    return ans;
}

const subDKeyGeneration = (key) => {
    let subDKeys = [];
    const subKeys = subKeyGeneration(key);

    let tmp = extendedEuclid(subKeys[8][0], IDEA_MP_MODULAR);
    subDKeys.push(tmp === 65536 ? 0 : tmp);
    subDKeys.push((IDEA_ADD_MODULAR - subKeys[8][1]) % IDEA_ADD_MODULAR);
    subDKeys.push((IDEA_ADD_MODULAR - subKeys[8][2]) % IDEA_ADD_MODULAR);

    tmp = extendedEuclid(subKeys[8][3], IDEA_MP_MODULAR);
    subDKeys.push(tmp === 65536 ? 0 : tmp);
    for (let i = 0; i < 8; ++i) {
        subDKeys.push(subKeys[7 - i][4]);
        subDKeys.push(subKeys[7 - i][5]);
        tmp = extendedEuclid(subKeys[7 - i][0], IDEA_MP_MODULAR);
        subDKeys.push(tmp === 65536 ? 0 : tmp);
        subDKeys.push((IDEA_ADD_MODULAR - subKeys[7 - i][2]) % IDEA_ADD_MODULAR);
        subDKeys.push((IDEA_ADD_MODULAR - subKeys[7 - i][1]) % IDEA_ADD_MODULAR);
        tmp = extendedEuclid(subKeys[7 - i][3], IDEA_MP_MODULAR);
        subDKeys.push(tmp == 65536 ? 0 : tmp);
    }
    let ans = [];
    for (let i = 0; i < 8; ++i) {
        let g = [];
        for (let j = 0; j < 6; ++j) {
            g.push(subDKeys[i * 6 + j]);
        }
        ans.push(g);
    }
    ans.push([subDKeys[48], subDKeys[49], subDKeys[50], subDKeys[51]]);
    return ans;
}

const extendedEuclid = (d, k) => {
    let x = [0, 0, 0, k];
    let y = [0, 0, 1, d == 0 ? (1 << 16) : d];
    let t = [0, 0, 0, 0];

    while (y[3] > 1) {
        let q = Math.floor(x[3] / y[3]);
        for(let i = 1; i <= 3; ++i) {
            t[i] = x[i] - q * y[i];
        }
        for(let i = 1; i <= 3; ++i) {
            x[i] = y[i];
        }
        for(let i = 1; i <= 3; ++i) {
            y[i] = t[i];
        }
    }

    if (y[3] === 1) {
        if (y[2] < 0) {
            y[2] += k;
        }
        return y[2];
    }
}

const ideaRound = (X, keys) => {
    let tmp = [];
    tmp.push(mpMod(X[0], keys[0]));
    tmp.push(addMod(X[1], keys[1]));
    tmp.push(addMod(X[2], keys[2]));
    tmp.push(mpMod(X[3], keys[3]));

    let maIn = [];
    maIn.push(xor(tmp[0], tmp[2])); 
    maIn.push(xor(tmp[1], tmp[3])); 

    let maOut = ma(maIn, [keys[4], keys[5]]);  
    let out = [];
    out.push(xor(tmp[0], maOut[1]));
    out.push(xor(tmp[1], maOut[0]));
    out.push(xor(tmp[2], maOut[1]));
    out.push(xor(tmp[3], maOut[0]));
    [ out[1], out[2] ] = [ out[2], out[1] ];

    return out;
}

// data is a 64 bit string, key is a 128 bit string
export const ideaEncrypt = (data, key) => {
    let X = [];
    for (let i = 0; i < 4; ++i) {
        X.push(parseInt(data.substring(i * 16, (i + 1) * 16), 2));
    }

    let subKeys = subKeyGeneration(key);
    let out = [];
    for (let i = 0; i < 8; ++i) {
        out = ideaRound(X, subKeys[i]);
        X = out;
    }

    [ out[1], out[2] ] = [ out[2], out[1] ];
    out[0] = mpMod(out[0], subKeys[8][0]);
    out[1] = addMod(out[1], subKeys[8][1]);
    out[2] = addMod(out[2], subKeys[8][2]);
    out[3] = mpMod(out[3], subKeys[8][3]);

    let ans = "";
    for (let i = 0; i < 4; ++i) {
        let part = out[i].toString(2);
        for (let j = 0; j < 16 - part.length; ++j) {
            ans += "0";
        }
        ans += part;
    }

    return ans;
}

export const ideaDecrypt = (data, key) => {
    let X = [];
    for (let i = 0; i < 4; ++i) {
        X.push(parseInt(data.substring(i * 16, (i + 1) * 16), 2));
    }

    let subDKeys = subDKeyGeneration(key);

    let out = [];
    for (let i = 0; i < 8; ++i) {
        out = ideaRound(X, subDKeys[i]);
        X = out;
    }

    out[0] = mpMod(out[0], subDKeys[8][0]);
    out[1] = addMod(out[1], subDKeys[8][1]);
    out[2] = addMod(out[2], subDKeys[8][2]);
    out[3] = mpMod(out[3], subDKeys[8][3]);
    [ out[1], out[2] ] = [ out[2], out[1] ];

    let ans = "";
    for (let i = 0; i < 4; ++i) {
        let part = out[i].toString(2);
        for (let j = 0; j < 16 - part.length; ++j) {
            ans += "0";
        }
        ans += part;
    }

    return ans;
}
