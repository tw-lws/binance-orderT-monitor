const axois = require("axios").default;
const crypto = require("crypto");
const querystring = require("querystring");

/** Force it test env */
if (process.env.NODE_ENV !== "development") {
    throw new Error("Only allow create test order in development!");
}
const HOST = "https://testnet.binance.vision";
//replace your api key here
const API_KEY = '';
//

if (!API_KEY) {
    throw new Error("Please input a API_KEY");
}
//replace your api secret here
const SECRET = '';
if (!SECRET) {
    throw new Error("Please input a SECRET");
}
const getTs = () => new Date().getTime();
/**
 * Signed function when you need access secure some secure endpoint
 *
 * details:
 * https://binance-docs.github.io/apidocs/spot/en/#signed-trade-user_data-and-margin-endpoint-security
 * @param {any} params
 */
const sign = (params) => {
    return crypto
        .createHmac("sha256", SECRET)
        .update(querystring.stringify(params))
        .digest("hex");
};

/** EXport functions */
const getOrders = async () => {
    const params = {
        symbol: "LTCBTC",
        timestamp: getTs(),
    };
    axois(HOST + "/api/v3/allOrders", {
            params: {
                ...params,
                signature: sign(params),
            },
            headers: {
                "X-MBX-APIKEY": API_KEY,
            },
        })
        .then((res) => console.log(res.data))
        .catch((err) => {
            console.error(err.response.status);
            console.error(err.response.data);
        });
};
const createOrder = async () => {
    const params = {
        symbol: "ETHBTC",
        side: "BUY",
        type: "MARKET",
        quantity: 1.0,
        timestamp: getTs(),
    };
    const data = {
        ...params,
        signature: sign(params),
    };
    axois
        .post(HOST + "/api/v3/order", null, {
            params: data,
            headers: {
                "X-MBX-APIKEY": API_KEY,
            },
        })
        .then((res) => console.log(res.data))
        .catch((err) => {
            console.error(err.response.status);
            console.error(err.response.data);
        });
};

(async () => {
    await createOrder();
})();