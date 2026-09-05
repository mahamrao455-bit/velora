const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5000;

const productsPath = path.join(__dirname, "products.json");

app.use(cors());
app.use(express.json());

function readProducts() {
  try {
    const data = fs.readFileSync(productsPath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Unable to read products.json:", error);
    return [];
  }
}

function saveProducts(products) {
  fs.writeFileSync(
    productsPath,
    JSON.stringify(products, null, 2),
    "utf8"
  );
}

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Velora API is running ✦"
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    server: "running",
    database: "not configured",
    products: readProducts().length
  });
});

app.get("/api/products", (req, res) => {
  const products = readProducts();

  res.json({
    success: true,
    count: products.length,
    products
  });
});

app.get("/api/products/:id", (req, res) => {
  const products = readProducts();

  const product = products.find(
    (item) => item.id === Number(req.params.id)
  );

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found"
    });
  }

  res.json({
    success: true,
    product
  });
});

app.post("/api/products", (req, res) => {
  const products = readProducts();

  const newProduct = {
    id: products.length
      ? Math.max(...products.map((product) => product.id)) + 1
      : 1,
    ...req.body
  };

  products.push(newProduct);
  saveProducts(products);

  res.status(201).json({
    success: true,
    message: "Product created successfully",
    product: newProduct
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

app.listen(PORT, () => {
  console.log("");
  console.log("✦ Velora API running on http://localhost:5000");
  console.log("✦ Products API: http://localhost:5000/api/products");
  console.log("");
});