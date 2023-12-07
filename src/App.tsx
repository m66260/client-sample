import { SelectPool } from "./components/select-pool/SelectPool";
import { SwapTokens } from "./components/swap-tokens/SwapTokens";
// import { Summary } from "./components/summary/Summary";
import { Box, Paper } from "@mui/material";
import { Connect } from "./components/connect-wallet/Connect";

function App() {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
    >
      <Paper elevation={3}>
        <Connect />
        <Paper elevation={3}>
          <SelectPool />
          {/* <Summary /> */}
          <SwapTokens />
        </Paper>
      </Paper>
    </Box>
  );
}

export default App;
