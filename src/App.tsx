import { ConnectButton } from "@rainbow-me/rainbowkit";
import { SelectPool } from "./components/select-pool/SelectPool";
import { DepositLots } from "./components/deposit-lots/DepositLots";
import { Summary } from "./components/summary/Summary";

function App() {
  return (
    <div>
      <ConnectButton />
      <SelectPool />
      <Summary />
      <DepositLots />
    </div>
  );
}

export default App;
