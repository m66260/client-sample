import { useWalletClient } from "wagmi";
import useExchangeInfo from "../../hooks/useExchangeInfo";
import { selectedPoolSymbolAtom } from "../../store/blockchain.store";
import { useAtom } from "jotai";
import { useMemo } from "react";
import useTraderAPI from "../../hooks/useTraderAPI";
import { Box } from "@mui/material";

export function SelectPool() {
  const { data } = useWalletClient();
  const { traderAPI } = useTraderAPI(data?.chain.id);
  const { exchangeInfo, isLoading } = useExchangeInfo(data?.chain.id);
  const [selectedPoolSymbol, setSelectedPoolSymbol] = useAtom(
    selectedPoolSymbolAtom
  );

  const lotSize = useMemo(() => {
    const selectedPool = exchangeInfo?.pools.find(
      (pool) => pool.poolSymbol === selectedPoolSymbol
    );
    return selectedPool?.brokerCollateralLotSize;
  }, [selectedPoolSymbol, exchangeInfo]);

  const symbols = useMemo(() => {
    if (isLoading || !exchangeInfo || traderAPI?.chainId !== data?.chain.id) {
      return [];
    }
    return exchangeInfo.pools.map((pool) => pool.poolSymbol);
  }, [traderAPI, exchangeInfo, isLoading]);

  return (
    <Box>
      {isLoading && <div>Loading exchange information...</div>}
      {!!exchangeInfo && !isLoading && (
        <form>
          <label htmlFor="pools">Select Pool </label>
          <select
            id="pools"
            onChange={(e) => {
              setSelectedPoolSymbol(e.target.value);
            }}
            value={selectedPoolSymbol}
          >
            <option disabled value="">
              -
            </option>
            {symbols.map((poolSymbol) => (
              <option value={poolSymbol} key={poolSymbol}>
                {poolSymbol}
              </option>
            ))}
          </select>
          <div> Lot size: {lotSize ?? "-"} </div>
        </form>
      )}
    </Box>
  );
}
