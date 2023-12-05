import {
  useContractWrite,
  useWaitForTransaction,
  useWalletClient,
} from "wagmi";

import { PROXY_ABI } from "@d8x/perpetuals-sdk";
import { useAtomValue } from "jotai";
import { useMemo, useState } from "react";
import useExchangeInfo from "../../hooks/useExchangeInfo";
import useTraderAPI from "../../hooks/useTraderAPI";
import { selectedPoolSymbolAtom } from "../../store/blockchain.store";
import { Box } from "@mui/material";

export function DepositLots() {
  const { data: wallet } = useWalletClient();
  const { traderAPI, isLoading: isTraderAPILoading } = useTraderAPI(
    wallet?.chain.id
  );
  const { exchangeInfo } = useExchangeInfo(wallet?.chain.id);

  const selectedPoolSymbol = useAtomValue(selectedPoolSymbolAtom);

  const [depositAmount, setDepositAmount] = useState("");

  const poolId = useMemo(() => {
    if (!traderAPI || isTraderAPILoading || selectedPoolSymbol === "") {
      return 0;
    }
    return traderAPI.getPoolIdFromSymbol(selectedPoolSymbol) ?? 0;
  }, [traderAPI, selectedPoolSymbol]);

  const { data, write } = useContractWrite({
    address: exchangeInfo?.proxyAddr as `0x${string}` | undefined,
    abi: [...PROXY_ABI],
    functionName: "depositBrokerLots",
    chainId: wallet?.chain.id,
    args: [poolId, +depositAmount],
    enabled: !!traderAPI && Boolean(depositAmount),
    gas: BigInt(1_000_000),
  });

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  return (
    <Box>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          write?.();
        }}
      >
        <label htmlFor="depositLotsId">Lots </label>
        <input
          id="depositLotsId"
          onChange={(e) => setDepositAmount(e.target.value)}
          value={depositAmount}
        />
        <button disabled={!write || isLoading}>
          {" "}
          {isLoading ? "Confirming..." : "Deposit"}
        </button>
        {isSuccess && (
          <div>
            Successfully added lots
            <div>{data?.hash}</div>
          </div>
        )}
      </form>
    </Box>
  );
}
