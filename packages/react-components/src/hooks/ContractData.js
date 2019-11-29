import React from "react";
import PropTypes from "prop-types";
import { drizzleReactHooks } from "@drizzle/react-plugin";

const { useDrizzle, useDrizzleState } = drizzleReactHooks;

function ContractData(props) {
  const { drizzle } = useDrizzle();
  const drizzleState = useDrizzleState(state => state);

  // Fetch initial value from chain and return cache key for reactive updates.
  const methodArgs = props.methodArgs ? props.methodArgs : [];

  const contracts = drizzle.contracts;
  const contractState = {
    dataKey: contracts[props.contract].methods[props.method].cacheCall(
      ...methodArgs,
    ),
  };

  //const [contractState, setContractState] = useState(initialState);

  //Apparently this is not needed with React hooks?
  //https://medium.com/simars/react-hooks-manage-life-cycle-events-tricks-and-tips-7ed13f52ba12
  // TODO refactor this
  //UNSAFE_componentWillReceiveProps(nextProps) {
  //  const { methodArgs, contract, method } = this.props;

  //  const didContractChange = contract !== nextProps.contract;
  //  const didMethodChange = method !== nextProps.method;
  //  const didArgsChange =
  //    JSON.stringify(methodArgs) !== JSON.stringify(nextProps.methodArgs);

  //  if (didContractChange || didMethodChange || didArgsChange) {
  //    this.setState({
  //      dataKey: this.contracts[nextProps.contract].methods[
  //        nextProps.method
  //      ].cacheCall(...nextProps.methodArgs),
  //    });
  //  }
  //}

  // Contract is not yet intialized.
  if (!drizzleState.contracts[props.contract].initialized) {
    return <span>Initializing...</span>;
  }

  // If the cache key we received earlier isn't in the store yet; the initial value is still being fetched.
  if (
    !(
      contractState.dataKey in
      drizzleState.contracts[props.contract][props.method]
    )
  ) {
    return <span>Fetching...</span>;
  }

  // Show a loading spinner for future updates.
  let pendingSpinner = drizzleState.contracts[props.contract].synced
    ? ""
    : " 🔄";

  // Optionally hide loading spinner (EX: ERC20 token symbol).
  if (props.hideIndicator) {
    pendingSpinner = "";
  }

  let displayData =
    drizzleState.contracts[props.contract][props.method][contractState.dataKey]
      .value;

  // Optionally convert to UTF8
  if (props.toUtf8) {
    displayData = drizzle.web3.utils.hexToUtf8(displayData);
  }

  // Optionally convert to Ascii
  if (props.toAscii) {
    displayData = drizzle.web3.utils.hexToAscii(displayData);
  }

  // If a render prop is given, have displayData rendered from that component
  if (props.render) {
    return props.render(displayData);
  }

  // If return value is an array
  if (Array.isArray(displayData)) {
    const displayListItems = displayData.map((datum, index) => {
      return (
        <li key={index}>
          {`${datum}`}
          {pendingSpinner}
        </li>
      );
    });

    return <ul>{displayListItems}</ul>;
  }

  // If retun value is an object
  if (typeof displayData === "object") {
    let i = 0;
    const displayObjectProps = [];

    Object.keys(displayData).forEach(key => {
      if (i != key) {
        displayObjectProps.push(
          <li key={i}>
            <strong>{key}</strong>
            {pendingSpinner}
            <br />
            {`${displayData[key]}`}
          </li>,
        );
      }

      i++;
    });

    return <ul>{displayObjectProps}</ul>;
  }

  return (
    <span>
      {`${displayData}`}
      {pendingSpinner}
    </span>
  );
}

ContractData.propTypes = {
  contract: PropTypes.string.isRequired,
  method: PropTypes.string.isRequired,
  methodArgs: PropTypes.array,
  hideIndicator: PropTypes.bool,
  toUtf8: PropTypes.bool,
  toAscii: PropTypes.bool,
  render: PropTypes.func,
};

export default ContractData;
