import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";


const Modal = ({ isNFTUnstaking, isNFTApproving, isNFTStaking,isClaiming }) => {
  const [isBrowser, setIsBrowser] = useState(false);
  const [option, setOption] = useState(0)

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  useEffect(()=>{
    if(isNFTStaking){
      setOption(1)
    } else if(isNFTUnstaking) {
      setOption(2)
    } else if (isClaiming){
      setOption(3)
    }
  },[isNFTUnstaking, isNFTStaking,isClaiming])

  let modalContent;
  if(isNFTUnstaking || isClaiming){
    modalContent = (
      <StyledModalOverlay>
        <StyledModal>
            <img  src="/loader.gif" alt="load" style={{"borderRadius":"50%"}}/>
            Processing...
        </StyledModal>
      </StyledModalOverlay>
    ) 
  } else if(isNFTApproving){
    modalContent = (
      <StyledModalOverlay>
        <StyledModal>
            <img  src="/loader.gif" alt="load" style={{"borderRadius":"50%"}}/>
            <span style={{"marginTop":"auto","marginBottom":"auto"}}>1. Approving...</span>
        </StyledModal>
      </StyledModalOverlay>
    )
  } else if(isNFTStaking){
    modalContent = (
      <StyledModalOverlay>
        <StyledModal>
            <img  src="/loader.gif" alt="load" style={{"borderRadius":"50%"}}/>
            <span style={{"marginTop":"auto","marginBottom":"auto","color":"red"}}>1. Completed Approving</span><p></p>
            <span style={{"marginTop":"auto","marginBottom":"auto"}}>2. Staking Processing...</span>
        </StyledModal>
      </StyledModalOverlay>
    )
  } else {
    if(option==1){
      modalContent = (
        <StyledModalOverlay>
          <StyledModal>
              <span style={{"marginTop":"auto","marginBottom":"auto"}}>Completed Staking</span>
              <button onClick={()=>setOption(0)}>Done</button>
          </StyledModal>
      </StyledModalOverlay>
      )
    } else if (option==2){
      modalContent = (
        <StyledModalOverlay>
          <StyledModal>
              Successfully Unstaked
              <button onClick={()=>setOption(0)}>Done</button>
          </StyledModal>
      </StyledModalOverlay>
      )
    } else if (option==3){
      modalContent = (
        <StyledModalOverlay>
          <StyledModal>
              Successfully Claim
              <button onClick={()=>setOption(0)}>Done</button>
          </StyledModal>
      </StyledModalOverlay>
    )
    }
  }


  if (isBrowser) {
    return ReactDOM.createPortal(
      modalContent,
      document.getElementById("modal-root")
    );
  } else {
    return null;
  }
};



const StyledModal = styled.div`
  background: #252525;
  width: 220px;
  padding:20px;
  border-radius: 20px;
  text-align:center;  
`;
const StyledModalHeader = styled.div`
  display: flex;
  justify-content: flex-end;
  font-size: 25px;
`;

const StyledModalS = styled.div`
  background: white;
  width: 200px;
  height:200px;
  border-radius: 20px;
  text-align:center;
  color:black;
  display: flex;
  justify-content: center;
`;
const StyledModalOverlay = styled.div`
  z-index: 999;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
`;

export default Modal;