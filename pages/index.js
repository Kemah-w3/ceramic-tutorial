import styles from "../styles/Home.module.css"
import Head from "next/head"
import Web3Modal from "web3modal"
import { useState, useRef, useEffect } from "react"
import { Web3Provider } from "@ethersproject/providers"
import { useViewerConnection } from "@self.id/react"
import { EthereumAuthProvider } from "@self.id/web"
import { useViewerRecord } from "@self.id/react"

export default function Home() {
  const [connection, connect, disconnect] = useViewerConnection()
  const web3ModalRef = useRef()

  const getProvider = async () => {
    const provider = await web3ModalRef.current.connect()
    const wrappedProvider = new Web3Provider(provider)
    return wrappedProvider
  }

  const connectToSelfId = async() => {
    const ethereumAuthProvider = await getEthereumAuthProvider()
    connect(ethereumAuthProvider)
  }

  const getEthereumAuthProvider = async () => {
    const wrappedProvider = await getProvider()
    const signer = wrappedProvider.getSigner()
    const address = await signer.getAddress()
    return new EthereumAuthProvider(wrappedProvider.provider, address)
  }

  useEffect(() => {
    if(connection.status != "connected") {
     web3ModalRef.current = new Web3Modal({
      network: "rinkeby",
      providerOptions: {},
      disableInjectedProvider: false
     }) 
    }
  }, [connection.status])

  return(
    <div className={styles.main}>
      <Head>
        <title>Ceramic Demo</title>
        <link rel="icon" href="./favicon.ico"/>
      </Head>
      <div className={styles.navbar}>
        <span className={styles.title}>Ceramic Demo</span>
        {connection.status === "connected" ? (
          <span className={styles.subtitle}>Connected</span>
        ) : (
          <button
            className={styles.button}
            onClick={connectToSelfId}
            disabled={connection.status === "connecting"}
          >
            Connect
          </button>
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.connection}>
          {connection.status === "connected" ? (
            <div>
              <span className={styles.subtitle}>
                Your 3ID is {connection.selfID.id}
              </span>
              <RecordSetter />
            </div>
          ) : (
            <span className={styles.subtitle}>
              Connect with your wallet to access your 3ID
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function RecordSetter() {
  const record = useViewerRecord("basicProfile")
  const [name, setName] = useState("")

  const updateRecordName = async (_name) => {
    await record.merge({
      name: _name
    })
  }
  return(
    <div className={styles.content}>
      <div className={styles.mt2}>
        {record.content ? (
          <div className={styles.flexCol}>
            <span className={styles.subtitle}>
              Hello {record.content.name}!
            </span>

            <span className={styles.subtitle}>
              The above name was name was loaded from ceramic network. 
              <br/>
              Try updating it below!
            </span>
          </div>
        ) : (
          <span>
            You do not have a profile attached to your 3ID
            <br/>
            Try to create a basic profile, by setting a name below 
          </span>
        )}
      </div>

      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className={styles.mt2}
      />
      <button className={styles.button} onClick={() => updateRecordName(name)}>
        Update
      </button>
    </div>
  )
}