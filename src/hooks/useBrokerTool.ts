import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { brokerToolAtom, traderAPIAtom } from "../store/sdk.store";
import {
  BrokerTool,
  PerpetualDataHandler,
  TraderInterface,
} from "@d8x/perpetuals-sdk";
import { useEthersSigner } from "./useEthersSigner";

const useBrokerTool = (chainId: number | undefined) => {
  const [brokerTool, setBrokertool] = useAtom(brokerToolAtom);
  const [isLoading, setLoading] = useState(false);
  const signer = useEthersSigner({ chainId });

  useEffect(() => {
    if (
      !signer ||
      chainId === undefined ||
      (!!brokerTool && brokerTool.chainId === chainId)
    ) {
      return;
    }
    setLoading(true);
    const obj = new BrokerTool(
      PerpetualDataHandler.readSDKConfig(chainId),
      signer
    );
    obj
      .createProxyInstance()
      .then(() => setBrokertool(obj))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [brokerTool, setBrokertool, setLoading]);
  return { brokerTool: brokerTool, isLoading: isLoading };
};

export default useBrokerTool;
