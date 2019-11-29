import React, { Children } from "react";
import PropTypes from "prop-types";
import { drizzleReactHooks } from "@drizzle/react-plugin";

const { useDrizzle, useDrizzleState } = drizzleReactHooks;

/*
 * Create component.
 */

function LoadingContainer({ children, loadingComp, errorComp }) {
  const { web3 } = useDrizzle();
  const { accounts, drizzleStatus } = useDrizzleState(state => ({
    accounts: state.accounts,
    drizzleStatus: state.drizzleStatus,
  }));
  if (web3.status === "failed") {
    if (errorComp) {
      return errorComp;
    }

    return (
      <main className="container loading-screen">
        <div className="pure-g">
          <div className="pure-u-1-1">
            <h1>⚠️</h1>
            <p>
              This browser has no connection to the Ethereum network. Please use
              the Chrome/FireFox extension MetaMask, or dedicated Ethereum
              browsers Mist or Parity.
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (web3.status === "initialized" && Object.keys(accounts).length === 0) {
    return (
      <main className="container loading-screen">
        <div className="pure-g">
          <div className="pure-u-1-1">
            <h1>🦊</h1>
            <p>
              <strong>{"We can't find any Ethereum accounts!"}</strong> Please
              check and make sure Metamask or your browser are pointed at the
              correct network and your account is unlocked.
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (drizzleStatus.initialized) {
    return Children.only(children);
  }

  if (loadingComp) {
    return loadingComp;
  }

  return (
    <main className="container loading-screen">
      <div className="pure-g">
        <div className="pure-u-1-1">
          <h1>⚙️</h1>
          <p>Loading dapp...</p>
        </div>
      </div>
    </main>
  );
}

LoadingContainer.propTypes = {
  children: PropTypes.node,
  loadingComp: PropTypes.node,
  errorComp: PropTypes.node,
};

export default LoadingContainer;
