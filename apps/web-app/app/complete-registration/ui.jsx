"use client";
import { useState, useMemo } from "react";
import { useMessage } from '@/lib/hooks/useMessage';
import { useCountryRegion } from '@/lib/hooks/useCountryRegion';
import { useRouter } from "next/navigation";
import { Card, Form, Input, Button, Select, Typography, Row, Col} from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, HomeOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { PhoneNumberInput, PostalCodeInput, AddressAutocomplete } from '@/components/forms';

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

export default function CompleteRegistrationForm({ firstName, middleName, lastName, email }) {
  const router = useRouter();
  const message = useMessage();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [country, setCountry] = useState("CA");
  const countryRegion = useCountryRegion(country);

  async function handleSubmit(values) {
    setLoading(true);
    try {
      const { v1Api } = await import('@/lib/api/v1-client');
      const data = await v1Api.landlords.create(values);
      
      if (data.success || data) {
        message.success('Registration completed successfully!');
        router.push("/dashboard");
      } else {
        message.error(data.error || 'Failed to complete registration');
      }
    } catch (error) {
      console.error('[Complete Registration] Error:', error);
      message.error('Failed to complete registration');
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
      <Card style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
          <Title level={2} style={{ marginBottom: 8 }}>Complete Your Registration</Title>
          <Text type="secondary">
            Please provide your contact information to complete your account setup.
          </Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            firstName: firstName || "",
            middleName: middleName || "",
            lastName: lastName || "",
            email: email || "",
            country: "CA",
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="firstName"
                label="First Name"
                rules={[{ required: true, message: 'Please enter first name' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="First name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lastName"
                label="Last Name"
                rules={[{ required: true, message: 'Please enter last name' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Last name" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="middleName" label="Middle Name (Optional)">
            <Input prefix={<UserOutlined />} placeholder="Middle name" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter valid email' }
            ]}
          >
            <Input prefix={<MailOutlined />} disabled />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Phone"
            rules={[{ required: true, message: 'Please enter phone number' }]}
          >
            <PhoneNumberInput country={country} />
          </Form.Item>

          <Form.Item
            name="addressLine1"
            label="Address Line 1"
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
                }
              }}
            />
          </Form.Item>

          <Form.Item name="addressLine2" label="Address Line 2 (Optional)">
            <Input placeholder="Apt, suite, unit, etc." />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="city"
                label="City"
                rules={[{ required: true, message: 'Please enter city' }]}
              >
                <Input placeholder="City" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="country"
                label="Country"
                rules={[{ required: true, message: 'Please select country' }]}
              >
                <Select
                  onChange={(value) => {
                    setCountry(value);
                    form.setFieldsValue({ provinceState: undefined, postalZip: undefined });
                  }}
                >
                  <Select.Option value="CA">Canada</Select.Option>
                  <Select.Option value="US">United States</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="provinceState"
                label={regionLabel}
                rules={[{ required: true, message: `Please select ${regionLabel.toLowerCase()}` }]}
              >
                <Select placeholder={`Select ${regionLabel}`} showSearch>
                  {regionOptions.map((region) => (
                    <Select.Option key={region} value={region}>{region}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="postalZip"
                label={postalLabel}
                rules={[{ required: true, message: `Please enter ${postalLabel.toLowerCase()}` }]}
              >
                <PostalCodeInput country={country} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <Button type="primary" htmlType="submit" loading={loading} size="large" block>
              Complete Registration
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
