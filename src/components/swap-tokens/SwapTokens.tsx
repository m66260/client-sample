import {
  useBalance,
  useContractRead,
  useContractWrite,
  useWaitForTransaction,
  useWalletClient,
} from "wagmi";

import { useAtomValue } from "jotai";
import { useCallback, useMemo, useRef, useState } from "react";
import useTraderAPI from "../../hooks/useTraderAPI";
import { selectedPoolSymbolAtom } from "../../store/blockchain.store";
import { Box, Button, Grid, Paper, styled } from "@mui/material";
import { ResponsiveInput } from "../responsive-input/ResponsiveInput";
import { SWAP_ABI, TOKEN_SWAPS } from "../utils/constants";
import { formatUnits, parseUnits } from "viem";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

export function SwapTokens() {
  const { data: wallet } = useWalletClient();
  const { traderAPI, isLoading: isTraderAPILoading } = useTraderAPI(
    wallet?.chain.id
  );
  const { data: nativeToken } = useBalance({
    address: wallet?.account.address,
  });

  const selectedPoolSymbol = useAtomValue(selectedPoolSymbolAtom);

  const [depositAmount, setDepositAmount] = useState(0);
  const [inputValue, setInputValue] = useState(`${depositAmount}`);

  const inputValueChangedRef = useRef(false);

  const handleInputCapture = useCallback((orderSizeValue: string) => {
    if (orderSizeValue) {
      setDepositAmount(+orderSizeValue);
      setInputValue(orderSizeValue);
    } else {
      setDepositAmount(0);
      setInputValue("");
    }
    inputValueChangedRef.current = true;
  }, []);

  const poolId = useMemo(() => {
    if (
      !traderAPI ||
      isTraderAPILoading ||
      selectedPoolSymbol === "" ||
      traderAPI.chainId !== wallet?.chain.id
    ) {
      return 0;
    }
    let id: number | undefined = undefined;
    try {
      id = traderAPI.getPoolIdFromSymbol(selectedPoolSymbol);
    } catch (e) {
      console.error(e);
    }
    return id;
  }, [traderAPI, wallet?.chain.id, isTraderAPILoading, selectedPoolSymbol]);

  const marginTokenDecimals = useMemo(() => {
    if (
      !traderAPI ||
      isTraderAPILoading ||
      selectedPoolSymbol === "" ||
      traderAPI.chainId !== wallet?.chain.id
    ) {
      return undefined;
    }
    let decimals: number | undefined = undefined;
    try {
      traderAPI.getPoolStaticInfoIndexFromSymbol(selectedPoolSymbol);
      decimals = traderAPI.getMarginTokenDecimalsFromSymbol(selectedPoolSymbol);
    } catch (e) {
      console.error(e);
    }
    return decimals;
  }, [traderAPI, wallet?.chain.id, isTraderAPILoading, selectedPoolSymbol]);

  const swapAddress = useMemo(() => {
    return TOKEN_SWAPS.find(
      (config) => config.chainId === wallet?.chain.id
    )?.pools.find((pool) => pool.id === poolId)?.marginTokenSwap;
  }, [wallet, poolId]);

  const { data: conversionFactor } = useContractRead({
    address: swapAddress as `0x${string}` | undefined,
    abi: [...SWAP_ABI],
    chainId: wallet?.chain.id,
    functionName: "d18MaticToMockConversion",
  });

  const depositAmountUnits = useMemo(() => {
    return nativeToken && +inputValue > 1e-7
      ? parseUnits(inputValue, nativeToken.decimals)
      : undefined;
  }, [inputValue, nativeToken]);

  const tokenAmount = useMemo(() => {
    return marginTokenDecimals && conversionFactor && depositAmountUnits
      ? formatUnits(
          (conversionFactor * depositAmountUnits) / 10n ** 18n,
          marginTokenDecimals
        )
      : undefined;
  }, [marginTokenDecimals, conversionFactor, depositAmountUnits]);

  const { data: swapTxn, write } = useContractWrite({
    address: swapAddress as `0x${string}` | undefined,
    abi: SWAP_ABI,
    functionName: "swapToMockToken",
    chainId: wallet?.chain.id,
    gas: BigInt(1_000_000),
    value: depositAmountUnits,
  });

  useWaitForTransaction({
    hash: swapTxn?.hash,
    onSettled: () => {
      console.log("txn", swapTxn?.hash);
    },
  });

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={0} marginTop={2}>
        <Grid item xs={3} marginTop={1} marginInline={1}>
          <Item variant="outlined">
            <Button
              onClick={() => {
                write?.();
              }}
              disabled={depositAmount <= 0}
            >
              Swap
            </Button>
          </Item>
        </Grid>
        <Grid item xs={3}>
          <Item elevation={0}>
            <ResponsiveInput
              id="native-amount"
              inputValue={inputValue}
              setInputValue={handleInputCapture}
              currency={nativeToken?.symbol}
              step={"0.000001"}
              // min={0}
              max={nativeToken ? +nativeToken.formatted : 0}
            />
          </Item>
        </Grid>
        <Grid item xs={5}>
          <Item elevation={0}>
            <ResponsiveInput
              id="token-amount"
              inputValue={tokenAmount ?? "-"}
              disabled={true}
              setInputValue={() => ({})}
              currency={selectedPoolSymbol}
              // step="1"
              // min={0}
              // max={poolTokenBalance || 999999}
            />
          </Item>
        </Grid>
      </Grid>
    </Box>
  );
}
