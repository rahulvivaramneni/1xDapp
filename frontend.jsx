// import React from 'react';

// function YourComponent() {
const state = {
  title: "",
  description: "",
  image: { cid: "" },
  sender: "",
  selectedChain: "0", // Default selected chain
};

let displayCode = 1; // Variable to determine which code to display (1 for the first code, 2 for the second code)

const toggleCode = (codeNumber) => {
  displayCode = codeNumber;
  renderComponent();
};

const auroraCOntract = "0xe53bC42B6b25a1d548B73636777a0599Fd27fE5c";
const polygonContract = "0x436AEceaEeC57b38a17Ebe71154832fB0fAFF878";
const celoContract = "0xC291846A587cf00a7CC4AF0bc4EEdbC9c3340C36";
const avaxContract = "0x43dBdfcAADD0Ea7aD037e8d35FDD7c353B5B435b";
const arbitrumContract = "0x959a2945185Ec975561Ac0d0b23F03Ed1b267925";
const nearContract = "genadrop.nftgen.near";
const mintSingle = [
  "function mint(address to, uint256 id, uint256 amount, string memory uri, bytes memory data) public {}",
];
let accountId = context.accountId;
const contractAddresses = {
  137: [polygonContract, "Polygon"],
  1313161554: [auroraCOntract, "Aurora"],
  42220: [celoContract, "Celo"],
  43114: [avaxContract, "Avalanche"],
  42161: [arbitrumContract, "Arbitrum"],
  0: [nearContract, "Near"],
};
const chains = [
  {
    id: "137",
    name: "Polygon",
  },
  {
    id: "1313161554",
    name: "Aurora",
  },
  {
    id: "42220",
    name: "Celo",
  },
  {
    id: "43114",
    name: "Avax",
  },
  {
    id: "42161",
    name: "Arbitrum",
  },
  {
    id: "0",
    name: "Near",
  },
];

const handleMint = () => {
  console.log("it's here", state.title && state.description && state.image.cid);
  if (!(state.title && state.description && state.image.cid)) {
    return;
  }
  if (state.selectedChain == "0") {
    const gas = 200000000000000;
    const deposit = 10000000000000000000000;
    const metadata = {
      name: state.title,
      description: state.description,
      properties: [],
      image: `ipfs://${state.image.cid}`,
    };
    asyncFetch("https://ipfs.near.social/add", {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: metadata,
    }).then((res) => {
      const cid = res.body.cid;
      const Id = Math.floor(Math.random() * (9999999 - 100000 + 1) + 100000);
      console.log("in the promise", res, Id);
      Near.call([
        {
          contractName: "genadrop-contract.nftgen.near",
          methodName: "nft_mint",
          args: {
            token_id: `${Date.now()}`,
            metadata: {
              title: state.title,
              description: state.description,
              media: `https://ipfs.io/ipfs/${state.image.cid}`,
              reference: `ipfs://${cid}`,
            },
            receiver_id: accountId,
          },
          gas: gas,
          deposit: deposit,
        },
      ]);
    });
    return;
  }
  console.log("passed checks");
  let networkId = Ethers.provider()._network.chainId;

  const CA = contractAddresses[state.selectedChain[0] || "137"];

  const contract = new ethers.Contract(
    CA,
    mintSingle,
    Ethers.provider().getSigner()
  );
  const metadata = {
    name: state.title,
    description: state.description,
    properties: [],
    image: `ipfs://${state.image.cid}`,
  };
  asyncFetch("https://ipfs.near.social/add", {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
    body: metadata,
  }).then((res) => {
    const cid = res.body.cid;
    const Id = Math.floor(Math.random() * (9999999 - 100000 + 1) + 100000);
    console.log("in the promise", res, Id);
    contract
      .mint(state.sender, Id, 1, `ipfs://${cid}`, "0x")
      .then((transactionHash) => transactionHash.wait())
      .then((ricit) => {
        console.log("receipt::", ricit);
      });
  });
};
if (state.sender === undefined) {
  const accounts = Ethers.send("eth_requestAccounts", []);
  console.log("accounts:", accounts, Ethers.provider(), ethers);
  if (accounts.length) {
    State.update({ sender: accounts[0] });
    Ethers.provider()
      .getNetwork()
      .then((data) => {
        State.update({
          selectedChain: data.chainId,
        });
      });
  }

  if (accountId) {
    State.update({ sender: accountId });
    State.update({
      selectedChain: "0",
    });
  }
}
State.init({
  title: "",
  description: "",
});
const onChangeTitle = (title) => {
  State.update({
    title,
  });
};

const handleChainChange = (event) => {
  console.log(
    "get what we doing:",
    event.target.value,
    event.target.value == "0",
    !accountId
  );
  if (event.target.value == "0") {
    if (!accountId) {
      console.log("not what we thought,:", accountId);
      return;
    }
    State.update({
      selectedChain: event.target.value,
    });
  }
  Ethers.send("wallet_switchEthereumChain", [
    {
      chainId: "0x" + Number(event.target.value).toString(16),
    },
  ]).then((data) => console.log("done!!!", data));
  console.log("what happens after");
  State.update({
    selectedChain: event.target.value,
  });
  console.log("afters", state.selectedChain);
};

const onChangeDesc = (description) => {
  console.log("Log ciritcal critics:", state.selectedChain, state.title);
  State.update({
    description,
  });
};
// if (state.sender === undefined) {
//   console.log("of course it's undefined", ethers);
//   const accounts = Ethers.send("eth_requestAccounts", []);
//   console.log("account", accounts);
//   if (accounts.length) {
//     State.update({ sender: accounts[0] });
//     console.log("set sender", accounts[0]);
//   }
// }

const sender = Ethers.send("eth_requestAccounts", [])[0];

if (!sender) return <Web3Connect connectLabel="Connect with Web3" />;

const erc20Abi = fetch(
  "https://gist.githubusercontent.com/veox/8800debbf56e24718f9f483e1e40c35c/raw/f853187315486225002ba56e5283c1dba0556e6f/erc20.abi.json"
);
if (!erc20Abi.ok) {
  return "scam";
}

const iface = new ethers.utils.Interface(erc20Abi.body);

initState({
  token: "",
  tokenDecimals: "",
  sendTo: "",
  sender,
  senderBalance: "0",
  receiverBalance: "0",
  receiver: "",
  amount: "1",
});

const tokens = {
  "Select Token": "",
  USDT: "0xdac17f958d2ee523a2206206994597c13d831ec7",
  DAI: "0x6b175474e89094c44da98b954eedeac495271d0f",
  USDC: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  MKR: "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2",
};

const tokensMenuItems = Object.keys(tokens).map((token) => (
  <option value={tokens[token]}>{token}</option>
));

const setSendTo = (sendTo) => {
  const receiver = Ethers.resolveName(sendTo);
  State.update({ sendTo, receiver: receiver ?? "" });
  refreshBalances();
};

const setToken = (token) => {
  State.update({ token });
  getTokenDecimals();
};

const getTokenBalance = (receiver) => {
  const encodedData = iface.encodeFunctionData("balanceOf", [receiver]);

  return Ethers.provider()
    .call({
      to: state.token,
      data: encodedData,
    })
    .then((rawBalance) => {
      const receiverBalanceHex = iface.decodeFunctionResult(
        "balanceOf",
        rawBalance
      );

      return Big(receiverBalanceHex.toString())
        .div(Big(10).pow(state.tokenDecimals))
        .toFixed(2)
        .replace(/\d(?=(\d{3})+\.)/g, "$&,");
    });
};

const getTokenDecimals = () => {
  const encodedData = iface.encodeFunctionData("decimals", []);

  return Ethers.provider()
    .call({
      to: state.token,
      data: encodedData,
    })
    .then((tokenDecimals) => {
      State.update({ tokenDecimals: parseInt(Number(tokenDecimals)) });
      refreshBalances();
    });
};

const refreshBalances = () => {
  getTokenBalance(state.sender).then((value) => {
    State.update({ senderBalance: value });
  });

  getTokenBalance(state.receiver).then((value) => {
    State.update({ receiverBalance: value });
  });
};

const sendTokens = () => {
  const erc20 = new ethers.Contract(
    state.token,
    erc20Abi.body,
    Ethers.provider().getSigner()
  );

  let amount = ethers.utils.parseUnits(state.amount, state.tokenDecimals);

  erc20.transfer(state.receiver, amount);

  console.log("transactionHash is " + transactionHash);
};

const renderComponent = () => {
  return (
    <>
      <h1 style={{ textAlign: "center" }}>1xDapp</h1>
      <div>
        <button onClick={() => toggleCode(1)}>Mint NFT</button>
        <button onClick={() => toggleCode(2)}>Transfer Tokens</button>
      </div>
      {displayCode === 1 && (
        <div
          style={{
            border: "5px dotted #ccc",
            margin: "20px 0",
            padding: "10px",
          }}
        >
          <div>
            <div>Mint your NFT on NEAR</div>
            <div>
              Title:
              <input
                type="text"
                onChange={(e) => onChangeTitle(e.target.value)}
              />
            </div>
            <div>
              Description:
              <input
                type="text"
                onChange={(e) => onChangeDesc(e.target.value)}
              />
            </div>
            <div className="flex-grow-1">
              <IpfsImageUpload
                image={state.image}
                className="btn btn-outline-secondary border-0 rounded-3"
              />
            </div>
            <div>
              {state.image.cid && (
                <div className="mt-3">
                  <h5>Preview:</h5>
                  <img
                    src={`https://ipfs.io/ipfs/` + state.image.cid}
                    alt="Preview"
                    style={{ maxWidth: "300px" }}
                  />
                </div>
              )}
            </div>
            <div>
              {state.sender && Ethers.provider() ? (
                <div className="form-group">
                  <label htmlFor="chainSelect">Select Chain</label>
                  <select
                    className="form-control"
                    value={state.selectedChain}
                    onChange={handleChainChange}
                  >
                    {chains.map((chain) => (
                      <option key={chain.id} value={chain.id}>
                        {chain.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn btn-primary mt-3"
                    onClick={handleMint}
                  >
                    Mint to {contractAddresses[state.selectedChain][1]}
                  </button>
                </div>
              ) : state.sender ? (
                <div className="form-group">
                  <label htmlFor="chainSelect">Select Chain</label>
                  <select
                    className="form-control"
                    value={state.selectedChain}
                    onChange={handleChainChange}
                  >
                    {chains.map((chain) => (
                      <option key={chain.id} value={chain.id}>
                        {chain.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn btn-primary mt-3"
                    onClick={handleMint}
                  >
                    Mint to {contractAddresses[state.selectedChain][1]}
                  </button>
                  <div>
                    <Web3Connect
                      className="btn mt-3"
                      connectLabel="Connect with Ethereum Wallet"
                    />
                  </div>
                </div>
              ) : (
                <Web3Connect
                  className="btn mt-3"
                  connectLabel="Connect with Wallet"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {displayCode === 1 && (
        <div
          style={{
            border: "5px dotted #ccc",
            margin: "20px 0",
            padding: "10px",
          }}
        >
          <h3>Transfer tokens</h3>
          <div class="mb-3">
            <label for="selectToken">Select token</label>
            <select
              class="form-select"
              id="selectToken"
              onChange={(e) => {
                setToken(e.target.value);
              }}
            >
              {tokensMenuItems}
            </select>
          </div>

          <div class="mb-3">
            <label for="send-to" class="form-label">
              Recepient address
            </label>
            <input
              value={state.sendTo}
              class="form-control"
              id="send-to"
              placeholder="rahulinweb.eth"
              onChange={(e) => setSendTo(e.target.value)}
            />
            {state.receiver && (
              <div class="text-secondary mt-3">
                Resolved to {state.receiver}
              </div>
            )}
            {state.receiverBalance != "0" && (
              <div class="text-secondary mt-3">
                Receiver's balance: {state.receiverBalance}
              </div>
            )}

            {state.senderBalance != "0" && (
              <div class="text-secondary mt-3">
                My balance: {state.senderBalance}
              </div>
            )}
          </div>

          <div class="mb-3">
            <label for="amount" class="form-label">
              Enter the amount
            </label>
            <input
              value={state.amount}
              class="form-control"
              id="amount"
              placeholder=""
              onChange={(e) => State.update({ amount: e.target.value })}
            />
          </div>
          <div class="mb-3">
            <button onClick={sendTokens}>Send</button>
          </div>
        </div>
      )}
      {displayCode === 1 && (
        <div
          style={{
            border: "px dotted #ccc",
            margin: "20px 0",
            padding: "10px",
          }}
        >
          <Widget
            src="ref-admin.near/widget/ZKEVMSwap.zkevm-bridge-ui"
            props={{
              ...props,
              onConfirm,
              onUpdateToken,
              onChangeAmount,
              tokens,
              chainId,
              updateChainId: (chainId) => State.update(chainId),
            }}
          />
        </div>
      )}
    </>
  );
};

return renderComponent();
// }

// export default YourComponent;
