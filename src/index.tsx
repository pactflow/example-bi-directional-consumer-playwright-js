import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import App from "./App";
import ErrorPage from "./ErrorPage";
import ProductPage from "./ProductPage";
import "./index.css";

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element #root was not found in index.html");
}

createRoot(container).render(
  <BrowserRouter>
    <Routes>
      <Route path="/error" element={<ErrorPage />} />
      <Route path="/products/:id" element={<ProductPage />} />
      <Route path="/products" element={<App />} />
      <Route path="/" element={<App />} />
    </Routes>
  </BrowserRouter>,
);
