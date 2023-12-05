import { useEffect, useState } from "react";
import useTraderAPI from "./useTraderAPI";
import {
  LimitOrderBook,
  ORDER_TYPE_LIMIT,
  ORDER_TYPE_MARKET,
  ORDER_TYPE_STOP_LIMIT,
  ORDER_TYPE_STOP_MARKET,
  TraderInterface,
  ZERO_ORDER_ID,
} from "@d8x/perpetuals-sdk";
import { OrderBook, OrderI } from "../types/types";
import { flagToOrderType } from "../helpers/flagToOrderType";
import { BigNumber } from "@ethersproject/bignumber";

const MAX_ORDERS_POLLED = 100;

const useOrderBook = (config: {
  chainId: number;
  symbol: string | undefined;
}) => {
  const { traderAPI, isLoading: isAPILoading } = useTraderAPI(config.chainId);

  const [isLoading, setLoading] = useState(false);
  const [orderBook, setOrderBook] = useState<OrderBook>();

  const fetchOrders = async (
    _traderAPI: TraderInterface,
    _orderBook: LimitOrderBook
  ) => {
    let doFetch = true;
    let startAt = ZERO_ORDER_ID;
    let res: OrderI[] = [];
    while (doFetch) {
      await _orderBook
        .pollLimitOrders(startAt, MAX_ORDERS_POLLED)
        .then(({ orders, orderHashes }) => {
          orders.map((order, idx) => {
            if (orderHashes[idx] !== ZERO_ORDER_ID) {
              res.push({ ...order, id: orderHashes[idx] });
            }
          });
        });
      startAt = res[res.length - 1].id;
      doFetch = res.length === MAX_ORDERS_POLLED && startAt !== ZERO_ORDER_ID;
    }
    return res;
  };

  useEffect(() => {
    if (config.symbol === undefined) {
      return;
    }

    if (!traderAPI || isAPILoading) {
      setLoading(isAPILoading);
      return;
    }
    setLoading(true);
    const symbol = config.symbol;
    fetchOrders(traderAPI, traderAPI.getOrderBookContract(symbol))
      .then((d) => {
        const buys = d.filter((order) => BigNumber.from(order.fAmount).gt(0));
        const sells = d.filter((order) => BigNumber.from(order.fAmount).lt(0));
        setOrderBook({
          symbol: symbol,
          buy: {
            market: buys.filter(
              (order) =>
                flagToOrderType(order.flags, order.fLimitPrice) ===
                ORDER_TYPE_MARKET
            ),
            limit: buys.filter(
              (order) =>
                flagToOrderType(order.flags, order.fLimitPrice) ===
                ORDER_TYPE_LIMIT
            ),
            stopMarket: buys.filter(
              (order) =>
                flagToOrderType(order.flags, order.fLimitPrice) ===
                ORDER_TYPE_STOP_MARKET
            ),
            stopLimit: buys.filter(
              (order) =>
                flagToOrderType(order.flags, order.fLimitPrice) ===
                ORDER_TYPE_STOP_LIMIT
            ),
          },
          sell: {
            market: sells.filter(
              (order) =>
                flagToOrderType(order.flags, order.fLimitPrice) ===
                ORDER_TYPE_MARKET
            ),
            limit: sells.filter(
              (order) =>
                flagToOrderType(order.flags, order.fLimitPrice) ===
                ORDER_TYPE_LIMIT
            ),
            stopMarket: sells.filter(
              (order) =>
                flagToOrderType(order.flags, order.fLimitPrice) ===
                ORDER_TYPE_STOP_MARKET
            ),
            stopLimit: sells.filter(
              (order) =>
                flagToOrderType(order.flags, order.fLimitPrice) ===
                ORDER_TYPE_STOP_LIMIT
            ),
          },
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [traderAPI, isAPILoading, setOrderBook, setLoading]);

  return { orderBook, isLoading };
};

export default useOrderBook;
