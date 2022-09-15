import { useState, useEffect } from "react";
import "./App.css";
import Web3 from "web3";
import detectEthereumProvider from "@metamask/detect-provider";
import { loadContract } from "./utils/load-contract";

function App() {
  const [web3Api, setWeb3Api] = useState({
    web3: null,
    provider: null,
    contract: null,
  });

  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);

  const [reload, setReload] = useState(false);
  const [isProviderLoading, setIsProviderLoading] = useState(false);

  const reloadPage = () => {
    setReload(!reload);
  };

  const setAccountListener = (provider) => {
    provider.on("accountsChanged", () => window.location.reload());
    provider.on("chainChanged", () => window.location.reload());
  };

  useEffect(() => {
    const detectProvider = async () => {
      const provider = await detectEthereumProvider();
      setIsProviderLoading(true);

      if (provider) {
        const contract = await loadContract("Faucet", provider);
        setAccountListener(provider);
        setWeb3Api({
          web3: new Web3(provider),
          provider,
          contract,
        });
        setIsProviderLoading(false);
      } else {
        setIsProviderLoading(false);
        console.error("Please install Metamask!");
      }
    };

    detectProvider();
  }, []);

  useEffect(() => {
    const getAccount = async () => {
      const { web3 } = web3Api;
      const accounts = await web3.eth.getAccounts();

      setAccount(accounts[0]);
    };

    web3Api.web3 && getAccount();
  }, [web3Api]);

  useEffect(() => {
    const loadBalance = async () => {
      const { web3, contract } = web3Api;

      const balance = await web3.eth.getBalance(contract.address);
      const balanceInEth = web3.utils.fromWei(balance, "ether");

      setBalance(balanceInEth);
    };

    web3Api.contract && loadBalance();
  }, [web3Api, reload]);

  const addFunds = async () => {
    const { contract, web3 } = web3Api;

    await contract.addFunds({
      from: account,
      value: web3.utils.toWei("1", "ether"),
    });

    reloadPage();
  };

  const withdraw = async () => {
    const { contract, web3 } = web3Api;

    await contract.withdraw(web3.utils.toWei("0.1", "ether"), {
      from: account,
    });

    reloadPage();
  };

  return (
    <div className="faucet-wrapper">
      <div className="faucet">
        <div className="is-flex is-align-items-center">
          <span className="mr-2">
            <strong>Account: </strong>
          </span>
          {account ? (
            <span>{account}</span>
          ) : !web3Api.provider && !isProviderLoading ? (
            <div className="notification is-warning p-3">
              Wallet is not connected, please {` `}
              <a
                target="_blank"
                href="https://metamask.io/download/"
                rel="noreferrer"
              >
                install Metamask!
              </a>
            </div>
          ) : isProviderLoading ? (
            <i>Loading provider...</i>
          ) : (
            <button
              className="button is-small"
              onClick={() => {
                web3Api.provider.request({ method: "eth_requestAccounts" });
              }}
            >
              Connect Wallet
            </button>
          )}
        </div>

        <div className="is-size-2 my-3">
          Current balance: <strong>{account ? balance : ""} ETH</strong>
        </div>
        <div className="faucet-actions">
          <button
            className="button is-info mr-3"
            onClick={addFunds}
            disabled={!account}
          >
            Donate 1 eth
          </button>
          <button
            className="button is-primary"
            onClick={withdraw}
            disabled={!account}
          >
            Withdraw 0.1 eth
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
