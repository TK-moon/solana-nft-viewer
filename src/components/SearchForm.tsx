import React, { useState } from 'react'

interface SearchFormProps {
  handleSubmit: (event: React.FormEvent, walletAdrs: string) => void
  initValue?: string
}

const SearchForm = (props: SearchFormProps) => {
  const [walletAdrs, setWalletAdrs] = useState(props.initValue || '')

  const handleWalletAdrsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setWalletAdrs(event.target.value)
  }

  return (
    <form
      className='search-form'
      onSubmit={event => props.handleSubmit(event, walletAdrs)}
    >
      <input
        value={walletAdrs}
        onChange={handleWalletAdrsChange}
        className='search-form-input'
        type='string'
      />
      <button
        type='submit'
        className='search-form-submit'
      >
        🔍
      </button>
    </form>
  )
}

SearchForm.defaultProps = { initValue: '' }

export default SearchForm
