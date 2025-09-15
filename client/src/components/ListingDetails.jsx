import { useEffect, useState } from "react";
import "../styles/ListingDetails.scss";
import { useNavigate, useParams } from "react-router-dom";
import { facilities } from "../data";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { DateRange } from "react-date-range";
import Loader from "../components/Loader";
import Navbar from "../components/Navbar";
import { useSelector } from "react-redux";
import Footer from "../components/Footer";
import { API_BASE_URL } from "../config";

const ListingDetails = () => {
  const [loading, setLoading] = useState(true);
  const { listingId } = useParams();
  const [listing, setListing] = useState(null);

  const getListingDetails = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/properties/${listingId}`,
        { method: "GET" }
      );
      const data = await response.json();
      setListing(data);
      setLoading(false);
    } catch (err) {
      console.log("Fetch Listing Details Failed", err.message);
    }
  };

  useEffect(() => {
    getListingDetails();
  }, []);

  // Debugging logs
  console.log("Listing data:", listing);
  console.log("Host profileImagePath:", listing?.creator?.profileImagePath);

  /* BOOKING CALENDAR */
  const [dateRange, setDateRange] = useState([
    { startDate: new Date(), endDate: new Date(), key: "selection" },
  ]);

  const handleSelect = (ranges) => {
    setDateRange([ranges.selection]);
  };

  const start = new Date(dateRange[0].startDate);
  const end = new Date(dateRange[0].endDate);
  const dayCount = Math.max(
    1,
    Math.round((end - start) / (1000 * 60 * 60 * 24))
  );

  /* SUBMIT BOOKING */
  const customerId = useSelector((state) => state?.user?._id);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      const bookingForm = {
        customerId,
        listingId,
        hostId: listing?.creator?._id,
        startDate: dateRange[0].startDate.toDateString(),
        endDate: dateRange[0].endDate.toDateString(),
        totalPrice: listing?.price * dayCount,
      };

      const response = await fetch(`${API_BASE_URL}/bookings/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingForm),
      });

      if (response.ok) {
        navigate(`/${customerId}/trips`);
      }
    } catch (err) {
      console.log("Submit Booking Failed.", err.message);
    }
  };

  if (loading) return <Loader />;

  // Safe image paths
  const hostImage = "/assets/pp.png";

  return (
    <>
      <Navbar />

      <div className="listing-details">
        <div className="title">
          <h1>{listing?.title || "Listing Title"}</h1>
        </div>

        <div className="photos">
          {listing?.listingPhotoPaths?.length > 0 ? (
            listing.listingPhotoPaths.map((item) => {
              const src =
                typeof item === "string" && item.length > 0
                  ? `${API_BASE_URL}/${item.replace("public", "")}`
                  : "/assets/slide.png";
              return (
                <img
                  key={item || Math.random()}
                  src={src}
                  alt="listing photo"
                />
              );
            })
          ) : (
            <img src="/assets/slide.png" alt="listing photo" />
          )}
        </div>

        <h2>
          {listing?.type || ""} in {listing?.city || ""},{" "}
          {listing?.province || ""}, {listing?.country || ""}
        </h2>
        <p>
          {listing?.guestCount || 0} guests - {listing?.bedroomCount || 0}{" "}
          bedroom(s) - {listing?.bedCount || 0} bed(s) -{" "}
          {listing?.bathroomCount || 0} bathroom(s)
        </p>
        <hr />

        <div className="profile">
          <img src={hostImage} alt="host" />
          <h3>
            Hosted by {listing?.creator?.firstName || "Unknown"}{" "}
            {listing?.creator?.lastName || ""}
          </h3>
        </div>
        <hr />

        <h3>Description</h3>
        <p>{listing?.description || "No description available."}</p>
        <hr />

        <h3>{listing?.highlight || ""}</h3>
        <p>{listing?.highlightDesc || ""}</p>
        <hr />

        <div className="booking">
          <div>
            <h2>What this place offers?</h2>
            <div className="amenities">
              {listing?.amenities?.[0]?.split(",").length > 0 ? (
                listing.amenities[0].split(",").map((item) => (
                  <div className="facility" key={item}>
                    <div className="facility_icon">
                      {facilities.find((f) => f.name === item)?.icon}
                    </div>
                    <p>{item}</p>
                  </div>
                ))
              ) : (
                <p>No amenities listed</p>
              )}
            </div>
          </div>

          <div>
            <h2>How long do you want to stay?</h2>
            <div className="date-range-calendar">
              <DateRange ranges={dateRange} onChange={handleSelect} />
              <h2>
                ${listing?.price || 0} x {dayCount}{" "}
                {dayCount > 1 ? "nights" : "night"}
              </h2>
              <h2>Total price: ${listing?.price * dayCount || 0}</h2>
              <p>Start Date: {dateRange[0].startDate.toDateString()}</p>
              <p>End Date: {dateRange[0].endDate.toDateString()}</p>

              <button className="button" type="submit" onClick={handleSubmit}>
                BOOKING
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ListingDetails;
