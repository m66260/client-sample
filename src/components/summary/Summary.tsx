import { useWalletClient } from "wagmi";
import { selectedPoolSymbolAtom } from "../../store/blockchain.store";
import { useAtom } from "jotai";
import { memo, useEffect, useState } from "react";
import useBrokerTool from "../../hooks/useBrokerTool";
import { Box, Grid, Paper, styled } from "@mui/material";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

export const Summary = memo(() => {
  const { data } = useWalletClient();
  const { brokerTool, isLoading: isToolLoading } = useBrokerTool(
    data?.chain.id
  );
  const [selectedPoolSymbol] = useAtom(selectedPoolSymbolAtom);

  const [lotsPurchased, setLotsPurchased] = useState<number | undefined>(
    undefined
  );

  const [lotsFee, setLotsFee] = useState<number | undefined>(undefined);

  const [volumeUSD, setVolumeUSD] = useState<number | undefined>(undefined);
  const [volumeFee, setVolumeFee] = useState<number | undefined>(undefined);

  const [stakeFee, setStakeFee] = useState<number | undefined>(undefined);

  const [totalFee, setTotalFee] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!!brokerTool && !isToolLoading && selectedPoolSymbol !== "") {
      brokerTool
        .getBrokerDesignation(selectedPoolSymbol)
        .then((lots) => setLotsPurchased(lots));
      brokerTool
        .getFeeForBrokerDesignation(selectedPoolSymbol)
        .then((fee) => setLotsFee(fee));
      brokerTool.getFeeForBrokerStake().then((fee) => setStakeFee(fee));
      brokerTool
        .getFeeForBrokerVolume(selectedPoolSymbol)
        .then((fee) => setVolumeFee(fee));
      brokerTool
        .getCurrentBrokerVolume(selectedPoolSymbol)
        .then((vol) => setVolumeUSD(vol));
      brokerTool
        .getBrokerInducedFee(selectedPoolSymbol)
        .then((fee) => setTotalFee(fee));
    }
  }, [
    brokerTool,
    isToolLoading,
    selectedPoolSymbol,
    setLotsPurchased,
    setLotsFee,
    setVolumeFee,
    setVolumeUSD,
    setTotalFee,
  ]);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Item>Lots</Item>
        </Grid>
        <Grid item xs={3}>
          <Item>Owned</Item>
        </Grid>
        <Grid item xs={3}>
          <Item>{lotsPurchased}</Item>
        </Grid>
        <Grid item xs={3}>
          <Item>Induced Fee</Item>
        </Grid>
        <Grid item xs={3}>
          <Item>{lotsFee !== undefined ? lotsFee * 1e4 : "-"}</Item>
        </Grid>

        <Grid item xs={12}>
          <Item>D8X Coin</Item>
        </Grid>
        <Grid item xs={3}>
          <Item>Owned</Item>
        </Grid>
        <Grid item xs={3}>
          <Item>{"-"}</Item>
        </Grid>
        <Grid item xs={3}>
          <Item>Induced Fee</Item>
        </Grid>
        <Grid item xs={3}>
          <Item>{stakeFee !== undefined ? stakeFee * 1e4 : "-"}</Item>
        </Grid>

        <Grid item xs={12}>
          <Item>Volume</Item>
        </Grid>
        <Grid item xs={3}>
          <Item>Current</Item>
        </Grid>
        <Grid item xs={3}>
          <Item>{volumeUSD !== undefined ? volumeUSD / 1e6 : "-"}</Item>
        </Grid>
        <Grid item xs={3}>
          <Item>Induced Fee</Item>
        </Grid>
        <Grid item xs={3}>
          <Item>{volumeFee !== undefined ? volumeFee * 1e4 : "-"}</Item>
        </Grid>

        <Grid item xs={6}>
          <Item>Final Fee</Item>
        </Grid>
        <Grid item xs={6}>
          <Item>{totalFee !== undefined ? totalFee * 1e4 : "-"}</Item>
        </Grid>
      </Grid>
    </Box>
  );

  // return (
  //   <Box>
  //     <Typography> Lots Owned: {lotsPurchased} </Typography>
  //     <Typography>
  //       {" "}
  //       Current volume: {volumeUSD !== undefined ? volumeUSD / 1e6 : "-"} mmUSD
  //     </Typography>
  //     <Typography>
  //       {" "}
  //       Lots induced fee: {lotsFeeTbps !== undefined
  //         ? lotsFeeTbps * 1e4
  //         : "-"}{" "}
  //       bps
  //     </Typography>
  //     <Typography>
  //       {" "}
  //       Volume induced fee:{" "}
  //       {volumeFeeTbps !== undefined ? volumeFeeTbps * 1e4 : "-"} bps{" "}
  //     </Typography>
  //     <Typography>
  //       {" "}
  //       Stake induced fee:{" "}
  //       {stakeFeeTbps !== undefined ? stakeFeeTbps * 1e4 : "-"} bps{" "}
  //     </Typography>
  //     <Typography>
  //       {" "}
  //       Final fee: {totalFeeTbps !== undefined
  //         ? totalFeeTbps * 1e4
  //         : "-"} bps{" "}
  //     </Typography>
  //   </Box>
  // );
});
