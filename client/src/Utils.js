export const TIME_INTERVAL = 2;
export const TIME_LENGTH = 22;

export const expandToFullIPv6 = (src) => {
    const parts = src.split(":");
    let ans = "";
    for (let i = 0; i < parts.length; ++i) {
        if (parts[i] === "") {
            for (let j = 0; j <= 8 - parts.length; ++j) {
                ans += "0000";
            }
        } else {
            for (let j = 0; j < 4 - parts[i].length; ++j) {
                ans += "0";
            }
            ans += parts[i];
        }
    }
    return ans;
}

export const getBinaryIPv6 = (ip) => {
    const fullIP = expandToFullIPv6(ip);
    console.log(fullIP);
    console.log(fullIP.length);
    let ans = "";
    for (let i = 0; i < fullIP.length; ++i) {
        const part = parseInt(fullIP[i], 16).toString(2);
        for (let j = 0; j < 4 - part.length; ++j) {
            ans += "0";
        }
        ans += part;
    }
    return ans;
}

export const getInterface = (ip) => {
    console.log(ip);
    const binaryIP = getBinaryIPv6(ip);
    console.log(binaryIP);
    console.log(binaryIP.length);
    return binaryIP.substring(64, 128);
}

export const getNIDFromInterface = (itf) => {
    let binaryNID = itf.substring(0, 40);
    return parseInt(binaryNID, 2).toString(16); 
}

export const getTimeFromInterface = (itf) => {
    let binaryTime = itf.substring(64 - TIME_LENGTH, 64);
    return parseInt(binaryTime, 2) * TIME_LENGTH;
}

export const decryptByIDEA = (src, key) => {
    return src;
}

export const encryptByIDEA = (src, key) => {
    return src;
}
