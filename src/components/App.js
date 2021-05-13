import React, { Component } from "react";
import Web3 from "web3";
import "./App.css";
import Fpmm from "../abis/FixedProductMarketMaker.json";
import Condt from "../abis/ConditionalTokens.json";
import Weth from "../abis/WETH9.json";
import FPMMDeterministicFactoryArtifact from "../abis/FPMMDeterministicFactory.json";
import Navbar from "./Navbar";
import data from "./data.json";
class App extends Component {
  async componentWillMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else {
      window.alert(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
    }
  }

  async loadBlockchainData() {
    const web3 = new Web3(window.ethereum);
    // Load account
    const accounts = await web3.eth.getAccounts();

    this.setState({ account: accounts[0] });

    const networkId = await web3.eth.net.getId();
    // 0x7E79bf33484b3994826356a0184B71B9Fe10967A
    // 0x382A8c5837d5dcD82F6b1EB6109e6066D43291d9
    if (networkId == 80001) {
      const web3 = window.web3
      const accounts = await web3.eth.getAccounts()
      this.setState({account:accounts[0] })
      const fpmm = Fpmm.abi;
      const cond = Condt.abi;
      const weth = Weth.abi;
      const Fpmmdf = FPMMDeterministicFactoryArtifact.abi;
      const fpmmaddress = "0x2Da236c3d999389bEEa44b00c8B171f52754E15d";
      const condaddress = "0xa55C7Dcc4124B10449d0Cd8D72334964ECD67FDA";
      const wethadd = "0x57ae504d2FF5cf203828c573d3CC7417d140e048";
      const fpmmdfadd = "0x6F20A18B134CB7169c8B93C7E6A9343228fa2b9a";
      //console.log(address);
      const contract = new web3.eth.Contract(fpmm, fpmmaddress);
      const condcontract = new web3.eth.Contract(cond, condaddress);
      const collateralToken = new web3.eth.Contract(weth, wethadd);
      const fpmmdf = new web3.eth.Contract(Fpmmdf, fpmmdfadd);
      this.setState({ contract });
      this.setState({ condcontract });
      this.setState({ collateralToken });
      this.setState({ fpmmdf });
      //await condcontract.methods.prepareCondition(0xF3d9D81e744B84a70CC40e790907a23BA2Cd018D,"0x0000000000000000000000000000000000000000000000000000000000000001",2).send({from: this.state.account})
      // const condiId = await condcontract.methods
      //   .getConditionId(
      //     "0xF3d9D81e744B84a70CC40e790907a23BA2Cd018D",
      //     "0x0000000000000000000000000000000000000000000000000000000000000001",
      //     2
      //   )
      //   .call();
      // console.log(condiId);
    }
  }

  handleInput = (event) => {
    this.setState({ liq: event.target.value });
  };

  addliq = () => {
    const l = this.state.liq;
    this.state.contract.methods
      .addFunding(this.state.liq.toString(), ["0"])
      .send({ from: this.state.account })
      .once("recepient", (receipt) => {
        console.log(receipt);
      })
      .on("error", () => {
        console.log("error");
      });
  };

  buyOutcomeTokens = async () => {
    
    const fpmmaddress = "0x2Da236c3d999389bEEa44b00c8B171f52754E15d";
  
    const investmentAmount = this.state.coltok;
    
    const buyOutcomeIndex = 1; // NO
    

    const balnaceofcollatertoken = await this.state.collateralToken.methods
      .balanceOf(this.state.account.toString())
      .call();

    // cono
    await this.state.collateralToken.methods.deposit().send({
      from: this.state.account,
      value: investmentAmount,
    });

    const balanceOfweth = await this.state.collateralToken.methods
      .balanceOf(this.state.account)
      .call();
    window.alert(balanceOfweth);

    await this.state.collateralToken.methods
      .approve(fpmmaddress, investmentAmount)
      .send({ from: this.state.account });
   
    const outcomeTokensToBuy = await this.state.contract.methods
      .calcBuyAmount(investmentAmount, buyOutcomeIndex)
      .call();

    console.log("outcomeTokensToBuy : ", outcomeTokensToBuy);

    await this.state.contract.methods
      .buy(investmentAmount, buyOutcomeIndex, outcomeTokensToBuy)
      .send({ from: this.state.account });

    console.log ('buy complete')
  };

  sellOutcomeTokens = async () => {
  
    const fpmmAddress = "0x2Da236c3d999389bEEa44b00c8B171f52754E15d";

    await this.state.condcontract.methods
      .setApprovalForAll(fpmmAddress, true)
      .send({ from: this.state.account });

    const returnAmount = this.state.investmentAmount;
    const sellOutcomeIndex = 1;
    const outcomeTokensToSell = await this.state.contract.methods
      .calcSellAmount(returnAmount, sellOutcomeIndex)
      .call();
    console.log('outcomeTokensToSell :>> ', outcomeTokensToSell);
    // const estimatedGas = await this.fpmmInstance.methods.sell(returnAmount, sellOutcomeIndex, outcomeTokensToSell).estimateGas({
    //   from: params.traderAddress
    // });

    await this.state.contract.methods
      .sell(returnAmount, sellOutcomeIndex, outcomeTokensToSell)
      .send({ from: this.state.account });

    console.log(returnAmount, sellOutcomeIndex, outcomeTokensToSell)
  };

  reportPayouts = async() => {
    
    const questionId = "0x4b22fe478b95fdaa835ddddf631ab29f12900b62061e0c5fd8564ddb7b684333"

    await this.state.condcontract.methods
    .reportPayouts(
      questionId,
      [0,1],// [1, 0]
    ).send({ from:this.state.account });

    // const reportPayoutsReceipt = await this.conditionalTokenInstance.methods.reportPayouts(
    //   conditionalQuestions.question1.questionId,
    //   [0, 1],// [1, 0]
    // ).send({
    //   from: params.oracleAddress,
    //   gas: '900000',
    //   gasPrice: this.gasPrice
    // });

    console.log('reportPayoutsReceipt : done');
  }

  redeemPositions = async() => {
    const outcomeSlotCount = await this.state.condcontract.methods
    .getOutcomeSlotCount(this.state.condiId)
    .call();
    console.log('outcomeSlotCount : ', outcomeSlotCount);

    const collectionId = await this.state.condcontract.methods
    .getCollectionId(
      "0x0000000000000000000000000000000000000000000000000000000000000000",
      this.state.condiId,
      [2]
    ).call();

    const positionId = await this.state.condcontract.methods
    .getPositionId(
      "0x57ae504d2FF5cf203828c573d3CC7417d140e048",
      collectionId,
    ).call();
  
    const balanceOfTrader = await this.state.condcontract.methods
    .balanceOf(this.state.account, positionId).call();
    console.log('balanceOfTrader :>> ', balanceOfTrader);

    await this.state.condcontract.methods.redeemPositions(
      "0x57ae504d2FF5cf203828c573d3CC7417d140e048",
      "0x0000000000000000000000000000000000000000000000000000000000000000", // ParentCollection Id
      this.state.condiId,
      [2]
    );

    // const redeemPositionReceipt = await Utils.signAndSendTransation(this.web3, redeemPositionRawTx, {
    //   from: params.traderAddress,
    //   to: this.conditionalTokenInstance._address,
    //   // gas: '90000000',
    //   gasPrice: this.gasPrice
    // });

    // const redeemPositionReceipt = await this.conditionalTokenInstance.methods.redeemPositions(
    //   this.collateralToken._address,
    //   "0x0000000000000000000000000000000000000000000000000000000000000000", // ParentCollection Id
    //   this.conditionId,
    //   [2]
    // ).send({
    //   from: params.traderAddress,
    //   gas: '90000000',
    //   gasPrice: this.gasPrice
    // });

    const afterRedemption = await this.state.condcontract.methods
    .balanceOf(this.state.account, positionId)
    .call();

    console.log('afterRedemption : ', afterRedemption);

    // console.log('redeemPositionReceipt :>> ', redeemPositionReceipt);

  }


  // rede = () => {
  //   this.state.contract.methods
  //     .redeemPositions(
  //       0x9de03f9ee15af5fcf3035eab4540fc2d3e5410c2,
  //       "0x0000000000000000000000000000000000000000000000000000000000000000",
  //       this.state.condiId,
  //       [1]
  //     )
  //     .send({ from: this.state.account })
  //     .once("receipt", (receipt) => {
  //       console.log(receipt);
  //     });
  // };

  handleToken = (event) => {
    this.setState({ coltok: event.target.value });
  };

  yorn = (event) => {
    this.setState({ yn: event.target.value });
  };

  // buyy = () => {
  //   this.state.contract.methods
  //     .buy(this.state.coltok, 1, 0)
  //     .send({ from: this.state.account })
  //     .once("receipt", (receipt) => {
  //       console.log(receipt);
  //     });
  // };

  // selll = () => {
  //   this.state.contract.methods
  //     .sell(this.state.coltok, 1, 0)
  //     .send({ from: this.state.account })
  //     .once("receipt", (receipt) => {
  //       console.log(receipt);
  //     });
  // };

  // res = () => {
  //   this.state.condcontract.methods
  //     .reportPayouts(
  //       "0x0000000000000000000000000000000000000000000000000000000000000001",
  //       [1, 0]
  //     )
  //     .send({ from: this.state.account })
  //     .once("receipt", (receipt) => {
  //       console.log(receipt);
  //     });
  // };

  constructor(props) {
    super(props);
    this.state = {
      account: "",
      contract: null,
      yn: ' ',
      coltok:'0',
      condcontract: null,
      collateralToken: null,
      fpmmdf: null,
      liq: "0",
      web3: null,
      buffer: null,
      investmentAmount: "0",
      condiId:
        "0x0000000000000000000000000000000000000000000000000000000000000000",
    };
  }
  render() {
    return (
      <div>
        <Navbar />
        
        <div class="container">
          <main role="main" class="container">
            <div>
              <div class="jumbotron">
                <div className="row" style={{ paddingTop: "30px" }}>
                  {" "}
                  <div className="row" style={{ paddingLeft: "40px" }}>
                    <h3>
                      Will Donald Trump be inaugurated for his second term as
                      President of the USA on Inauguration Day, January 20th,
                      2021?
                    </h3>
                  </div>
                </div>
              </div>
              <div className="container">
                <input
                  type="number"
                  placeholder="0.0"
                  onChange={this.handleInput}
                  style={{
                    height: "35px",
                    marginLeft: "350px",
                    marginRight: "40px",
                    marginTop: "-80px",
                  }}
                ></input>
                <button
                  className="btn btn-outline-primary"
                  onClick={this.addliq}
                  style={{
                    marginLeftt: "30px",
                    marginBottom: "30px",
                    marginTop: "10px",
                  }}
                >
                  Add Liquidity
                </button>
                <div className="row" style={{ paddingLeft: "40px" }}>
                  <p>
                    <input
                      type="number"
                      placeholder="0.0"
                      onChange={this.handleToken}
                      style={{
                        height: "35px",
                        marginLeft: "350px",
                        marginRight: "40px",
                      }}
                    ></input>
                  </p>
                  <p>
                    <input type="radio" onClick={this.yorn} name="JTP" id="yes" value="2" />
                    Yes{"\t"}
                    <input type="radio" onClick={this.yorn} name="JTP" id="no" value="1" />
                    No
                  </p>
                  <p>
                    <button
                      className="btn btn-outline-success btn-lg"
                      onClick={this.buyOutcomeTokens}
                      style={{
                        width: "157px",
                        marginTop: "-20px",
                        marginLeft: "300px",
                      }}
                    >
                      BUY
                    </button>
                    <button
                      className="btn btn-outline-danger btn-lg"
                      onClick={this.sellOutcomeTokens}
                      style={{
                        width: "157px",
                        marginTop: "30px",
                        marginLeft: "30px",
                        marginBottom: "50px",
                      }}
                    >
                      SELL
                    </button>
                  </p>
                  <button
                    className="btn btn-outline-secondary btn-lg"
                    onClick={this.reportPayouts}
                    style={{
                      width: "127px",
                      marginLeft: "320px",
                      marginBottom: "100px",
                      marginTop: "-30px",
                    }}
                  >
                    RESOLVE
                  </button>
                  <button
                    className="btn btn-outline-warning btn-lg"
                    onClick={this.redeemPositions}
                    style={{
                      width: "127px",
                      marginLeft: "30px",
                      marginBottom: "100px",
                      marginTop: "-30px",
                    }}
                  >
                    REDEEM
                  </button>
                </div>

                <div className="row" style={{ paddingLeft: "40px" }}></div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
}

export default App;
