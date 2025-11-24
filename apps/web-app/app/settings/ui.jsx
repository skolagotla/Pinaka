"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, Button, Label, TextInput, Select, Textarea, Spinner, Alert } from 'flowbite-react';
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
  const [error, setError] = useState(null);
  const [country, setCountry] = useState(landlord.country || "CA");
  const countryRegion = useCountryRegion(country);
  
  const [formData, setFormData] = useState({
    firstName: landlord.firstName || landlord.first_name || "",
    middleName: landlord.middleName || landlord.middle_name || "",
    lastName: landlord.lastName || landlord.last_name || "",
    email: landlord.email || "",
    phone: landlord.phone || "",
    addressLine1: landlord.addressLine1 || landlord.address_line1 || "",
    city: landlord.city || "",
    country: landlord.country || "CA",
    provinceState: landlord.provinceState || landlord.state || "",
    postalZip: landlord.postalZip || landlord.postal_code || "",
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
    setError(null);
    try {
      const { v2Api } = await import('@/lib/api/v2-client');
      
      // Get landlord ID from props
      let landlordId = landlord?.id;
      if (!landlordId) {
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
      setError(error.message || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  }

  const regionLabel = formData.country === "CA" ? "Province" : "State";
  const regionOptions = formData.country === "CA" ? CA_PROVINCES : US_STATES;
  const postalLabel = formData.country === "CA" ? "Postal Code" : "ZIP Code";
  const postalPlaceholder = formData.country === "CA" ? "A1A 1A1" : "12345";

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <h1 className="text-2xl font-bold mb-2">Settings</h1>
        <p className="text-gray-600 mb-6">
          Update your profile information
        </p>
        
        {error && (
          <Alert color="failure" className="mb-4">
            {error}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <TextInput
                id="firstName"
                type="text"
                placeholder="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="middleName">Middle Name (Optional)</Label>
              <TextInput
                id="middleName"
                type="text"
                placeholder="Middle Name"
                value={formData.middleName}
                onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="lastName">Last Name *</Label>
            <TextInput
              id="lastName"
              type="text"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="email">Email *</Label>
            <TextInput
              id="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              disabled
              className="bg-gray-100 cursor-not-allowed"
            />
          </div>
          
          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <TextInput
              id="phone"
              type="tel"
              placeholder="(XXX) XXX-XXXX"
              value={formData.phone}
              onChange={handlePhoneChange}
              maxLength={14}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="country">Country *</Label>
            <Select
              id="country"
              value={formData.country}
              onChange={handleCountryChange}
              required
            >
              <option value="CA">Canada</option>
              <option value="US">United States</option>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="addressLine1">Address *</Label>
            <TextInput
              id="addressLine1"
              type="text"
              placeholder="Address"
              value={formData.addressLine1}
              onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="city">City *</Label>
            <TextInput
              id="city"
              type="text"
              placeholder="City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="provinceState">{regionLabel} *</Label>
            <Select
              id="provinceState"
              value={formData.provinceState}
              onChange={(e) => setFormData({ ...formData, provinceState: e.target.value })}
              required
            >
              <option value="">Select {regionLabel}</option>
              {regionOptions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </Select>
          </div>
          
          <div>
            <Label htmlFor="postalZip">{postalLabel} *</Label>
            <TextInput
              id="postalZip"
              type="text"
              placeholder={postalPlaceholder}
              value={formData.postalZip}
              onChange={handlePostalZipChange}
              maxLength={formData.country === "CA" ? 7 : 5}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="timezone">
              Timezone * 
              <span className="text-sm text-gray-500 ml-2">
                (All dates and times will display in your selected timezone)
              </span>
            </Label>
            <Select
              id="timezone"
              value={formData.timezone}
              onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              required
              className="font-mono text-sm"
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
            </Select>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              color="gray"
              onClick={() => router.push("/dashboard")}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              color="blue"
              disabled={!isValid || loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
