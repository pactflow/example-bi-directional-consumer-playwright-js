import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import "spectre.css/dist/spectre.min.css";
import "spectre.css/dist/spectre-icons.min.css";
import "spectre.css/dist/spectre-exp.min.css";
import { api } from "./api";
import Heading from "./Heading";
import Layout from "./Layout";
import type { ProductData } from "./product";

function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Partial<ProductData>>({ id });

  useEffect(() => {
    if (!id) {
      return;
    }
    api
      .getProduct(id)
      .then((r) => {
        setLoading(false);
        setProduct(r);
      })
      .catch((e: unknown) => {
        console.error(`failed to load product ${id}`, e);
        navigate("/error", { state: { error: String(e) } });
      });
  }, [id, navigate]);

  return (
    <Layout>
      <Heading text="Products" href="/" />
      {loading ? (
        <div
          style={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          className="loading loading-lg"
        />
      ) : (
        <div>
          <p className="product-id">ID: {product.id}</p>
          <p className="product-name">Name: {product.name}</p>
          <p className="product-type">Type: {product.type}</p>
        </div>
      )}
    </Layout>
  );
}

export default ProductPage;
