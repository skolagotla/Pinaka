"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, Button, Label, TextInput, Select, Textarea, Spinner, Alert } from 'flowbite-react';
import { HiUser, HiMail, HiPhone, HiHome, HiCheckCircle } from 'react-icons/hi';
import { formatPhoneNumber, formatPostalCode, formatZipCode, isValidPhoneNumber, isValidPostalCode, isValidZipCode } from '@/lib/utils/formatters';
import { ALL_TIMEZONES, DEFAULT_TIMEZONE } from '@/lib/constants/timezones';
import { useCountryRegion } from '@/lib/hooks';
import { PhoneNumberInput, PostalCodeInput, AddressAutocomplete } from '@/components/forms';

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

export default function CompleteRegistrationForm({ firstName, middleName, lastName, email }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [country, setCountry] = useState("CA");
  const countryRegion = useCountryRegion(country);
  
  const [formData, setFormData] = useState({
    firstName: firstName || "",
    middleName: middleName || "",
    lastName: lastName || "",
    email: email || "",
    phone: "",
    addressLine1: "",
    city: "",
    country: "CA",
    provinceState: "",
    postalZip: "",
    timezone: DEFAULT_TIMEZONE,
  });

  function handlePhoneChange(e) {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData({ ...formData, phone: formatted });
  }

  function handlePostalZipChange(e) {
    const value = e.target.value;
    const formatted = country === "CA" ? formatPostalCode(value) : formatZipCode(value);
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
    const hasValidPostalZip = country === "CA"
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
  }, [formData, country]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isValid || loading) return;
    
    setLoading(true);
    setError(null);
    try {
      const { v2Api } = await import('@/lib/api/v2-client');
      
      // Create landlord via v2 API
      // Note: This requires an organization_id - in a real flow, this would come from invitation
      // For now, we'll need to handle this differently or create a registration endpoint
      // TODO: Create a proper registration endpoint that handles organization assignment
      
      // For now, show error that registration needs to be done via invitation
      setError('Registration is currently only available through invitation links. Please contact your administrator.');
      setLoading(false);
      return;
      
      // When registration endpoint is available:
      // const response = await v2Api.createLandlord({
      //   organization_id: invitationData.organization_id,
      //   name: `${formData.firstName} ${formData.lastName}`,
      //   email: formData.email,
      //   phone: formData.phone,
      //   // ... other fields
      // });
      
    } catch (error) {
      console.error('[Complete Registration] Error:', error);
      setError(error.message || 'Failed to complete registration');
    } finally {
      setLoading(false);
    }
  }

  const regionLabel = country === "CA" ? "Province" : "State";
  const regionOptions = country === "CA" ? CA_PROVINCES : US_STATES;
  const postalLabel = country === "CA" ? "Postal Code" : "ZIP Code";
  const postalPlaceholder = country === "CA" ? "A1A 1A1" : "12345";

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 16px' }}>
      <Card>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <HiCheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Complete Your Registration</h1>
          <p className="text-gray-600">
            Please provide your contact information to complete your account setup.
          </p>
        </div>

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
                placeholder="First name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
                icon={HiUser}
              />
            </div>
            
            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <TextInput
                id="lastName"
                type="text"
                placeholder="Last name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
                icon={HiUser}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="middleName">Middle Name (Optional)</Label>
            <TextInput
              id="middleName"
              type="text"
              placeholder="Middle name"
              value={formData.middleName}
              onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
              icon={HiUser}
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
              icon={HiMail}
            />
          </div>
          
          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <PhoneNumberInput
              id="phone"
              value={formData.phone}
              onChange={handlePhoneChange}
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
            <AddressAutocomplete
              placeholder="Type an address (e.g., 123 Main St, Toronto)"
              country={country === 'CA' ? 'CA,US' : country === 'US' ? 'CA,US' : 'CA,US'}
              onSelect={(addressData) => {
                setFormData({
                  ...formData,
                  addressLine1: addressData.addressLine1,
                  city: addressData.city,
                  provinceState: addressData.provinceState,
                  postalZip: addressData.postalZip,
                  country: addressData.country || formData.country,
                });
                if (addressData.country) {
                  setCountry(addressData.country);
                }
              }}
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
              icon={HiHome}
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
            <PostalCodeInput
              id="postalZip"
              country={country}
              value={formData.postalZip}
              onChange={handlePostalZipChange}
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
              onClick={() => router.push("/")}
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
                  Completing Registration...
                </>
              ) : (
                'Complete Registration'
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
