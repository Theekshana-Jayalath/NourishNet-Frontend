import React, { useState } from "react";
import { Search, PlusCircle } from "lucide-react";

const sampleItems = [
  {
    id: 1,
    name: "Rice",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c",
    quantity: 50,
    unit: "kg",
    type: "Unprocessed",
    expireDate: "2026-05-01",
    description: "White raw rice good for families",
  },
  {
    id: 2,
    name: "Canned Beans",
    image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d",
    quantity: 100,
    unit: "pcs",
    type: "Processed",
    expireDate: "2026-04-15",
    description: "Ready to eat canned beans",
  },
  {
    id: 3,
    name: "Carrots",
    image: "https://images.unsplash.com/photo-1582515073490-dc0e9f3f97d8",
    quantity: 30,
    unit: "kg",
    type: "Unprocessed",
    expireDate: "2026-04-10",
    description: "Fresh organic carrots",
  },
];

const FoodItemsBoard = () => {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [expireDate, setExpireDate] = useState("");

  const filteredItems = sampleItems.filter((item) => {
    const matchSearch = item.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchType =
      filterType === "All" || item.type === filterType;

    const matchDate =
      !expireDate || item.expireDate <= expireDate;

    return matchSearch && matchType && matchDate;
  });

  return (
    <div className="p-6 bg-teal-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-teal-900">
          Available Food Items
        </h1>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 text-teal-500" />
          <input
            type="text"
            placeholder="Search items..."
            className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <select
          className="border rounded-lg px-4 py-2"
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Processed">Processed</option>
          <option value="Unprocessed">Unprocessed</option>
        </select>

        <input
          type="date"
          className="border rounded-lg px-4 py-2"
          onChange={(e) => setExpireDate(e.target.value)}
        />
      </div>

      {/* Items Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl shadow-md overflow-hidden border hover:shadow-lg transition"
          >
            <img
              src={item.image}
              alt={item.name}
              className="h-40 w-full object-cover"
            />

            <div className="p-4">
              <h2 className="text-lg font-semibold text-teal-900">
                {item.name}
              </h2>

              <p className="text-sm text-gray-500">
                {item.description}
              </p>

              <div className="mt-3 space-y-1 text-sm">
                <p>
                  <span className="font-semibold">
                    Quantity:
                  </span>{" "}
                  {item.quantity} {item.unit}
                </p>

                <p>
                  <span className="font-semibold">
                    Type:
                  </span>{" "}
                  <span
                    className={`px-2 py-1 rounded text-white text-xs ${
                      item.type === "Processed"
                        ? "bg-teal-700"
                        : "bg-teal-500"
                    }`}
                  >
                    {item.type}
                  </span>
                </p>

                <p>
                  <span className="font-semibold">
                    Expire:
                  </span>{" "}
                  {item.expireDate}
                </p>
              </div>

              <button className="mt-4 w-full flex items-center justify-center gap-2 bg-teal-700 hover:bg-teal-900 text-white py-2 rounded-lg">
                <PlusCircle size={18} />
                Add / Select
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FoodItemsBoard;