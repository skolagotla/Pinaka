"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { formatPhoneNumber, formatPostalCode, formatZipCode, isValidPhoneNumber, isValidPostalCode, isValidZipCode } from '@/lib/utils/formatters';
import { ALL_TIMEZONES, DEFAULT_TIMEZONE, getTimezoneLabel } from '@/lib/constants/timezones';
import { useCountryRegion } from '@/lib/hooks';
import { ValidationHelpers } from '@/lib/utils/unified-validation';

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

const CA_PROVINCES = [
  "AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT"
];

export default function SettingsForm({ landlord }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [country, setCountry] = useState(landlord.country || "CA");
  const countryRegion = useCountryRegion(country);
  
  const [formData, setFormData] = useState({
    firstName: landlord.firstName || "",
    middleName: landlord.middleName || "",
    lastName: landlord.lastName || "",
    email: landlord.email || "",
    phone: landlord.phone || "",
    addressLine1: landlord.addressLine1 || "",
    city: landlord.city || "",
    country: landlord.country || "CA",
    provinceState: landlord.provinceState || "",
    postalZip: landlord.postalZip || "",
    timezone: landlord.timezone || DEFAULT_TIMEZONE,
  });

  function handlePhoneChange(e) {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData({ ...formData, phone: formatted });
  }

  function handlePostalZipChange(e) {
    const value = e.target.value;
    const formatted = formData.country === "CA" ? formatPostalCode(value) : formatZipCode(value);
    setFormData({ ...formData, postalZip: formatted });
  }

  function handleCountryChange(e) {
    const newCountry = e.target.value;
    setCountry(newCountry);
    countryRegion.setCountry(newCountry);
    setFormData({
      ...formData,
      country: newCountry,
      provinceState: "",
      postalZip: "",
    });
  }

  // Validation
  const isValid = useMemo(() => {
    const hasValidPhone = isValidPhoneNumber(formData.phone);
    
    const hasValidPostalZip = formData.country === "CA"
      ? isValidPostalCode(formData.postalZip)
      : isValidZipCode(formData.postalZip);
    
    return (
      formData.firstName.trim() &&
      formData.lastName.trim() &&
      formData.email.trim() &&
      hasValidPhone &&
      formData.addressLine1.trim() &&
      formData.city.trim() &&
      formData.provinceState.trim() &&
      hasValidPostalZip
    );
  }, [formData]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isValid || loading) return;
    
    setLoading(true);
    try {
      const { v2Api } = await import('@/lib/api/v2-client');
      
      // Get landlord ID from props or find it via user
      let landlordId = landlord?.id;
      if (!landlordId) {
        // Try to get from user context
        const { useV2Auth } = await import('@/lib/hooks/useV2Auth');
        // Note: This won't work in a non-hook context, so we need landlord.id from props
        throw new Error('Landlord ID is required');
      }
      
      await v2Api.updateLandlord(landlordId, {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address_line1: formData.addressLine1,
        city: formData.city,
        state: formData.provinceState,
        postal_code: formData.postalZip,
        country: formData.country,
      });
      
      // Redirect to dashboard after successful update
      router.push("/dashboard");
    } catch (error) {
      console.error('[Settings] Error:', error);
      alert(error.message || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  }

  const regionLabel = formData.country === "CA" ? "Province" : "State";
  const regionOptions = formData.country === "CA" ? CA_PROVINCES : US_STATES;
  const postalLabel = formData.country === "CA" ? "Postal Code" : "ZIP Code";
  const postalPlaceholder = formData.country === "CA" ? "A1A 1A1" : "12345";

  return (
    <div className="card" style={{ maxWidth: 600, margin: "40px auto" }}>
      <h1 className="title">Settings</h1>
      <p style={{ textAlign: "center", color: "#5f6368", marginBottom: 24, fontSize: 14 }}>
        Update your profile information
      </p>
      <form onSubmit={handleSubmit}>
        <div className="inputs">
          <input
            className="input"
            type="text"
            placeholder="First Name *"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          />
          <input
            className="input"
            type="text"
            placeholder="Middle Name (Optional)"
            value={formData.middleName}
            onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
          />
          <input
            className="input"
            type="text"
            placeholder="Last Name *"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          />
          <input
            className="input"
            type="email"
            placeholder="Email *"
            value={formData.email}
            disabled
            style={{ backgroundColor: "#f5f5f5", cursor: "not-allowed" }}
          />
          <input
            className="input"
            type="tel"
            placeholder="Phone Number * (XXX) XXX-XXXX"
            value={formData.phone}
            onChange={handlePhoneChange}
            maxLength={14}
          />
          
          <label className="muted" style={{ marginTop: 16, marginBottom: 4 }}>Country *</label>
          <select
            className="input"
            value={formData.country}
            onChange={handleCountryChange}
          >
            <option value="CA">Canada</option>
            <option value="US">United States</option>
          </select>
          
          <input
            className="input"
            type="text"
            placeholder="Address *"
            value={formData.addressLine1}
            onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
          />
          <input
            className="input"
            type="text"
            placeholder="City *"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          />
          
          <label className="muted" style={{ marginTop: 8, marginBottom: 4 }}>{regionLabel} *</label>
          <select
            className="input"
            value={formData.provinceState}
            onChange={(e) => setFormData({ ...formData, provinceState: e.target.value })}
          >
            <option value="">Select {regionLabel}</option>
            {regionOptions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
          
          <input
            className="input"
            type="text"
            placeholder={`${postalLabel} * (${postalPlaceholder})`}
            value={formData.postalZip}
            onChange={handlePostalZipChange}
            maxLength={formData.country === "CA" ? 7 : 5}
          />
          
          <label className="muted" style={{ marginTop: 16, marginBottom: 4 }}>
            Timezone * 
            <span style={{ fontSize: 12, color: '#666', marginLeft: 8 }}>
              (All dates and times will display in your selected timezone)
            </span>
          </label>
          <select
            className="input"
            value={formData.timezone}
            onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
            style={{ fontFamily: 'monospace', fontSize: 13 }}
          >
            {ALL_TIMEZONES.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.options.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label} ({tz.offset})
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        
        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <button
            type="button"
            className="icon-text"
            onClick={() => router.push("/dashboard")}
            style={{ 
              flex: 1, 
              padding: "12px",
              border: "1px solid #dadce0",
              borderRadius: "24px",
              background: "#fff",
              cursor: "pointer",
              fontWeight: 500
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="primary"
            disabled={!isValid || loading}
            style={{ flex: 1 }}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

