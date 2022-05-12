import React, { useEffect, useState } from "react"
import { ethers } from "ethers"
import abi from "./BuyMeACoffee.json"
import "./App.css"

function App() {
  const contractAddress = "0xdA5B8A7db2d47F593C8217c4e9A65a35A4C17a6F"
  const contractABI = abi.abi
  const [currentAccount, setCurrentAccount] = useState("")
  const [name, setName] = useState("")
  const [message, setMessage] = useState("")
  const [memos, setMemos] = useState([])

  const onNameChange = (event) => {
    setName(event.target.value)
  }

  const onMsgChange = (event) => {
    setMessage(event.target.value)
  }

  const isWalletConnected = async () => {
    try {
      const { ethereum } = window
      const accounts = await ethereum.request({ method: "eth_accounts" })
      // console.log("accounts: ", accounts)
      if (accounts.length > 0) {
        const account = accounts[0]
        console.log("MetaMask is connected with: " + account)
      } else {
        console.log("pls connect MetaMask")
      }
    } catch (err) {
      console.log("error:", err)
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window
      if (!ethereum) {
        console.log("pls install MetaMask")
      }
      const accounts = await ethereum.request({ method: "eth_requestAccounts" })
      setCurrentAccount(accounts[0])
    } catch (err) {
      console.log("error:", err)
    }
  }

  const buyCoffee = async () => {
    try {
      const { ethereum } = window
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum, "any")
        const signer = provider.getSigner()
        const buyMeACoffee = new ethers.Contract(contractAddress, contractABI, signer)

        console.log("buying coffee..")
        const coffeeTxn = await buyMeACoffee.buyCoffee(name ? name : "anonymous", message ? message : "enjoy your coffee :)", { value: ethers.utils.parseEther("0.001") })
        await coffeeTxn.wait()
        console.log("tx hash:", coffeeTxn.hash)

        // Clear the form fields.
        setName("")
        setMessage("")
      }
    } catch (err) {
      console.log(err)
    }
  }

  const getMemos = async () => {
    try {
      const { ethereum } = window
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const buyMeACoffee = new ethers.Contract(contractAddress, contractABI, signer)

        console.log("fetching memos from blockchain...")
        const memos = await buyMeACoffee.getMemos()
        console.log("fetched!")
        setMemos(memos)
      } else {
        console.log("Metamask is not connected")
      }
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    let buyMeACoffee
    isWalletConnected()
    getMemos()

    // Create an event handler function for when someone sends
    // us a new memo.
    const onNewMemo = (from, timestamp, name, message) => {
      console.log("memo received:", from, timestamp, name, message)
      setMemos((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message,
          name
        }
      ])
    }

    const { ethereum } = window
    // Listen for new memo events.
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum, "any")
      const signer = provider.getSigner()
      buyMeACoffee = new ethers.Contract(contractAddress, contractABI, signer)
      buyMeACoffee.on("NewMemo", onNewMemo)
    }

    return () => {
      if (buyMeACoffee) {
        buyMeACoffee.off("NewMemo", onNewMemo)
      }
    }
  }, [])

  return (
    <div className="container">
      <div>
        <title>Buy Isaac a Coffee!</title>
        <meta name="description" content="Tipping site" />
        <link rel="icon" href="/favicon.ico" />
      </div>

      <main className="main">
        <h1 className="title">Buy Isaac a Coffee</h1>

        {currentAccount ? (
          <div>
            <form>
              <div>
                <label>Name:</label>
                <br />
                <input id="name" type="text" placeholder="input your name" onChange={onNameChange} />
              </div>
              <br />

              <div>
                <label>Message:</label>
                <br />
                <textarea rows={3} placeholder="Send Isaac a message" id="message" onChange={onMsgChange} required />
              </div>
              <div>
                <button type="button" onClick={buyCoffee}>
                  Buy 1 Coffee for 0.001ETH
                </button>
              </div>
            </form>
          </div>
        ) : (
          <button onClick={connectWallet}>Connect MetaMask</button>
        )}
      </main>

      {currentAccount && <h1>memos received</h1>}
      {currentAccount &&
        memos.map((memo, idx) => {
          return (
            <div
              key={idx}
              style={{
                border: "2px solid",
                borderRadius: "5px",
                padding: "5px",
                margin: "5px"
              }}
            >
              <p style={{ fontWeight: "bold" }}>"{memo.message}"</p>
              <p>
                From: {memo.name} at {memo.timestamp.toString()}
              </p>
            </div>
          )
        })}

      <footer className="footer">
        <a href="https://alchemy.com/?a=roadtoweb3weektwo" target="_blank" rel="noopener noreferrer">
          Created by @thatguyintech for Alchemy's Road to Web3 lesson two!
        </a>
      </footer>
    </div>
  )
}

export default App
