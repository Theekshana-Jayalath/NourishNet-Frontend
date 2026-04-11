import React, { useEffect, useState } from "react";
import axios from "axios";
<<<<<<< HEAD
import { getToken, getUser, BASE_URL } from "../api";
=======
<<<<<<< HEAD
import { getToken, getUser, BASE_URL } from "../api";
=======
import { getToken, BASE_URL } from "../api.js";

// Must match backend allowed product IDs (see DonationFormModel.js)
>>>>>>> e4f7935f24c9444ec59f6aba385858ca0fd830ed
>>>>>>> 8042ee97fabd67ba22d1d59bef88ac25d85d881e

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
<<<<<<< HEAD
    const u = getUser();
    if (u && Object.keys(u).length) setLoggedUser(u);
=======
<<<<<<< HEAD
    const u = getUser();
    if (u && Object.keys(u).length) setLoggedUser(u);
=======
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setLoggedUser(parsedUser);
    }
>>>>>>> e4f7935f24c9444ec59f6aba385858ca0fd830ed
>>>>>>> 8042ee97fabd67ba22d1d59bef88ac25d85d881e
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

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 8042ee97fabd67ba22d1d59bef88ac25d85d881e
    try {
      // derive donor id from logged user persisted by the backend at login
      const donorId =
        loggedUser?._id || loggedUser?.id || loggedUser?.userId || null;
<<<<<<< HEAD
=======
=======
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
>>>>>>> e4f7935f24c9444ec59f6aba385858ca0fd830ed
>>>>>>> 8042ee97fabd67ba22d1d59bef88ac25d85d881e

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

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 8042ee97fabd67ba22d1d59bef88ac25d85d881e
      const token = getToken();

      const response = await axios.post(`${BASE_URL}/donationForms`, payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
<<<<<<< HEAD
=======
=======
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
>>>>>>> e4f7935f24c9444ec59f6aba385858ca0fd830ed
>>>>>>> 8042ee97fabd67ba22d1d59bef88ac25d85d881e

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
<<<<<<< HEAD
      setError(
        err.response?.data?.message || "Failed to submit donation application."
=======
<<<<<<< HEAD
      setError(
        err.response?.data?.message || "Failed to submit donation application."
=======
      console.error("Donation submit error", err);
      console.error("Server response:", err.response?.data);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to submit donation application."
>>>>>>> e4f7935f24c9444ec59f6aba385858ca0fd830ed
>>>>>>> 8042ee97fabd67ba22d1d59bef88ac25d85d881e
      );
      setMessage("");
    }
  };

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 8042ee97fabd67ba22d1d59bef88ac25d85d881e
  return (
    <div style={styles.page}>
      <div style={styles.backgroundGlowOne}></div>
      <div style={styles.backgroundGlowTwo}></div>

      <div style={styles.container}>
        <div style={styles.headerCard}>
      
          <h1 style={styles.heading}>Donation Application</h1>
          
        </div>

  {/* Donor information intentionally hidden */}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.subHeading}>Donation Items</h2>
            
            </div>
          </div>

          {formData.items.map((item, index) => (
            <div key={index} style={styles.itemCard}>
              <div style={styles.itemCardTop}>
                <div>
                  <p style={styles.itemNumber}>Item {index + 1}</p>
                  <p style={styles.itemHint}>
                    Fill in the product and storage details
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  style={{
                    ...styles.removeButton,
                    opacity: formData.items.length === 1 ? 0.5 : 1,
                    cursor: formData.items.length === 1 ? "not-allowed" : "pointer",
                  }}
                >
                  Remove
                </button>
              </div>

              <div style={styles.row}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Processing Type</label>
                  <select
                    name="processingType"
                    value={item.processingType}
                    onChange={(e) => handleItemChange(index, e)}
                    style={styles.input}
                  >
                    <option value="Unprocessed">Unprocessed</option>
                    <option value="Processed">Processed</option>
                  </select>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Product</label>
                  <select
                    name="productId"
                    value={item.productId}
                    onChange={(e) => handleItemChange(index, e)}
                    required
                    style={styles.input}
                  >
                    <option value="">Select Product</option>
                    {getProductsByType(item.processingType).map((product) => (
                      <option key={product.productId} value={product.productId}>
                        {product.label} ({product.productId})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={styles.row}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, e)}
                    required
                    style={styles.input}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Unit</label>
                  <select
                    name="unit"
                    value={item.unit}
                    onChange={(e) => handleItemChange(index, e)}
                    style={styles.input}
                  >
                    <option value="Kg">Kg</option>
                    <option value="g">g</option>
                    <option value="L">L</option>
                    <option value="ml">ml</option>
                    <option value="Packets">Packets</option>
                    <option value="Pieces">Pieces</option>
                  </select>
                </div>
              </div>

              <div style={styles.row}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Expiration Date</label>
                  <input
                    type="date"
                    name="expirationDate"
                    value={item.expirationDate}
                    onChange={(e) => handleItemChange(index, e)}
                    style={styles.input}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Storage Type</label>
                  <select
                    name="StorageType"
                    value={item.StorageType}
                    onChange={(e) => handleItemChange(index, e)}
                    style={styles.input}
                  >
                    <option value="Room Temperature">Room Temperature</option>
                    <option value="Refrigerated">Refrigerated</option>
                    <option value="Frozen">Frozen</option>
                    <option value="Cool Place">Cool Place</option>
                  </select>
                </div>
              </div>
            </div>
          ))}

          <div style={styles.actionRow}>
            <button type="button" onClick={addItem} style={styles.addButton}>
              + Add Another Item
            </button>

            <button type="submit" style={styles.submitButton}>
              Submit Application
            </button>
          </div>

          {message && <div style={styles.success}>{message}</div>}
          {error && <div style={styles.error}>{error}</div>}
        </form>
      </div>
    </div>
  );
};

export default DonationApplication;

const styles = {
  page: {
    minHeight: "100vh",
    position: "relative",
    overflow: "hidden",
    background:
      "linear-gradient(135deg, #002a29 0%, #004b49 45%, #317873 100%)",
    padding: "40px 16px",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },

  backgroundGlowOne: {
    position: "absolute",
    top: "-120px",
    left: "-80px",
    width: "280px",
    height: "280px",
    borderRadius: "50%",
    background: "rgba(150, 222, 209, 0.18)",
    filter: "blur(30px)",
  },

  backgroundGlowTwo: {
    position: "absolute",
    bottom: "-100px",
    right: "-60px",
    width: "300px",
    height: "300px",
    borderRadius: "50%",
    background: "rgba(102, 173, 164, 0.2)",
    filter: "blur(35px)",
  },

  container: {
    position: "relative",
    zIndex: 2,
    maxWidth: "980px",
    margin: "0 auto",
    background: "rgba(255,255,255,0.9)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    borderRadius: "28px",
    padding: "32px",
    boxShadow: "0 20px 60px rgba(0, 42, 41, 0.25)",
    border: "1px solid rgba(150, 222, 209, 0.25)",
  },

  headerCard: {
    textAlign: "center",
    marginBottom: "28px",
    padding: "10px 0 6px",
  },

  badge: {
    display: "inline-block",
    background: "linear-gradient(135deg, #96ded1, #66ada4)",
    color: "#002a29",
    padding: "8px 16px",
    borderRadius: "999px",
    fontWeight: "700",
    fontSize: "13px",
    letterSpacing: "0.4px",
    marginBottom: "14px",
    boxShadow: "0 8px 20px rgba(49, 120, 115, 0.18)",
  },

  heading: {
    fontSize: "36px",
    fontWeight: "800",
    margin: "0 0 10px",
    color: "#002a29",
    letterSpacing: "-0.5px",
  },

  subText: {
    textAlign: "center",
    color: "#317873",
    fontSize: "15px",
    maxWidth: "620px",
    margin: "0 auto",
    lineHeight: "1.6",
  },

  userBox: {
    background: "linear-gradient(135deg, #f7fffd 0%, #ecfdf8 100%)",
    border: "1px solid rgba(102, 173, 164, 0.35)",
    borderRadius: "22px",
    padding: "22px",
    marginBottom: "28px",
    boxShadow: "0 10px 30px rgba(0, 75, 73, 0.08)",
  },

  userTop: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "18px",
    flexWrap: "wrap",
  },

  avatarCircle: {
    width: "54px",
    height: "54px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #317873, #004b49)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    fontWeight: "800",
    boxShadow: "0 10px 24px rgba(0, 75, 73, 0.22)",
  },

  userTitle: {
    margin: 0,
    fontSize: "20px",
    color: "#002a29",
    fontWeight: "700",
  },

  userSub: {
    margin: "4px 0 0",
    color: "#317873",
    fontSize: "14px",
  },

  userGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "14px",
  },

  infoCard: {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "14px 16px",
    border: "1px solid rgba(150, 222, 209, 0.35)",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  infoLabel: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#317873",
    textTransform: "uppercase",
    letterSpacing: "0.6px",
  },

  infoValue: {
    fontSize: "15px",
    color: "#002a29",
    fontWeight: "600",
    wordBreak: "break-word",
  },

  infoValueSmall: {
    fontSize: "13px",
    color: "#004b49",
    fontWeight: "600",
    wordBreak: "break-word",
  },

  roleBadge: {
    display: "inline-block",
    alignSelf: "flex-start",
    background: "#96ded1",
    color: "#002a29",
    padding: "6px 12px",
    borderRadius: "999px",
    fontWeight: "700",
    fontSize: "13px",
    textTransform: "capitalize",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "22px",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
  },

  subHeading: {
    color: "#002a29",
    margin: 0,
    fontSize: "24px",
    fontWeight: "800",
  },

  sectionText: {
    margin: "6px 0 0",
    color: "#317873",
    fontSize: "14px",
  },

  itemCard: {
    border: "1px solid rgba(102, 173, 164, 0.28)",
    borderRadius: "22px",
    padding: "22px",
    background: "linear-gradient(180deg, #ffffff 0%, #f7fffd 100%)",
    boxShadow: "0 14px 35px rgba(0, 75, 73, 0.08)",
  },

  itemCardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    marginBottom: "18px",
    flexWrap: "wrap",
  },

  itemNumber: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "800",
    color: "#004b49",
  },

  itemHint: {
    margin: "4px 0 0",
    color: "#66ada4",
    fontSize: "13px",
  },

  row: {
    display: "flex",
    gap: "18px",
    flexWrap: "wrap",
    marginBottom: "16px",
  },

  inputGroup: {
    flex: 1,
    minWidth: "220px",
    display: "flex",
    flexDirection: "column",
  },

  label: {
    marginBottom: "8px",
    fontWeight: "700",
    color: "#004b49",
    fontSize: "14px",
  },

  input: {
    padding: "14px 16px",
    borderRadius: "14px",
    border: "1px solid rgba(102, 173, 164, 0.45)",
    fontSize: "15px",
    outline: "none",
    background: "#ffffff",
    color: "#002a29",
    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.04)",
  },

  actionRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "14px",
    flexWrap: "wrap",
    marginTop: "4px",
  },

  addButton: {
    padding: "14px 22px",
    border: "none",
    borderRadius: "14px",
    background: "linear-gradient(135deg, #96ded1, #66ada4)",
    color: "#002a29",
    fontWeight: "800",
    fontSize: "15px",
    cursor: "pointer",
    boxShadow: "0 12px 24px rgba(102, 173, 164, 0.25)",
  },

  submitButton: {
    padding: "14px 24px",
    border: "none",
    borderRadius: "14px",
    background: "linear-gradient(135deg, #004b49, #002a29)",
    color: "#ffffff",
    fontWeight: "800",
    fontSize: "15px",
    cursor: "pointer",
    boxShadow: "0 14px 28px rgba(0, 42, 41, 0.28)",
  },

  removeButton: {
    padding: "10px 16px",
    border: "1px solid rgba(0, 75, 73, 0.12)",
    borderRadius: "12px",
    background: "#fff5f5",
    color: "#c62828",
    fontWeight: "700",
    fontSize: "14px",
  },

  success: {
    background: "#ecfdf5",
    color: "#065f46",
    border: "1px solid #a7f3d0",
    padding: "14px 16px",
    borderRadius: "14px",
    fontWeight: "700",
    textAlign: "center",
  },

  error: {
    background: "#fef2f2",
    color: "#b91c1c",
    border: "1px solid #fecaca",
    padding: "14px 16px",
    borderRadius: "14px",
    fontWeight: "700",
    textAlign: "center",
  },
<<<<<<< HEAD
};
=======
};
=======
  return <div>/* UI remains same */</div>;
};

export default DonationApplication;
>>>>>>> e4f7935f24c9444ec59f6aba385858ca0fd830ed
>>>>>>> 8042ee97fabd67ba22d1d59bef88ac25d85d881e
