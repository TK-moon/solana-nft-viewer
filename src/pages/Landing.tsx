import React from 'react'
import { useNavigate } from 'react-router-dom'

import SearchForm from '../components/SearchForm'
import { checkIsValidWallet } from '../lib/index'

const Landing = () => {
  const navigate = useNavigate()

  const handleSubmit = (event: React.FormEvent, walletAdrs: string) => {
    event.preventDefault()
    const isValidWallet = checkIsValidWallet(walletAdrs)
    if (isValidWallet) navigate(`/${walletAdrs}`)
    else alert('Wallet address is not valid')
  }

  return (
    <div className='landing-container'>
      <h1 className='landing-title'>NFT Viewer</h1>
      <SearchForm handleSubmit={handleSubmit} />
    </div>
  )
}

export default Landing
