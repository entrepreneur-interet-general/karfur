import styled from "styled-components";
import React, { Component } from "react";

export const StyledThead = styled.thead`
  flex: 1;
  flex-direction: row;
  width: 100%;
  justify-content: flex-end;
  align-items: flex-end;
`;

export const StyledSort = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
  width: 100%;
  justify-content: flex-end;
  align-items: flex-end;
`;

export const StyledTitle = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
  width: 100%;
  justify-content: flex-start;
  align-items: flex-end;
  font-weight: bold;
  font-size: 40px;
  padding-left: 10px;
`;

export const StyledHeader = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
  width: 100%;
`;

export const StyledStatus = styled.button`
  font-weight: bold;
  border-radius: 6px;
  margin: 10px;
  padding: 10px;
`;
