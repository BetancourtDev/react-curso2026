import { useState } from "react"
import BotonFavorito from "../BotonFavorito"

const Item = ({nombre, precio}) => {

  const [contador, setContador] = useState(0);
  const incrementar = () => { setContador(contador + 1) };
  
  const decrementar = () => {
    if(contador > 0) 
      setContador(contador - 1) 
  };

  return (
    <div>
      <h2>
        {nombre}: AR${precio}
      </h2>
      <BotonFavorito />
      <button onClick={decrementar}> - </button>
      <p>{contador}</p>
      <button onClick={incrementar}> + </button>
    </div>
  );
}

export default Item