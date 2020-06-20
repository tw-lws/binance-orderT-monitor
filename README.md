## binance-ws

A websocket event listener(SPOT trading) for binance, will console.log any trade that duration is over `x` ms.

Feel free to edit the `x` or even the listener logic.

### Installation

```
npm install
or
yarn
```

### Arguments

- API_KEY
  - required, for listen auth
- SECRET_KEY
  - optional, for create/update/delete order, we could use this for testing
- DELAY
  - optional, `in ms`, DEFAULT will be `5000`

### Usage (development)

Startup, under development, will log any message received from ws

```
API_KEY=YOUR_KEY DELAY=5000 
 ** npm run start:dev **
2020-06-20 00:04:39.125 Connect to wss://testnet.binance.vision/ws/HuV4NHGxEUnHPnV3JR3g60rJMfltavweesGiYjHaWi2OOKinHHrcZfcnVi2p
2020-06-20 00:04:39.127 Wait for message...
2020-06-20 00:04:52.079 executionReport:TRADE delayed {
  orderId: 54,
  orderCreateTime: '2020-06-20 00:04:52.049',
  transactionTime: '2020-06-20 00:04:57.049',
  executionDuration: '7000ms',
  eventTime: '2020-06-20 00:04:52.051',
  orderStatus: 'FILLED',
  executionStatus: 'TRADE'
}
```

Test a trading event

```
API_KEY=YOUR_KEY SECRET_KEY=YOUR_SECRET npm run test-order
```

### Usage (production)

Startup, under production only log event detail when it excess `DELAY` time

```
API_KEY=YOUR_KEY DELAY=5000 
**npm run start:prod**
6/19/2020, 3:08:14 PM Connect to wss://stream.binance.com:9443/ws/HuV4NHGxEUnHPnV3JR3g60rJMfltavweesGiYjHaWi2OOKinHHrcZfcnVi2p
2020-06-20 00:04:39.127 Wait for message...
2020-06-20 00:04:52.079 executionReport:TRADE delayed {
  orderId: 54,
  orderCreateTime: '2020-06-20 00:04:52.049',
  transactionTime: '2020-06-20 00:04:57.049',
  executionDuration: '7000ms',
  eventTime: '2020-06-20 00:04:52.051',
  orderStatus: 'FILLED',
  executionStatus: 'TRADE'
}
```

Then test/listen your order event

### Requirements

```
Write a small app that can monitor the executionReport websocket message delay for X ms.
If you place an order to Binance exchange and the order is matched,
there will be a message with event type executionReport gives many details.
We want to have a small application that can alert us if the Event time is delivered delayed up to X ms.
```

```
- testnet[https://testnet.binance.vision/] has free funds to trade.
- X is confinable, so I can set to 5000ms or 10000ms, etc.
- Should not use any pre-build library related to Binance or other crypto exchanges
- Language is not limited, but please give details of how to run.
- UI is not required, running from terminal is enough.
```



### Implementation

- Generate listen key
- Listen on event `executionReport`
- If the `executionReport.O`(Order creation time) - `T` > `x` => console.log()
- Revoke token every `30min`

### Notes

The alert might be limited since you could set `receiveWindow` to be a timeout parameter
