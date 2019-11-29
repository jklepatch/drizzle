import React, { useState } from "react";
import PropTypes from "prop-types";
import { drizzleReactHooks } from "@drizzle/react-plugin";

const { useDrizzle } = drizzleReactHooks;

const translateType = type => {
  switch (true) {
    case /^uint/.test(type):
      return "number";
    case /^string/.test(type) || /^bytes/.test(type):
      return "text";
    case /^bool/.test(type):
      return "checkbox";
    default:
      return "text";
  }
};

function ContractForm(props) {
  const { drizzle } = useDrizzle();

  const contracts = drizzle.contracts;
  const utils = drizzle.web3.utils;

  // Get the contract ABI
  const abi = contracts[props.contract].abi;

  let inputs = [];
  let initialState = {};

  // Iterate over abi for correct function.
  for (var i = 0; i < abi.length; i++) {
    if (abi[i].name === props.method) {
      inputs = abi[i].inputs;

      for (var j = 0; j < inputs.length; j++) {
        initialState[inputs[j].name] = "";
      }

      break;
    }
  }

  const { formData, setFormData } = useState(initialState);

  const handleSubmit = event => {
    event.preventDefault();

    const convertedInputs = inputs.map(input => {
      if (input.type === "bytes32") {
        return utils.toHex(formData[input.name]);
      }
      return formData[input.name];
    });

    if (props.sendArgs) {
      return contracts[props.contract].methods[props.method].cacheSend(
        ...convertedInputs,
        props.sendArgs,
      );
    }

    return contracts[props.contract].methods[props.method].cacheSend(
      ...convertedInputs,
    );
  };

  const handleInputChange = event => {
    const value =
      event.target.type === "checkbox"
        ? event.target.checked
        : event.target.value;
    setFormData({ [event.target.name]: value });
  };

  if (props.render) {
    return props.render({
      inputs,
      inputTypes: inputs.map(input => translateType(input.type)),
      state: formData,
      handleInputChange: handleInputChange,
      handleSubmit: handleSubmit,
    });
  }

  return (
    <form className="pure-form pure-form-stacked" onSubmit={handleSubmit}>
      {inputs.map((input, index) => {
        var inputType = translateType(input.type);
        var inputLabel = props.labels ? props.labels[index] : input.name;
        // check if input type is struct and if so loop out struct fields as well
        return (
          <input
            key={input.name}
            type={inputType}
            name={input.name}
            value={formData[input.name]}
            placeholder={inputLabel}
            onChange={handleInputChange}
          />
        );
      })}
      <button
        key="submit"
        className="pure-button"
        type="button"
        onClick={handleSubmit}
      >
        Submit
      </button>
    </form>
  );
}

ContractForm.propTypes = {
  contract: PropTypes.string.isRequired,
  method: PropTypes.string.isRequired,
  sendArgs: PropTypes.object,
  labels: PropTypes.arrayOf(PropTypes.string),
  render: PropTypes.func,
};

export default ContractForm;
