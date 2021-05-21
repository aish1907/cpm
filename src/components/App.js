import React, { Component } from "react";
import Web3 from "web3";
import "./App.css";
import Fpmm from "../abis/FixedProductMarketMaker.json";
import Condt from "../abis/ConditionalTokens.json";
import Weth from "../abis/WETH9.json";
import Que from "../abis/que.json";
import FPMMDeterministicFactoryArtifact from "../abis/FPMMDeterministicFactory.json";
import Navbar from "./Navbar";
// import Addquest from "./Addquest";
import { Switch, Route, Router } from 'react-router-dom';
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
      const queabi = Que.abi;
      const fpmmaddress = "0x2Da236c3d999389bEEa44b00c8B171f52754E15d";
      const condaddress = "0xa55C7Dcc4124B10449d0Cd8D72334964ECD67FDA";
      const wethadd = "0x57ae504d2FF5cf203828c573d3CC7417d140e048";
      const fpmmdfadd = "0x6F20A18B134CB7169c8B93C7E6A9343228fa2b9a";
      const que = "0x2520EfFA075794d391E3072cd13462fAb97e111d"
      //console.log(address);
      const contract = new web3.eth.Contract(fpmm, fpmmaddress);
      const condcontract = new web3.eth.Contract(cond, condaddress);
      const collateralToken = new web3.eth.Contract(weth, wethadd);
      const fpmmdf = new web3.eth.Contract(Fpmmdf, fpmmdfadd);
      const qu = new web3.eth.Contract(queabi, que);
      this.setState({ contract });
      this.setState({ condcontract });
      this.setState({ collateralToken });
      this.setState({ fpmmdf });
      this.setState({ qu });
      
      const coar = await qu.methods.quesret().call()
      for (var i = 1; i <= coar.length; i++) {
        const plac = coar[i - 1]
        this.setState({
          questions: [...this.state.questions, plac]
        })}
      console.log(coar);
      const yn=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
      for(var j=0; j<15; j++){
        const yes = await qu.methods.yesret(j,0).call()
        yn[j] = yes;
      }
      this.setState({yesnum:yn})
      console.log(this.state.yesnum)
      for(var j=0; j<15; j++){
        const no = await qu.methods.yesret(j,1).call()
        yn[j] = no;
      }
      this.setState({nonum:yn})
      console.log(this.state.nonum)
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
      .addFunding(this.state.liq.toString(), ['1','1'])
      .send({ from: this.state.account })
      .once("recepient", (receipt) => {
        console.log(receipt);
      })
      .on("error", () => {
        console.log("error");
      });
  };

  buyOutcomeTokens = async (key) => {
    
    const fpmmaddress = "0x2Da236c3d999389bEEa44b00c8B171f52754E15d";
  
    const investmentAmount = this.state.coltok;
    console.log(this.state.coltok)
    const buyOutcomeIndex = this.state.yn; // NO
    console.log(this.state.yn)

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

    // const balanceBefore = await this.collateralToken.methods.balanceOf("0x2Da236c3d999389bEEa44b00c8B171f52754E15d").call();
    // console.log('balanceBefore :>> ', balanceBefore);

    await this.state.contract.methods
      .buy(investmentAmount, buyOutcomeIndex, outcomeTokensToBuy)
      .send({ from: this.state.account });

      // const balanceAfter = await this.collateralToken.methods.balanceOf("0x2Da236c3d999389bEEa44b00c8B171f52754E15d").call();
      // console.log('balanceAfter :>> ', balanceAfter);

    await this.state.qu.methods
      .yeses(key,0)
      .send({ from: this.state.account });

    console.log ('buy complete')
  };

  sellOutcomeTokens = async (key) => {
  
    const fpmmAddress = "0x2Da236c3d999389bEEa44b00c8B171f52754E15d";

    await this.state.condcontract.methods
      .setApprovalForAll(fpmmAddress, true)
      .send({ from: this.state.account });

    const returnAmount = this.state.investmentAmount;
    const sellOutcomeIndex = this.state.yn;
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

    await this.state.qu.methods
      .yeses(key,1)
      .send({ from: this.state.account });  

    console.log(returnAmount, sellOutcomeIndex, outcomeTokensToSell)
  };

  reportPayouts = async(key) => {
    console.log(this.state.questid[key])
  const questionId = this.state.questid[key];
   //window.alert(this.state.account)
    await this.state.condcontract.methods
    .reportPayouts(
      this.state.questid[key],
      ['0','1']// [1, 0]
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

  redeemPositions = async(key) => {
    const conditionid = this.state.condiid[key]
    const outcomeSlotCount = 2
    console.log('outcomeSlotCount : ', outcomeSlotCount);

    const collectionId = await this.state.condcontract.methods
    .getCollectionId(
      "0x0000000000000000000000000000000000000000000000000000000000000000",
      conditionid,
      [2]
    ).call();

    const positionId = await this.state.condcontract.methods
    .getPositionId(
      "0x57ae504d2FF5cf203828c573d3CC7417d140e048",
      collectionId,
    ).call();
  
    const balanceOfTrader = await this.state.collateralToken.methods
    .balanceOf(this.state.account).call();
    console.log('balanceOfTrader :>> ', balanceOfTrader);

    await this.state.condcontract.methods.redeemPositions(
      "0x57ae504d2FF5cf203828c573d3CC7417d140e048",
      "0x0000000000000000000000000000000000000000000000000000000000000000", // ParentCollection Id
      conditionid,
      [2]
    ).send({ from:this.state.account });

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

    const afterRedemption = await this.state.collateralToken.methods
    .balanceOf(this.state.account)
    .call();

    console.log('afterRedemption : 1.7006', afterRedemption);

  // console.log('redeemPositionReceipt :>> ', redeemPositionReceipt);

  }

  addq = async() =>{
       var inputVal = await document.getElementById("myInput").value;
       if(inputVal){console.log(inputVal)
    this.setState({
      questions: [...this.state.questions, inputVal]
    })
    console.log(this.state.questions)
    await this.state.qu.methods.ques(inputVal).send({ from: this.state.account });
    const al = await this.state.qu.methods.quesret().call();
    console.log(al);
    const current = al.length-1
    console.log(this.state.condiid[current])
    await this.state.condcontract.methods.prepareCondition(
      "0xb60B993862673A87C16E4e6e5F75397131EEBb3e",
      this.state.questid[current],
      '2',
    ).send({ from: this.state.account });
    console.log("condition prepared..yay!")
    //console.log(Web3.utils.fromAscii(this.state.questid[current]))

    // const saltNonce = Web3.utils.toBN(2020);
    // const feeFactor = Web3.utils.toBN(3e10); // (0.3%)
    // const initialFunds = Web3.utils.toBN(10e2);
    // const initialDistribution = [1, 2];
    // await this.state.collateralToken.methods.deposit().send({ from: this.state.account });

    // await this.state.collateralToken.methods
    // .approve(
    //   "0x6F20A18B134CB7169c8B93C7E6A9343228fa2b9a",
    //    initialFunds).send({ from: this.state.account });
    // // .send({
    // //   from: Accounts.marketOwner.publicKey,
    // //   gasPrice: this.gasPrice,
    // //   gas: '900000',
    // // });
    // // console.log('conditionId: ', this.conditionId);
    // const approvedObj = await this.state.collateralToken.methods
    // .allowance("0xD550338cC2CDA0764d439b7D30b2b502Df0826FB", 
    // "0x6F20A18B134CB7169c8B93C7E6A9343228fa2b9a"
    // ).send({ from: this.state.account });

    // const createArgs = [
    //   saltNonce,
    //   "0xa55C7Dcc4124B10449d0Cd8D72334964ECD67FDA",
    //   "0x57ae504d2FF5cf203828c573d3CC7417d140e048",
    //   [this.state.condiid[current]],
    //   feeFactor,
    //   initialFunds,
    //   initialDistribution,
    //   // { from: creator }
    // ]

    // const fpmmAddress = await this.state.fpmmdf.methods.create2FixedProductMarketMaker(...createArgs).send({ from: "0xD550338cC2CDA0764d439b7D30b2b502Df0826FB" });

    // console.log('this.fpmmInstance call : ', fpmmAddress);

    // await this.state.fpmmdf.methods.create2FixedProductMarketMaker(...createArgs).send({ from: this.state.account });
}
     else{const al = await this.state.qu.methods.quesret().call();
      
       const current = al.length-1
       console.log(this.state.questid[current])
       console.log(this.state.condiid[current])}
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
    this.setState({ yn: 0 });
    //console.log(this.state.yn)
  };

  norn = (event) => {
    this.setState({ yn: 1 });
    //console.log(this.state.yn)
  };

  ini = () => {
    this.setState({qidcounter : 0 });
    
  }

  iniadd = () => {
    this.setState({qidcounter : this.state.qidcounter+1 });
  }

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
      qu:null,
      fpmmdf: null,
      liq: "0",
      web3: null,
      buffer: null,
      investmentAmount: "0",
      condiId:
        "0x0000000000000000000000000000000000000000000000000000000000000000",
      qidcounter:'0',
      questid:[
        "0x0000000000000000000000000000000000000000000000000000000000000011",
        "0x0000000000000000000000000000000000000000000000000000000000000012",
        "0x0000000000000000000000000000000000000000000000000000000000000013",
        "0x0000000000000000000000000000000000000000000000000000000000000014",
        "0x0000000000000000000000000000000000000000000000000000000000000015",
        "0x0000000000000000000000000000000000000000000000000000000000000016",
        "0x0000000000000000000000000000000000000000000000000000000000000017",
        "0x0000000000000000000000000000000000000000000000000000000000000018"
      ],
      questions:[],
      condiid:[
        "0xc27a24cdc9a6701f15c231aa762bb157ea8636349abab392252ad5cbd7b38711",
        "0x380a9225c4e77f7e10b4f331839d8ad880af0cad7791812f3b05bfc0bc58af87",
        "0xb6543aaa59c49e8ede6cfe2ce9b55827dcba2c605f3d88936c3c49e0fd774aa5",
        "0x3c3861f9445be7994f60a28ad8dedd69b30c8c22c490d81946111b41880bdaff",
        "0xd54544ee71a3d5ee028686253bf23a66b45fb8a1e683d7891b9c72f127f9d4d6",
        "0x74561f485caa45ec37dd556be97cf95a6742799929ab12020b3759818a88d937",
        "0x2d9b3df8c58107f42d7fcb76a9c8c11c54571ecf2e846b82823cbd44fa6b579f",
        "0x798d2f760a90e49c37dbf0da43b8c7cf19e32612ee4eb477b14553b5ef52351a"
      ],
      yesnum:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      nonum:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    };
  }
  render() {
    return (
      <div>
        <Navbar account={this.state.account}/>
        <div>
          {this.state.questions.length > 0 &&  this.state.questions.map((plac, index) => {
           
            return(
               <div key={index}>                         
                  {/* {console.log(index)} */}
                            
                  <div class="container">
                  {this.state.questions[index]}
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
                  <input type="radio" onClick={this.yorn} name="JTP" id="yes" value="0" />
                    Yes{"\t"}
                    <input type="radio" onClick={this.norn} name="JTP" id="no" value="1" />
                    No
                    <button
                      className="btn btn-outline-success btn-lg"
                      onClick={() => this.buyOutcomeTokens(index)}
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
                      onClick={() => this.sellOutcomeTokens(index)}
                      style={{
                        width: "157px",
                        marginTop: "30px",
                        marginLeft: "30px",
                        marginBottom: "50px",
                      }}
                    >
                      SELL
                    </button>
                  <button
                    className="btn btn-outline-secondary btn-lg"
                    value={index}
                    onClick={() => this.reportPayouts(index)}
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
                    onClick={() => this.redeemPositions(index)}
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
              
               : <div> </div>
      
             </div>
          )
      })
      }
        </div>
        <div class="container">
          <input type="text" placeholder="Type something..." id="myInput"></input>
          <button
                  className="btn btn-outline-primary"
                  onClick={this.addq}
                  style={{
                    marginLeftt: "30px",
                    marginBottom: "30px",
                    marginTop: "10px",
                  }}
                >
                  Add questions
                </button>
        </div>
        <div className="container">
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
                    <input type="radio" onClick={this.yorn} name="JTP" id="yes" value="0" />
                    Yes{"\t"}
                    <input type="radio" onClick={this.norn} name="JTP" id="no" value="1" />
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
               {/* <Addquest con = {this.state.condcontract}/> */}
                
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
}

export default App;
