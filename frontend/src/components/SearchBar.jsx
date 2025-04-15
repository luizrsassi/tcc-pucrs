import { 
    Input,
    InputGroup,
    InputLeftElement
  } from '@chakra-ui/react';
  import { SearchIcon } from '@chakra-ui/icons';
  import { useState } from 'react';
  
  const SearchBar = ({ onSearch }) => {
    const [searchTerm, setSearchTerm] = useState('');
  
    const handleSearch = (e) => {
      const value = e.target.value;
      setSearchTerm(value);
      if(onSearch) {
        onSearch(value); // Passa o termo de pesquisa para o componente pai
      }
    };
  
    return (
      <InputGroup mb={8}>
        <InputLeftElement pointerEvents="none">
          <SearchIcon color="gray.400" />
        </InputLeftElement>
        
        <Input
          placeholder="Pesquisar clubes..."
          value={searchTerm}
          onChange={handleSearch}
          variant="filled"
          focusBorderColor="blue.500"
          _placeholder={{ color: 'gray.500' }}
        />
      </InputGroup>
    );
  };
  
  export default SearchBar;