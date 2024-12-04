import React, { useState } from "react";
import axios from "axios";
import "./css/AddProduct.css"; // Estilos para o componente

const AddProduct = () => {
  const [productData, setProductData] = useState({
    photo: null,
    name: "",
    quantity: "",
    color: "",
    size: "",
    wholesalePrice: "",
    retailPrice: "",
    reference: "",
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false); // Controle do modal

  // Função para lidar com mudanças nos campos de texto
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData({ ...productData, [name]: value });
  };

  // Função para lidar com mudanças no campo de arquivo
  const handleFileChange = (e) => {
    setProductData({ ...productData, photo: e.target.files[0] });
  };

  // Função para validar o formulário
  const validateForm = () => {
    const errors = {};
    if (!productData.name) errors.name = "Nome do produto é obrigatório.";
    if (!productData.quantity || Number(productData.quantity) <= 0)
      errors.quantity = "A quantidade deve ser maior que 0.";
    if (
      !productData.wholesalePrice ||
      isNaN(Number(productData.wholesalePrice)) ||
      Number(productData.wholesalePrice) <= 0
    )
      errors.wholesalePrice =
        "Preço de atacado é obrigatório e deve ser um número válido.";
    if (
      !productData.retailPrice ||
      isNaN(Number(productData.retailPrice)) ||
      Number(productData.retailPrice) <= 0
    )
      errors.retailPrice =
        "Preço de varejo é obrigatório e deve ser um número válido.";
    if (!productData.reference) errors.reference = "Referência é obrigatória.";
    if (!productData.photo) errors.photo = "A foto do produto é obrigatória.";
    return errors;
  };

  // Função para enviar o formulário
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    const formData = new FormData();
    formData.append("photo", productData.photo);
    formData.append("name", productData.name);
    formData.append("quantity", productData.quantity);
    formData.append("color", productData.color);
    formData.append("size", productData.size);
    formData.append(
      "wholesale_price",
      Number(productData.wholesalePrice).toFixed(2)
    ); // Garantindo formato decimal
    formData.append(
      "retail_price",
      Number(productData.retailPrice).toFixed(2)
    ); // Garantindo formato decimal
    formData.append("reference", productData.reference);

    try {
      setLoading(true);
      const token = localStorage.getItem("access_token"); // Pega o token armazenado no localStorage

      const response = await axios.post(
        "http://localhost:8000/products/add/",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Envia o token no cabeçalho
            "Content-Type": "multipart/form-data", // Define o tipo do conteúdo
          },
        }
      );

      if (response.status === 201) {
        setSuccessMessage("Produto adicionado com sucesso!");
        setErrorMessage(""); // Limpa a mensagem de erro se o produto for adicionado com sucesso
        setProductData({
          photo: null,
          name: "",
          quantity: "",
          color: "",
          size: "",
          wholesalePrice: "",
          retailPrice: "",
          reference: "",
        });
        setShowModal(true); // Exibe o modal de sucesso
        setTimeout(() => setShowModal(false), 3000); // Fecha o modal após 3 segundos
      } else {
        setErrorMessage("Erro ao adicionar o produto. Tente novamente.");
        setSuccessMessage(""); // Limpa qualquer mensagem de sucesso, caso haja erro
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setErrorMessage(
          "Sessão expirada. Faça login novamente para continuar."
        );
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      } else if (err.response?.status === 400) {
        setErrorMessage("Dados inválidos. Verifique as informações.");
      } else {
        setErrorMessage("Erro ao conectar ao servidor. Tente novamente.");
      }
      setSuccessMessage(""); // Limpa qualquer mensagem de sucesso, caso haja erro
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product-container">
      <h2>Adicionar Novo Produto</h2>

      {successMessage && <div className="success-message">{successMessage}</div>}
      {errorMessage && <div className="error-message">{errorMessage}</div>}

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <span
              className="close"
              onClick={() => setShowModal(false)}
            >
              &times;
            </span>
            <p>{successMessage}</p>
          </div>
        </div>
      )}

      <form className="add-product-form" onSubmit={handleSubmit}>
        <label htmlFor="photo">Foto do Produto:</label>
        <div className="avatar-upload">
          <input
            id="photo"
            type="file"
            name="photo"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          <div
            className="avatar-preview"
            onClick={() => document.getElementById("photo").click()}
          >
            {productData.photo ? (
              <img
                src={URL.createObjectURL(productData.photo)}
                alt="Foto do produto"
                className="avatar-image"
              />
            ) : (
              <span className="avatar-placeholder">+ Adicionar Foto</span>
            )}
          </div>
        </div>
        {errors.photo && <div className="error-message">{errors.photo}</div>}

        <label htmlFor="name">Nome do Produto:</label>
        <input
          id="name"
          type="text"
          name="name"
          value={productData.name}
          onChange={handleChange}
          placeholder="Ex: Camiseta Masculina"
          className={errors.name ? "error" : ""}
        />
        {errors.name && <div className="error-message">{errors.name}</div>}

        <label htmlFor="quantity">Quantidade Disponível:</label>
        <input
          id="quantity"
          type="number"
          name="quantity"
          value={productData.quantity}
          onChange={handleChange}
          placeholder="Ex: 100"
          className={errors.quantity ? "error" : ""}
        />
        {errors.quantity && (
          <div className="error-message">{errors.quantity}</div>
        )}

        <label htmlFor="color">Cor:</label>
        <input
          id="color"
          type="text"
          name="color"
          value={productData.color}
          onChange={handleChange}
          placeholder="Ex: Azul"
        />

        <label htmlFor="size">Tamanho:</label>
        <input
          id="size"
          type="text"
          name="size"
          value={productData.size}
          onChange={handleChange}
          placeholder="Ex: M, G, P"
        />

        <label htmlFor="wholesalePrice">Preço de Atacado:</label>
        <input
          id="wholesalePrice"
          type="text"
          name="wholesalePrice"
          value={productData.wholesalePrice}
          onChange={handleChange}
          placeholder="Ex: 199.99"
          className={errors.wholesalePrice ? "error" : ""}
        />
        {errors.wholesalePrice && (
          <div className="error-message">{errors.wholesalePrice}</div>
        )}

        <label htmlFor="retailPrice">Preço de Varejo:</label>
        <input
          id="retailPrice"
          type="text"
          name="retailPrice"
          value={productData.retailPrice}
          onChange={handleChange}
          placeholder="Ex: 249.99"
          className={errors.retailPrice ? "error" : ""}
        />
        {errors.retailPrice && (
          <div className="error-message">{errors.retailPrice}</div>
        )}

        <label htmlFor="reference">Referência (Código do Produto):</label>
        <input
          id="reference"
          type="text"
          name="reference"
          value={productData.reference}
          onChange={handleChange}
          placeholder="Ex: 12345"
          className={errors.reference ? "error" : ""}
        />
        {errors.reference && (
          <div className="error-message">{errors.reference}</div>
        )}

        <button type="submit" className="add-product-button" disabled={loading}>
          {loading ? "Adicionando..." : "Adicionar Produto"}
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
