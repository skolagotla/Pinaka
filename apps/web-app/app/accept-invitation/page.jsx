'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button, Datepicker, Select, Card, Alert, Spinner, TextInput, Textarea, Label } from 'flowbite-react';
import { HiMail, HiPhone, HiSave, HiUser, HiHome, HiX } from 'react-icons/hi';
import dayjs from 'dayjs';
import { PhoneNumberInput, PostalCodeInput, AddressAutocomplete } from '@/components/forms';
import { useCountryRegion } from '@/lib/hooks/useCountryRegion';
import { useRequestDeduplication } from '@/lib/hooks/useRequestDeduplication';
import { getRoleConfig } from '@/lib/config/invitation-roles';
import { useTenantFormData } from '@/lib/hooks/useTenantFormData';
import { useFormState } from '@/lib/hooks/useFormState';
import CurrencyInput from '@/components/rules/CurrencyInput';
import { notify } from '@/lib/utils/notification-helper';

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

export default function AcceptInvitationPage() {
  const form = useFormState({
    email: '',
    firstName: '',
    middleName: '',
    lastName: '',
    companyName: '',
    contactName: '',
    licenseNumber: '',
    phone: '',
    country: 'CA',
    provinceState: 'ON',
    addressLine1: '',
    currentAddress: '',
    city: '',
    postalZip: '',
    services: '',
    latitude: '',
    longitude: '',
    specialties: '',
    defaultCommissionRate: '',
    dateOfBirth: null,
    moveInDate: null,
    numberOfAdults: 1,
    numberOfChildren: 0,
    leaseTerm: '',
  });
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const { dedupeRequest } = useRequestDeduplication();
  const hasFetchedRef = useRef(false);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [invitation, setInvitation] = useState(null);
  const [error, setError] = useState(null);
  const [country, setCountry] = useState('CA');
  const [submitted, setSubmitted] = useState(false);
  const countryRegion = useCountryRegion('CA', 'ON');
  
  // Tenant form data management hook for emergency contacts and employers
  const tenantFormData = useTenantFormData({ country });
  const { emergencyContacts, employers, setEmergencyContacts, setEmployers, prepareTenantData } = tenantFormData;

  useEffect(() => {
    if (!token) {
      setError('Invalid invitation link');
      setLoading(false);
      return;
    }

    // Prevent double-fetching (React Strict Mode in dev)
    if (hasFetchedRef.current) {
      return;
    }
    hasFetchedRef.current = true;

    // Fetch invitation details with request deduplication
    dedupeRequest(
      `invitation-${token}`,
      async () => {
        // TODO: Implement v2 endpoint for public invitation by token
        const { v2Api } = await import('@/lib/api/v2-client');
        const data = await v1Api.specialized.getPublicInvitationByToken(token);
        return data;
      },
      { ttl: 10000 }
    )
      .then(data => {
        if (!data) return;
        
        if (data.success) {
          setInvitation(data.data);
          
          // Use setTimeout to ensure form is fully initialized before setting values
          setTimeout(() => {
            // Prefill form with metadata if available
            if (data.data.metadata) {
              const prefill = data.data.metadata;
              form.setFieldsValue({
                email: data.data.email,
                firstName: prefill.firstName || '',
                lastName: prefill.lastName || '',
                middleName: prefill.middleName || '',
                phone: prefill.phone || '',
                country: prefill.country || 'CA',
                provinceState: prefill.provinceState || (prefill.country === 'CA' ? 'ON' : 'NJ'),
                postalZip: prefill.postalZip || '',
                city: prefill.city || '',
                addressLine1: prefill.addressLine1 || '',
                currentAddress: prefill.currentAddress || '',
              });
              
              if (prefill.country) {
                setCountry(prefill.country);
                countryRegion.setCountry(prefill.country);
                // Set default province/state if not provided
                if (!prefill.provinceState) {
                  const defaultRegion = prefill.country === 'CA' ? 'ON' : 'NJ';
                  form.setFieldsValue({ provinceState: defaultRegion });
                  countryRegion.setRegion(defaultRegion);
                } else {
                  countryRegion.setRegion(prefill.provinceState);
                }
              } else {
                form.setFieldsValue({ 
                  country: 'CA',
                  provinceState: 'ON' 
                });
                setCountry('CA');
                countryRegion.setCountry('CA');
                countryRegion.setRegion('ON');
              }
            } else {
              // Set email from invitation and defaults
              form.setFieldsValue({
                email: data.data.email,
                country: 'CA',
                provinceState: 'ON',
              });
              setCountry('CA');
              countryRegion.setCountry('CA');
              countryRegion.setRegion('ON');
            }
          }, 0);
        } else {
          setError(data.error?.message || 'Failed to load invitation');
        }
      })
      .catch(err => {
        console.error('Error fetching invitation:', err);
        setError(err.message || 'Failed to load invitation');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token, form, countryRegion]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError('Invalid invitation token');
      return;
    }

    // Prevent multiple submissions
    if (submitting) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Format dates for API
      const formatDate = (dateValue) => {
        if (!dateValue) return null;
        if (typeof dateValue === 'string') {
          if (dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
            return dateValue;
          }
          const parsed = dayjs(dateValue);
          if (parsed.isValid()) {
            return parsed.format('YYYY-MM-DD');
          }
          return null;
        }
        // Date object from Datepicker
        if (dateValue instanceof Date) {
          return dayjs(dateValue).format('YYYY-MM-DD');
        }
        return null;
      };

      const values = form.getFieldsValue();
      
      // Prepare tenant data including emergency contacts and employers
      const baseFormData = {
        ...values,
        email: invitation?.email || values.email,
        dateOfBirth: formatDate(values.dateOfBirth),
        moveInDate: formatDate(values.moveInDate),
      };
      
      // Use prepareTenantData to include emergency contacts and employers
      const formData = prepareTenantData(baseFormData);

      // TODO: Implement v2 endpoint for accepting public invitation
      const { v2Api } = await import('@/lib/api/v2-client');
      const data = await v1Api.specialized.acceptPublicInvitation(token, formData);

      if (!data.success) {
        throw new Error(data.error?.message || data.error || 'Failed to accept invitation');
      }

      // Mark as submitted to show thank you message
      setSubmitted(true);
      setSubmitting(false);
    } catch (err) {
      console.error('Error accepting invitation:', err);
      const errorMessage = err.message || 'Failed to accept invitation. Please try again.';
      if (errorMessage.includes('Too many requests') || errorMessage.includes('rate limit')) {
        setError('Too many requests. Please wait a few minutes before trying again.');
      } else {
        setError(errorMessage);
      }
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[80vh]">
        <Spinner size="xl" />
        <div className="mt-4 text-gray-500">Loading invitation...</div>
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="max-w-2xl mx-auto p-10">
        <Card>
          <Alert color="failure">
            <div>
              <p className="font-semibold">Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
            <div className="mt-4">
              <Button size="sm" onClick={() => window.location.href = '/'}>
                Go Home
              </Button>
            </div>
          </Alert>
        </Card>
      </div>
    );
  }

  const roleConfig = invitation?.type ? getRoleConfig(invitation.type) : null;
  const isLandlord = invitation?.type === 'landlord';
  const isTenant = invitation?.type === 'tenant';
  const isVendor = invitation?.type === 'vendor';
  const isContractor = invitation?.type === 'contractor';
  const isPMC = invitation?.type === 'pmc';
  const regionLabel = country === "CA" ? "Province" : "State";
  const regionOptions = country === "CA" ? CA_PROVINCES : US_STATES;
  const postalLabel = country === "CA" ? "Postal Code" : "ZIP Code";

  return (
    <div className="max-w-3xl mx-auto p-10">
      <Card className="shadow-lg">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">
            {isLandlord ? 'Complete Your Landlord Profile' 
              : isTenant ? 'Complete Your Tenant Profile'
              : isVendor ? 'Complete Your Vendor Profile'
              : isContractor ? 'Complete Your Contractor Profile'
              : isPMC ? 'Complete Your PMC Profile'
              : 'Complete Your Profile'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {invitation?.invitedByName && (
              <>
                You've been invited by <strong>{invitation.invitedByName}</strong>.
                <br />
              </>
            )}
            Please provide your information to complete your profile.
          </p>
        </div>

        {error && (
          <Alert color="failure" onDismiss={() => setError(null)} className="mb-6">
            <div>
              <p className="font-semibold">Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </Alert>
        )}

        {submitted ? (
          <Card className="text-center p-12 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-800">
            <div className="mb-6">
              <div className="text-5xl text-green-500">✓</div>
            </div>
            <h3 className="text-xl font-semibold mb-4">Thank You</h3>
            <p className="text-base mb-8 text-gray-700 dark:text-gray-300 leading-relaxed">
              {isTenant 
                ? (() => {
                    const landlordName = invitation?.landlord 
                      ? `${invitation.landlord.firstName || ''} ${invitation.landlord.lastName || ''}`.trim()
                      : null;
                    const pmcName = invitation?.pmc?.companyName || invitation?.companyName || null;
                    const inviterName = invitation?.invitedByName || null;
                    
                    let contactName = 'your landlord or PMC company';
                    if (pmcName) {
                      contactName = pmcName;
                    } else if (landlordName) {
                      contactName = landlordName;
                    } else if (inviterName) {
                      contactName = inviterName;
                    }
                    
                    return `Your information has been submitted successfully. ${contactName} will get back to you soon.`;
                  })()
                : (isPMC || isLandlord)
                ? 'Your information has been submitted successfully. The Pinaka Team will get back to you soon.'
                : 'Your information has been submitted successfully. We will get back to you soon.'
              }
            </p>
            <Button 
              color="blue"
              size="lg"
              onClick={() => {
                if (window.opener) {
                  window.close();
                } else {
                  window.location.href = '/';
                }
              }}
              className="flex items-center gap-2"
            >
              <HiX className="h-5 w-5" />
              Close Window
            </Button>
          </Card>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email (read-only) */}
            <div>
              <Label htmlFor="email" className="mb-2 block">Email</Label>
              <TextInput
                id="email"
                icon={HiMail}
                disabled
                value={invitation?.email || ''}
                readOnly
              />
            </div>

            {/* Name Fields - Different for different roles */}
            {!isVendor && !isContractor && !isPMC ? (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="firstName" className="mb-2 block">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <TextInput
                    id="firstName"
                    icon={HiUser}
                    placeholder="First name"
                    value={form.values.firstName}
                    onChange={(e) => form.setFieldsValue({ firstName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="middleName" className="mb-2 block">Middle Name</Label>
                  <TextInput
                    id="middleName"
                    icon={HiUser}
                    placeholder="Middle name"
                    value={form.values.middleName}
                    onChange={(e) => form.setFieldsValue({ middleName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="mb-2 block">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <TextInput
                    id="lastName"
                    icon={HiUser}
                    placeholder="Last name"
                    value={form.values.lastName}
                    onChange={(e) => form.setFieldsValue({ lastName: e.target.value })}
                    required
                  />
                </div>
              </div>
            ) : (
              <>
                <div>
                  <Label htmlFor="companyName" className="mb-2 block">
                    Company Name <span className="text-red-500">*</span>
                  </Label>
                  <TextInput
                    id="companyName"
                    icon={HiUser}
                    placeholder="Company name"
                    value={form.values.companyName}
                    onChange={(e) => form.setFieldsValue({ companyName: e.target.value })}
                    required
                  />
                </div>
                
                {(isVendor || isContractor) && (
                  <div>
                    <Label htmlFor="contactName" className="mb-2 block">
                      Contact Name <span className="text-red-500">*</span>
                    </Label>
                    <TextInput
                      id="contactName"
                      icon={HiUser}
                      placeholder="Contact person name"
                      value={form.values.contactName}
                      onChange={(e) => form.setFieldsValue({ contactName: e.target.value })}
                      required
                    />
                  </div>
                )}
                
                {isContractor && (
                  <div>
                    <Label htmlFor="licenseNumber" className="mb-2 block">License Number</Label>
                    <TextInput
                      id="licenseNumber"
                      placeholder="Contractor license number (optional)"
                      value={form.values.licenseNumber}
                      onChange={(e) => form.setFieldsValue({ licenseNumber: e.target.value })}
                    />
                  </div>
                )}
              </>
            )}

            {/* Phone */}
            <div>
              <Label htmlFor="phone" className="mb-2 block">
                Phone Number <span className="text-red-500">*</span>
              </Label>
              <PhoneNumberInput
                value={form.values.phone}
                onChange={(e) => form.setFieldsValue({ phone: e.target.value })}
                placeholder="(123) 456-7890"
                required
              />
            </div>

            {/* Country and Region */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="country" className="mb-2 block">
                  Country <span className="text-red-500">*</span>
                </Label>
                <Select
                  id="country"
                  value={form.values.country}
                  onChange={(e) => {
                    const value = e.target.value;
                    form.setFieldsValue({ country: value });
                    setCountry(value);
                    countryRegion.setCountry(value);
                    const defaultRegion = value === 'CA' ? 'ON' : 'NJ';
                    form.setFieldsValue({ provinceState: defaultRegion });
                    countryRegion.setRegion(defaultRegion);
                  }}
                  required
                >
                  <option value="CA">Canada</option>
                  <option value="US">United States</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="provinceState" className="mb-2 block">
                  {regionLabel} <span className="text-red-500">*</span>
                </Label>
                <Select
                  id="provinceState"
                  value={form.values.provinceState}
                  onChange={(e) => form.setFieldsValue({ provinceState: e.target.value })}
                  required
                >
                  <option value="">Select {regionLabel}</option>
                  {regionOptions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Address Fields - Different for different roles */}
            {isLandlord || isVendor || isContractor || isPMC ? (
              <div>
                <Label htmlFor="addressLine1" className="mb-2 block">
                  Address <span className="text-red-500">*</span>
                </Label>
                <AddressAutocomplete
                  placeholder="Type an address (e.g., 123 Main St, Toronto)"
                  country={country === 'CA' ? 'CA,US' : country === 'US' ? 'CA,US' : 'CA,US'}
                  onSelect={(addressData) => {
                    form.setFieldsValue({
                      addressLine1: addressData.addressLine1,
                      city: addressData.city,
                      provinceState: addressData.provinceState,
                      postalZip: addressData.postalZip,
                      country: addressData.country,
                    });
                    if (addressData.country) {
                      setCountry(addressData.country);
                      countryRegion.setCountry(addressData.country);
                    }
                  }}
                />
              </div>
            ) : (
              <div>
                <Label htmlFor="currentAddress" className="mb-2 block">Current Address</Label>
                <AddressAutocomplete
                  placeholder="Type an address (e.g., 123 Main St, Toronto)"
                  country={country === 'CA' ? 'CA,US' : country === 'US' ? 'CA,US' : 'CA,US'}
                  onSelect={(addressData) => {
                    const countryCode = addressData.country;
                    const streetAddress = addressData.addressLine1 || addressData.formattedAddress?.split(',')[0] || '';
                    
                    if (countryCode === 'CA' || countryCode === 'US') {
                      setCountry(countryCode);
                      countryRegion.setCountry(countryCode);
                      setTimeout(() => {
                        form.setFieldsValue({
                          currentAddress: streetAddress,
                          city: addressData.city,
                          provinceState: addressData.provinceState,
                          postalZip: addressData.postalZip,
                          country: countryCode,
                        });
                      }, 50);
                    } else {
                      form.setFieldsValue({
                        currentAddress: streetAddress,
                        city: addressData.city,
                        provinceState: addressData.provinceState,
                        postalZip: addressData.postalZip,
                        country: countryCode,
                      });
                    }
                  }}
                />
              </div>
            )}

            {/* City and Postal Code */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city" className="mb-2 block">
                  City {isLandlord && <span className="text-red-500">*</span>}
                </Label>
                <TextInput
                  id="city"
                  placeholder="City"
                  value={form.values.city}
                  onChange={(e) => form.setFieldsValue({ city: e.target.value })}
                  required={isLandlord}
                />
              </div>
              <div>
                <Label htmlFor="postalZip" className="mb-2 block">
                  {postalLabel} {isLandlord && <span className="text-red-500">*</span>}
                </Label>
                <PostalCodeInput
                  country={country}
                  placeholder={postalLabel}
                  value={form.values.postalZip}
                  onChange={(e) => form.setFieldsValue({ postalZip: e.target.value })}
                  required={isLandlord}
                />
              </div>
            </div>

            {/* Vendor-specific fields */}
            {isVendor && (
              <>
                <div>
                  <Label htmlFor="services" className="mb-2 block">
                    Services/Category <span className="text-red-500">*</span>
                  </Label>
                  <TextInput
                    id="services"
                    placeholder="e.g., Plumbing, Electrical, General Maintenance"
                    value={form.values.services}
                    onChange={(e) => form.setFieldsValue({ services: e.target.value })}
                    required
                  />
                </div>
                
                {invitation?.invitedByRole === 'admin' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="latitude" className="mb-2 block">Latitude (Optional)</Label>
                      <TextInput
                        id="latitude"
                        type="number"
                        step="0.0001"
                        placeholder="e.g., 43.6532"
                        value={form.values.latitude}
                        onChange={(e) => form.setFieldsValue({ latitude: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="longitude" className="mb-2 block">Longitude (Optional)</Label>
                      <TextInput
                        id="longitude"
                        type="number"
                        step="0.0001"
                        placeholder="e.g., -79.3832"
                        value={form.values.longitude}
                        onChange={(e) => form.setFieldsValue({ longitude: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Contractor-specific fields */}
            {isContractor && (
              <>
                <div>
                  <Label htmlFor="specialties" className="mb-2 block">
                    Specialties <span className="text-red-500">*</span>
                  </Label>
                  <TextInput
                    id="specialties"
                    placeholder="e.g., plumbing, electrical, hvac (comma-separated)"
                    value={form.values.specialties}
                    onChange={(e) => form.setFieldsValue({ specialties: e.target.value })}
                    required
                  />
                </div>
                
                {invitation?.invitedByRole === 'admin' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="latitude" className="mb-2 block">Latitude (Optional)</Label>
                      <TextInput
                        id="latitude"
                        type="number"
                        step="0.0001"
                        placeholder="e.g., 43.6532"
                        value={form.values.latitude}
                        onChange={(e) => form.setFieldsValue({ latitude: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="longitude" className="mb-2 block">Longitude (Optional)</Label>
                      <TextInput
                        id="longitude"
                        type="number"
                        step="0.0001"
                        placeholder="e.g., -79.3832"
                        value={form.values.longitude}
                        onChange={(e) => form.setFieldsValue({ longitude: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {/* PMC-specific fields */}
            {isPMC && (
              <div>
                <Label htmlFor="defaultCommissionRate" className="mb-2 block">Default Commission Rate (%)</Label>
                <TextInput
                  id="defaultCommissionRate"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="e.g., 8.5 for 8.5%"
                  value={form.values.defaultCommissionRate}
                  onChange={(e) => form.setFieldsValue({ defaultCommissionRate: e.target.value })}
                />
              </div>
            )}

            {/* Tenant-specific fields */}
            {isTenant && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dateOfBirth" className="mb-2 block">Date of Birth</Label>
                    <Datepicker
                      value={form.values.dateOfBirth}
                      onSelectedDateChanged={(date) => form.setFieldsValue({ dateOfBirth: date })}
                      placeholder="Select date of birth"
                    />
                  </div>
                  <div>
                    <Label htmlFor="moveInDate" className="mb-2 block">Desired Move-in Date</Label>
                    <Datepicker
                      value={form.values.moveInDate}
                      onSelectedDateChanged={(date) => form.setFieldsValue({ moveInDate: date })}
                      placeholder="Select move-in date"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="numberOfAdults" className="mb-2 block">Number of Adults</Label>
                    <TextInput
                      id="numberOfAdults"
                      type="number"
                      min="1"
                      placeholder="1"
                      value={form.values.numberOfAdults}
                      onChange={(e) => form.setFieldsValue({ numberOfAdults: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="numberOfChildren" className="mb-2 block">Number of Children</Label>
                    <TextInput
                      id="numberOfChildren"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={form.values.numberOfChildren}
                      onChange={(e) => form.setFieldsValue({ numberOfChildren: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="leaseTerm" className="mb-2 block">Desired Lease Term</Label>
                    <Select
                      id="leaseTerm"
                      value={form.values.leaseTerm}
                      onChange={(e) => form.setFieldsValue({ leaseTerm: e.target.value })}
                    >
                      <option value="">Select lease term</option>
                      <option value="1">1 Month</option>
                      <option value="3">3 Months</option>
                      <option value="6">6 Months</option>
                      <option value="12">12 Months</option>
                      <option value="24">24 Months</option>
                      <option value="month-to-month">Month-to-Month</option>
                    </Select>
                  </div>
                </div>
              </>
            )}

            {/* Emergency Contacts Section - Only for tenants */}
            {isTenant && (
              <>
                <div className="mt-8 mb-4">
                  <h4 className="text-lg font-semibold mb-2">Emergency Contacts</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Please provide at least one emergency contact</p>
                </div>
                {emergencyContacts.map((contact, index) => (
                  <div key={index} className={index < emergencyContacts.length - 1 ? "mb-4" : ""}>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="mb-2 block">
                          Contact {index + 1} Name {index === 0 && <span className="text-red-500">*</span>}
                        </Label>
                        <TextInput
                          placeholder="Jane Doe"
                          value={contact.contactName}
                          onChange={(e) => {
                            const updated = [...emergencyContacts];
                            updated[index].contactName = e.target.value;
                            setEmergencyContacts(updated);
                          }}
                          required={index === 0}
                        />
                      </div>
                      <div>
                        <Label className="mb-2 block">Contact {index + 1} Email</Label>
                        <TextInput
                          type="email"
                          icon={HiMail}
                          placeholder="jane.doe@example.com"
                          value={contact.email}
                          onChange={(e) => {
                            const updated = [...emergencyContacts];
                            updated[index].email = e.target.value;
                            setEmergencyContacts(updated);
                          }}
                        />
                      </div>
                      <div>
                        <Label className="mb-2 block">
                          Contact {index + 1} Phone {index === 0 && <span className="text-red-500">*</span>}
                        </Label>
                        <PhoneNumberInput
                          country={country}
                          value={contact.phone}
                          onChange={(e) => {
                            const updated = [...emergencyContacts];
                            updated[index].phone = e.target.value;
                            setEmergencyContacts(updated);
                          }}
                          required={index === 0}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Employer Section - Only for tenants */}
            {isTenant && (
              <>
                <div className="mt-8 mb-4">
                  <h4 className="text-lg font-semibold mb-2">Employer Information</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Please provide your current employer details</p>
                </div>
                {employers.map((employer, index) => (
                  <div key={index} className="mb-4">
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <Label className="mb-2 block">
                          Employer Name <span className="text-red-500">*</span>
                        </Label>
                        <TextInput
                          placeholder="ABC Corporation"
                          value={employer.employerName}
                          onChange={(e) => {
                            const updated = [...employers];
                            updated[index].employerName = e.target.value;
                            setEmployers(updated);
                          }}
                          required
                        />
                        {!employer.employerName && (
                          <p className="text-xs text-red-500 mt-1">Please enter employer name</p>
                        )}
                      </div>
                      <div>
                        <Label className="mb-2 block">Job Title</Label>
                        <TextInput
                          placeholder="Software Engineer"
                          value={employer.jobTitle}
                          onChange={(e) => {
                            const updated = [...employers];
                            updated[index].jobTitle = e.target.value;
                            setEmployers(updated);
                          }}
                        />
                      </div>
                      <div>
                        <Label className="mb-2 block">Annual Income</Label>
                        <CurrencyInput
                          country={country}
                          value={employer.income}
                          onChange={(value) => {
                            const updated = [...employers];
                            updated[index].income = value;
                            setEmployers(updated);
                          }}
                          style={{ width: '100%' }}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label className="mb-2 block">Employment Start Date</Label>
                        <Datepicker
                          value={employer.startDate ? new Date(employer.startDate) : null}
                          onSelectedDateChanged={(date) => {
                            const updated = [...employers];
                            updated[index].startDate = date ? dayjs(date).format('YYYY-MM-DD') : null;
                            setEmployers(updated);
                          }}
                          placeholder="Select date"
                        />
                      </div>
                      <div>
                        <Label className="mb-2 block">Pay Frequency</Label>
                        <Select
                          value={employer.payFrequency || ''}
                          onChange={(e) => {
                            const updated = [...employers];
                            updated[index].payFrequency = e.target.value;
                            setEmployers(updated);
                          }}
                        >
                          <option value="">Select frequency</option>
                          <option value="weekly">Weekly</option>
                          <option value="biweekly">Bi-weekly</option>
                          <option value="monthly">Monthly</option>
                          <option value="semimonthly">Semi-monthly</option>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="mb-2 block">Employer Address</Label>
                      <Textarea
                        rows={2}
                        placeholder="123 Business St, Suite 100, City, State, ZIP"
                        value={employer.employerAddress}
                        onChange={(e) => {
                          const updated = [...employers];
                          updated[index].employerAddress = e.target.value;
                          setEmployers(updated);
                        }}
                      />
                    </div>
                  </div>
                ))}
              </>
            )}

            <div>
              <Button
                type="submit"
                color="blue"
                size="lg"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Spinner size="sm" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <HiSave className="h-5 w-5" />
                    Complete Profile
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
