import { Button } from "@mui/material";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import styles from "./Connect.module.scss";
import classnames from "classnames";
import { memo } from "react";

interface WalletConnectButtonPropsI {
  buttonClassName?: string;
}

const Connect = memo(
  ({ buttonClassName }: WalletConnectButtonPropsI) => {
    return (
      <ConnectButton.Custom>
        {({
          account,
          chain,
          openAccountModal,
          openChainModal,
          openConnectModal,
          mounted,
        }) => {
          const connected = mounted && account && chain;

          return (
            <div
              {...(!mounted && {
                "aria-hidden": true,
                className: styles.root,
              })}
            >
              {(() => {
                if (!connected) {
                  return (
                    <Button
                      onClick={openConnectModal}
                      variant="primary"
                      className={classnames(
                        styles.connectWalletButton,
                        buttonClassName
                      )}
                    >
                      {<span className={styles.cutAddressName}>Connect</span>}
                    </Button>
                  );
                }

                if (chain.unsupported) {
                  return (
                    <Button onClick={openChainModal} variant="warning">
                      Wrong Network
                    </Button>
                  );
                }

                return (
                  <div className={styles.buttonsHolder}>
                    <Button
                      onClick={openAccountModal}
                      variant="primary"
                      className={styles.addressButton}
                    >
                      <span className={styles.cutAddressName}>
                        {account.address}
                      </span>
                    </Button>
                  </div>
                );
              })()}
            </div>
          );
        }}
      </ConnectButton.Custom>
    );
  }
);

export default Connect;
