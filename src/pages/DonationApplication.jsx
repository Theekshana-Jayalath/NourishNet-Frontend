import React, { useEffect, useState } from "react";
import axios from "axios";
import { getToken, BASE_URL } from "../api.js";

// Must match backend allowed product IDs (see DonationFormModel.js)

const UNPROCESSED_PRODUCTS = [
  { productId: "UNP001", label: "Rice" },
  { productId: "UNP002", label: "Dhal" },
  { productId: "UNP003", label: "Milk Powder" },
  { productId: "UNP004", label: "Flour" },
  { productId: "UNP005", label: "Sugar" },
  { productId: "UNP006", label: "Salt" },
];

const PROCESSED_PRODUCTS = [
  { productId: "PRO001", label: "Vegetable Curry" },
  { productId: "PRO002", label: "Chicken Fried Rice" },
  { productId: "PRO003", label: "Egg Sandwich" },
  { productId: "PRO004", label: "Fish Curry" },
  { productId: "PRO005", label: "Dhal Curry (Cooked)" },
];

const DonationApplication = () => {
  const [loggedUser, setLoggedUser] = useState(null);

  const [formData, setFormData] = useState({
    items: [
      {
        productId: "",
        processingType: "Unprocessed",
        quantity: 1,
        unit: "Kg",
        expirationDate: "",
        StorageType: "Room Temperature",
      },
    ],
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setLoggedUser(parsedUser);
    }
  }, []);

  const getProductsByType = (processingType) => {
    return processingType === "Processed"
      ? PROCESSED_PRODUCTS
      : UNPROCESSED_PRODUCTS;
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const updatedItems = [...formData.items];

    updatedItems[index][name] =
      name === "quantity" ? Number(value) : value;

    if (name === "processingType") {
      updatedItems[index].productId = "";
    }

    setFormData({ ...formData, items: updatedItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          productId: "",
          processingType: "Unprocessed",
          quantity: 1,
          unit: "Kg",
          expirationDate: "",
          StorageType: "Room Temperature",
        },
      ],
    });
  };

  const removeItem = (index) => {
    if (formData.items.length === 1) return;

    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: updatedItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!loggedUser) {
      setError("No logged-in user found.");
      return;
    }

    if (loggedUser.role !== "donor") {
      setError("Only donors can submit donation applications.");
      return;
    }

    // validate product selection
    const invalidItem = formData.items.find(
      (it) => !it.productId || it.productId === ""
    );
    if (invalidItem) {
      setError("Please select a product for each item before submitting.");
      return;
    }

    try {
      const donorId = loggedUser._id || loggedUser.id;

      if (!donorId) {
        setError("Unable to determine donor id from logged user.");
        return;
      }

      const payload = {
        donorId,
        items: formData.items.map((item) => ({
          productId: item.productId,
          processingType: item.processingType,
          quantity: Number(item.quantity),
          unit: item.unit,
          expirationDate: item.expirationDate || null,
          StorageType: item.StorageType,
        })),
      };

      const response = await axios.post(
        `${BASE_URL}/donationForms`,
        payload,
        {
          headers: {
            ...(getToken()
              ? { Authorization: `Bearer ${getToken()}` }
              : {}),
          },
        }
      );

      console.log("POST to", `${BASE_URL}/donationForms`, payload);

      setMessage("Donation application submitted successfully.");
      setError("");

      setFormData({
        items: [
          {
            productId: "",
            processingType: "Unprocessed",
            quantity: 1,
            unit: "Kg",
            expirationDate: "",
            StorageType: "Room Temperature",
          },
        ],
      });

      console.log(response.data);
    } catch (err) {
      console.error("Donation submit error", err);
      console.error("Server response:", err.response?.data);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to submit donation application."
      );
      setMessage("");
    }
  };

  return <div>/* UI remains same */</div>;
};

export default DonationApplication;