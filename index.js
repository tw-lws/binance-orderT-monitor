const WebSocket = require("ws");
const axois = require("axios").default;

/** Prepare env/parameters */
const isProd = process.env.NODE_ENV === "production";
const isDev = !isProd;
/** Host setting is available in https://testnet.binance.vision at FAQ section */
const API_HOST = isProd
  ? "https://api.binance.com"
  : "https://testnet.binance.vision";
const WS_HOST = isProd
  ? "wss://stream.binance.com:9443"
  : "wss://testnet.binance.vision";

 // replace your apikey here
const API_KEY = '';
const DELAY_TIME = process.env.DELAY || 5000; // Default will be 5000ms
if (!API_KEY) {
  throw new Error("Please input a API_KEY");
}

/**
 * Helper function to get local time string
 *
 * @param {Date} [date]
 */
const getGMT8Time = (date) => {
  const now = date || new Date();
  now.setHours(now.getHours() + 8); // to GMT+8
  return now.toISOString().replace("T", " ").replace("Z", "");
};

/**
 * Get UserDataStreamKey in order to listen on ws
 */
const getUserDataStreamKey = async () => {
  return axois
    .post(API_HOST + "/api/v3/userDataStream", null, {
      headers: {
        "X-MBX-APIKEY": API_KEY,
      },
    })
    .then((res) => res.data.listenKey)
    .catch((err) => {
      console.error(err.response.status);
      console.error(err.response.data);
    });
};
const pingUserDataStreamKey = async (key) => {
  console.log(getGMT8Time(), "Ping UserDataStreamKey");
  return axois
    .put(API_HOST + "/api/v3/userDataStream", null, {
      params: {
        listenKey: key,
      },
      headers: {
        "X-MBX-APIKEY": API_KEY,
      },
    })
    .then((res) => res.data.listenKey)
    .catch((err) => {
      console.error(err.response.status);
      console.error(err.response.data);
    });
};

/**
 * Listen ws events
 *
 * @param {string} key
 */
const listen = (key) => {
  const url = WS_HOST + "/ws/" + key;
  const ws = new WebSocket(url);
  ws.on("open", function open() {
    console.log(getGMT8Time(), "Connect to", url);
    console.log(getGMT8Time(), "Wait for message...");
  });
  ws.on("message", function incoming(data) {
    const payload = JSON.parse(data.toString());
    if (payload.e === "executionReport") {
      // Catch the executionReport event
      const {
        O: orderCreateTime,
        T: transactionTime,
        E: eventTime,
        i: orderId,
        X: orderStatus,
        x: executionStatus,
      } = payload;
      // All status is available in https://binance-docs.github.io/apidocs/spot/en/#payload-order-update
      if (executionStatus === "TRADE") {
        const executionDuration = transactionTime - orderCreateTime;
        if (executionDuration > DELAY_TIME) {
          console.log(getGMT8Time(), "executionReport:TRADE delayed", {
            orderId,
            orderCreateTime: getGMT8Time(new Date(orderCreateTime)),
            transactionTime: getGMT8Time(new Date(transactionTime)),
            executionDuration: executionDuration + "ms",
            eventTime: getGMT8Time(new Date(eventTime)),
            orderStatus,
            executionStatus,
          });
        }
      }
      // Debug
      const executionDuration = transactionTime - orderCreateTime;
      isDev &&
        console.log(getGMT8Time(), "executionReport", {
          orderId,
          orderCreateTime: getGMT8Time(new Date(orderCreateTime)),
          transactionTime: getGMT8Time(new Date(transactionTime)),
          executionDuration: executionDuration + "ms",
          eventTime: getGMT8Time(new Date(eventTime)),
          orderStatus,
          executionStatus,
        });
    }

    // Debug any payload
    isDev && console.log(getGMT8Time(), "message", data);
    console.log("");
  });
};

/** Main */
getUserDataStreamKey().then((key) => {
  // Listen ws event
  listen(key);
  // Setup Ping/Keep-alive a ListenKey every 30
  setInterval(() => pingUserDataStreamKey(key), 30 * 60 * 1000);
});
