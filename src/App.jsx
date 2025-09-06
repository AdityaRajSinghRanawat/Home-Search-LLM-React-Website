import { useState } from "react";

function App() {
  const [searchInput, setSearchInput] = useState("");
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    try {
      setError("");
      setLoading(true);
      console.log("processing search...");
      console.log("Search Input:-", searchInput);

      const backendBase = import.meta.env.VITE_BACKEND_URL;
      const url = `${backendBase}/api/parse-properties`;

      const formData = { post: searchInput };

      const responseData = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const parsedData = await responseData.json();
      console.log("parsedData:-", parsedData);
      // Guard: ensure array
      setProperties(Array.isArray(parsedData) ? parsedData : []);
    } catch (err) {
      console.error("Error while fetching properties:", err);
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="w-full min-h-screen flex flex-col justify-start items-center p-8">
        <div className="max-w-3xl w-full">
          <h1 className="text-4xl mb-6 font-bold text-center">
            Search for property in Seattle
          </h1>

          <textarea
            className="p-3 border rounded-2xl w-full"
            name="inputName"
            id="inputId"
            placeholder="Example: Looking for 3 bedroom house in Seattle under $2,000,000 near a school and station"
            rows="4"
            onChange={(e) => setSearchInput(e.target.value)}
            value={searchInput}
          />

          <div className="flex items-center gap-4 mt-4">
            <button
              className="text-lg font-semibold px-4 py-3 bg-sky-500 rounded-xl hover:bg-sky-600 transition-colors"
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? "Searching..." : "Search"}
            </button>
            {error && <span className="text-red-500">{error}</span>}
          </div>

          <div className="mt-8">
            {properties.length === 0 ? (
              <p className="text-gray-500">
                No properties yet. Search to fetch them.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {properties.map((p, idx) => (
                  <div key={p?.zpid || idx} className="p-4 border rounded-lg">
                    <h3 className="font-semibold">
                      {p?.streetAddress}, {p?.city}, {p?.state} {p?.zipcode}
                    </h3>
                    <p>Price: ${p?.price?.toLocaleString() || "N/A"}</p>
                    <p>Beds: {p?.bedrooms || "N/A"}</p>
                    <p>Baths: {p?.bathrooms || "N/A"}</p>
                    <p>Type: {p?.homeType || "N/A"}</p>
                    {p?.imgSrc && (
                      <img
                        src={p.imgSrc}
                        alt="property"
                        className="w-full h-48 object-cover mt-2 rounded"
                      />
                    )}
                    {p?.zpid && (
                      <a
                        className="text-sky-600"
                        href={`https://www.zillow.com/homedetails/${p.zpid}_zpid/`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View on Zillow
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
