import { useState } from "react"
import BotonFavorito from "../BotonFavorito"

const Item = ({title, price, image}) => {

  const [contador, setContador] = useState(0);
  const incrementar = () => { setContador(contador + 1) };
  
  const decrementar = () => {
    if(contador > 0) 
      setContador(contador - 1) 
  };

  return (
    <div>
      <h2>
        {title}: AR${price}
      </h2>
      <img src={image} alt={title} />
      <BotonFavorito />
      <button onClick={decrementar}> - </button>
      <p>{contador}</p>
      <button onClick={incrementar}> + </button>
    </div>
  );
}

export default Item