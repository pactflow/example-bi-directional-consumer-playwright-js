import { type ChangeEvent, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import "spectre.css/dist/spectre.min.css";
import "spectre.css/dist/spectre-icons.min.css";
import "spectre.css/dist/spectre-exp.min.css";
import API from "./api";
import Heading from "./Heading";
import Layout from "./Layout";
import type { Product } from "./product";

function ProductTableRow({ product }: { product: Product }) {
  return (
    <tr className="product-item">
      <td>{product.name}</td>
      <td>{product.type}</td>
      <td>
        <Link
          className="btn btn-link"
          to={`/products/${product.id}`}
          state={{ product }}
        >
          See more!
        </Link>
      </td>
    </tr>
  );
}

function ProductTable({ products }: { products: Product[] }) {
  return (
    <table className="table table-striped table-hover">
      <thead>
        <tr>
          <th>Name</th>
          <th>Type</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {products.map((p) => (
          <ProductTableRow key={p.id} product={p} />
        ))}
      </tbody>
    </table>
  );
}

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [products, setProducts] = useState<Product[]>([]);

  const id = new URLSearchParams(location.search).get("id") ?? undefined;

  useEffect(() => {
    API.getAllProducts(id)
      .then((r) => {
        setLoading(false);
        setProducts(r);
      })
      .catch((e: unknown) => {
        navigate("/error", { state: { error: String(e) } });
      });
  }, [id, navigate]);

  const search = searchText.toLowerCase();
  const visibleProducts = search
    ? products.filter(
        (p) =>
          p.id.toLowerCase().includes(search) ||
          p.name.toLowerCase().includes(search) ||
          p.type.toLowerCase().includes(search),
      )
    : products;

  const onSearchTextChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  return (
    <Layout>
      <Heading text="Products" href="/" />
      <div className="form-group col-2">
        <label className="form-label" htmlFor="input-product-search">
          Search
        </label>
        <input
          id="input-product-search"
          className="form-input"
          type="text"
          value={searchText}
          onChange={onSearchTextChange}
        />
      </div>
      {loading ? (
        <div className="loading loading-lg centered" />
      ) : (
        <ProductTable products={visibleProducts} />
      )}
    </Layout>
  );
}

export default App;
