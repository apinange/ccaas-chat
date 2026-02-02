import styled from 'styled-components';

export const SSelector = styled.select`
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: white;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  margin-left: 8px;
  
  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
  
  &:hover {
    border-color: #999;
  }
`;

export const SOption = styled.option`
  padding: 8px;
  background-color: white;
  color: #333;
`;

export const SLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #333;
  display: inline-block;
`;

