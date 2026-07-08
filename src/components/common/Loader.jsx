import React from 'react';
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import styled from 'styled-components';
import '../../styles/Loader.css';

const Loader = () => {

  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/connexion");
    }, 3000); // ⏱️ 3 secondes

    return () => clearTimeout(timer);
  }, []);


  return (
    <div className='loader-center' >
      <div class="loader"></div>

    </div>

  )
}

export default Loader;
