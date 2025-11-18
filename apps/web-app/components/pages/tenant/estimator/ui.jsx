"use client";

import { useState, useMemo } from 'react';
import { Card, Form, Input, DatePicker, Select, Button, Space, Typography, Row, Col, Divider, Alert, Statistic, Table } from 'antd';
import { CalculatorOutlined, DollarOutlined, CalendarOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { PageLayout } from '@/components/shared';
import CurrencyInput from '@/components/rules/CurrencyInput';
import CurrencyDisplay from '@/components/rules/CurrencyDisplay';
import { rules } from '@/lib/utils/validation-rules';
import dayjs from 'dayjs';

const { Text } = Typography;
const { Option } = Select;

export default function EstimatorClient({ tenant }) {
  const [form] = Form.useForm();
  const [results, setResults] = useState(null);

  const activeLease = tenant?.leaseTenants?.find(lt => lt.lease?.status === 'Active')?.lease;

  const calculateProratedRent = (monthlyRent, moveInDate, moveOutDate, rentDueDay) => {
    if (!moveInDate || !moveOutDate) return null;

    const start = dayjs(moveInDate);
    const end = dayjs(moveOutDate);
    const daysInMonth = end.daysInMonth();
    const daysRented = end.diff(start, 'days') + 1;
    const proratedAmount = (monthlyRent / daysInMonth) * daysRented;
    
    return {
      daysRented,
      daysInMonth,
      proratedAmount,
      fullMonthAmount: monthlyRent
    };
  };

  const calculateSecurityDepositReturn = (deposit, deductions) => {
    const totalDeductions = deductions.reduce((sum, d) => sum + (d.amount || 0), 0);
    return {
      originalDeposit: deposit,
      totalDeductions,
      returnAmount: deposit - totalDeductions
    };
  };

  const handleCalculate = (values) => {
    const calculations = {};

    // Prorated Rent
    if (values.calculationType === 'prorated' && values.monthlyRent && values.moveInDate && values.moveOutDate) {
      calculations.proratedRent = calculateProratedRent(
        values.monthlyRent,
        values.moveInDate,
        values.moveOutDate,
        values.rentDueDay || 1
      );
    }

    // Security Deposit Return
    if (values.calculationType === 'deposit' && values.securityDeposit) {
      const deductions = [
        { description: 'Cleaning', amount: values.cleaningFee || 0 },
        { description: 'Repairs', amount: values.repairFee || 0 },
        { description: 'Other', amount: values.otherDeduction || 0 }
      ].filter(d => d.amount > 0);
      
      calculations.depositReturn = calculateSecurityDepositReturn(values.securityDeposit, deductions);
      calculations.depositReturn.deductions = deductions;
    }

    setResults(calculations);
  };

  const depositColumns = [
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => <CurrencyDisplay value={amount} country="CA" />,
      align: 'right',
    },
  ];

  const statsData = [
    {
      title: 'Active Lease',
      value: activeLease ? 'Yes' : 'No',
      prefix: activeLease ? <CheckCircleOutlined /> : <CloseCircleOutlined />,
      valueStyle: { color: activeLease ? '#52c41a' : '#ff4d4f' },
    },
  ];

  return (
    <PageLayout
      headerTitle={<><CalculatorOutlined /> Payment Estimator</>}
      headerDescription="Calculate prorated rent, security deposit returns, and more"
      stats={statsData}
      statsCols={1}
    >

      <Card style={{ marginBottom: 24 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCalculate}
          initialValues={{
            calculationType: 'prorated',
            monthlyRent: activeLease?.rentAmount || 0,
            rentDueDay: activeLease?.rentDueDay || 1,
            securityDeposit: activeLease?.securityDeposit || 0,
          }}
        >
          <Form.Item
            name="calculationType"
            label="Calculation Type"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="prorated">Prorated Rent</Option>
              <Option value="deposit">Security Deposit Return</Option>
            </Select>
          </Form.Item>

          {Form.useWatch('calculationType', form) === 'prorated' && (
            <>
              <Form.Item
                name="monthlyRent"
                label="Monthly Rent"
                rules={[rules.required('Monthly rent')]}
              >
                <CurrencyInput country="CA" placeholder="0.00" min={0.01} />
              </Form.Item>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="moveInDate"
                    label="Move-in Date"
                    rules={[rules.required('Move-in date')]}
                  >
                    <DatePicker style={{ width: '100%' }} format="MMM D, YYYY" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="moveOutDate"
                    label="Move-out Date"
                    rules={[rules.required('Move-out date')]}
                  >
                    <DatePicker style={{ width: '100%' }} format="MMM D, YYYY" />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item
                name="rentDueDay"
                label="Rent Due Day (of month)"
              >
                <Input type="number" min={1} max={31} />
              </Form.Item>
            </>
          )}

          {Form.useWatch('calculationType', form) === 'deposit' && (
            <>
              <Form.Item
                name="securityDeposit"
                label="Security Deposit Amount"
                rules={[{ required: true, message: 'Please enter security deposit' }]}
              >
                <CurrencyInput country="CA" placeholder="0.00" min={0} />
              </Form.Item>
              <Title level={5}>Deductions (if any)</Title>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="cleaningFee"
                    label="Cleaning Fee"
                  >
                    <CurrencyInput country="CA" placeholder="0.00" min={0} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="repairFee"
                    label="Repair Fee"
                  >
                    <CurrencyInput country="CA" placeholder="0.00" min={0} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="otherDeduction"
                    label="Other Deduction"
                  >
                    <CurrencyInput country="CA" placeholder="0.00" min={0} />
                  </Form.Item>
                </Col>
              </Row>
            </>
          )}

          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<CalculatorOutlined />} size="large">
              Calculate
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {results && (
        <>
          {results.proratedRent && (
            <Card title="Prorated Rent Calculation" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic
                    title="Days Rented"
                    value={results.proratedRent.daysRented}
                    suffix="days"
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Days in Month"
                    value={results.proratedRent.daysInMonth}
                    suffix="days"
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Prorated Amount"
                    value={results.proratedRent.proratedAmount}
                    prefix="$"
                    precision={2}
                  />
                </Col>
              </Row>
              <Divider />
              <Alert
                message={
                  <div>
                    <Text>Full Month Rent: </Text>
                    <Text strong><CurrencyDisplay value={results.proratedRent.fullMonthAmount} country="CA" /></Text>
                    <br />
                    <Text>Prorated Rent ({results.proratedRent.daysRented} days): </Text>
                    <Text strong style={{ color: '#52c41a', fontSize: 16 }}>
                      <CurrencyDisplay value={results.proratedRent.proratedAmount} country="CA" />
                    </Text>
                  </div>
                }
                type="info"
                showIcon
              />
            </Card>
          )}

          {results.depositReturn && (
            <Card title="Security Deposit Return Calculation" style={{ marginBottom: 16 }}>
              <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={8}>
                  <Statistic
                    title="Original Deposit"
                    value={results.depositReturn.originalDeposit}
                    prefix="$"
                    precision={2}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Total Deductions"
                    value={results.depositReturn.totalDeductions}
                    prefix="$"
                    precision={2}
                    valueStyle={{ color: '#ff4d4f' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Return Amount"
                    value={results.depositReturn.returnAmount}
                    prefix="$"
                    precision={2}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Col>
              </Row>
              {results.depositReturn.deductions.length > 0 && (
                <>
                  <Divider />
                  <Table
                    dataSource={results.depositReturn.deductions}
                    columns={depositColumns}
                    pagination={false}
                    size="small"
                  />
                </>
              )}
              <Divider />
              <Alert
                message={
                  <div>
                    <Text>Security Deposit: </Text>
                    <Text strong><CurrencyDisplay value={results.depositReturn.originalDeposit} country="CA" /></Text>
                    <br />
                    <Text>Less Deductions: </Text>
                    <Text strong style={{ color: '#ff4d4f' }}>
                      <CurrencyDisplay value={results.depositReturn.totalDeductions} country="CA" />
                    </Text>
                    <br />
                    <Text>Return Amount: </Text>
                    <Text strong style={{ color: '#52c41a', fontSize: 16 }}>
                      <CurrencyDisplay value={results.depositReturn.returnAmount} country="CA" />
                    </Text>
                  </div>
                }
                type={results.depositReturn.returnAmount >= 0 ? 'success' : 'error'}
                showIcon
              />
            </Card>
          )}
        </>
      )}
    </PageLayout>
  );
}

