import { useWalletClient } from "wagmi";
import useExchangeInfo from "../../hooks/useExchangeInfo";
import { selectedPoolSymbolAtom } from "../../store/blockchain.store";
import { useAtom } from "jotai";
import { useEffect, useMemo, useState } from "react";
import useTraderAPI from "../../hooks/useTraderAPI";
import useBrokerTool from "../../hooks/useBrokerTool";
import { Box, Typography } from "@mui/material";

export function Summary() {
  const { data } = useWalletClient();
  const { brokerTool, isLoading: isToolLoading } = useBrokerTool(
    data?.chain.id
  );
  const { exchangeInfo, isLoading } = useExchangeInfo(data?.chain.id);
  const [selectedPoolSymbol, setSelectedPoolSymbol] = useAtom(
    selectedPoolSymbolAtom
  );

  const [lotsPurchased, setLotsPurchased] = useState<number | undefined>(
    undefined
  );

  const [lotsFeeTbps, setLotsFeeTbps] = useState<number | undefined>(undefined);

  const [volumeUSD, setVolumeUSD] = useState<number | undefined>(undefined);
  const [volumeFeeTbps, setVolumeFeeTbps] = useState<number | undefined>(
    undefined
  );

  const [stakeFeeTbps, setStakeFeeTbps] = useState<number | undefined>(
    undefined
  );

  const [totalFeeTbps, setTotalFeeTbps] = useState<number | undefined>(
    undefined
  );

  useEffect(() => {
    if (!!brokerTool && !isToolLoading && selectedPoolSymbol !== "") {
      brokerTool
        .getBrokerDesignation(selectedPoolSymbol)
        .then((lots) => setLotsPurchased(lots));
      brokerTool
        .getFeeForBrokerDesignation(selectedPoolSymbol)
        .then((fee) => setLotsFeeTbps(fee));
      brokerTool
        .getFeeForBrokerStake(selectedPoolSymbol)
        .then((fee) => setStakeFeeTbps(fee));
      brokerTool
        .getFeeForBrokerVolume(selectedPoolSymbol)
        .then((fee) => setVolumeFeeTbps(fee));
      brokerTool
        .getCurrentBrokerVolume(selectedPoolSymbol)
        .then((vol) => setVolumeUSD(vol));
      brokerTool
        .getBrokerInducedFee(selectedPoolSymbol)
        .then((fee) => setTotalFeeTbps(fee));
    }
  }, [
    brokerTool,
    isToolLoading,
    selectedPoolSymbol,
    selectedPoolSymbol,
    setLotsPurchased,
    setLotsFeeTbps,
    setVolumeFeeTbps,
    setVolumeUSD,
    setTotalFeeTbps,
  ]);

  return (
    <Box>
      {
        <>
          <Typography> Lots Owned: {lotsPurchased} </Typography>
          <Typography>
            {" "}
            Current volume: {volumeUSD !== undefined
              ? volumeUSD / 1e6
              : "-"}{" "}
            mmUSD
          </Typography>
          <Typography>
            {" "}
            Lots induced fee:{" "}
            {lotsFeeTbps !== undefined ? lotsFeeTbps * 1e4 : "-"} bps
          </Typography>
          <Typography>
            {" "}
            Volume induced fee:{" "}
            {volumeFeeTbps !== undefined ? volumeFeeTbps * 1e4 : "-"} bps{" "}
          </Typography>
          <Typography>
            {" "}
            Stake induced fee:{" "}
            {stakeFeeTbps !== undefined ? stakeFeeTbps * 1e4 : "-"} bps{" "}
          </Typography>
        </>
      }
    </Box>
  );
}
