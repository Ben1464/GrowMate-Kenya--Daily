import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { PDFDownloadLink, Page, Text, Document, StyleSheet, View } from '@react-pdf/renderer';
import './App.css';

// Define Categories, Products, Pack Sizes, and Units
const categories = {
  Insecticides: {
    Growprid: { unit: 'gms', packSizes: [5, 10, 25, 50, 100, '1kg'] },
    Timecarb: { unit: 'mls', packSizes: [25, 50, 100, 250, '1ltr'] },
    Spirometer: { unit: 'mls', packSizes: [50, 100, 250, '1ltr'] },
    Emagurd: { unit: 'mls', packSizes: [25, 50, 100, 250, '1ltr'] },
  },
  Fungicides: {
    Pyraccop: { unit: 'mls', packSizes: [50, 100, 250, '1ltr'] },
    Azokon: { unit: 'mls', packSizes: [50, 100, 250, '1ltr'] },
    Manlaxy: { unit: 'gms', packSizes: [50, 100, 250, 500, '1kg'] },
  },
  Nutrition: {
    Okinawo: { unit: 'mls', packSizes: [100, 250, 500, '1ltr'] },
    Seagold: { unit: 'mls', packSizes: [100, 250, 500, '1ltr'] },
    Zincbomate: { unit: 'mls', packSizes: [100, 250, 500, '1ltr'] },
    Calcibora: { unit: 'mls', packSizes: [100, 250, 500, '1ltr'] },
    Boroking: { unit: 'mls', packSizes: [100, 250, 500, '1ltr'] },
    Growspeed_macro: { unit: 'mls', packSizes: [100, 250, 500, '1ltr'] },
  },
  Adjuvant: {
    Polysil: { unit: 'mls', packSizes: [25, 50, 100, 250, '1ltr'] },
  },
  Herbicides: {
    Mineposat: { unit: 'mls', packSizes: [500, '1ltr'] },
    Bentagrow: { unit: 'mls', packSizes: [500, '1ltr'] },
  },
};

// Generate initial sales values dynamically based on categories
const generateInitialSales = () => {
  const sales = {};
  Object.keys(categories).forEach((category) => {
    Object.keys(categories[category]).forEach((product) => {
      const { packSizes } = categories[category][product];
      packSizes.forEach((size) => {
        sales[`sales_${category}_${product}_${size}_quantity`] = '';
        sales[`sales_${category}_${product}_${size}_price`] = '';
      });
    });
  });
  return sales;
};

// Validation Schema using Yup
const ReportSchema = Yup.object().shape({
  date: Yup.string().required('Required'),
  author: Yup.string().required('Required'),
  marketingActivities: Yup.string().required('Marketing Activities are required'),
  competitiveAnalysis: Yup.string().required('Competitive Analysis is required'),
  issues: Yup.string().required('Issues and Challenges are required'),
  upcomingActions: Yup.string().required('Upcoming Actions are required'),
  ...Object.keys(categories).reduce((acc, category) => {
    Object.keys(categories[category]).forEach((product) => {
      categories[category][product].packSizes.forEach((size) => {
        acc[`sales_${category}_${product}_${size}_quantity`] = Yup.number().typeError('Must be a number').nullable();
        acc[`sales_${category}_${product}_${size}_price`] = Yup.number().typeError('Must be a number').nullable();
      });
    });
    return acc;
  }, {}),
});

// PDF component
// PDF component
const ReportPDF = ({ values }) => {
  const salesRows = [];
  Object.keys(categories).forEach((category) => {
    Object.keys(categories[category]).forEach((product) => {
      categories[category][product].packSizes.forEach((size) => {
        const keyQuantity = `sales_${category}_${product}_${size}_quantity`;
        const keyPrice = `sales_${category}_${product}_${size}_price`;
        if (values[keyQuantity]) {
          const total = (parseFloat(values[keyQuantity]) || 0) * (parseFloat(values[keyPrice]) || 0);
          salesRows.push({
            category,
            product,
            size,
            quantity: values[keyQuantity],
            price: parseFloat(values[keyPrice]),
            unit: categories[category][product].unit,
            total: total.toLocaleString('en-US', { style: 'currency', currency: 'Ksh' }),
          });
        }
      });
    });
  });

  return (
    <Document>
      <Page style={styles.body}>
        <Text style={styles.header}>Daily Sales Report</Text>
        <Text style={styles.header}>Date: {values.date}</Text>
        <Text style={styles.header}>Staff: {values.author}</Text>
        <Text style={styles.section}>Sales Summary</Text>
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableRow}>
            <Text style={styles.tableHeaderCell}>Category</Text>
            <Text style={styles.tableHeaderCell}>Product</Text>
            <Text style={styles.tableHeaderCell}>Pack Size</Text>
            <Text style={styles.tableHeaderCell}>Quantity</Text>
            <Text style={styles.tableHeaderCell}>Price</Text>
            <Text style={styles.tableHeaderCell}>Total</Text>
          </View>
          {/* Table Rows */}
          {salesRows.map((row, index) => (
            <View style={styles.tableRow} key={index}>
              <Text style={styles.tableCell}>{row.category}</Text>
              <Text style={styles.tableCell}>{row.product}</Text>
              <Text style={styles.tableCell}>{row.size} ({row.unit})</Text>
              <Text style={styles.tableCell}>{row.quantity}</Text>
              <Text style={styles.tableCell}>{row.price}</Text>
              <Text style={styles.tableCell}>{row.total}</Text>
            </View>
          ))}
        </View>

        {/* Total Sales Section */}
        <Text style={styles.section}>Total Sales: {values.totalSales.toLocaleString('en-US', { style: 'currency', currency: 'Ksh' })}</Text>
        
        {/* Additional Sections */}
        <Text style={styles.section}>Marketing Activities</Text>
        <Text>{values.marketingActivities}</Text>

        <Text style={styles.section}>Competitive Analysis</Text>
        <Text>{values.competitiveAnalysis}</Text>

        <Text style={styles.section}>Issues and Challenges</Text>
        <Text>{values.issues}</Text>

        <Text style={styles.section}>Upcoming Actions</Text>
        <Text>{values.upcomingActions}</Text>
      </Page>
    </Document>
  );
};


// PDF Styles
const styles = StyleSheet.create({
  body: { padding: 20 },
  header: { fontSize: 18, marginBottom: 10, textAlign: 'center' },
  section: { fontSize: 16, marginTop: 10, marginBottom: 5, fontWeight: 'bold' },
  table: { display: 'table', width: 'auto', marginTop: 10 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#000' },
  tableHeaderCell: { padding: 5, width: '16.66%', fontWeight: 'bold', backgroundColor: '#f0f0f0' },
  tableCell: { padding: 5, width: '16.66%' },
});

const DailyReportApp = () => {
  const [reportData, setReportData] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState({}); // Tracks selected product per category

  // Calculate total sales
  const calculateTotalSales = (values) => {
    let total = 0;
    Object.keys(categories).forEach((category) => {
      Object.keys(categories[category]).forEach((product) => {
        categories[category][product].packSizes.forEach((size) => {
          const quantity = parseFloat(values[`sales_${category}_${product}_${size}_quantity`]) || 0;
          const price = parseFloat(values[`sales_${category}_${product}_${size}_price`]) || 0;
          total += quantity * price;
        });
      });
    });
    return total;
  };

  return (
    <div className="App">
      <h1>Daily Report App</h1>
      <Formik
        initialValues={{
          date: '',
          author: '',
          marketingActivities: '',
          competitiveAnalysis: '',
          issues: '',
          upcomingActions: '',
          ...generateInitialSales(),
        }}
        validationSchema={ReportSchema}
        onSubmit={(values) => {
          const totalSales = calculateTotalSales(values);
          setReportData({ ...values, totalSales });
        }}
      >
        {({ values, setFieldValue }) => (
          <Form>
            {/* General Information */}
            <div className="form-section">
              <label>Date:</label>
              <Field type="date" name="date" />
              <ErrorMessage name="date" component="div" className="error" />
            </div>
            <div className="form-section">
              <label>Staff Name:</label>
              <Field type="text" name="author" placeholder="Enter your name" />
              <ErrorMessage name="author" component="div" className="error" />
            </div>
            <div className="form-section">
              <label>Marketing Activities:</label>
              <Field type="text" name="marketingActivities" placeholder="Describe activities" />
              <ErrorMessage name="marketingActivities" component="div" className="error" />
            </div>
            <div className="form-section">
              <label>Competitive Analysis:</label>
              <Field type="text" name="competitiveAnalysis" placeholder="A brief description of competitors activities.." />
              <ErrorMessage name="competitiveAnalysis" component="div" className="error" />
            </div>
            <div className="form-section">
              <label>Issues and Challenges:</label>
              <Field type="text" name="issues" placeholder="List issues and challenges.." />
              <ErrorMessage name="issues" component="div" className="error" />
            </div>
            <div className="form-section">
              <label>Upcoming Actions:</label>
              <Field type="text" name="upcomingActions" placeholder="Today's actions/plan.." />
              <ErrorMessage name="upcomingActions" component="div" className="error" />
            </div>

            {/* Sales Details */}
            <h2>Sales Details</h2>
            {Object.keys(categories).map((category) => (
              <div key={category} className="form-section">
                <h3>{category}</h3>

                {/* Product Selection */}
                <label>Product:</label>
                <Field
                  as="select"
                  name={`selectedProduct_${category}`}
                  value={selectedProduct[category] || ""}
                  onChange={(e) => {
                    const selectedProd = e.target.value;
                    setSelectedProduct({
                      ...selectedProduct,
                      [category]: selectedProd,
                    });
                    setFieldValue(`selectedProduct_${category}`, selectedProd);
                    // Reset pack size when product changes
                    setFieldValue(`packSize_${category}`, '');
                  }}
                >
                  <option value="">Select a product</option>
                  {Object.keys(categories[category]).map((product) => (
                    <option key={product} value={product}>
                      {product}
                    </option>
                  ))}
                </Field>
                <ErrorMessage name={`selectedProduct_${category}`} component="div" className="error" />

                {/* Pack Size Selection */}
                {selectedProduct[category] && (
                  <>
                    <label>Pack Size:</label>
                    <Field
                      as="select"
                      name={`packSize_${category}`}
                      onChange={(e) => {
                        setFieldValue(`packSize_${category}`, e.target.value);
                      }}
                    >
                      <option value="">Select pack size</option>
                      {categories[category][selectedProduct[category]].packSizes.map((size) => (
                        <option key={size} value={size}>
                          {size} {categories[category][selectedProduct[category]].unit}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage name={`packSize_${category}`} component="div" className="error" />
                  </>
                )}

                {/* Quantity and Price Inputs */}
                {selectedProduct[category] && values[`packSize_${category}`] && (
                  <>
                    <div className="sales-inputs">
                      <label>Quantity:</label>
                      <Field
                        type="number"
                        name={`sales_${category}_${selectedProduct[category]}_${values[`packSize_${category}`]}_quantity`}
                        placeholder="Quantity"
                      />
                      <ErrorMessage
                        name={`sales_${category}_${selectedProduct[category]}_${values[`packSize_${category}`]}_quantity`}
                        component="div"
                        className="error"
                      />
                    </div>
                    <div className="sales-inputs">
                      <label>Price:</label>
                      <Field
                        type="number"
                        name={`sales_${category}_${selectedProduct[category]}_${values[`packSize_${category}`]}_price`}
                        placeholder="Price"
                      />
                      <ErrorMessage
                        name={`sales_${category}_${selectedProduct[category]}_${values[`packSize_${category}`]}_price`}
                        component="div"
                        className="error"
                      />
                    </div>
                  </>
                )}
              </div>
            ))}

            <button type="submit">Generate Report</button>

            {/* Total Sales Display */}
            {reportData && (
              <div className="total-sales">
                <h3>Total Sales: Ksh {reportData.totalSales.toLocaleString()}</h3>
              </div>
            )}

            {/* PDF Download Link */}
            {reportData && (
              <PDFDownloadLink document={<ReportPDF values={reportData} />} fileName="daily_report.pdf">
                {({ blob, url, loading, error }) =>
                  loading ? 'Loading document...' : 'Download Report'
                }
              </PDFDownloadLink>
            )}
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default DailyReportApp;