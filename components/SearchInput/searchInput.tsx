'use client'

import React from 'react'
import styles from './searchInput.module.css'

type Props = {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  placeholder?: string
}

const SearchInput: React.FC<Props> = ({
  value,
  onChange,
  onKeyDown,
  placeholder = "Kërko..."
}) => {
  return (
    <input
      type="text"
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      autoComplete='off'
      placeholder={placeholder}
      className={styles.searchInput}
    />
  )
}

export default SearchInput
