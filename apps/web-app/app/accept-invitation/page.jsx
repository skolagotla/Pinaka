'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Form, Input, Button, DatePicker, InputNumber, Select, Row, Col, Card, Typography, Alert, Spin, message } from 'antd';
import { MailOutlined, PhoneOutlined, SaveOutlined, UserOutlined, HomeOutlined, CloseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { PhoneNumberInput, PostalCodeInput, AddressAutocomplete } from '@/components/forms';
import { useCountryRegion } from '@/lib/hooks/useCountryRegion';
import { useRequestDeduplication } from '@/lib/hooks/useRequestDeduplication';
import { getRoleConfig } from '@/lib/config/invitation-roles';
import { useTenantFormData } from '@/lib/hooks/useTenantFormData';
import CurrencyInput from '@/components/rules/CurrencyInput';

const { Title, Text } = Typography;

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
  const [form] = Form.useForm();
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
  const countryRegion = useCountryRegion('CA', 'ON'); // Default to Canada with Ontario
  
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
        const { v1Api } = await import('@/lib/api/v1-client');
        const data = await v1Api.specialized.getPublicInvitationByToken(token);
        return data;
      },
      { ttl: 10000 } // 10 second deduplication window
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
                firstName: prefill.firstName,
                lastName: prefill.lastName,
                middleName: prefill.middleName,
                phone: prefill.phone,
                country: prefill.country || 'CA',
                provinceState: prefill.provinceState || (prefill.country === 'CA' ? 'ON' : 'NJ'),
                postalZip: prefill.postalZip,
                city: prefill.city,
                addressLine1: prefill.addressLine1,
                addressLine2: prefill.addressLine2,
                currentAddress: prefill.currentAddress,
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
                // No country in prefill, ensure defaults are set
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

  const handleSubmit = async (values) => {
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
      // Handle both dayjs objects and string dates (from manual input)
      const formatDate = (dateValue) => {
        if (!dateValue) return null;
        if (typeof dateValue === 'string') {
          // Already a string, validate format
          if (dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
            return dateValue;
          }
          // Try to parse and format
          const parsed = dayjs(dateValue);
          if (parsed.isValid()) {
            return parsed.format('YYYY-MM-DD');
          }
          return null;
        }
        // dayjs object
        if (dateValue.format) {
          return dateValue.format('YYYY-MM-DD');
        }
        return null;
      };

      // Prepare tenant data including emergency contacts and employers
      const baseFormData = {
        ...values,
        email: invitation?.email || values.email,
        dateOfBirth: formatDate(values.dateOfBirth),
        moveInDate: formatDate(values.moveInDate),
      };
      
      // Use prepareTenantData to include emergency contacts and employers
      const formData = prepareTenantData(baseFormData);

      const { v1Api } = await import('@/lib/api/v1-client');
      const data = await v1Api.specialized.acceptPublicInvitation(token, formData);

      if (!data.success) {
        throw new Error(data.error?.message || data.error || 'Failed to accept invitation');
      }

      // Mark as submitted to show thank you message
      setSubmitted(true);
      setSubmitting(false);
    } catch (err) {
      console.error('Error accepting invitation:', err);
      // Handle rate limit errors specifically
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
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16, color: '#666' }}>Loading invitation...</div>
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 16px' }}>
        <Card>
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            action={
              <Button size="small" onClick={() => window.location.href = '/'}>
                Go Home
              </Button>
            }
          />
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
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 16px' }}>
      <Card style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={2} style={{ marginBottom: 8 }}>
            {isLandlord ? 'Complete Your Landlord Profile' 
              : isTenant ? 'Complete Your Tenant Profile'
              : isVendor ? 'Complete Your Vendor Profile'
              : isContractor ? 'Complete Your Contractor Profile'
              : isPMC ? 'Complete Your PMC Profile'
              : 'Complete Your Profile'}
          </Title>
          <Text type="secondary">
            {invitation?.invitedByName && (
              <>
                You've been invited by <strong>{invitation.invitedByName}</strong>.
                <br />
              </>
            )}
            Please provide your information to complete your profile.
          </Text>
        </div>

        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            closable
            onClose={() => setError(null)}
            style={{ marginBottom: 24 }}
          />
        )}

        {submitted ? (
          <Card 
            style={{ 
              textAlign: 'center', 
              padding: '48px 24px',
              backgroundColor: '#f6ffed',
              border: '1px solid #b7eb8f'
            }}
          >
            <div style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 48, color: '#52c41a' }}>✓</Text>
            </div>
            <Title level={3} style={{ marginBottom: 16 }}>
              Thank You!
            </Title>
            <Text style={{ fontSize: 16, display: 'block', marginBottom: 32, color: '#666', lineHeight: 1.6 }}>
              {isTenant 
                ? (() => {
                    // Get the actual landlord or PMC name from invitation
                    const landlordName = invitation?.landlord 
                      ? `${invitation.landlord.firstName || ''} ${invitation.landlord.lastName || ''}`.trim()
                      : null;
                    const pmcName = invitation?.pmc?.companyName || invitation?.companyName || null;
                    const inviterName = invitation?.invitedByName || null;
                    
                    // Determine who to mention - prioritize PMC, then landlord, then inviter name
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
            </Text>
            <Button 
              type="primary" 
              size="large"
              icon={<CloseOutlined />}
              onClick={() => {
                if (window.opener) {
                  window.close();
                } else {
                  // If window can't be closed, redirect to home
                  window.location.href = '/';
                }
              }}
            >
              Close Window
            </Button>
          </Card>
        ) : (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              numberOfAdults: 1,
              numberOfChildren: 0,
            }}
          >
          {/* Email (read-only) */}
          <Form.Item
            name="email"
            label="Email"
          >
            <Input
              prefix={<MailOutlined />}
              disabled
              value={invitation?.email}
            />
          </Form.Item>

          {/* Name Fields - Different for different roles */}
          {!isVendor && !isContractor && !isPMC ? (
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="firstName"
                  label="First Name"
                  rules={[{ required: true, message: 'Please enter first name' }]}
                >
                  <Input prefix={<UserOutlined />} placeholder="First name" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="middleName"
                  label="Middle Name"
                >
                  <Input prefix={<UserOutlined />} placeholder="Middle name" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="lastName"
                  label="Last Name"
                  rules={[{ required: true, message: 'Please enter last name' }]}
                >
                  <Input prefix={<UserOutlined />} placeholder="Last name" />
                </Form.Item>
              </Col>
            </Row>
          ) : (
            <>
              {/* Vendor/Contractor/PMC: Company Name */}
              <Form.Item
                name="companyName"
                label="Company Name"
                rules={[{ required: true, message: 'Please enter company name' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Company name" />
              </Form.Item>
              
              {/* Contact Name for Vendor/Contractor */}
              {(isVendor || isContractor) && (
                <Form.Item
                  name="contactName"
                  label="Contact Name"
                  rules={[{ required: true, message: 'Please enter contact name' }]}
                >
                  <Input prefix={<UserOutlined />} placeholder="Contact person name" />
                </Form.Item>
              )}
              
              {/* License Number for Contractor */}
              {isContractor && (
                <Form.Item
                  name="licenseNumber"
                  label="License Number"
                >
                  <Input placeholder="Contractor license number (optional)" />
                </Form.Item>
              )}
            </>
          )}

          {/* Phone */}
          <Form.Item
            name="phone"
            label="Phone Number"
            rules={[{ required: true, message: 'Please enter phone number' }]}
          >
            <PhoneNumberInput
              prefix={<PhoneOutlined />}
              placeholder="(123) 456-7890"
            />
          </Form.Item>

          {/* Country and Region */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="country"
                label="Country"
                rules={[{ required: true, message: 'Please select country' }]}
              >
                <Select
                  onChange={(value) => {
                    setCountry(value);
                    countryRegion.setCountry(value);
                    // Set default province/state based on country
                    const defaultRegion = value === 'CA' ? 'ON' : 'NJ';
                    form.setFieldsValue({ provinceState: defaultRegion });
                    countryRegion.setRegion(defaultRegion);
                  }}
                >
                  <Select.Option value="CA">Canada</Select.Option>
                  <Select.Option value="US">United States</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="provinceState"
                label={regionLabel}
                rules={[{ required: true, message: `Please select ${regionLabel.toLowerCase()}` }]}
              >
                <Select placeholder={`Select ${regionLabel}`}>
                  {regionOptions.map(region => (
                    <Select.Option key={region} value={region}>{region}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Address Fields - Different for different roles */}
          {isLandlord || isVendor || isContractor || isPMC ? (
            <>
              <Form.Item
                name="addressLine1"
                label="Address"
                rules={[{ required: true, message: 'Please enter address' }]}
                tooltip="Start typing an address to see autocomplete suggestions"
              >
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
              </Form.Item>
            </>
          ) : (
            <Form.Item
              name="currentAddress"
              label="Current Address"
              tooltip="Start typing an address to see autocomplete suggestions"
            >
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
            </Form.Item>
          )}

          {/* City and Postal Code */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="city"
                label="City"
                rules={isLandlord ? [{ required: true, message: 'Please enter city' }] : []}
              >
                <Input placeholder="City" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="postalZip"
                label={postalLabel}
                rules={isLandlord ? [{ required: true, message: `Please enter ${postalLabel.toLowerCase()}` }] : []}
              >
                <PostalCodeInput
                  country={country}
                  placeholder={postalLabel}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Vendor-specific fields */}
          {isVendor && (
            <>
              <Form.Item
                name="services"
                label="Services/Category"
                rules={[{ required: true, message: 'Please enter services or category' }]}
              >
                <Input placeholder="e.g., Plumbing, Electrical, General Maintenance" />
              </Form.Item>
              
              {/* Optional location fields for global vendors (admin-invited) */}
              {invitation?.invitedByRole === 'admin' && (
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="latitude"
                      label="Latitude (Optional)"
                      tooltip="For location-based search within 50KM radius"
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        placeholder="e.g., 43.6532"
                        step={0.0001}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="longitude"
                      label="Longitude (Optional)"
                      tooltip="For location-based search within 50KM radius"
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        placeholder="e.g., -79.3832"
                        step={0.0001}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              )}
            </>
          )}

          {/* Contractor-specific fields */}
          {isContractor && (
            <>
              <Form.Item
                name="specialties"
                label="Specialties"
                rules={[{ required: true, message: 'Please enter specialties' }]}
              >
                <Input placeholder="e.g., plumbing, electrical, hvac (comma-separated)" />
              </Form.Item>
              
              {/* Optional location fields for global contractors (admin-invited) */}
              {invitation?.invitedByRole === 'admin' && (
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="latitude"
                      label="Latitude (Optional)"
                      tooltip="For location-based search within 50KM radius"
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        placeholder="e.g., 43.6532"
                        step={0.0001}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="longitude"
                      label="Longitude (Optional)"
                      tooltip="For location-based search within 50KM radius"
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        placeholder="e.g., -79.3832"
                        step={0.0001}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              )}
            </>
          )}

          {/* PMC-specific fields */}
          {isPMC && (
            <>
              <Form.Item
                name="defaultCommissionRate"
                label="Default Commission Rate (%)"
              >
                <InputNumber
                  min={0}
                  max={100}
                  style={{ width: '100%' }}
                  placeholder="e.g., 8.5 for 8.5%"
                />
              </Form.Item>
            </>
          )}

          {/* Tenant-specific fields */}
          {isTenant && (
            <>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="dateOfBirth"
                    label="Date of Birth"
                  >
                    <DatePicker
                      style={{ width: '100%' }}
                      format="YYYY-MM-DD"
                      placeholder="Select date of birth"
                      onKeyDown={(e) => {
                        // Prevent form submission when pressing Enter in date picker
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          e.stopPropagation();
                        }
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="moveInDate"
                    label="Desired Move-in Date"
                  >
                    <DatePicker
                      style={{ width: '100%' }}
                      format="YYYY-MM-DD"
                      placeholder="Select move-in date"
                      onKeyDown={(e) => {
                        // Prevent form submission when pressing Enter in date picker
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          e.stopPropagation();
                        }
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="numberOfAdults"
                    label="Number of Adults"
                  >
                    <InputNumber
                      min={1}
                      style={{ width: '100%' }}
                      placeholder="1"
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="numberOfChildren"
                    label="Number of Children"
                  >
                    <InputNumber
                      min={0}
                      style={{ width: '100%' }}
                      placeholder="0"
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="leaseTerm"
                    label="Desired Lease Term"
                  >
                    <Select placeholder="Select lease term">
                      <Select.Option value="1">1 Month</Select.Option>
                      <Select.Option value="3">3 Months</Select.Option>
                      <Select.Option value="6">6 Months</Select.Option>
                      <Select.Option value="12">12 Months</Select.Option>
                      <Select.Option value="24">24 Months</Select.Option>
                      <Select.Option value="month-to-month">Month-to-Month</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </>
          )}

          {/* Emergency Contacts Section - Only for tenants */}
          {isTenant && (
            <>
              <div style={{ marginTop: 32, marginBottom: 16 }}>
                <Title level={4}>Emergency Contacts</Title>
                <Text type="secondary">Please provide at least one emergency contact</Text>
              </div>
              {emergencyContacts.map((contact, index) => (
                <div key={index} style={{ marginBottom: index < emergencyContacts.length - 1 ? 16 : 0 }}>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item 
                        label={`Contact ${index + 1} Name`}
                        required={index === 0}
                        style={{ marginBottom: 12 }}
                      >
                        <Input 
                          placeholder="Jane Doe" 
                          value={contact.contactName}
                          onChange={(e) => {
                            const updated = [...emergencyContacts];
                            updated[index].contactName = e.target.value;
                            setEmergencyContacts(updated);
                          }}
                          size="large"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label={`Contact ${index + 1} Email`} style={{ marginBottom: 12 }}>
                        <Input 
                          placeholder="jane.doe@example.com" 
                          prefix={<MailOutlined />}
                          value={contact.email}
                          onChange={(e) => {
                            const updated = [...emergencyContacts];
                            updated[index].email = e.target.value;
                            setEmergencyContacts(updated);
                          }}
                          size="large"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item 
                        label={`Contact ${index + 1} Phone`}
                        required={index === 0}
                        style={{ marginBottom: 12 }}
                      >
                        <PhoneNumberInput
                          country={country}
                          value={contact.phone}
                          onChange={(e) => {
                            const updated = [...emergencyContacts];
                            updated[index].phone = e.target.value;
                            setEmergencyContacts(updated);
                          }}
                          size="large"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
              ))}
            </>
          )}

          {/* Employer Section - Only for tenants */}
          {isTenant && (
            <>
              <div style={{ marginTop: 32, marginBottom: 16 }}>
                <Title level={4}>Employer Information</Title>
                <Text type="secondary">Please provide your current employer details</Text>
              </div>
              {employers.map((employer, index) => (
                <div key={index} style={{ marginBottom: 16 }}>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item 
                        label="Employer Name" 
                        required
                        validateStatus={!employer.employerName ? 'error' : ''}
                        help={!employer.employerName ? 'Please enter employer name' : ''}
                        style={{ marginBottom: 12 }}
                      >
                        <Input 
                          placeholder="ABC Corporation" 
                          value={employer.employerName}
                          onChange={(e) => {
                            const updated = [...employers];
                            updated[index].employerName = e.target.value;
                            setEmployers(updated);
                          }}
                          size="large"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label="Job Title" style={{ marginBottom: 12 }}>
                        <Input 
                          placeholder="Software Engineer" 
                          value={employer.jobTitle}
                          onChange={(e) => {
                            const updated = [...employers];
                            updated[index].jobTitle = e.target.value;
                            setEmployers(updated);
                          }}
                          size="large"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label="Annual Income" style={{ marginBottom: 12 }}>
                        <CurrencyInput
                          country={country}
                          value={employer.income}
                          onChange={(value) => {
                            const updated = [...employers];
                            updated[index].income = value;
                            setEmployers(updated);
                          }}
                          style={{ width: '100%' }}
                          size="large"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item label="Employment Start Date" style={{ marginBottom: 12 }}>
                        <DatePicker
                          style={{ width: '100%' }}
                          value={employer.startDate ? dayjs(employer.startDate) : null}
                          onChange={(date) => {
                            const updated = [...employers];
                            updated[index].startDate = date ? date.format('YYYY-MM-DD') : null;
                            setEmployers(updated);
                          }}
                          size="large"
                          placeholder="Select date"
                          format="YYYY-MM-DD"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label="Pay Frequency" style={{ marginBottom: 12 }}>
                        <Select
                          value={employer.payFrequency}
                          onChange={(value) => {
                            const updated = [...employers];
                            updated[index].payFrequency = value;
                            setEmployers(updated);
                          }}
                          placeholder="Select frequency"
                          size="large"
                          virtual={false}
                        >
                          <Select.Option value="weekly">Weekly</Select.Option>
                          <Select.Option value="biweekly">Bi-weekly</Select.Option>
                          <Select.Option value="monthly">Monthly</Select.Option>
                          <Select.Option value="semimonthly">Semi-monthly</Select.Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                  
                  <Form.Item label="Employer Address" style={{ marginBottom: 12 }}>
                    <Input.TextArea 
                      rows={2}
                      placeholder="123 Business St, Suite 100, City, State, ZIP" 
                      value={employer.employerAddress}
                      onChange={(e) => {
                        const updated = [...employers];
                        updated[index].employerAddress = e.target.value;
                        setEmployers(updated);
                      }}
                    />
                  </Form.Item>
                </div>
              ))}
            </>
          )}

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={submitting}
              size="large"
              block
            >
              {submitting ? 'Submitting...' : 'Complete Profile'}
            </Button>
          </Form.Item>
        </Form>
        )}
      </Card>
    </div>
  );
}

