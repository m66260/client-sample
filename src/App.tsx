import { ConnectButton } from "@rainbow-me/rainbowkit";
import { SelectPool } from "./components/SelectPool/SelectPool";
import { DepositLots } from "./components/DepositLots/DepositLots";
import { Summary } from "./components/Summary/Summary";

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
