import React, { Suspense, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from 'react-query'

import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import {
  Connection, PublicKey, ParsedAccountData, clusterApiUrl, AccountInfo,
} from '@solana/web3.js'
import * as metadata from '@metaplex-foundation/mpl-token-metadata'

import {
  getConnectionOptions,
  nftItemType,
  checkIsValidWallet,
  localStorageBookmarks,
  getMintListHashByList,
  localStorageDataHashType,
  localStorageDataHash,
  localStorageCustomOrderType,
  localStorageCustomOrder,
} from '../lib/index'

import SearchForm from '../components/SearchForm'
import NftListComponent from '../components/NftListComponent'

const NftListPage = (props: { walletId: string }) => {
  // init data hash local storage
  const dataHash = useMemo<localStorageDataHashType>(() => localStorageDataHash(props.walletId), [props.walletId])
  // init custom order local storage
  const customOrder = useMemo<localStorageCustomOrderType>(() => localStorageCustomOrder(props.walletId), [props.walletId])
  // 위 클로져에서 메모리 낭비가 발생하지는 않나..?

  const getConnection = () => new Connection(clusterApiUrl('devnet'), 'confirmed')

  const fetchNftList = async (connection: Connection, walletid: string) => {
    const connectionOptions = getConnectionOptions(walletid)
    const tokenAccounts = await connection.getParsedProgramAccounts(TOKEN_PROGRAM_ID, connectionOptions)
    return tokenAccounts
  }

  /**
   *
   * @param connection
   * @param tokenAccounts
   * @returns NFT Metadata with bookmarkedData
   */
  const getMetadatasByTokenAccountsPromise = (
    connection: Connection,
    tokenAccounts: {
      pubkey: PublicKey
      account: AccountInfo<ParsedAccountData | Buffer>
    }[],
  ): Promise<nftItemType>[] => {
    const localStorageBookmark = localStorageBookmarks(props.walletId)
    const savedBookmarks = localStorageBookmark.load()

    return tokenAccounts.map(async item => {
      const accountData = item.account.data as ParsedAccountData
      const { mint } = accountData.parsed.info // TOKEN
      const tokenmetaPubkey = await metadata.Metadata.getPDA(new PublicKey(mint))
      const tokenmeta = await metadata.Metadata.load(connection, tokenmetaPubkey)
      const signature = await connection.getSignaturesForAddress(new PublicKey(mint))
      const times = signature.map(item => new Date(item.blockTime || 0))
      // const transaction = await connection.getParsedTransaction(signature[0].signature)

      const localStorageBookmarkData = savedBookmarks[mint]
      const bookmark = localStorageBookmarkData?.bookmark || false
      const bookmarkedTime = localStorageBookmarkData ? new Date(localStorageBookmarkData.bookmarkedTime) : null

      return {
        mint: tokenmeta.data.mint,
        creators: tokenmeta.data.data.creators,
        uri: tokenmeta.data.data.uri,
        lastTransactionTime: times[0],
        lastCreationTime: times[times.length - 1],
        bookmark,
        bookmarkedTime,
      }
    })
  }

  type fetchParsedNftListType = {
    nftList: nftItemType[]
    hash: string
  }
  const fetchParsedNftList = async (): Promise<fetchParsedNftListType> => {
    if (!props.walletId) return { nftList: [], hash: '' }

    const connection = getConnection()
    const tokenAccounts = await fetchNftList(connection, props.walletId)
    const nftDataPromise = getMetadatasByTokenAccountsPromise(connection, tokenAccounts)
    const nftdatas = await Promise.all(nftDataPromise)

    const mintListHash = getMintListHashByList(nftdatas)
    const localStorageHash = dataHash.load()

    if (mintListHash === localStorageHash) {
      return {
        nftList: customOrder.load(),
        hash: localStorageHash,
      }
    }

    return {
      nftList: nftdatas,
      hash: mintListHash,
    }
  }

  const { data: nftDatas } = useQuery(['nftlist', props.walletId], fetchParsedNftList)

  return (<NftListComponent
    walletId={props.walletId}
    nftList={nftDatas?.nftList as nftItemType[]}
  />)
}

const NftListPageWithSuspense = () => {
  const navigate = useNavigate()

  const { walletid } = useParams()

  const handleSubmit = (event: React.FormEvent, walletAdrs: string) => {
    event.preventDefault()
    const isValidWallet = checkIsValidWallet(walletAdrs)
    if (isValidWallet) navigate(`/${walletAdrs}`)
    else alert('Wallet address is not valid')
  }

  return (
    <div className='list-page'>
      <header className='list-page-hader'>
        <Link to='/'>
          <h1>NFT Viewer</h1>
        </Link>
        <SearchForm
          handleSubmit={handleSubmit}
          initValue={walletid}
        />
      </header>
      <Suspense fallback={<div>Loading</div>}>
        <NftListPage walletId={walletid as string} />
      </Suspense>
    </div>
  )
}

export default NftListPageWithSuspense
