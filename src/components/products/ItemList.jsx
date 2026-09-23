import Item from "./Item";
import styles from "./ItemList.module.css";

const ItemList = ({ productos }) => {
  if (!productos || productos.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <p className={styles.emptyText}>No se encontraron productos disponibles con los criterios seleccionados.</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {productos.map((producto) => (
        <Item key={producto.id} {...producto} />
      ))}
    </div>
  );
};

export default ItemList;